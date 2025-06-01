const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { Lambda } = require('aws-sdk');

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });
const lambda = new Lambda();

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    const { prompt } = event;

    const response = await bedrock.send(new InvokeModelCommand({
      modelId: 'anthropic.claude-v2',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
        max_tokens_to_sample: 300,
        temperature: 0.7,
        top_p: 1,
      })
    }));

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log('Bedrock response:', JSON.stringify(responseBody, null, 2));

    const pollyResponse = await lambda.invoke({
      FunctionName: process.env.POLLY_FUNCTION_NAME,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({ text: responseBody.completion })
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        text: responseBody.completion,
        audio: JSON.parse(pollyResponse.Payload)
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};