/**
 * AWS Configuration
 * This file exports AWS configuration values from environment variables
 */

export const awsConfig = {
  // AWS Region
  region: process.env.NEXT_PUBLIC_AWS_PROJECT_REGION || 'us-east-1',
  
  // Cognito Configuration
  cognito: {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
    clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
    region: process.env.NEXT_PUBLIC_COGNITO_REGION || 'us-east-1',
  },
  
  // S3 Configuration
  s3: {
    readingMaterialsBucket: process.env.NEXT_PUBLIC_S3_READING_MATERIALS_BUCKET || '',
    generatedContentBucket: process.env.NEXT_PUBLIC_S3_GENERATED_CONTENT_BUCKET || '',
  },
  
  // API Gateway
  apiGateway: {
    endpoint: process.env.NEXT_PUBLIC_API_GATEWAY_ENDPOINT || 'https://your-api-gateway-endpoint.execute-api.us-east-1.amazonaws.com/prod',
  },
  
  // API URL
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
};

export default awsConfig;
