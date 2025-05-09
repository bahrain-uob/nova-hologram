# Nova Hologram Project Overview

Nova Hologram is an educational platform that transforms reading materials into immersive holographic experiences. The system allows librarians to upload reading materials and readers to access these materials along with AI-generated holographic content.

## Project Structure

The project is organized into several main directories:

- **frontend-next**: Next.js frontend application
- **lambda**: AWS Lambda functions for backend processing
- **bin**: Deployment scripts and utilities
- **lib**: Shared libraries and utilities
- **test**: Testing utilities and test cases

## Key Features

1. **User Authentication**: Secure login and registration using AWS Cognito
2. **Book Management**: Upload, view, and manage reading materials
3. **AI Content Generation**: Generate holographic videos from text using Amazon Bedrock
4. **Text Extraction**: Extract text from uploaded documents using Amazon Textract
5. **Role-Based Access**: Different interfaces for readers and librarians

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Authentication**: AWS Cognito
- **Storage**: AWS S3
- **Backend Processing**: AWS Lambda
- **AI Services**: Amazon Bedrock, Amazon Textract
- **API Gateway**: AWS API Gateway

## Getting Started

See the following documentation sections for detailed information on how to use and extend the project:

1. [Authentication System](./05-authentication-system.md)
2. [Frontend Components](./06-frontend-components.md)
3. [Lambda Functions](./07-lambda-functions.md)
4. [API Services](./08-api-services.md)
5. [Page Routing](./09-page-routing.md)
