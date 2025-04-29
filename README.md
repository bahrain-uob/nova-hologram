# Nova Hologram Educational Platform

### 📁 **Project Structure**

```
Nova-Hologram/
│── frontend-next/                # Next.js application
│   ├── public/                   # Static assets
│   ├── src/                      # Source code
│   │   ├── app/                  # Next.js App Router pages
│   │   │   ├── actions/          # Server actions
│   │   │   ├── addbook/          # Add book page
│   │   │   ├── bookdetail-librarian/ # Book detail for librarians
│   │   │   ├── bookdetail-reader/    # Book detail for readers
│   │   │   ├── dashboard/        # Librarian dashboard
│   │   │   ├── login/            # Login page
│   │   │   ├── reader-dashboard/ # Reader dashboard
│   │   │   ├── signup/           # Signup page
│   │   │   └── videosGenerated/  # Generated videos page
│   │   ├── components/           # Reusable UI components
│   │   │   ├── addbook/          # Book addition components
│   │   │   ├── auth/             # Authentication components
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   ├── layout/           # Layout components
│   │   │   └── ui/               # UI primitives
│   │   ├── context/              # React context providers
│   │   │   └── auth-context.tsx  # Authentication context
│   │   ├── lib/                  # Utility functions
│   │   │   ├── api-service.ts    # API service functions
│   │   │   ├── auth.ts           # Authentication utilities
│   │   │   ├── s3-service.ts     # S3 interaction utilities
│   │   │   └── utils.ts          # General utilities
│   │   ├── types/                # TypeScript type definitions
│   │   │   └── book.ts           # Book-related types
│   │   └── config/               # Configuration
│   │       └── aws-config.ts     # AWS configuration
│   ├── package.json              # Dependencies and scripts
│   └── tsconfig.json             # TypeScript configuration
│
│── lambda/                       # Lambda functions
│   ├── Bedrock/                  # Video generation with Bedrock
│   │   ├── index.py              # Lambda handler
│   │   ├── Template Prompts      # Prompt templates
│   │   └── requirements.txt      # Python dependencies
│   ├── GetBookInfo/              # Book metadata retrieval
│   │   └── index.js              # Lambda handler
│   ├── GetFiles/                 # File retrieval from S3
│   ├── SaveExtractedText/        # Save extracted text
│   ├── Student/                  # Student-specific functions
│   ├── TextExtraction/           # Text extraction with Textract
│   │   └── textex.py             # Text extraction implementation
│   ├── deleteFiles/              # File deletion from S3
│   ├── postUpload/               # Post-upload processing
│   └── utils/                    # Shared utilities
│
│── bin/                          # CDK entry points
│
│── lib/                          # CDK infrastructure
│   └── Nova-Hologram-Page-6.drawio.png # Architecture diagram
│
│── docs/                         # Documentation
│   ├── 00-project-overview.md    # Project overview
│   ├── 01-context.md             # Project context
│   ├── 02-deployment-architecture.md # AWS architecture
│   ├── 03-api-defenition.md      # API definitions
│   ├── 04-db-schema.md           # Database schema
│   ├── 05-authentication-system.md # Authentication details
│   ├── 06-frontend-components.md # Frontend component guide
│   ├── 07-lambda-functions.md    # Lambda function guide
│   ├── 08-api-services.md        # API services guide
│   ├── 09-page-routing.md        # Page routing guide
│   ├── 10-environment-setup.md   # Environment setup guide
│   ├── 11-ai-features.md         # AI features documentation
│   ├── assets/                   # Documentation assets
│   ├── diagrams/                 # Architecture diagrams
│   └── Wireframes/               # UI wireframes
│
│── test/                         # Test files
│
│── cdk.json                      # CDK configuration
│── package.json                  # Project dependencies
└── README.md                     # Project README
```

### **Project Structure Breakdown:**

##### 1. **Frontend (`frontend-next/`)**

The `frontend-next/` directory contains the Next.js application that serves as the user interface for the Nova Hologram platform.

