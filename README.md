# IGA Innovation Hub - Tawasul MVP

### 📁 **Project Structure**

```

IGA-Tawasul-MVP/
│── frontend/                # React app (S3-hosted website)
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── .gitignore
│   ├── README.md
│   ├── build/               # React build output (deployed to S3)
│── lambda/                  # Lambda function code
│   ├── index.js             # Simple "Hello, World!" function
│   ├── package.json
│── bin/
│   ├── my-cdk-app.ts        # CDK entry point
│── lib/
│   ├── my-cdk-app-stack.ts  # CDK stack defining S3, API Gateway, and Lambda
│── cdk.json                 # CDK config
│── package.json             # CDK dependencies
│── tsconfig.json            # TypeScript config
│── .gitignore
│── README.md

```

## Prerequisites 

Before getting started, ensure you have the following installed:

AWS CLI: Follow the installation guide here: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html 


## 🚀 Getting Started

Follow these steps to set up and deploy the project:

#### 📥 Clone the Repository

Clone this repository into your local environment. 


#### 📌 Install AWS CDK globally

```npm install -g aws-cdk```

#### 📌 Install AWS CDK library

```npm install aws-cdk-lib```

#### 🛠 Fix any security vulnerabilities

```npm audit fix```

#### 📂 Navigate to the frontend directory

```cd frontend```

#### 📌 Install frontend dependencies
```
npm install
npm install web-vitals
```
```
npm audit fix --force
```

#### 🔙 Return to the root directory

```cd ..```

#### 🚀 Deploy the CDK application

```cdk deploy```

#### ⚠️ Notes

Ensure you are authenticated with AWS before running cdk deploy.

If you encounter permission errors, check your AWS IAM roles and policies.







