const { Polly, S3 } = require('aws-sdk');

const polly = new Polly();
const s3 = new S3();

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    const { text } = event;

    if (!text) {
      throw new Error('Text is required');
    }

    const response = await polly.synthesizeSpeech({
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: 'Joanna',
      Engine: 'neural'
    }).promise();

    const timestamp = Date.now();
    const key = `audio/${timestamp}.mp3`;

    await s3.putObject({
      Bucket: process.env.AUDIO_BUCKET_NAME,
      Key: key,
      Body: response.AudioStream,
      ContentType: 'audio/mpeg'
    }).promise();

    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: process.env.AUDIO_BUCKET_NAME,
      Key: key,
      Expires: 3600
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        audioUrl: url
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