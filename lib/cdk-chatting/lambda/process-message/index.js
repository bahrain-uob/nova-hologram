const { Lambda } = require('aws-sdk');
const lambda = new Lambda();

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }

    const bedrockResponse = await lambda.invoke({
      FunctionName: process.env.BEDROCK_FUNCTION_NAME,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({ prompt })
    }).promise();

    console.log('Bedrock response:', JSON.stringify(bedrockResponse, null, 2));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Success',
        response: JSON.parse(bedrockResponse.Payload)
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};