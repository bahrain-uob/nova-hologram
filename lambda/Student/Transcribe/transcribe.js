const AWS = require('aws-sdk');
const transcribe = new AWS.TranscribeService();


exports.handler = async (event) => {
    console.log('Transcribe Lambda triggered with:', event);

  const jobName = `transcription-${Date.now()}`;
  const params = {
    TranscriptionJobName: jobName,
    LanguageCode: 'en-US',
    MediaFormat: 'mp3',
    Media: {
      MediaFileUri: event.audioS3Url || 'https://example.com/audio.mp3', // Replace with actual audio URL
    },
    OutputBucketName: process.env.OUTPUT_BUCKET || 'your-transcribe-output-bucket',
  };

  await transcribe.startTranscriptionJob(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Transcription started', jobName }),
  };
};


  