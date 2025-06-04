import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const REGION = process.env.AWS_REGION || "us-east-1";
const client = new DynamoDBClient({ region: REGION });
const s3Client = new S3Client({ region: REGION });

async function getPresignedUrl(s3Path) {
  if (!s3Path || !s3Path.startsWith("s3://")) return null;

  try {
    const parts = s3Path.replace("s3://", "").split("/");
    const bucket = parts.shift()?.trim(); // ✅ remove any space
    const key = parts.join("/").trim();   // ✅ remove any space

    if (!bucket || !key) throw new Error("Invalid S3 path");

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
  } catch (err) {
    console.warn("Presigned URL generation failed for:", s3Path, err);
    return null;
  }
}

export const handler = async function () {
  try {
    const data = await client.send(new ScanCommand({
      TableName: process.env.BOOK_TABLE_NAME,
    }));

    const books = await Promise.all(
      (data.Items || []).map(async (item) => {
        const book = unmarshall(item);

        if (book.book_cover?.startsWith("s3://")) {
          try {
            book.book_cover = await getPresignedUrl(book.book_cover);
          } catch (err) {
            console.warn("book_cover signing failed for:", book.book_id, err);
          }
        }

        return book;
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify(books),
    };
  } catch (error) {
    console.error("Failed to fetch books:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch books", error }),
    };
  }
};
