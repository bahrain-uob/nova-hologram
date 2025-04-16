const AWS = require('aws-sdk');
const polly = new AWS.Polly();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const responseText = 'Hello, this is a Polly response.';
  const pollyParams = {
    OutputFormat: 'mp3',
    Text: responseText,
    VoiceId: 'Joanna',
  };

  const audioStream = await polly.synthesizeSpeech(pollyParams).promise();
  const key = `response-${Date.now()}.mp3`;

  await s3.putObject({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Body: audioStream.AudioStream,
    ContentType: 'audio/mpeg',
  }).promise();

  return { statusCode: 200, body: 'Audio saved to S3' };
};
