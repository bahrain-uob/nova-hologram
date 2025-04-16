const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Invoking Bedrock with:', event);

  const id = uuidv4();
  await dynamodb.put({
    TableName: process.env.QATABLE_NAME,
    Item: {
      id,
      question: event.question || 'Sample Question',
      answer: 'Sample Answer from Bedrock'
    }
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Stored in DynamoDB' }),
  };
};
