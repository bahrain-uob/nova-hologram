import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const BOOKS_TABLE = process.env.BOOKS_TABLE;
const CHAPTERS_TABLE = process.env.CHAPTERS_TABLE;

// Normalize incoming frontend fields to match DB schema
function normalizeFields(updatedFields) {
  const fieldMap = {
    title: "book_title",
    publisher: "publisher",
    genre: "genre",
  };

  const result = {};
  for (const [key, value] of Object.entries(updatedFields)) {
    const mappedKey = fieldMap[key] || key;

    if (mappedKey === "publisher" && typeof value === "string") {
      result[mappedKey] = { name: value };
    } else if (mappedKey === "genre" && typeof value === "string") {
      result[mappedKey] = [value];
    } else {
      result[mappedKey] = value;
    }
  }
  return result;
}

export const handler = async (event) => {
  console.log("Raw event received:", JSON.stringify(event));

  let body;
  try {
    body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  } catch (err) {
    console.error("Failed to parse JSON body:", err);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,PUT",
      },
      body: JSON.stringify({ message: "Invalid JSON format" }),
    };
  }

  const { book_id, updatedFields, chapters } = body;

  if (!book_id || !updatedFields) {
    console.warn("Missing required fields", { book_id, updatedFields });
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,PUT",
      },
      body: JSON.stringify({ message: "Missing required fields" }),
    };
  }

  try {
    // Step 1: Get user_id from book
    const userQuery = await docClient.send(new QueryCommand({
      TableName: BOOKS_TABLE,
      IndexName: "GSI_by_book_id",
      KeyConditionExpression: "book_id = :book_id",
      ExpressionAttributeValues: { ":book_id": book_id },
    }));

    if (!userQuery.Items || userQuery.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "OPTIONS,PUT",
        },
        body: JSON.stringify({ message: "Book not found" }),
      };
    }

    const book = userQuery.Items[0];
    const user_id = book.user_id;

    console.log("Updating book for:", { user_id, book_id });

    // Step 2: Normalize field names/types
    const normalizedFields = normalizeFields(updatedFields);

    // Step 3: Prepare update expression
    let UpdateExpression = "SET";
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};

    Object.entries(normalizedFields).forEach(([key, value], index) => {
      const attrName = `#field${index}`;
      const attrValue = `:value${index}`;
      UpdateExpression += ` ${attrName} = ${attrValue},`;
      ExpressionAttributeNames[attrName] = key;
      ExpressionAttributeValues[attrValue] = value;
    });

    UpdateExpression = UpdateExpression.slice(0, -1); // remove trailing comma

    // Step 4: Execute book update
    await docClient.send(new UpdateCommand({
      TableName: BOOKS_TABLE,
      Key: { user_id, book_id },
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    }));

    console.log("Book updated.");

    // Step 5: Update chapters if provided
    if (Array.isArray(chapters)) {
      for (const chapter of chapters) {
        const { chapter_id, summary } = chapter;
        if (!chapter_id || typeof summary !== "string") continue;

        await docClient.send(new UpdateCommand({
          TableName: CHAPTERS_TABLE,
          Key: { chapter_id, book_id },
          UpdateExpression: "SET #summary = :summary",
          ExpressionAttributeNames: { "#summary": "summary" },
          ExpressionAttributeValues: { ":summary": summary },
        }));
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,PUT",
      },
      body: JSON.stringify({ message: "Book and chapters updated successfully" }),
    };

  } catch (error) {
    console.error("Update failed:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,PUT",
      },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
