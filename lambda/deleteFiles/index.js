exports.handler = async function (event) {
    console.log('request:', JSON.stringify(event, undefined, 2))
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: `hey from delete file. ${event.path}\n`,
    }
  }