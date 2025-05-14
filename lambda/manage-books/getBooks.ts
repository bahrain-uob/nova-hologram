import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const docClient = new DynamoDB.DocumentClient();
const TABLE_NAME = 'book';

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.pathParameters?.user_id;
  const bookId = event.pathParameters?.book_id;

  if (!userId || !bookId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing user_id or book_id' }),
    };
  }

  try {
    const data = await docClient.get({
      TableName: TABLE_NAME,
      Key: {
        user_id: userId,     // string
        book_id: bookId      // string ✅
      }
    }).promise();

    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Book not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data.Item),
    };
  } catch (error) {
    console.error('Get error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error', error }),
    };
  }
};
