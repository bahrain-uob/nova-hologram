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
const lambda = new AWS.Lambda();
const bedrock = new AWS.Bedrock(); // Adjust region as necessary: ex: { region: 'us-east-1' }


exports.handler = async (event) => {
  console.log('Invoking Bedrock with:', event);

  const id = uuidv4();
  // Get the transcribed text from the event
  const question = event.transcribedText || 'Sample Question';

  const answer = 'Sample Answer from Bedrock'; // Replace with actual Bedrock integration
  //const answer = await getAnswerFromBedrock(question);

  // Save question/answer to DynamoDB
  await dynamodb.put({
    TableName: process.env.QATABLE_NAME,
    Item: {
      id,
      question,
      answer,
    }
  }).promise();

// Trigger Polly Lambda
await lambda.invoke({
    FunctionName: process.env.TRIGGER_POLLY_LAMBDA_NAME,
    InvocationType: 'Event',
    Payload: JSON.stringify({ answer }),
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ question, answer, message: 'Stored in DynamoDB' }),
  };
};

