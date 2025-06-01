import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());
const snsClient = new SNSClient();

const TABLE_NAME = process.env.TABLE_NAME;
const SNS_TOPIC_ARN = process.env.TEXTRACT_TRIGGER_TOPIC_ARN;

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const bookId = body.book_id;
    const timestamp = new Date().toISOString();

    const item = {
      book_id: bookId,
      user_id: body.user_id,
      book_title: body.book_title,
      type: body.type,
      genre: body.genre || [],
      collection_id: body.collection ? Number(body.collection) : undefined,
      isbn: body.isbn,
      authors: body.authors || [],
      language: body.language,
      publisher: body.publisher || {},
      publication_year: body.publication_year,
      reading_level: body.reading_level,
      book_cover: body.book_cover || "",
      book_file: body.book_file || "",
      book_summary: "",
      book_trailer: "",
      prompt: body.prompt || "",
      created_at: timestamp,
      updated_at: timestamp,
    };

    if (body.objectives) {
      item.objectives = body.objectives;
    }

    await dynamoClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    }));

    await snsClient.send(new PublishCommand({
      TopicArn: SNS_TOPIC_ARN,
      Message: JSON.stringify({
        book_id: bookId,
        file_key: body.book_file
      }),
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Book metadata saved and Textract triggered", book_id: bookId })
    };

  } catch (err) {
    console.error("Error saving book metadata:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save book metadata" })
    };
  }
};

