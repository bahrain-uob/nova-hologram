/**
 * AWS Configuration
 * This file exports AWS configuration values from environment variables
 */

export const awsConfig = {
  // AWS Region
  region: process.env.NEXT_PUBLIC_AWS_PROJECT_REGION || 'us-east-1',
  
  // Cognito Configuration
  cognito: {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'us-east-1_U0iB4Rowp',
    clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '509b3p7mb73l7rfi2h16mef65v',
    region: process.env.NEXT_PUBLIC_COGNITO_REGION || 'us-east-1',
  },
  
  // S3 Configuration
  s3: {
    readingMaterialsBucket: process.env.NEXT_PUBLIC_S3_READING_MATERIALS_BUCKET || 'nova-hologram-reading-materials',
    generatedContentBucket: process.env.NEXT_PUBLIC_S3_GENERATED_CONTENT_BUCKET || 'nova-hologram-generated-content',
  },
  
  // API Gateway
  apiGateway: {
    endpoint: process.env.NEXT_PUBLIC_API_GATEWAY_ENDPOINT || 'https://your-api-gateway-endpoint.execute-api.us-east-1.amazonaws.com/prod',
  },
  
  // API URL
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
};

export default awsConfig;
