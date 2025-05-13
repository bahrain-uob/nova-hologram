const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const {
  DynamoDBClient,
  UpdateItemCommand,
  QueryCommand,
} = require("@aws-sdk/client-dynamodb");

const dynamo = new DynamoDBClient();
const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const sqs = new SQSClient();

const summaryPrompt = `
Summarize the following children’s story into a short, simple, and friendly paragraph. The summary should be easy to read for young readers and clearly describe the main events of the story. Avoid unnecessary details, complicated words, or difficult language.
`;

async function getUserIdFromBookId(bookId) {
  const command = new QueryCommand({
    TableName: process.env.BOOKS_TABLE,
    IndexName: "GSI_by_book_id", // Make sure this GSI exists
    KeyConditionExpression: "book_id = :bookId",
    ExpressionAttributeValues: {
      ":bookId": { S: bookId }, // CHANGE TO .S if book_id is a string!
    },
  });

  const result = await dynamo.send(command);
  const item = result.Items?.[0];
  return item?.user_id?.S;
}

exports.handler = async (event) => {
  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      const { bookId, chapterNo, chapterText, isBookSummary = false } = body;

      console.log(`📘 Generating summary for ${isBookSummary ? "Book" : "Chapter"} ${bookId}${chapterNo ? ` - Chapter ${chapterNo}` : ""}`);

      const fullPrompt = `${summaryPrompt}\n\n${chapterText}`;
      const bedrockInput = {
        inferenceConfig: { max_new_tokens: 500 },
        messages: [
          {
            role: "user",
            content: [{ text: fullPrompt }]
          }
        ]
      };

      const command = new InvokeModelCommand({
        modelId: "amazon.nova-lite-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(bedrockInput)
      });

      const response = await bedrock.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const summaryText = responseBody.output.message.content[0].text.trim();

      console.log("✅ Summary generated");

      const tableName = isBookSummary ? process.env.BOOKS_TABLE : process.env.CHAPTERS_TABLE;

      let key;
      if (isBookSummary) {
        const userId = await getUserIdFromBookId(bookId);
        if (!userId) {
          console.error(`❌ Could not find userId for bookId ${bookId}`);
          continue;
        }
        key = {
          user_id: { S: userId },
          book_id: { S: bookId },
        };
      } else {
        key = {
          chapter_id: { S: `${bookId}#${chapterNo}` },
          book_id: { S: bookId }, // ✅ Fix here
        };
      }
      

      const update = new UpdateItemCommand({
        TableName: tableName,
        Key: key,
        UpdateExpression: "SET summary = :summary",
        ExpressionAttributeValues: {
          ":summary": { S: summaryText },
        },
      });

      await dynamo.send(update);
      console.log(`🗃️ Summary saved to ${isBookSummary ? "BOOKS_TABLE" : "CHAPTERS_TABLE"}`);

      // Send to script queue for next Lambda
        const scriptQueueUrl = process.env.SCRIPT_QUEUE_URL;

        const sendScriptMessage = new SendMessageCommand({
        QueueUrl: scriptQueueUrl,
        MessageBody: JSON.stringify({
            chapterId: `${bookId}#${chapterNo}`,
            summaryText,
            bookId,
            chapterNo,
            isBookSummary,
        }),
        });

        await sqs.send(sendScriptMessage);
        console.log("📤 Summary sent to ScriptQueue");

    } catch (error) {
      console.error("❌ Error in GenerateSummaryLambda:", error);
    }
  }
};
