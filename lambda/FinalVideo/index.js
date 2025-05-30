import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, UpdateItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { execSync } from "child_process";
import { createWriteStream, readFileSync, unlinkSync } from "fs";
import { pipeline } from "stream";
import { promisify } from "util";

const REGION = "us-east-1";
const BUCKET_NAME = "storagestack-genvideosb3836295-cgsm7lv3g2uy";
const BOOKS_TABLE = process.env.BOOKS_TABLE;
const CHAPTERS_TABLE = process.env.CHAPTERS_TABLE;

const s3 = new S3Client({ region: REGION });
const dynamo = new DynamoDBClient({ region: REGION });
const streamPipeline = promisify(pipeline);

export const handler = async (event) => {
  for (const record of event.Records) {
    let body;
    try {
      body = JSON.parse(record.body);
    } catch (e) {
      console.error(" Invalid JSON in record body:", record.body);
      continue;
    }

    const { bookId, chapterNo, isBookSummary, audioS3Path, videoS3Path } = body;

    if (!audioS3Path || !videoS3Path) {
      console.error(" Missing audioS3Path or videoS3Path in payload:", body);
      continue;
    }

    const videoKey = videoS3Path.replace(`s3://${BUCKET_NAME}/`, "");
    const audioKey = audioS3Path.replace(`s3://${BUCKET_NAME}/`, "");

    const videoPath = "/tmp/video.mp4";
    const audioPath = "/tmp/audio.mp3";
    const processedAudioPath = "/tmp/processed_audio.mp3";
    const finalPath = "/tmp/output.mp4";

    try {
      // Download video
      const videoStream = await s3.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: videoKey }));
      await streamPipeline(videoStream.Body, createWriteStream(videoPath));

      // Download audio
      const audioStream = await s3.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: audioKey }));
      await streamPipeline(audioStream.Body, createWriteStream(audioPath));

      // Get audio duration using FFmpeg
      let durationOutput;
      try {
        durationOutput = execSync(`/opt/bin/ffmpeg -i ${audioPath} -f null - 2>&1`).toString();
      } catch (ffmpegError) {
        console.error(" FFmpeg failed to read audio. Output:");
        console.error(ffmpegError.stdout?.toString() || ffmpegError.message);
        throw new Error("FFmpeg failed to analyze audio file");
      }

      const match = durationOutput.match(/Duration: (\d+):(\d+):([\d.]+)/);
      if (!match) {
        console.error(" FFmpeg could not extract duration. Full output:\n", durationOutput);
        throw new Error("Unable to extract audio duration.");
      }

      const totalAudioSeconds =
        parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]);

      // Process audio
    if (totalAudioSeconds > 60) {
        const speed = 60 / totalAudioSeconds;
        const atempo = Math.min(Math.max(0.5, speed), 2).toFixed(2);
        execSync(
        `/opt/bin/ffmpeg -y -i ${audioPath} -filter:a "atempo=${atempo}" -vn ${processedAudioPath}`
        );
    } else {
        execSync(`cp ${audioPath} ${processedAudioPath}`);
    }
    

      // Determine video speed
      let videoSpeedCmd = "-c:v copy";
      if (totalAudioSeconds < 60) {
        const speed = (60 / totalAudioSeconds).toFixed(2);
        const setpts = (1 / parseFloat(speed)).toFixed(2);
        videoSpeedCmd = `-filter:v "setpts=${setpts}*PTS"`;
      }

      // Merge audio + video
      execSync(
        `/opt/bin/ffmpeg -y -i ${videoPath} -i ${processedAudioPath} -t 60 ${videoSpeedCmd} -map 0:v:0 -map 1:a:0 -c:a aac -ac 2 -b:a 128k -shortest ${finalPath}`
      );

      // Upload to S3
      const outputKey = `final/${bookId}/${chapterNo || "summary"}.mp4`;
      const fileBuffer = readFileSync(finalPath);
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: outputKey,
          Body: fileBuffer,
          ContentType: "video/mp4",
        })
      );

      // Update DynamoDB
      const outputUrl = `s3://${BUCKET_NAME}/${outputKey}`;
      const key = isBookSummary
        ? await getBookKey(bookId)
        : {
            chapter_id: { S: `${bookId}#${chapterNo}` },
            book_id: { S: bookId },
          };

      await dynamo.send(
        new UpdateItemCommand({
          TableName: isBookSummary ? BOOKS_TABLE : CHAPTERS_TABLE,
          Key: key,
          UpdateExpression: "SET finalvideo = :url",
          ExpressionAttributeValues: {
            ":url": { S: outputUrl },
          },
        })
      );

      console.log(" Final video uploaded:", outputUrl);
    } catch (err) {
      console.error(" Error:", err);
    } finally {
      try {
        unlinkSync(videoPath);
        unlinkSync(audioPath);
        unlinkSync(processedAudioPath);
        unlinkSync(finalPath);
      } catch {}
    }
  }
};

async function getBookKey(bookId) {
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

  const userId = result.Items?.[0]?.user_id?.S;
  if (!userId) throw new Error("User ID not found for bookId " + bookId);

  return {
    user_id: { S: userId },
    book_id: { S: bookId },
  };
}
