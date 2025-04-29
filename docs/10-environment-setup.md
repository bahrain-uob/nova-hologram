# Environment Setup and Development Workflow

This document provides instructions for setting up the development environment and the recommended workflow for the Nova Hologram project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 16.x or later
- **npm**: Version 8.x or later
- **AWS CLI**: Version 2.x
- **Python**: Version 3.8 or later (for Lambda functions)
- **Git**: For version control

## Frontend Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nova-hologram
```

### 2. Install Dependencies

```bash
cd frontend-next
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the `frontend-next` directory with the following variables:

```
# AWS Configuration
NEXT_PUBLIC_AWS_PROJECT_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_U0iB4Rowp
NEXT_PUBLIC_COGNITO_CLIENT_ID=509b3p7mb73l7rfi2h16mef65v
NEXT_PUBLIC_COGNITO_REGION=us-east-1

# S3 Configuration
NEXT_PUBLIC_S3_READING_MATERIALS_BUCKET=reading-materials-bucket
NEXT_PUBLIC_S3_GENERATED_CONTENT_BUCKET=generated-content-bucket

# API Gateway
NEXT_PUBLIC_API_GATEWAY_ENDPOINT=https://your-api-gateway-endpoint.execute-api.us-east-1.amazonaws.com/prod
```

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Lambda Functions Setup

### 1. Set Up Python Virtual Environment

```bash
cd lambda
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure AWS Credentials

Ensure your AWS credentials are configured:

```bash
aws configure
```

Enter your AWS Access Key ID, Secret Access Key, default region, and output format.

## Development Workflow

### Frontend Development

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement Your Feature**:
   - Follow the component structure in `src/components`
   - Add new pages in `src/app`
   - Use the authentication context from `src/context/auth-context.tsx`
   - Use API services from `src/lib`

3. **Run Tests**:
   ```bash
   npm test
   ```

4. **Commit Your Changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push Your Branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Lambda Function Development

1. **Create or Modify Lambda Functions**:
   - Each Lambda function should be in its own directory under `lambda/`
   - Include a `requirements.txt` file for Python dependencies
   - Follow the existing patterns for error handling and response formatting

2. **Test Locally**:
   ```bash
   cd lambda/YourFunction
   python -c "import index; print(index.lambda_handler({'your': 'test', 'event': 'here'}, None))"
   ```

3. **Deploy to AWS**:
   ```bash
   cd lambda/YourFunction
   zip -r function.zip .
   aws lambda update-function-code --function-name YourFunction --zip-file fileb://function.zip
   ```

## Deployment

### Frontend Deployment

The frontend is deployed using AWS Amplify:

1. **Build the Application**:
   ```bash
   cd frontend-next
   npm run build
   ```

2. **Deploy to Amplify**:
   ```bash
   # If using Amplify CLI
   amplify publish
   
   # Or manually upload the build output to Amplify via the AWS Console
   ```

### Lambda Function Deployment

Lambda functions are deployed using AWS CloudFormation or manually:

1. **Package the Lambda Function**:
   ```bash
   cd lambda/YourFunction
   zip -r function.zip .
   ```

2. **Deploy to AWS Lambda**:
   ```bash
   aws lambda update-function-code --function-name YourFunction --zip-file fileb://function.zip
   ```

## Troubleshooting

### Common Issues

1. **Authentication Issues**:
   - Verify Cognito User Pool ID and Client ID in `.env.local`
   - Check browser console for authentication errors
   - Ensure user has the correct permissions

2. **API Gateway Issues**:
   - Verify API Gateway endpoint in `.env.local`
   - Check CORS configuration in API Gateway
   - Ensure Lambda functions have proper IAM permissions

3. **Lambda Function Issues**:
   - Check CloudWatch logs for errors
   - Verify IAM permissions for Lambda functions
   - Test Lambda functions locally before deployment

### Getting Help

If you encounter issues not covered in this document:

1. Check the project's issue tracker
2. Consult the AWS documentation
3. Reach out to the development team
