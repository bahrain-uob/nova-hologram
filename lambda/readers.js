const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const params = {
    TableName: process.env.USER_TABLE_NAME,
    FilterExpression: 'role = :role',
    ExpressionAttributeValues: {
      ':role': 'reader'
    }
  };

  try {
    const data = await dynamoDB.scan(params).promise();
return {
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
};
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err.message),
    };
  }
};