/**
 * AWS Lambda Configuration
 * Centralizes access to environment variables for Lambda functions
 */

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// AWS Configuration
const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  profile: process.env.AWS_PROFILE || 'default',
};

// Cognito Configuration
const cognitoConfig = {
  userPoolId: process.env.COGNITO_USER_POOL_ID || '',
  clientId: process.env.COGNITO_CLIENT_ID || '',
  region: process.env.COGNITO_REGION || 'us-east-1',
};

// S3 Configuration
const s3Config = {
  readingMaterialsBucket: process.env.S3_READING_MATERIALS_BUCKET || 'nova-hologram-reading-materials',
  generatedContentBucket: process.env.S3_GENERATED_CONTENT_BUCKET || 'nova-hologram-generated-content',
};

// DynamoDB Configuration
const dynamoDbConfig = {
  table: process.env.DYNAMODB_TABLE || 'NovaHologramTable',
};

// Textract Configuration
const textractConfig = {
  enabled: process.env.TEXTRACT_ENABLED === 'true',
};

// Bedrock Configuration
const bedrockConfig = {
  enabled: process.env.BEDROCK_ENABLED === 'true',
  modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-v2',
};

// Export all configurations
module.exports = {
  aws: awsConfig,
  cognito: cognitoConfig,
  s3: s3Config,
  dynamoDb: dynamoDbConfig,
  textract: textractConfig,
  bedrock: bedrockConfig,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
};
