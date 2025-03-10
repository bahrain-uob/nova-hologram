exports.handler = async (event) => {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",  // Allow all origins or specify specific domains
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",  // Allow methods
        "Access-Control-Allow-Headers": "Content-Type", // Allow specific headers
      },
      body: JSON.stringify({ message: "Hello CIC team!" }),
    };
  };
  