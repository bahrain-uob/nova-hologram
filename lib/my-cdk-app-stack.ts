import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { RemovalPolicy } from "aws-cdk-lib";
import { DBStack } from "./DBstack"; // Import DBStack
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as iam from 'aws-cdk-lib/aws-iam';




export class MyCdkStack extends cdk.Stack {
  public readonly websiteBucket: s3.Bucket; // Declare ReadingMaterialsBucket as a public property
  public readonly ReadingMaterials: s3.Bucket; // Declare ReadingMaterials as a public property
  constructor(scope: cdk.App, id: string,dbStack: DBStack, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket for React Website (without public access)
    //Creates a private S3 bucket (not public-facing)
    this.websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      removalPolicy: RemovalPolicy.DESTROY, //removalPolicy: DESTROY means it will be deleted on cdk destroy
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Deploy React App to S3
    //So React assets go from ./frontend/build to S3 bucket


    // CloudFront Distribution for S3 bucket
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, "OriginAccessIdentity"); //It is needed to access the PRIVATE S3 bucket from CloudFront

    this.websiteBucket.grantRead(cloudfrontOAI); // Grant CloudFront access to the S3 bucket

    const cloudfrontDistribution = new cloudfront.CloudFrontWebDistribution(this, "CloudFrontDistribution", {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: this.websiteBucket,
            originAccessIdentity: cloudfrontOAI,  // Associate OAI with the CloudFront distribution
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
    });

    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset("./frontend/build")], //the place where the static files are located.
      destinationBucket: this.websiteBucket,
      distribution: cloudfrontDistribution,
      distributionPaths: ['/*'], // This invalidates CloudFront cache
    });


    // Output the CloudFront URL for the website
    new cdk.CfnOutput(this, "CloudFrontURL", {
      value: cloudfrontDistribution.distributionDomainName,
      description: "The URL of the CloudFront distribution for the website",
    });
    
    this.ReadingMaterials = new s3.Bucket(this, "ReadingMaterials", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,  // Block public access to the bucket
    });
    //POST Lambda (Upload)
    const postUploadLambda = new lambda.Function(this, 'PostUploadLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,// execution environment
      handler: 'index.handler',// file is "index", function is "handler"   change this when you'll do the function itself
      code: lambda.Code.fromAsset('lambda/postUpload'),// code loaded from "lambda" directory
    });
    //GET Lambda (List files)
    const getFilesLambda = new lambda.Function(this, 'GetFilesLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/GetFiles'),
    });
    //DELETE Lambda (Delete file)
    const deleteFilesLambda = new lambda.Function(this, 'DeleteFilesLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/deleteFiles'),
    });
     //API Gateway to do the methods from the s3 website hosted bucket
     const PostGetDelete = new apigatewayv2.HttpApi(this, 'HttpApi', {
      apiName: 'WebAppHttpApi',
    });
    // Add route for upload 
    PostGetDelete.addRoutes({
      path: '/upload', //path of the api gateway url for example https://api-id.execute-api.region.amazonaws.com/upload
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('PostIntegration', postUploadLambda),
    });
    //Add route for get 
    PostGetDelete.addRoutes({
      path: '/upload',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('GetIntegration', getFilesLambda),
    });
    // Add route for delete
    PostGetDelete.addRoutes({
      path: '/upload',
      methods: [apigatewayv2.HttpMethod.DELETE],
      integration: new integrations.HttpLambdaIntegration('DeleteIntegration', deleteFilesLambda),
    });
    //giving lambda functions permissions
    this.ReadingMaterials.grantReadWrite(postUploadLambda);
    this.ReadingMaterials.grantRead(getFilesLambda);
    this.ReadingMaterials.grantWrite(deleteFilesLambda);

    // Output the API endpoint URL example: https://api-id.execute-api.region.amazonaws.com
    new cdk.CfnOutput(this, 'HttpApiEndpoint', {
      value: PostGetDelete.apiEndpoint,
    });

    // SQS Queue for new uploads from reading materials s3 bucket
    const readingMaterialsQueue = new sqs.Queue(this, "ReadingMaterialsQueue",{}); //this takes readingmaterials s3 object and puts it in the queue for the lambda function to process it

    // SQS Queue for extracted text from textract function 
    const extractedTextQueue = new sqs.Queue(this, "ExtractedTextQueue",{}); //after the textextraction lambda function processes the object, it puts the result in this queue for the next lambda function to process it

    // trigger the SQS readingmaterialsQueue when a new object is created in the ReadingMaterials s3 bucket
    this.ReadingMaterials.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SqsDestination(readingMaterialsQueue)
    );

    // This is the lambda function that will have the aws textract code to extract text  from object (pdf, epub and word for example)
    const textExtractionLambda = new lambda.Function(this, 'TextExtractionLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/TextExtraction'), //location of the folder that should have the text extracted object 
      environment: {
        OUTPUT_QUEUE_URL: extractedTextQueue.queueUrl,
      },
    });
    
    // Permissions
    readingMaterialsQueue.grantConsumeMessages(textExtractionLambda);
    this.ReadingMaterials.grantRead(textExtractionLambda);
    extractedTextQueue.grantSendMessages(textExtractionLambda);

    const saveExtractedTextLambda = new lambda.Function(this, 'SaveExtractedTextLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/SaveExtractedText'), //responsible for saving the extracted text to the DynamoDB table
    });
    

    
    // Permissions
    extractedTextQueue.grantConsumeMessages(saveExtractedTextLambda);//this permission will allow lambda function to consume the messages from the extractedTextQueue
    dbStack.extractedTextTable.grantWriteData(saveExtractedTextLambda); //this permission will allow lambda function to write the extracted text to the DynamoDB table
    saveExtractedTextLambda.addEventSource(new lambdaEventSources.SqsEventSource(extractedTextQueue)); //


    
    //BedRock Lambda function
    const BedRockFunction = new lambda.Function(this, 'MyBedrockFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/Bedrock'),
      timeout: cdk.Duration.seconds(30), // ⏱ Set a longer timeout here
      memorySize: 1024,                  // (Optional) More memory can help reduce latency
    });
    
    BedRockFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream'
      ],
      resources: ['*'], // or limit to specific model ARN
    }));

    

    

  }
}




