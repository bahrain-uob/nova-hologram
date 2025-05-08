// config.js

// Load environment variables from .env only in non-production environments
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (e) {
    console.warn('dotenv not loaded — skipping since this is likely running in Lambda');
  }
}

// AWS-related configuration (region can be useful in some SDK clients)
const aws = {
  region: process.env.AWS_REGION || 'us-east-1',
};

// S3 configuration
const s3 = {
  // Bucket where QR code images will be saved
  qrCodeBucket: process.env.S3_QR_CODE_BUCKET || 'nova-hologram-qrcode',

  // Optional prefix path inside the bucket
  uploadPath: process.env.S3_UPLOAD_PATH || 'upload/',
};

// Export the config for use in Lambda
module.exports = {
  aws,
  s3,
};
