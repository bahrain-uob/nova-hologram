import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  try {
    console.log("Event:", JSON.stringify(event, null, 2));

    // Handle preflight OPTIONS request
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

    // Get bookId from query parameters (API Gateway v2) or queryStringParameters (API Gateway v1)
    const bookId =
      event.queryStringParameters?.bookId ||
      event.pathParameters?.bookId ||
      (event.requestContext?.http?.method
        ? new URLSearchParams(event.rawQueryString || "").get("bookId")
        : null);

    if (!bookId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing bookId parameter",
        }),
      };
    }

    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);

    // Query reviews by book_id using GSI
    const params = {
      TableName: process.env.REVIEW_TABLE_NAME,
      IndexName: "GSI_by_book_id",
      KeyConditionExpression: "book_id = :bookId",
      ExpressionAttributeValues: {
        ":bookId": bookId,
      },
      ScanIndexForward: false, // Sort by created_at descending (newest first)
    };

    const result = await docClient.send(new QueryCommand(params));

    // Calculate average rating
    const reviews = result.Items || [];
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating =
      reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    // Group ratings by star count for rating breakdown
    const ratingBreakdown = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      ratingBreakdown[review.rating]++;
    });

    // Calculate percentages
    const ratingPercentages = {};
    Object.keys(ratingBreakdown).forEach((star) => {
      ratingPercentages[star] =
        reviews.length > 0
          ? Math.round((ratingBreakdown[star] / reviews.length) * 100)
          : 0;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reviews: reviews,
        totalReviews: reviews.length,
        averageRating: Number.parseFloat(averageRating),
        ratingBreakdown: ratingBreakdown,
        ratingPercentages: ratingPercentages,
      }),
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
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
