import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { DBStack } from "./DBstack"; // Import DBStack
import * as s3 from "aws-cdk-lib/aws-s3";
import { MyCdkStack } from "./my-cdk-app-stack";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { RemovalPolicy } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";

export class APIStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, dbStack: DBStack, props?: cdk.StackProps) {
    super(scope, id, props);

    //declaration of API Gateway
    const api = new apigatewayv2.HttpApi(this, 'ApiGateway', {
      corsPreflight: { allowOrigins: ['*'] },
    });


    new cdk.CfnOutput(this, 'S3-Lambda-POST', {
      value: api.url!,
      description: 'API Gateway endpoint between Lambda and S3 for POST requests',
    });

    const ReadingMaterials = new s3.Bucket(this, "ReadingMaterials", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,  // Block public access to the bucket
    });
    const WritetoReadingMaterialS3 = new lambda.Function(this, 'WritetoReadingMaterials', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('Lambda/index.js'), // directory with index.js
      handler: 'index.handler',
    });


    //allowing the post Lambda to write to the S3 bucket
    ReadingMaterials.grantWrite(WritetoReadingMaterialS3);
    WritetoReadingMaterialS3.addEnvironment("READING_BUCKET", ReadingMaterials.bucketName);

    api.addRoutes({
      path: '/upload',
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration( //Integration means basically means if the path /upload, it will call the Lambda function.
        'UploadIntegration',
        WritetoReadingMaterialS3
      ),
    });



    new cdk.CfnOutput(this, 'S3-Lambda-POST', {
      value: api.url!,
      description: 'API Gateway endpoint between Lambda and S3 for POST requests',
    }); //printing important values after cdk stack is deployed

        // Lambda to READ from ReadingMaterials bucket (no need for api integration)
    const ReadFromReadingMaterialS3 = new lambda.Function(this, 'ReadFromReadingMaterials', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('Lambda/read.js'), // adjust path as needed
      handler: 'read.handler',
    });
    ReadingMaterials.grantRead(ReadFromReadingMaterialS3); // Grant read access
    ReadFromReadingMaterialS3.addEnvironment("READING_BUCKET", ReadingMaterials.bucketName);

    // Lambda to DELETE from ReadingMaterials bucket
    const DeleteFromReadingMaterialS3 = new lambda.Function(this, 'DeleteFromReadingMaterials', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('Lambda/delete.js'), // adjust path as needed
      handler: 'delete.handler',
    });
    ReadingMaterials.grantDelete(DeleteFromReadingMaterialS3); // Grant delete access
    DeleteFromReadingMaterialS3.addEnvironment("READING_BUCKET", ReadingMaterials.bucketName);



    // From S3 Bucket to QUEUE
    const readingMaterialsQueue = new sqs.Queue(this, 'ReadingMaterialsQueue');
    
    ReadingMaterials.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SqsDestination(readingMaterialsQueue)
    ); //basically once an object is created in the S3 bucket, it will send it to the queue.

    // Define the textExtractionLambda function
        const textExtractionLambda = new lambda.Function(this, 'TextExtractionLambda', {
          runtime: lambda.Runtime.NODEJS_18_X,
          code: lambda.Code.fromAsset('Lambda/textExtraction.js'), // adjust path as needed
          handler: 'textExtraction.handler',
        });
    
        textExtractionLambda.addToRolePolicy(new iam.PolicyStatement({
          actions: [
            "textract:DetectDocumentText",
            "textract:StartDocumentTextDetection",
            "textract:GetDocumentTextDetection"
          ],
          resources: ["*"] // Optional: Narrow to specific resources
        }));
    
        ReadingMaterials.grantRead(textExtractionLambda); // allow Lambda to read S3 objects
        
        textExtractionLambda.addEventSource(
          new lambdaEventSources.SqsEventSource(readingMaterialsQueue)
        );
        
        readingMaterialsQueue.grantConsumeMessages(textExtractionLambda);
        
    
 
    




  }
}
