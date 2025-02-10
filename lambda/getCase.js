const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const tableName = process.env.CASES_TABLE_NAME; // Get table name from environment variable

  if (!tableName) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Table name is not set in environment variables" }),
    };
  }

  const params = {
    TableName: tableName,
  };

  try {
    const result = await dynamoDB.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error("Error fetching cases:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch cases", error: error.message }),
    };
  }
};
