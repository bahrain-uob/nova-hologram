const { TextractClient, StartDocumentTextDetectionCommand } = require("@aws-sdk/client-textract");

const textractClient = new TextractClient();

exports.handler = async (event) => {
    const snsMessage = JSON.parse(event.Records[0].Sns.Message);
    const bookId = snsMessage.book_id;
    const fileKey = `books/${bookId}/book.pdf`; // path in S3

  const params = {
    DocumentLocation: {
      S3Object: {
        Bucket: process.env.BUCKET_NAME, 
        Name: fileKey,
      },
    },
    NotificationChannel: {
      SNSTopicArn: process.env.SNS_TOPIC_ARN,         
      RoleArn: process.env.TEXTRACT_SERVICE_ROLE_ARN, 
    },
    JobTag: bookId,
  };

  try {
    const command = new StartDocumentTextDetectionCommand(params);
    const response = await textractClient.send(command);
    console.log("Textract job started:", response.JobId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Textract job started",
        jobId: response.JobId,
        bookId,
      }),
    };
  } catch (err) {
    console.error("Error starting Textract:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
