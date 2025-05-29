import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = process.env.AWS_REGION || "us-east-1";
const BUCKET_NAME = process.env.S3_BUCKET;

const s3Client = new S3Client({ region: REGION });

export const handler = async (event) => {
  try {
    const { bookId } = JSON.parse(event.body);

    const bookKey = `books/${bookId}/book.pdf`;
    const coverKey = `books/${bookId}/cover.jpg`;

    const expiresIn = 300; // 5 minutes

    const bookUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: bookKey,
        ContentType: "application/pdf",
      }),
      { expiresIn }
    );

    const coverUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: coverKey,
        ContentType: "image/jpeg",
      }),
      { expiresIn }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ bookUrl, coverUrl, bookKey, coverKey }),
    };
  } catch (err) {
    console.error("Error generating signed URLs:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not generate URLs" }),
    };
  }
};
