import {
    DynamoDBClient,
    UpdateItemCommand,
    QueryCommand,
  } from "@aws-sdk/client-dynamodb";
  import {
    BedrockRuntimeClient,
    InvokeModelCommand,
  } from "@aws-sdk/client-bedrock-runtime";
  import {
    SQSClient,
    SendMessageCommand,
  } from "@aws-sdk/client-sqs";
  
  const dynamo = new DynamoDBClient({});
  const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
  const sqs = new SQSClient();
  
  const POLLY_QUEUE_URL = process.env.POLLY_QUEUE_URL;
  const MAX_WORDS = 200;
  
  const narrationPromptTemplate = `
  You are an expert narration writer for children’s educational videos.
  
  Your task: Write a short, clear voiceover narration that tells the full story in chronological order using the summary and visual scene descriptions provided.
  
  Guidelines:
  - Keep the script under 100 words to fit in about 1 minute of speech.
  - Focus on telling exactly what happens, step by step.
  - Use simple, direct sentences and transition words like: first, then, after that, finally.
  - Do not include background music, camera movements, or visual descriptions — just the narration.
  - Combine information from both the summary and the scene script to make the story complete, but brief.
  
  Now write the 1-minute audio narration using this content:
  
  SUMMARY:
  {summary}
  
  SCENE SCRIPT:
  {script}
  `;
  
  const getUserIdFromBookId = async (bookId) => {
    const result = await dynamo.send(new QueryCommand({
      TableName: process.env.BOOKS_TABLE,
      IndexName: "GSI_by_book_id",
      KeyConditionExpression: "book_id = :bookId",
      ExpressionAttributeValues: {
        ":bookId": { S: bookId },
      },
    }));
    return result.Items?.[0]?.user_id?.S;
  };
  
  const generateNarrationFromBedrock = async (summary, script) => {
    const fullPrompt = narrationPromptTemplate
      .replace("{summary}", summary)
      .replace("{script}", script);
  
      const bedrockInput = {
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
    const body = JSON.parse(new TextDecoder().decode(response.body));
    return body.output.message.content[0].text.trim();
  };
  
  const wrapWithSSML = (text) => {
    const trimmed = text.split(" ").slice(0, MAX_WORDS).join(" ");
    return `<speak><prosody rate="slow">${trimmed}</prosody></speak>`;
  };
  
  export const handler = async (event) => {
    for (const record of event.Records) {
      try {
        const body = JSON.parse(record.body);
        const { bookId, chapterNo, summary, script, isBookSummary = false, videoS3Path } = body;
  
        const narration = await generateNarrationFromBedrock(summary, script);
        const ssml = wrapWithSSML(narration);
  
        const tableName = isBookSummary ? process.env.BOOKS_TABLE : process.env.CHAPTERS_TABLE;
  
        const key = isBookSummary
          ? { user_id: { S: await getUserIdFromBookId(bookId) }, book_id: { S: bookId } }
          : { chapter_id: { S: `${bookId}#${chapterNo}` }, book_id: { S: bookId } };
  
        await dynamo.send(new UpdateItemCommand({
          TableName: tableName,
          Key: key,
          UpdateExpression: "SET ssml = :ssml",
          ExpressionAttributeValues: {
            ":ssml": { S: ssml },
          },
        }));
  
        console.log(" SSML saved to DynamoDB");
  
        await sqs.send(new SendMessageCommand({
          QueueUrl: POLLY_QUEUE_URL,
          MessageBody: JSON.stringify({ bookId, chapterNo, isBookSummary, ssml, videoS3Path }),
        }));
  
        console.log(" SSML message sent to PollyQueue");
      } catch (error) {
        console.error(" Error in GenerateSSMLLambda:", error);
      }
    }
  };

  