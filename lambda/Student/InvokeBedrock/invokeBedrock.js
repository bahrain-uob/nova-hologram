//student
// Triggered by AWS Transcribe when transcription is complete
// Communicates with Bedrock and stores the question/answer in DynamoDB
// Triggerts Polly
//check with muhammed, deploy one scrip
//task1: test bedrock and come with good prompt another task for testing
//create task2 : prompt engineering for user side, user asks question about a part. 
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const lambdaClient = new AWS.Lambda();

// Initialize the Bedrock client—adjust the region as needed,
// or derive it from process.env.AWS_REGION if provided.
const bedrock = new AWS.Bedrock({ region: process.env.AWS_REGION || 'us-east-1' });

exports.handler = async (event) => {
  console.log('Invoking Bedrock with event:', event);

  const id = uuidv4();
  // Extract the transcribed text; default to a sample question if none is provided
  const question = event.transcribedText || 'Sample Question';

  // Call Amazon Bedrock to get an answer for the question.
  // Replace the following with the correct method and parameters as per your Bedrock model.
  let answer;
  try {
    const bedrockParams = {
      ModelId: process.env.BEDROCK_MODEL_ID || 'default-model', // Set via environment variable
      ContentType: 'text/plain',
      Accept: 'text/plain',
      Body: question, // Sending the question as plain text
    };

    console.log('Calling Bedrock with parameters:', bedrockParams);

    // Invoke the Bedrock model (this is an example call; your actual API may differ)
    const bedrockResponse = await bedrock.invokeModel(bedrockParams).promise();
    
    // Assume that bedrockResponse.Body returns a Buffer (or string) with the answer.
    answer = bedrockResponse.Body ? bedrockResponse.Body.toString('utf-8') : 'No answer returned by Bedrock';
    console.log('Received answer from Bedrock:', answer);
  } catch (err) {
    console.error('Error invoking Bedrock:', err);
    answer = 'Error retrieving response from Bedrock';
  }

  // Store the Q&A pair in DynamoDB using the table name from the environment variable.
  try {
    await dynamodb.put({
      TableName: process.env.QATABLE_NAME,
      Item: {
        id,
        question,
        answer,
      },
    }).promise();
    console.log(`Stored Q&A with id: ${id}`);
  } catch (dbErr) {
    console.error('Error storing Q&A in DynamoDB:', dbErr);
    // You could also return an error here if desired.
  }
  
  // Trigger the Polly Lambda (asynchronously) to further process the answer (e.g., for text-to-speech conversion)
  try {
    await lambdaClient.invoke({
      FunctionName: process.env.TRIGGER_POLLY_LAMBDA_NAME,
      InvocationType: 'Event', // Asynchronous invocation
      Payload: JSON.stringify({ answer }),
    }).promise();
    console.log('Triggered Polly Lambda successfully.');
  } catch (lambdaErr) {
    console.error('Error invoking Polly Lambda:', lambdaErr);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      question,
      answer,
      message: 'Question and answer stored; Polly Lambda triggered.',
    }),
  };
};
