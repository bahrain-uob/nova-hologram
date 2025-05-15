const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

const tableName = process.env.BOOK_TABLE_NAME;

exports.handler = async function(event) {
  try {
    const data = await dynamo.scan({ TableName: tableName }).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch books", error }),
    };
  }
};
