const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const {
  DynamoDBClient,
  UpdateItemCommand,
  QueryCommand,
} = require("@aws-sdk/client-dynamodb");

const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const dynamo = new DynamoDBClient();
const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
const sqs = new SQSClient();

const summaryPrompt = `
Summarize the following children’s story into a short, simple, and friendly paragraph. The summary should be easy to read for young readers and clearly describe the main events of the story. Avoid unnecessary details, complicated words, or difficult language.
`;

async function getBookInfo(bookId) {
  const command = new QueryCommand({
    TableName: process.env.BOOKS_TABLE,
    IndexName: "GSI_by_book_id",
    KeyConditionExpression: "book_id = :bookId",
    ExpressionAttributeValues: {
      ":bookId": { S: bookId },
    },
  });

  const result = await dynamo.send(command);
  const item = result.Items?.[0];
  if (!item) return {};

  return {
    userId: item.user_id?.S,
    prompt: item.prompt?.S || "", // fallback if prompt is missing
  };
}

exports.handler = async (event) => {
  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      const { bookId, chapterNo, chapterText, isBookSummary = false } = body;

      console.log(`📘 Generating summary for ${isBookSummary ? "Book" : "Chapter"} ${bookId}${chapterNo ? ` - Chapter ${chapterNo}` : ""}`);

      // Get userId and custom prompt from book table
      const { userId, prompt } = await getBookInfo(bookId);
      if (!userId && isBookSummary) {
        console.error(`❌ Could not find userId for bookId ${bookId}`);
        continue;
      }

      const fullPrompt = `${summaryPrompt}${prompt ? `\n\n[Book Context Prompt]: ${prompt}` : ""}\n\n${chapterText}`;

      const bedrockInput = {
        inferenceConfig: { max_new_tokens: 500 },
        messages: [
          {
            role: "user",
            content: [{ text: fullPrompt }],
          },
        ],
      };

      const command = new InvokeModelCommand({
        modelId: "amazon.nova-lite-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(bedrockInput),
      });

      const response = await bedrock.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const summaryText = responseBody.output.message.content[0].text.trim();

      console.log("✅ Summary generated");

      const tableName = isBookSummary ? process.env.BOOKS_TABLE : process.env.CHAPTERS_TABLE;

      const key = isBookSummary
        ? { user_id: { S: userId }, book_id: { S: bookId } }
        : { chapter_id: { S: `${bookId}#${chapterNo}` }, book_id: { S: bookId } };

      await dynamo.send(new UpdateItemCommand({
        TableName: tableName,
        Key: key,
        UpdateExpression: "SET summary = :summary",
        ExpressionAttributeValues: {
          ":summary": { S: summaryText },
        },
      }));

      console.log(`🗃️ Summary saved to ${isBookSummary ? "BOOKS_TABLE" : "CHAPTERS_TABLE"}`);

      // Send to Script Queue
      await sqs.send(new SendMessageCommand({
        QueueUrl: process.env.SCRIPT_QUEUE_URL,
        MessageBody: JSON.stringify({
          chapterId: `${bookId}#${chapterNo}`,
          summaryText,
          bookId,
          chapterNo,
          isBookSummary,
        }),
      }));

      console.log("📤 Summary sent to ScriptQueue");

    } catch (error) {
      console.error("❌ Error in GenerateSummaryLambda:", error);
    }
  }
};
