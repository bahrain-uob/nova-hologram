const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = "DBStack-bookF0785129-1B9WR0J1EB4DN"; // Replace with your actual table name

exports.handler = async function(event) {
  try {
    const bookId = event.pathParameters?.bookId;

    if (!bookId) {
      return { statusCode: 400, body: JSON.stringify({ message: "Book ID is required" }) };
    }

    // Get user ID from body or query parameters
    let body = {};
    try {
      if (event.body) {
        body = JSON.parse(event.body);
      }
    } catch (e) {
      console.log("Failed to parse body:", e);
    }

    const userId = body.userId || event.queryStringParameters?.userId;

    if (!userId) {
      // If no user ID, try to delete by book ID only (may not work if composite key)
      console.log("No user ID provided, attempting to delete by book ID only");

      // Try to scan for the book first to get its user ID
      const scanParams = {
        TableName: tableName,
        FilterExpression: "book_id = :bookId",
        ExpressionAttributeValues: {
          ":bookId": bookId
        }
      };

      const scanResult = await dynamo.scan(scanParams).promise();

      if (scanResult.Items && scanResult.Items.length > 0) {
        // Found the book, now delete it with its user ID
        const foundBook = scanResult.Items[0];

        await dynamo.delete({
          TableName: tableName,
          Key: {
            user_id: foundBook.user_id,
            book_id: bookId
          }
        }).promise();

        return {
          statusCode: 200,
          body: JSON.stringify({ message: "Book deleted successfully" }),
          headers: { "Access-Control-Allow-Origin": "*" }
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Book not found" }),
          headers: { "Access-Control-Allow-Origin": "*" }
        };
      }
    } else {
      // Delete with both user ID and book ID
      await dynamo.delete({
        TableName: tableName,
        Key: {
          user_id: userId,
          book_id: bookId
        }
      }).promise();

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Book deleted successfully" }),
        headers: { "Access-Control-Allow-Origin": "*" }
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to delete book", error: error.message }),
      headers: { "Access-Control-Allow-Origin": "*" }
    };
  }
};
