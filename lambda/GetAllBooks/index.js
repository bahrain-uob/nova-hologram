import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = process.env.AWS_REGION || "us-east-1";
const BOOK_TABLE = process.env.BOOKS_TABLE;

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
    // Scan all books from the table
    const scanCommand = new ScanCommand({
      TableName: BOOK_TABLE,
    });

    const result = await docClient.send(scanCommand);

    if (!result.Items) {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
        body: JSON.stringify({ books: [] }),
      };
    }

    // Transform books to match the expected format
    const books = await Promise.all(
      result.Items.map(async (book) => {
        const bookCoverSignedUrl = book.book_cover?.startsWith("s3://")
          ? await getPresignedUrl(book.book_cover)
          : book.book_cover;

        return {
          id: book.book_id,
          title: book.book_title || book.title,
          author: Array.isArray(book.authors)
            ? book.authors.join(", ")
            : book.authors || "Unknown Author",
          cover: bookCoverSignedUrl || "/placeholder.svg?height=400&width=300",
          genres: Array.isArray(book.genre)
            ? book.genre
            : book.genre
            ? [book.genre]
            : ["Fiction"],
          language: book.language || "English",
        };
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
      body: JSON.stringify({ books }),
    };
  } catch (error) {
    console.error("Error in getAllBooks Lambda:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
