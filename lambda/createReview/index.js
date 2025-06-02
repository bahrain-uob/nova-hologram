const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

function generateUUIDWithCrypto() {
  const crypto = require("crypto");
  return crypto.randomUUID();
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "POST, PUT, DELETE, GET, OPTIONS",
  };

  try {
    console.log("Event:", JSON.stringify(event, null, 2));

    // Handle OPTIONS preflight
    if (
      event.requestContext?.http?.method === "OPTIONS" ||
      event.httpMethod === "OPTIONS"
    ) {
      return {
        statusCode: 200,
        headers,
        body: "",
      };
    }

    // Parse body
    let body;
    if (typeof event.body === "string") {
      body = JSON.parse(event.body);
    } else {
      body = event.body;
    }

    const method = event.requestContext?.http?.method || event.httpMethod;

    if (method === "POST") {
      const { bookId, userId, userName, rating, reviewText } = body;

      if (!bookId || !userId || !userName || !rating || !reviewText) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error:
              "Missing required fields: bookId, userId, userName, rating, reviewText",
          }),
        };
      }

      if (rating < 1 || rating > 5) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Rating must be between 1 and 5" }),
        };
      }

      const reviewId = generateUUIDWithCrypto();
      const timestamp = new Date().toISOString();

      const reviewItem = {
        reviews_id: reviewId,
        user_id: userId,
        book_id: bookId,
        user_name: userName,
        rating,
        review_text: reviewText,
        created_at: timestamp,
        updated_at: timestamp,
      };

      await dynamodb.send(
        new PutCommand({
          TableName: process.env.REVIEW_TABLE_NAME,
          Item: reviewItem,
        })
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          message: "Review created successfully",
          review: reviewItem,
        }),
      };
    } else if (method === "PUT") {
      const { reviewId, userId, rating, reviewText } = body;

      if (!reviewId || !userId || !rating || !reviewText) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error:
              "Missing required fields: reviewId, userId, rating, reviewText",
          }),
        };
      }

      if (rating < 1 || rating > 5) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Rating must be between 1 and 5" }),
        };
      }

      const timestamp = new Date().toISOString();

      const result = await dynamodb.send(
        new UpdateCommand({
          TableName: process.env.REVIEW_TABLE_NAME,
          Key: { reviews_id: reviewId },
          UpdateExpression:
            "SET rating = :rating, review_text = :reviewText, updated_at = :updatedAt",
          ConditionExpression: "user_email = :userId",
          ExpressionAttributeValues: {
            ":rating": rating,
            ":reviewText": reviewText,
            ":updatedAt": timestamp,
            ":userId": userId,
          },
          ReturnValues: "ALL_NEW",
        })
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: "Review updated successfully",
          review: result.Attributes,
        }),
      };
    } else if (method === "DELETE") {
      const reviewId = event.pathParameters?.reviewId;
      const { userId } = body;

      if (!reviewId || !userId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: "Missing required fields: reviewId, userId",
          }),
        };
      }

      await dynamodb.send(
        new DeleteCommand({
          TableName: process.env.REVIEW_TABLE_NAME,
          Key: { reviews_id: reviewId },
          ConditionExpression: "user_email = :userId",
          ExpressionAttributeValues: {
            ":userId": userId,
          },
        })
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: "Review deleted successfully",
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  } catch (error) {
    console.error("Error processing review:", error);

    if (error.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          error: "You can only modify your own reviews",
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  }
};
