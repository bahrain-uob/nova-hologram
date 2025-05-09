#!/bin/bash

# Nova Hologram Frontend Runner
# This script focuses on running just the frontend-next part of the project

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}    NOVA HOLOGRAM FRONTEND      ${NC}"
echo -e "${BLUE}=================================${NC}"

# Check if .env file exists in frontend-next
if [ ! -f "frontend-next/.env" ]; then
  echo -e "${YELLOW}Creating frontend-next/.env file...${NC}"
  cat > frontend-next/.env << 'EOL'
# AWS Configuration
AWS_REGION=us-east-1
AWS_PROFILE=default

# Cognito Configuration
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_U0iB4Rowp
NEXT_PUBLIC_COGNITO_CLIENT_ID=509b3p7mb73l7rfi2h16mef65v
NEXT_PUBLIC_COGNITO_REGION=us-east-1

# S3 Configuration
NEXT_PUBLIC_S3_READING_MATERIALS_BUCKET=nova-hologram-reading-materials
NEXT_PUBLIC_S3_GENERATED_CONTENT_BUCKET=nova-hologram-generated-content

# API Gateway
NEXT_PUBLIC_API_GATEWAY_ENDPOINT=https://your-api-gateway-endpoint.execute-api.us-east-1.amazonaws.com/prod

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# AWS Amplify Configuration
NEXT_PUBLIC_AWS_PROJECT_REGION=us-east-1
NEXT_PUBLIC_AWS_COGNITO_REGION=us-east-1
NEXT_PUBLIC_AWS_USER_POOLS_ID=us-east-1_U0iB4Rowp
NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID=509b3p7mb73l7rfi2h16mef65v
EOL
  echo -e "${GREEN}Created .env file${NC}"
fi

# Start the frontend development server
echo -e "${YELLOW}Starting frontend-next development server...${NC}"
echo -e "${BLUE}This will run in development mode, bypassing TypeScript errors${NC}"
echo -e "${BLUE}Open http://localhost:3000 in your browser when the server starts${NC}"

cd frontend-next
npm run dev
