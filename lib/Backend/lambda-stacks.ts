import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { DBStack } from "../DB/db-stack"; // Import DBStack
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources"; // Import lambda event sources
import { StorageStack } from "../Storage/storage-stack"; // Import StorageStack
import { SharedResourcesStack } from "../sharedresources/SharedResourcesStack";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";


export class lambdastack extends cdk.Stack {
    public readonly postUploadLambda: lambda.Function;
    public readonly getFilesLambda: lambda.Function;
    public readonly deleteFilesLambda: lambda.Function;
    public readonly BedRockFunction: lambda.Function; 
    public readonly getBookInfoLambda: lambda.Function;

    public readonly messageProcessing: lambda.Function; 
    public readonly invokeBedrock: lambda.Function; 
    public readonly invokeBedrockLib: lambda.Function; 
    public readonly playResponse: lambda.Function; 
    public readonly transcribe: lambda.Function; 
    public readonly triggerPolly: lambda.Function; 


  constructor(scope: cdk.App, id: string, dbStack: DBStack, StorageStack:StorageStack, shared:SharedResourcesStack, props?: cdk.StackProps & { synthesisMode?: boolean }) {
    // Extract synthesisMode from props if present
    const synthesisMode = props?.synthesisMode || false;
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
      
  //Student

  
          // Lambda function for processing audio files
        this.messageProcessing = new lambda.Function(this, 'MessageProcessingLambda', {
          runtime: lambda.Runtime.NODEJS_18_X,
          code: lambda.Code.fromAsset('lambda/Student/MessageProcessing'),
          handler: 'messageProcessing.handler',
        }),
          // Lambda function for transcribing audio files
        this.transcribe = new lambda.Function(this, 'TranscribeLambda', {
          runtime: lambda.Runtime.NODEJS_18_X,
          code: lambda.Code.fromAsset('lambda/Student/Transcribe'),//remove, one lambda needed
          handler: 'transcribe.handler',
        }), 
        // Lambda function: // Calls Bedrock with the transcribed text and saves Q&A to DynamoDB
        this.invokeBedrock = new lambda.Function(this, 'InvokeBedrockLambda', {
          runtime: lambda.Runtime.NODEJS_18_X,
          code: lambda.Code.fromAsset('lambda/Student/InvokeBedrock'),
          handler: 'invokeBedrock.handler',
          environment: {
            QATABLE_NAME: dbStack.qaTable.tableName,
          },
        }),
        // Lambda function for triggering Polly and saving audio in S3
        this.triggerPolly = new lambda.Function(this, 'TriggerPollyLambda', {
          runtime: lambda.Runtime.NODEJS_18_X,
          code: lambda.Code.fromAsset('lambda/Student/TriggerPolly'),
          handler: 'triggerPolly.handler',
          environment: {
            BUCKET_NAME: StorageStack.audioFilesBucket.bucketName,
          },
        }),
        
          // Lambda function for playing the response
        this.playResponse = new lambda.Function(this, 'PlayResponseLambda', {
          runtime: lambda.Runtime.NODEJS_18_X,
          code: lambda.Code.fromAsset('lambda/Student/PlayResponse'),
          handler: 'playResponse.handler',
        }),
      
          // Lambda function for invoking Bedrock (Librarian) and stores Nova content in S3
        this.invokeBedrockLib = new lambda.Function(this, 'InvokeBedrockLibrarianLambda', {
          runtime: lambda.Runtime.NODEJS_18_X,
          code: lambda.Code.fromAsset('lambda/Student/LibInvokeBedrock'),
          handler: 'invokeBedrockLibrarian.handler',
          environment: {
            OUTPUT_BUCKET: StorageStack.novaContentBucket.bucketName,
            TEXT_TABLE: dbStack.extractedTextTable.tableName,
          },
        });
  

      // Only add permissions and event notifications if not in synthesis mode
      // This breaks the circular dependency during CDK synthesis
      if (!synthesisMode) {
        // Add permission for S3 to invoke the Lambda
        this.playResponse.addPermission('AllowS3Invoke', {
          principal: new iam.ServicePrincipal('s3.amazonaws.com'),
          sourceArn: StorageStack.audioFilesBucket.bucketArn
        });
        
        // Add the event notification directly here
        // This will only run during actual deployment, not during synthesis
        try {
          StorageStack.audioFilesBucket.addEventNotification(
            s3.EventType.OBJECT_CREATED,
            new s3n.LambdaDestination(this.playResponse)
          );
        } catch (error) {
          // Ignore circular dependency errors during synthesis
          console.warn('Skipping event notification setup during synthesis to avoid circular dependencies');
        }
      } else {
        console.log('Running in synthesis mode - skipping event notification setup');
      }

      // Permissions
    // Allow Polly Lambda to write to the audio bucket
    StorageStack.audioFilesBucket.grantWrite(this.triggerPolly);
    // Allow librarian Bedrock Lambda to write Nova content to Nova bucket
    StorageStack.novaContentBucket.grantWrite(this.invokeBedrockLib);
    // Allow Student Bedrock Lambda to write to Q&A table
    dbStack.qaTable.grantReadWriteData(this.invokeBedrock);
    // Allow librarian Bedrock Lambda to read from text table
    dbStack.extractedTextTable.grantReadData(this.invokeBedrockLib);

    // Permissions for lamdas to call Transcribe, Polly, and Bedrock
        this.invokeBedrock.addToRolePolicy(new iam.PolicyStatement({
          actions: [
            'bedrock:*',
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
            'dynamodb:*',
            's3:PutObject',
            's3:GetObject',
            's3:ListBucket'
          ],
          resources: ['*']  // Use specific ARNs for tighter control
        }));

        this.invokeBedrockLib.addToRolePolicy(new iam.PolicyStatement({
          actions: [
            'bedrock:*',
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
            'dynamodb:*',
            's3:PutObject',
            's3:GetObject',
            's3:ListBucket'
          ],
          resources: ['*']  // Use specific ARNs for tighter control
        }));

        this.messageProcessing.addToRolePolicy(new iam.PolicyStatement({
          actions: [
            'bedrock:*',
            'transcribe:*',
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
            'dynamodb:*',
            's3:PutObject',
            's3:GetObject',
            's3:ListBucket'
          ],
          resources: ['*']  // Use specific ARNs for tighter control
        }));

        this.playResponse.addToRolePolicy(new iam.PolicyStatement({
          actions: [
            'bedrock:*',
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
            'dynamodb:*',
            's3:PutObject',
            's3:GetObject',
            's3:ListBucket'
          ],
          resources: ['*']  // Use specific ARNs for tighter control
        }));

        this.transcribe.addToRolePolicy(new iam.PolicyStatement({
          actions: [
            'bedrock:*',
            'transcribe:*',
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
            'dynamodb:*',
            's3:PutObject',
            's3:GetObject',
            's3:ListBucket'
          ],
          resources: ['*']  // Use specific ARNs for tighter control
        }));

        this.triggerPolly.addToRolePolicy(new iam.PolicyStatement({
          actions: [
            'bedrock:*',
            'polly:*',
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
            'dynamodb:*',
            's3:PutObject',
            's3:GetObject',
            's3:ListBucket'
          ],
          resources: ['*']  // Use specific ARNs for tighter control
        }));

         // Lambda to get book info using ISBN or DOI
        const getBookInfoLambda = new lambda.Function(this, "GetBookInfoLambda", {
          runtime: lambda.Runtime.NODEJS_18_X,
          handler: "index.handler",
          code: lambda.Code.fromAsset("lambda/getBookInfo"), 
          });
          this.getBookInfoLambda = getBookInfoLambda;
  }
}