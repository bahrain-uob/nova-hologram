import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  DynamoDBClient,
  UpdateItemCommand,
  QueryCommand
} from "@aws-sdk/client-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const polly = new PollyClient({});
const s3 = new S3Client({});
const dynamo = new DynamoDBClient({});
const sqs = new SQSClient({});

const BUCKET_NAME = process.env.BUCKET_NAME;
const BOOKS_TABLE = process.env.BOOKS_TABLE;
const CHAPTERS_TABLE = process.env.CHAPTERS_TABLE;
const AUDIO_VIDEO_QUEUE_URL = process.env.AUDIO_MERGE_QUEUE_URL;

const uploadToS3 = async (buffer, key) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: "audio/mpeg",
  });
  await s3.send(command);
  return `s3://${BUCKET_NAME}/${key}`;
};

const getUserIdFromBookId = async (bookId) => {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: BOOKS_TABLE,
      IndexName: "GSI_by_book_id",
      KeyConditionExpression: "book_id = :bookId",
      ExpressionAttributeValues: {
        ":bookId": { S: bookId },
      },
    })
  );
  return result.Items?.[0]?.user_id?.S;
};

export const handler = async (event) => {
  for (const record of event.Records) {
    try {
      const { bookId, chapterNo, isBookSummary = false, ssml, videoS3Path } = JSON.parse(record.body);

      const speechCommand = new SynthesizeSpeechCommand({
        OutputFormat: "mp3",
        TextType: "ssml",
        Text: ssml,
        VoiceId: "Matthew",
        Engine: "neural",
      });

      const { AudioStream } = await polly.send(speechCommand);

      const chunks = [];
      for await (const chunk of AudioStream) {
        chunks.push(chunk);
      }

      const audioBuffer = Buffer.concat(chunks);
      const audioKey = `audio/${bookId}/${chapterNo || "summary"}.mp3`;
      const audioS3Path = await uploadToS3(audioBuffer, audioKey);

      const tableName = isBookSummary ? BOOKS_TABLE : CHAPTERS_TABLE;

      let key;
      if (isBookSummary) {
        const userId = await getUserIdFromBookId(bookId);
        if (!userId) {
          console.error("❌ Could not find userId for bookId:", bookId);
          continue;
        }
        key = {
          user_id: { S: userId },
          book_id: { S: bookId },
        };
      } else {
        key = {
          chapter_id: { S: `${bookId}#${chapterNo}` },
          book_id: { S: bookId },
        };
      }

      await dynamo.send(new UpdateItemCommand({
        TableName: tableName,
        Key: key,
        UpdateExpression: "SET audio_url = :audio",
        ExpressionAttributeValues: {
          ":audio": { S: audioS3Path },
        },
      }));

      await sqs.send(new SendMessageCommand({
        QueueUrl: AUDIO_VIDEO_QUEUE_URL,
        MessageBody: JSON.stringify({
          bookId,
          chapterNo,
          isBookSummary,
          audioS3Path,
          videoS3Path,
        }),
      }));

      console.log(`✅ Audio generated and saved to ${audioS3Path}`);
    } catch (error) {
      console.error("❌ Error in GenerateAudio Lambda:", error);
    }
  }
};
