exports.handler = async (event) => {
    console.log('Message processing event:', event);
    // Trigger transcribe logic here
    return { statusCode: 200, body: 'Message received' };
  };
  