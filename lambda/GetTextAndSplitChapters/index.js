import { TextractClient, GetDocumentTextDetectionCommand } from "@aws-sdk/client-textract";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const textractClient = new TextractClient();
const s3 = new S3Client();
const dynamo = new DynamoDBClient();
const sqs = new SQSClient();

export const handler = async (event) => {
  try {
    console.log(" SNS Event:", JSON.stringify(event, null, 2));
    const snsMessage = JSON.parse(event.Records[0].Sns.Message);
    const jobId = snsMessage.JobId;
    const bookId = snsMessage.JobTag;

    console.log(" JobId:", jobId);
    console.log(" BookId:", bookId);

    let fullText = "";
    let params = { JobId: jobId };
    let response;

    do {
      const command = new GetDocumentTextDetectionCommand(params);
      response = await textractClient.send(command);

      response.Blocks.forEach((block) => {
        if (block.BlockType === "LINE" && block.Text) {
          fullText += block.Text + "\n";
        }
      });

      params.NextToken = response.NextToken;
    } while (response.NextToken);

    console.log(" Total extracted text length:", fullText.length);

    // Clean the text
    fullText = fullText.replace(/Activities[\s\S]*$/i, '').trim();
    fullText = fullText.replace(/^\d+\s*$/gm, '');

    const fullTextKey = `books/${bookId}/book.txt`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.READING_MATERIALS_BUCKET,
        Key: fullTextKey,
        Body: fullText,
        ContentType: "text/plain",
      })
    );
    console.log(" Full text saved at:", fullTextKey);

    // Send full book summary request to SQS
    await sqs.send(new SendMessageCommand({
        QueueUrl: process.env.SUMMARY_QUEUE_URL,
        MessageBody: JSON.stringify({
          bookId,
          chapterText: fullText,
          isBookSummary: true
        }),
      }));
      

      const chapterRegex = /(chapter\s+((\d+)|([ivxlcdm]+))[:\s\-]*[^\n]*)/gi;
      const allMatches = [...fullText.matchAll(chapterRegex)];

    let realStartIndex = null;

    for (let i = 0; i < allMatches.length; i++) {
      const match = allMatches[i];
      const chapterTitle = match[0];
      const currentIndex = match.index;
      const nextIndex = i + 1 < allMatches.length ? allMatches[i + 1].index : fullText.length;
      const afterText = fullText.slice(currentIndex + chapterTitle.length, nextIndex).trim();
      if (afterText.length < 100) continue;
      const lines = afterText.split('\n').filter(line => line.trim() !== '');
      const shortLines = lines.slice(0, 3).filter(line => line.trim().split(/\s+/).length < 5);
      if (shortLines.length >= 2) continue;
      realStartIndex = currentIndex;
      break;
    }

    if (realStartIndex !== null) {
      fullText = fullText.slice(realStartIndex).trim();
    }

    const matches = [...fullText.matchAll(chapterRegex)];
    const chapters = [];

    if (matches.length > 0) {
      for (let i = 0; i < matches.length; i++) {
        const title = matches[i][0].trim();
        const start = matches[i].index;
        const end = i + 1 < matches.length ? matches[i + 1].index : fullText.length;
        const text = fullText.slice(start, end).trim();

        chapters.push({
          chapterTitle: title,
          chapterText: text,
          chapterNo: i + 1,
          summary: "",
          script: "",
        });
      }
    } 

    console.log(` Final number of chapters: ${chapters.length}`);

    for (const chapter of chapters) {
      const key = `books/${bookId}/chapters/chapter_${chapter.chapterNo}.txt`;
      console.log(` Uploading chapter ${chapter.chapterNo} to S3 key: ${key}`);

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.READING_MATERIALS_BUCKET,
          Key: key,
          Body: chapter.chapterText,
          ContentType: "text/plain",
        })
      );

      await dynamo.send(
        new PutItemCommand({
          TableName: process.env.CHAPTERS_TABLE,
          Item: {
            chapter_id: { S: `${bookId}#${chapter.chapterNo}` },
            book_id: { S: bookId },
            chapter_no: { N: chapter.chapterNo.toString() },
            chapter_title: { S: chapter.chapterTitle },
            summary: { S: chapter.summary },
            script: { S: chapter.script },
          },
        })
      );

      console.log(` Saved chapter ${chapter.chapterNo} to DynamoDB`);

      // Send chapter summary request to SQS
      await sqs.send(new SendMessageCommand({
        QueueUrl: process.env.SUMMARY_QUEUE_URL,
        MessageBody: JSON.stringify({
          bookId,
          chapterNo: chapter.chapterNo,
          chapterText: chapter.chapterText,
          isBookSummary: false
        }),
      }));
      
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Chapters and full text saved", bookId }),
    };
  } catch (err) {
    console.error(" Error in SplitChaptersLambda:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
