const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

// Use the correct table name - this is critical
const tableName = process.env.BOOK_TABLE_NAME || "DBStack-bookF0785129-1B9WR0J1EB4DN";

exports.handler = async function(event) {
  console.log("Delete event:", JSON.stringify(event, null, 2));
  console.log("Using table name:", tableName);
  
  try {
    // Get the book ID from path parameters
    const bookId = event.pathParameters?.bookId;
    
    if (!bookId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Book ID is required" }),
        headers: { "Access-Control-Allow-Origin": "*" }
      };
    }
    
    // Parse the request body if available
    let body = {};
    try {
      if (event.body) {
        body = JSON.parse(event.body);
      }
    } catch (e) {
      console.error("Failed to parse body:", e);
    }
    
    const userId = body.userId || event.queryStringParameters?.userId;
    
    // First scan for the book to find all its data
    console.log(`Scanning for book with ID: ${bookId}`);
    const scanParams = {
      TableName: tableName,
      FilterExpression: "book_id = :bookId",
      ExpressionAttributeValues: {
        ":bookId": bookId
      }
    };
    
    const scanResult = await dynamo.scan(scanParams).promise();
    console.log("Scan result:", JSON.stringify(scanResult, null, 2));
    
    if (scanResult.Items && scanResult.Items.length > 0) {
      // Found the book, now delete it
      const bookToDelete = scanResult.Items[0];
      console.log("Book found, attempting to delete:", JSON.stringify(bookToDelete, null, 2));
      
      // Determine the key structure
      let deleteParams;
      
      // If the table has a composite key with user_id and book_id
      if (bookToDelete.user_id) {
        console.log(`Using composite key with user_id: ${bookToDelete.user_id} and book_id: ${bookId}`);
        deleteParams = {
          TableName: tableName,
          Key: {
            user_id: bookToDelete.user_id,
            book_id: bookId
          }
        };
      } else {
        // If the table only uses book_id as the key
        console.log(`Using simple key with book_id: ${bookId}`);
        deleteParams = {
          TableName: tableName,
          Key: {
            book_id: bookId
          }
        };
      }
      
      console.log("Delete params:", JSON.stringify(deleteParams, null, 2));
      await dynamo.delete(deleteParams).promise();
      
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: "Book deleted successfully",
          bookId: bookId
        }),
        headers: { "Access-Control-Allow-Origin": "*" }
      };
    } else {
      console.log(`Book not found with ID: ${bookId}`);
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Book not found" }),
        headers: { "Access-Control-Allow-Origin": "*" }
      };
    }
  } catch (error) {
    console.error("Error deleting book:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: "Failed to delete book", 
        error: error.message,
        stack: error.stack
      }),
      headers: { "Access-Control-Allow-Origin": "*" }
    };
  }
};
