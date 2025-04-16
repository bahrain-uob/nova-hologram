exports.handler = async (event) => {
    console.log('Start transcription job with event:', event);
    // trigger Amazon Transcribe here
    return { statusCode: 200, body: 'Transcription started' };
  };
  