import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { DBStack } from "./DBstack"; // Import DBStack

export class APIStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, dbStack: DBStack, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function to insert sample cases into DynamoDB
    const insertSampleCaseLambda = new lambda.Function(this, "InsertSampleCaseLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "insertSampleCase.handler",  // Ensure this points to the correct handler
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        CASES_TABLE_NAME: dbStack.casesTable.tableName, // Pass table name as environment variable
      },
    });

    // Lambda function to insert new case into DynamoDB
    const insertCaseLambda = new lambda.Function(this, "InsertCaseLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "insertCase.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        CASES_TABLE_NAME: dbStack.casesTable.tableName,
      },
    });

    // Lambda function to get all cases from DynamoDB
    const getCasesLambda = new lambda.Function(this, "GetCasesLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "getCases.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        CASES_TABLE_NAME: dbStack.casesTable.tableName,
      },
    });

    // Lambda function for Hello World
    const helloLambda = new lambda.Function(this, "HelloLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda"),
    });

    // Grant permissions for Lambda functions to interact with DynamoDB
    dbStack.casesTable.grantReadWriteData(insertCaseLambda);
    dbStack.casesTable.grantReadData(getCasesLambda);
    dbStack.casesTable.grantReadWriteData(insertSampleCaseLambda);

    // Create the API Gateway with CORS enabled
    const api = new apigateway.RestApi(this, "[ChallengeName]Api", {
      restApiName: "[ChallengeName] Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
        allowCredentials: true,
      },
    });

    // Resource for '/cases' to insert new case
    const cases = api.root.addResource("cases");
    cases.addMethod("POST", new apigateway.LambdaIntegration(insertCaseLambda)); // POST /cases
    cases.addMethod("GET", new apigateway.LambdaIntegration(getCasesLambda));   // GET /cases

    // Resource for '/cases/sample' to insert sample cases
    const sampleCases = cases.addResource("sample");
    sampleCases.addMethod("POST", new apigateway.LambdaIntegration(insertSampleCaseLambda));  // POST /cases/sample

    // Resource for '/hello'
    const hello = api.root.addResource("hello");
    hello.addMethod("GET", new apigateway.LambdaIntegration(helloLambda));  // GET /hello

    // Outputs for both APIs
    new cdk.CfnOutput(this, "ApiEndpoint", {
      value: api.url,  // Combined API URL
    });
  }
}