- **public/**: Contains static assets such as images, fonts, and the favicon.
- **src/**: The source code for the Next.js application, organized into several subdirectories:
  - **app/**: Page components following the Next.js App Router convention
  - **components/**: Reusable UI components organized by functionality
  - **context/**: React context providers, including authentication context
  - **lib/**: Utility functions and service implementations
  - **types/**: TypeScript type definitions
  - **config/**: Configuration files for AWS services
- **package.json**: Manages dependencies and scripts for the Next.js application.

##### 2. **Lambda Functions (`lambda/`)**

The `lambda/` directory contains several AWS Lambda functions that power the backend of the Nova Hologram platform. Each function is designed for a specific purpose and can be deployed independently.

###### Key Lambda Functions:

- **Bedrock/**: Generates holographic videos from text using Amazon Bedrock's Nova Reel model.
  - **index.py**: Main Lambda handler that processes text input and generates videos.
  - **Template Prompts**: Contains prompt templates for optimizing video generation.
  - **requirements.txt**: Python dependencies for the Lambda function.
  
  This function works by:
  1. Taking text input from the request
  2. Formatting it with a template to create an effective prompt
  3. Calling Amazon Bedrock's Nova Reel model to generate a video
  4. Storing the video in an S3 bucket
  5. Returning the video URI to the client
  
  Example usage:
  ```json
  {
    "prompt": "A student is reading a book about space exploration. The planets orbit around the sun in the background."
  }
  ```

- **GetBookInfo/**: Retrieves metadata for books using ISBN or DOI identifiers.
  - **index.js**: Queries Google Books API for ISBN or Crossref API for DOI.
  
  This function supports two types of identifiers:
  1. ISBN: For traditional books, using Google Books API
  2. DOI: For academic papers, using Crossref API
  
  Example usage:
  ```json
  {
    "input": "9781234567890"
  }
  ```

- **TextExtraction/**: Extracts text from uploaded documents using Amazon Textract.
  - **textex.py**: Implements asynchronous text extraction from documents in S3.
  
  This function:
  1. Starts an asynchronous Textract job on a document in S3
  2. Polls for job completion
  3. Extracts and formats the text content
  4. Returns the extracted text
  
  Example usage:
  ```json
  {
    "documentKey": "materials/document.pdf"
  }
  ```

- **SaveExtractedText/**: Stores extracted text in the database for later use.
- **GetFiles/**: Retrieves files from S3 with appropriate permissions.
- **deleteFiles/**: Removes files from S3 and updates database records.
- **postUpload/**: Processes files after upload, triggering text extraction.

##### 3. **Amazon Bedrock Integration**

The Nova Hologram platform leverages Amazon Bedrock for AI-powered content generation. Specifically, it uses the Nova Reel model for text-to-video generation to create immersive holographic experiences from reading materials.

###### Key Features:

- **Text-to-Video Generation**: Transforms textual descriptions into visually rich videos.
- **Customizable Parameters**: Controls video quality, duration, and style through parameters:
  ```python
  "videoGenerationConfig": {
      "fps": 24,
      "durationSeconds": 60,
      "dimension": "1280x720",
      "seed": seed,
  }
  ```
- **Prompt Engineering**: Uses carefully crafted prompts to guide the AI in generating educational content:
  ```python
  base_prompt = """
  You are an AI that transforms story content into immersive holographic scene descriptions for an educational reading platform.
  
  Generate a rich, multi-sensory scene description from this input text. Include:
  - Visual setting (location, time, atmosphere)
  - Main characters or objects (description, motion)
  - Sounds or ambient noise
  - Suggested narration with emphasis for pronunciation practice
  """
  ```

###### Integration Flow:

1. Text is extracted from reading materials using Textract
2. Users select portions of text for visualization
3. The Bedrock Lambda function is invoked with the text
4. Amazon Bedrock generates a video based on the text
5. The video is stored in S3 and made available to users

###### Performance Considerations:

- Video generation typically takes 1-3 minutes depending on complexity
- Videos are generated asynchronously to avoid blocking user interaction
- Generated videos are cached to improve performance for frequently accessed content

##### 4. **CDK Infrastructure (`bin/` and `lib/`)**

The `bin/` and `lib/` directories contain the AWS Cloud Development Kit (CDK) application that defines and deploys the infrastructure for the Nova Hologram platform.

- **bin/**: Contains the entry point for the CDK app that defines which stacks are to be deployed.
- **lib/**: Contains the CDK stacks that define the AWS resources:
  - **S3 Buckets**: For storing reading materials and generated videos
  - **API Gateway**: For handling API requests from the frontend
  - **Lambda Functions**: For backend processing
  - **DynamoDB Tables**: For storing application data
  - **Cognito User Pools**: For user authentication
  - **IAM Roles and Policies**: For secure access to AWS resources

##### 5. **CDK Configuration**

These files handle the configuration and dependencies for the CDK setup:

- **cdk.json**: Contains the configuration for the CDK app, including environment settings.
- **package.json**: Defines the dependencies for the CDK project.
- **tsconfig.json**: TypeScript configuration for the CDK project.

##### 6. **Authentication System**

The Nova Hologram platform uses AWS Cognito for user authentication and management. The system supports two types of users:

1. **Readers**: Students and learners who access and consume educational content
2. **Librarians**: Content managers who upload and manage reading materials

###### AWS Cognito Configuration:

- **User Pool ID**: us-east-1_U0iB4Rowp
- **Client ID**: 509b3p7mb73l7rfi2h16mef65v
- **Region**: us-east-1
- **Token signing key URL**: https://cognito-idp.us-east-1.amazonaws.com/us-east-1_U0iB4Rowp/.well-known/jwks.json

###### Authentication Flow:

1. Users register with email, password, name, and user type (reader/librarian)
2. Email verification is required to complete registration
3. After login, users receive JWT tokens for API authorization
4. Different dashboards are presented based on user type

###### Implementation:

The authentication system is implemented in the following files:

- **frontend-next/src/context/auth-context.tsx**: React context for managing authentication state
- **frontend-next/src/lib/auth.ts**: Authentication utility functions
- **frontend-next/src/app/login/page.tsx**: Login page component
- **frontend-next/src/app/signup/page.tsx**: Signup page component
- **frontend-next/src/app/verification/page.tsx**: Account verification page

## Prerequisites 

Before getting started, ensure you have the following installed:

AWS CLI: Follow the installation guide here: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html 



## 🚀 Getting Started

Follow these steps to set up and deploy the project:

#### 📥 Clone the Repository

Clone this repository into your local environment. 


#### 📌 Install AWS CDK globally

```
npm install -g aws-cdk
```

#### 📌 Install AWS CDK library

```
npm install aws-cdk-lib
```

#### 🛠 Fix any security vulnerabilities

```
npm audit fix
```

#### 📂 Navigate to the frontend directory

```
cd frontend
```

#### 📌 Install frontend dependencies
```
npm install
```
```
npm install web-vitals
```
```
npm audit fix --force
```
```
npm run build
```

#### 🔙 Return to the root directory

```
cd ..
```

#### 🚀 Deploy the CDK application

```
cdk deploy --all
```

#### ⚠️ Notes for development 

Ensure you are authenticated with AWS before running cdk deploy.

If you encounter permission errors, check your AWS IAM roles or NCSC boundaries/policies.

  **After successful initial deployment:**
  1. Copy your API Endpoint URL from your API stack deployment outputs
  2. Go to ```frontend > src > app.js```
  3. Replace YOUR_API_GATEWAY_URL, line 8 with your own API endpoint
  4. Build the React App:```npm run build```
  6. Sync the Build Files to S3:```aws s3 sync build/ s3://your-bucket-name --delete```
  7. **if needed** Invalidate CloudFront Cache:```aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"```









