const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

const tableName = process.env.BOOK_TABLE_NAME;

exports.handler = async function(event) {
  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    const bookId = event.pathParameters?.bookId;
    
    if (!bookId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Book ID is required" }),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      };
    }
    
    // Ensure the book exists before updating
    const existingBook = await dynamo.get({
      TableName: tableName,
      Key: {
        book_id: bookId
      }
    }).promise();
    
    if (!existingBook.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Book not found" }),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      };
    }
    
    // Build update expression dynamically based on provided fields
    const updateParams = {
      TableName: tableName,
      Key: {
        book_id: bookId
      },
      UpdateExpression: "set",
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
      ReturnValues: "ALL_NEW"
    };
    
    let prefix = " ";
    
    // Only update fields that are provided
    const fields = [
      { name: "book_title", paramName: "#title", value: requestBody.book_title },
      { name: "authors", paramName: "#authors", value: requestBody.authors },
      { name: "genre", paramName: "#genre", value: requestBody.genre },
      { name: "reading_level", paramName: "#level", value: requestBody.reading_level },
      { name: "publication_year", paramName: "#year", value: requestBody.publication_year },
      { name: "book_cover", paramName: "#cover", value: requestBody.book_cover },
      { name: "isbn", paramName: "#isbn", value: requestBody.isbn },
      { name: "language", paramName: "#lang", value: requestBody.language },
      { name: "book_summary", paramName: "#summary", value: requestBody.book_summary },
      { name: "publisher", paramName: "#publisher", value: requestBody.publisher }
    ];
    
    fields.forEach(field => {
      if (field.value !== undefined) {
        updateParams.UpdateExpression += `${prefix}${field.paramName} = :${field.name}`;
        updateParams.ExpressionAttributeNames[field.paramName] = field.name;
        updateParams.ExpressionAttributeValues[`:${field.name}`] = field.value;
        prefix = ", ";
      }
    });
    
    // If no fields to update
    if (prefix === " ") {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "No fields to update" }),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      };
    }
    
    // Add updated_at timestamp
    updateParams.UpdateExpression += `${prefix}#updated = :updated`;
    updateParams.ExpressionAttributeNames["#updated"] = "updated_at";
    updateParams.ExpressionAttributeValues[":updated"] = new Date().toISOString();
    
    const result = await dynamo.update(updateParams).promise();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Book updated successfully",
        book: result.Attributes
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    };
  } catch (error) {
    console.error("Error updating book:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to update book", error: error.message }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    };
  }
};