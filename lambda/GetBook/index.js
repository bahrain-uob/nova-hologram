import {
  DynamoDBClient
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";

import {
  S3Client,
  GetObjectCommand
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = process.env.AWS_REGION || "us-east-1";
const BOOK_TABLE = process.env.BOOKS_TABLE;
const CHAPTER_TABLE = process.env.CHAPTERS_TABLE;

const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({ region: REGION });

async function getPresignedUrl(s3Path) {
  if (!s3Path || !s3Path.startsWith("s3://")) return null;

  const parts = s3Path.replace("s3://", "").split("/");
  const bucket = parts.shift();
  const key = parts.join("/");

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
}

export const handler = async (event) => {
  try {
    const bookId = event.pathParameters?.bookId;

    if (!bookId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing bookId in path parameters' }),
      };
    }

    // 1. Get book data using GSI_by_book_id
    const bookQuery = await docClient.send(new QueryCommand({
      TableName: BOOK_TABLE,
      IndexName: 'GSI_by_book_id',
      KeyConditionExpression: 'book_id = :bookId',
      ExpressionAttributeValues: {
        ':bookId': bookId,
      },
    }));

    if (!bookQuery.Items || bookQuery.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Book not found' }),
      };
    }

    const book = bookQuery.Items[0];
    const bookTrailerSignedUrl = await getPresignedUrl(book.book_trailer);

    // 2. Get chapter summaries
    const chapterQuery = await docClient.send(new QueryCommand({
      TableName: CHAPTER_TABLE,
      IndexName: 'Global_chapter_summary',
      KeyConditionExpression: 'book_id = :bookId',
      ExpressionAttributeValues: {
        ':bookId': bookId,
      },
    }));

    const chapters = await Promise.all(
      (chapterQuery.Items || []).map(async (ch) => ({
        chapter_id: ch.chapter_id,
        chapter_no: ch.chapter_no,
        summary: ch.summary,
        script: ch.script,
        trailer_status: ch.trailer_status,
        trailer: await getPresignedUrl(ch.trailer),
      }))
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        book: {
          summary: book.summary,
          script: book.script,
          trailer_status: book.trailer_status,
          trailer: bookTrailerSignedUrl,
        },
        chapters,
      }),
    };

  } catch (error) {
    console.error("❌ Error in getBook Lambda:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
