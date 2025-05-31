const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const bucketName = process.env.BUCKET_NAME;

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Max S3 object expiration (in seconds)
const URL_EXPIRE_SECONDS = 300; // 5 minutes

exports.handler = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const fileName = body.fileName;
    const fileType = body.fileType;

    // Check file name and type are provided
    if (!fileName || !fileType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing fileName or fileType' })
      };
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`
        })
      };
    }

    // Optionally: Get user info from authorizer (if API Gateway auth is used)
    // const userId = event.requestContext.authorizer.claims.sub || 'anonymous';

    // Generate unique file key
    const timestamp = Date.now();
    const fileKey = `uploads/${timestamp}-${fileName}`;

    // Generate S3 pre-signed URL
    const uploadUrl = s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: fileKey,
      Expires: URL_EXPIRE_SECONDS,
      ContentType: fileType
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // You can lock this down later if needed
      },
      body: JSON.stringify({
        uploadUrl,
        fileKey
      })
    };
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to generate upload URL',
        error: error.message
      })
    };
  }
};
