exports.handler = async (event) => {
    console.log('Play response triggered with:', event);
    return { statusCode: 200, body: 'Response played (simulation)' };
  };
  