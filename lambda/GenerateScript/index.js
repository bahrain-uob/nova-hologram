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

const scriptPrompt = `
You are a cinematic scene writer helping create static video scenes for Nova Reel.

Your task: Based on the following story or chapter summary, write multiple visually rich, static scene descriptions for Nova Reel to use in a 1-minute educational video.

Important guidelines:
- Write at least 3–4 key scenes or turning points from the summary.
- The main character's appearance must stay consistent across all scenes.
- Avoid describing any character movement like walking, running, jumping, etc.
- Instead, imply action through the environment, pose, or facial expression.
- Use rich, cinematic visual language.
- Add light camera movement (e.g., "camera slowly dolly in") only at the beginning or end of each scene.
- Include visual settings, mood, lighting, and emotional tone.
- Each scene must end with technical tags like: “4k, cinematic, soft lighting, shallow depth of field”.
`;

async function getUserIdFromBookId(bookId) {
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
  return item?.user_id?.S;
}

exports.handler = async (event) => {
  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      const { bookId, chapterNo, summaryText, isBookSummary = false } = body;

      console.log(`🎬 Generating script for ${isBookSummary ? "Book" : "Chapter"} ${bookId}${chapterNo ? ` - Chapter ${chapterNo}` : ""}`);

      const fullPrompt = `${scriptPrompt}\n\n${summaryText}`;
      const bedrockInput = {
        inferenceConfig: { max_new_tokens: 800 },
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
      const scriptText = responseBody.output.message.content[0].text.trim();

      console.log("✅ Script generated");

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
          book_id: { S: bookId },
        };
      }

      const update = new UpdateItemCommand({
        TableName: tableName,
        Key: key,
        UpdateExpression: "SET script = :script",
        ExpressionAttributeValues: {
          ":script": { S: scriptText },
        },
      });

      await dynamo.send(update);
      console.log(`🗃️ Script saved to ${isBookSummary ? "BOOKS_TABLE" : "CHAPTERS_TABLE"}`);

      // Send script to video generation queue
      const videoQueueUrl = process.env.VIDEO_QUEUE_URL;

      const sendVideoJob = new SendMessageCommand({
        QueueUrl: videoQueueUrl,
        MessageBody: JSON.stringify({
          bookId,
          chapterNo,
          scriptText,
          isBookSummary,
        }),
      });

      await sqs.send(sendVideoJob);
      console.log("📤 Script sent to VideoQueue");

    } catch (error) {
      console.error("❌ Error in GenerateScriptLambda:", error);
    }
  }
};
