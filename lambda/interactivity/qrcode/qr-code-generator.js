// qr-code-generator.js

const QRCode = require('qrcode');
const { s3 } = require('./config'); // Import cleaned S3 config
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'); // AWS SDK v3

exports.handler = async (event) => {
  const url = event.queryStringParameters?.url;

  if (!url) {
    return {
      statusCode: 400,
      body: 'Missing "url" query parameter',
    };
  }

  try {
    // Generate QR code as PNG buffer
    const qrPng = await QRCode.toBuffer(url);

    // Define bucket and key
    const bucketName = s3.qrCodeBucket;
    const uploadPath = s3.uploadPath;
    const keyName = `${uploadPath}${Date.now()}.png`;

    // Create S3 client (uses IAM role in Lambda)
    const s3Client = new S3Client(); 

    const s3Params = {
      Bucket: bucketName,
      Key: keyName,
      Body: qrPng,
      ContentType: 'image/png',
    };

    // Upload to S3
    await s3Client.send(new PutObjectCommand(s3Params));

    const s3Url = `https://${bucketName}.s3.amazonaws.com/${keyName}`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'QR Code generated and saved to S3!',
        qrCodeUrl: s3Url
      }),
    };
  } catch (err) {
    console.error('Error generating QR code:', err);
    return {
      statusCode: 500,
      body: 'Failed to generate QR code',
    };
  }
};
