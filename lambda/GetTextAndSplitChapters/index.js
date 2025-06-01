import {
    TextractClient,
    GetDocumentTextDetectionCommand,
  } from "@aws-sdk/client-textract";
  import {
    S3Client,
    PutObjectCommand,
  } from "@aws-sdk/client-s3";
  import {
    DynamoDBClient,
    PutItemCommand,
  } from "@aws-sdk/client-dynamodb";
  import {
    SQSClient,
    SendMessageCommand,
  } from "@aws-sdk/client-sqs";
  import {
    BedrockRuntimeClient,
    InvokeModelCommand,
  } from "@aws-sdk/client-bedrock-runtime";
  
  const textractClient = new TextractClient();
  const s3 = new S3Client();
  const dynamo = new DynamoDBClient();
  const sqs = new SQSClient();
  const bedrock = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION });
  
  export const handler = async (event) => {
    try {
      console.log("📨 SNS Event:", JSON.stringify(event, null, 2));
      const snsMessage = JSON.parse(event.Records[0].Sns.Message);
      const jobId = snsMessage.JobId;
      const bookId = snsMessage.JobTag;
  
      let fullText = "";
      let params = { JobId: jobId };
      let response;
  
      do {
        const command = new GetDocumentTextDetectionCommand(params);
        response = await textractClient.send(command);
  
        for (const block of response.Blocks) {
          if (block.BlockType === "LINE" && block.Text) {
            fullText += block.Text + "\n";
          }
        }
  
        params.NextToken = response.NextToken;
      } while (response.NextToken);
  

  
      // Save full text to S3
      const fullTextKey = `books/${bookId}/book.txt`;
      await s3.send(new PutObjectCommand({
        Bucket: process.env.READING_MATERIALS_BUCKET,
        Key: fullTextKey,
        Body: fullText,
        ContentType: "text/plain",
      }));
      console.log("✅ Full text saved:", fullTextKey);
  
      // Send full book summary to SQS
      await sqs.send(new SendMessageCommand({
        QueueUrl: process.env.SUMMARY_QUEUE_URL,
        MessageBody: JSON.stringify({
          bookId,
          chapterText: fullText,
          isBookSummary: true,
        }),
      }));
  
      // Bedrock - Count chapters
      const countPrompt = `You are analyzing the full text of a book.
  
  Your task:
  Determine if the book is divided into chapters.
  
  Rules:
  - If the book **has chapters**, count them and return the number only (as a number).
  - If the book **does not have chapters**, return "none".
  
  ✅ Output format (no explanations):
  If chapters exist:
  12
  
  If no chapters exist:
  none
  
  full text:
  ${fullText.slice(0, 700000)}`;
  
      const countRes = await bedrock.send(new InvokeModelCommand({
        modelId: "amazon.nova-lite-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          inferenceConfig: { max_new_tokens: 50 },
          messages: [{ role: "user", content: [{ text: countPrompt }] }],
        }),
      }));
  
      const countBody = JSON.parse(new TextDecoder().decode(countRes.body));
      const countRaw = countBody.output.message.content[0].text.trim();
      const match = countRaw.match(/^\d+$/);
      const chapterCount = match ? parseInt(match[0]) : 0;
  
      console.log("📘 Chapter count:", chapterCount);
  
      if (chapterCount === 0) {
        console.log("📗 No chapters detected.");
        return { statusCode: 200, body: "No chapters found" };
      }
  
      // Loop over chapters
      for (let i = 1; i <= chapterCount; i++) {
        const splitPrompt = `You are analyzing the full text of a book.
  
  Your task is to extract only **Chapter ${i}** from the book and return it exactly as it appears in the text.
  
  ✅ Output format:
  Chapter ${i}: [Title]  
  [Full original text of Chapter ${i}]
  
  Instructions:
  - Return **only** Chapter ${i} with its original heading and full text.
  - Do **not** return any other chapters.
  - Preserve all line breaks and layout.
  
  full text:
  ${fullText.slice(0, 700000)}`;
  
        const splitRes = await bedrock.send(new InvokeModelCommand({
          modelId: "amazon.nova-lite-v1:0",
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify({
            inferenceConfig: { max_new_tokens: 5120 },
            messages: [{ role: "user", content: [{ text: splitPrompt }] }],
          }),
        }));
  
        const splitBody = JSON.parse(new TextDecoder().decode(splitRes.body));
        const chapterText = splitBody.output.message.content[0].text.trim();
  
        // Save chapter to S3
        const chapterKey = `books/${bookId}/chapters/chapter_${i}.txt`;
        await s3.send(new PutObjectCommand({
          Bucket: process.env.READING_MATERIALS_BUCKET,
          Key: chapterKey,
          Body: chapterText,
          ContentType: "text/plain",
        }));
  
        // Save chapter to DynamoDB
        await dynamo.send(new PutItemCommand({
          TableName: process.env.CHAPTERS_TABLE,
          Item: {
            chapter_id: { S: `${bookId}#${i}` },
            book_id: { S: bookId },
            chapter_no: { N: i.toString() },
            chapter_title: { S: `Chapter ${i}` },
            summary: { S: "" },
            script: { S: "" },
          },
        }));
  
        // Send to SQS for summary
        await sqs.send(new SendMessageCommand({
          QueueUrl: process.env.SUMMARY_QUEUE_URL,
          MessageBody: JSON.stringify({
            bookId,
            chapterNo: i,
            chapterText,
            isBookSummary: false,
          }),
        }));
      }
  
      return {
        statusCode: 200,
        body: `✅ Processed ${chapterCount} chapters.`,
      };
    } catch (err) {
      console.error("❌ Error:", err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: err.message }),
      };
    }
  };
  