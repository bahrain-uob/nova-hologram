import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.READER_BOOKS_TABLE;

export const handler = async (event) => {
  try {
    if (event.httpMethod === "POST") {
      const { userId, bookId, title, author, genre, book_cover } = JSON.parse(
        event.body
      );

      const params = {
        TableName: TABLE_NAME,
        Item: {
          user_id: userId,
          book_id: bookId,
          book_title: title,
          authors: author,
          genre,
          progress: 0,
          addedAt: new Date().toISOString(),
          book_cover,
        },
      };

      await ddbDocClient.send(new PutCommand(params));

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify({ message: "Book added successfully" }),
      };
    } else if (event.httpMethod === "GET") {
      const userId = event.queryStringParameters?.userId;
      if (!userId) {
        return {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
          body: JSON.stringify({ message: "Missing userId query parameter" }),
        };
      }

      const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: "user_id = :u",
        ExpressionAttributeValues: {
          ":u": userId,
        },
      };

      const data = await ddbDocClient.send(new QueryCommand(params));

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify({ books: data.Items || [] }),
      };
    } else {
      return {
        statusCode: 405,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
