import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { DBStack } from "../DB/db-stack"; // Import DBStack
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources"; // Import lambda event sources
import { StorageStack } from "../Storage/storage-stack"; // Import StorageStack
import { SharedResourcesStack } from "../sharedresources/SharedResourcesStack";

export class lambdastack extends cdk.Stack {
    public readonly postUploadLambda: lambda.Function;
    public readonly getFilesLambda: lambda.Function;
    public readonly deleteFilesLambda: lambda.Function;
    public readonly BedRockFunction: lambda.Function; 
  constructor(scope: cdk.App, id: string, dbStack: DBStack,StorageStack:StorageStack, shared:SharedResourcesStack, props?: cdk.StackProps) {
    super(scope, id, props);

    //POST Lambda (Upload)
    this.postUploadLambda = new lambda.Function(this, 'PostUploadLambda', {
        runtime: lambda.Runtime.NODEJS_18_X,// execution environment
        handler: 'index.handler',// file is "index", function is "handler"   change this when you'll do the function itself
        code: lambda.Code.fromAsset('lambda/postUpload'),// code loaded from "lambda" directory
      });
      //GET Lambda (List files)
    this.getFilesLambda = new lambda.Function(this, 'GetFilesLambda', {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('lambda/GetFiles'),
      });
      //DELETE Lambda (Delete file)
    this.deleteFilesLambda = new lambda.Function(this, 'DeleteFilesLambda', {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('lambda/deleteFiles'),
      });
    //giving lambda functions permissions
    StorageStack.readingMaterials.grantReadWrite(this.postUploadLambda);
    StorageStack.readingMaterials.grantRead(this.getFilesLambda);
    StorageStack.readingMaterials.grantWrite(this.deleteFilesLambda);

 
     // This is the lambda function that will have the aws textract code to extract text  from object (pdf, epub and word for example)
    const textExtractionLambda = new lambda.Function(this, 'TextExtractionLambda', {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('lambda/TextExtraction'), //location of the folder that should have the text extracted object 
        environment: {
          OUTPUT_QUEUE_URL: StorageStack.extractedTextQueue.queueUrl,
        },
      });

      // Permissions
      StorageStack.readingMaterialsQueue.grantConsumeMessages(textExtractionLambda);
      StorageStack.readingMaterials.grantRead(textExtractionLambda);
      StorageStack.extractedTextQueue.grantSendMessages(textExtractionLambda);
  
      const saveExtractedTextLambda = new lambda.Function(this, 'SaveExtractedTextLambda', {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('lambda/SaveExtractedText'), //responsible for saving the extracted text to the DynamoDB table
      });

      // Permissions
      StorageStack.extractedTextQueue.grantConsumeMessages(saveExtractedTextLambda);//this permission will allow lambda function to consume the messages from the extractedTextQueue
      dbStack.extractedTextTable.grantWriteData(saveExtractedTextLambda); //this permission will allow lambda function to write the extracted text to the DynamoDB table
      saveExtractedTextLambda.addEventSource(new lambdaEventSources.SqsEventSource(StorageStack.extractedTextQueue)); //

      this.BedRockFunction = new lambda.Function(this, 'MyBedrockFunction', {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: 'index.lambda_handler',  // Match the Python handler
        code: lambda.Code.fromAsset('lambda/Bedrock'),
        timeout: cdk.Duration.seconds(900),  // Increase to 15 minutes
        memorySize: 2048,
        environment: {
          VIDEO_BUCKET: StorageStack.genVideos.bucketName,  // Used in Python code
        }
      });
      
  
  }
}