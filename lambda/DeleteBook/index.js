const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const {
  S3Client,
  DeleteObjectCommand,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");

const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3Client = new S3Client({});

const BOOKS_TABLE = process.env.BOOKS_TABLE;
const CHAPTERS_TABLE = process.env.CHAPTERS_TABLE;
const READING_BUCKET = process.env.READING_BUCKET;
const VIDEO_BUCKET = process.env.VIDEO_BUCKET;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  if (event.requestContext?.http?.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Preflight OK" }),
    };
  }

  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { bookId } = body;
    console.log("Parsed bookId:", bookId);

    if (!bookId) throw new Error("Missing bookId");

    // Step 1: Get book record
    const bookResp = await ddbClient.send(
      new QueryCommand({
        TableName: BOOKS_TABLE,
        IndexName: "GSI_by_book_id",
        KeyConditionExpression: "#book_id = :b",
        ExpressionAttributeNames: { "#book_id": "book_id" },
        ExpressionAttributeValues: { ":b": bookId },
      })
    );

    const book = bookResp.Items?.[0];
    console.log("Fetched book record:", book);

    if (!book) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Book not found" }),
      };
    }

    const effectiveStatus = book.status || book.trailer_status;
    if (!["completed", "failed"].includes(effectiveStatus)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: `Book cannot be deleted while status is '${effectiveStatus}'`,
        }),
      };
    }

    const userId = book.user_id;
    const bookKey = { user_id: userId, book_id: bookId };

    const s3PathsToDelete = [];
    if (book.book_trailer?.startsWith("s3://")) {
      s3PathsToDelete.push(book.book_trailer);
    }

    // Step 2: Get chapters
    const chapterResp = await ddbClient.send(
      new QueryCommand({
        TableName: CHAPTERS_TABLE,
        IndexName: "Global_chapter_summary",
        KeyConditionExpression: "book_id = :b",
        ExpressionAttributeValues: { ":b": bookId },
      })
    );

    const chapters = chapterResp.Items || [];

    await Promise.all(
      chapters.map((ch) =>
        ddbClient.send(
          new DeleteCommand({
            TableName: CHAPTERS_TABLE,
            Key: {
              chapter_id: ch.chapter_id,
              book_id: ch.book_id,
            },
          })
        )
      )
    );

    chapters.forEach((ch) => {
      if (ch.trailer?.startsWith("s3://")) {
        s3PathsToDelete.push(ch.trailer);
      }
    });

    // Step 3: Delete book
    const bookDelete = ddbClient.send(
      new DeleteCommand({
        TableName: BOOKS_TABLE,
        Key: bookKey,
      })
    );

    // Step 4: Delete reading materials
    const listedObjects = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: READING_BUCKET,
        Prefix: `books/${bookId}/`,
      })
    );

    if (listedObjects.Contents) {
      await Promise.all(
        listedObjects.Contents.map((item) =>
          s3Client.send(
            new DeleteObjectCommand({
              Bucket: READING_BUCKET,
              Key: item.Key,
            })
          )
        )
      );
    }

// Step 5: Delete full trailer folders
const genFolders = ["audio", "final", "upload"];
for (const folder of genFolders) {
  const prefix = `${folder}/${bookId}/`;
  const listed = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: VIDEO_BUCKET,
      Prefix: prefix,
    })
  );

  if (listed.Contents && listed.Contents.length > 0) {
    await Promise.all(
      listed.Contents.map((item) =>
        s3Client.send(
          new DeleteObjectCommand({
            Bucket: VIDEO_BUCKET,
            Key: item.Key,
          })
        )
      )
    );
  }
}



    await bookDelete;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Book and associated data deleted." }),
    };
  } catch (err) {
    console.error("Delete failed:", err?.message || err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message || "Internal Server Error" }),
    };
  }
};
