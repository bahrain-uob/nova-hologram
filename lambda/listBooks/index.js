import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb"; 
const client = new DynamoDBClient({});

export const handler = async function () {
  try {
    const data = await client.send(new ScanCommand({
      TableName: process.env.BOOK_TABLE_NAME,
    }));

    //  Convert each item from DynamoDB format to plain JS object
    const books = data.Items?.map((item) => unmarshall(item)) || [];

    return {
      statusCode: 200,
      body: JSON.stringify(books),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch books", error }),
    };
  }
};
