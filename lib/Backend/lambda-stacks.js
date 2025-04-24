"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lambdastack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const lambdaEventSources = __importStar(require("aws-cdk-lib/aws-lambda-event-sources")); // Import lambda event sources
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
const s3n = __importStar(require("aws-cdk-lib/aws-s3-notifications"));
class lambdastack extends cdk.Stack {
    constructor(scope, id, dbStack, StorageStack, shared, props) {
        super(scope, id, props);
        //POST Lambda (Upload)
        this.postUploadLambda = new lambda.Function(this, 'PostUploadLambda', {
            runtime: lambda.Runtime.NODEJS_18_X, // execution environment
            handler: 'index.handler', // file is "index", function is "handler"   change this when you'll do the function itself
            code: lambda.Code.fromAsset('lambda/postUpload'), // code loaded from "lambda" directory
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
        StorageStack.extractedTextQueue.grantConsumeMessages(saveExtractedTextLambda); //this permission will allow lambda function to consume the messages from the extractedTextQueue
        dbStack.extractedTextTable.grantWriteData(saveExtractedTextLambda); //this permission will allow lambda function to write the extracted text to the DynamoDB table
        saveExtractedTextLambda.addEventSource(new lambdaEventSources.SqsEventSource(StorageStack.extractedTextQueue)); //
        this.BedRockFunction = new lambda.Function(this, 'MyBedrockFunction', {
            runtime: lambda.Runtime.PYTHON_3_12,
            handler: 'index.lambda_handler', // Match the Python handler
            code: lambda.Code.fromAsset('lambda/Bedrock'),
            timeout: cdk.Duration.seconds(900), // Increase to 15 minutes
            memorySize: 2048,
            environment: {
                VIDEO_BUCKET: StorageStack.genVideos.bucketName, // Used in Python code
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
                code: lambda.Code.fromAsset('lambda/Student/Transcribe'), //remove, one lambda needed
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
            }),
            this.playResponse.addPermission('AllowS3Invoke', {
                principal: new iam.ServicePrincipal('s3.amazonaws.com'),
                sourceArn: StorageStack.audioFilesBucket.bucketArn,
            });
        StorageStack.audioFilesBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(this.playResponse));
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
            resources: ['*'] // Use specific ARNs for tighter control
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
            resources: ['*'] // Use specific ARNs for tighter control
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
            resources: ['*'] // Use specific ARNs for tighter control
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
            resources: ['*'] // Use specific ARNs for tighter control
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
            resources: ['*'] // Use specific ARNs for tighter control
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
            resources: ['*'] // Use specific ARNs for tighter control
        }));
    }
}
exports.lambdastack = lambdastack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLXN0YWNrcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxhbWJkYS1zdGFja3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsK0RBQWlEO0FBRWpELHlGQUEyRSxDQUFDLDhCQUE4QjtBQUcxRyx5REFBMkM7QUFDM0MsdURBQXlDO0FBQ3pDLHNFQUF3RDtBQUd4RCxNQUFhLFdBQVksU0FBUSxHQUFHLENBQUMsS0FBSztJQWV4QyxZQUFZLEtBQWMsRUFBRSxFQUFVLEVBQUUsT0FBZ0IsRUFBRSxZQUF5QixFQUFFLE1BQTJCLEVBQUUsS0FBc0I7UUFDdEksS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsc0JBQXNCO1FBQ3RCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ2xFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBQyx3QkFBd0I7WUFDNUQsT0FBTyxFQUFFLGVBQWUsRUFBQywwRkFBMEY7WUFDbkgsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLEVBQUMsc0NBQXNDO1NBQ3hGLENBQUMsQ0FBQztRQUNILHlCQUF5QjtRQUMzQixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDOUQsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsZUFBZTtZQUN4QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUM7U0FDL0MsQ0FBQyxDQUFDO1FBQ0gsNkJBQTZCO1FBQy9CLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ3BFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLGVBQWU7WUFDeEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDO1NBQ2xELENBQUMsQ0FBQztRQUNMLHFDQUFxQztRQUNyQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3BFLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzdELFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFHaEUsaUlBQWlJO1FBQ2xJLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUMzRSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLG9FQUFvRTtZQUMxSCxXQUFXLEVBQUU7Z0JBQ1gsZ0JBQWdCLEVBQUUsWUFBWSxDQUFDLGtCQUFrQixDQUFDLFFBQVE7YUFDM0Q7U0FDRixDQUFDLENBQUM7UUFFSCxjQUFjO1FBQ2QsWUFBWSxDQUFDLHFCQUFxQixDQUFDLG9CQUFvQixDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDOUUsWUFBWSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzlELFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBRXhFLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRTtZQUNuRixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxFQUFFLGlFQUFpRTtTQUMzSCxDQUFDLENBQUM7UUFFSCxjQUFjO1FBQ2QsWUFBWSxDQUFDLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQSxnR0FBZ0c7UUFDOUssT0FBTyxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsOEZBQThGO1FBQ2xLLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUVsSCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDcEUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUcsMkJBQTJCO1lBQzdELElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQztZQUM3QyxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUcseUJBQXlCO1lBQzlELFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFdBQVcsRUFBRTtnQkFDWCxZQUFZLEVBQUUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUcsc0JBQXNCO2FBQ3pFO1NBQ0YsQ0FBQyxDQUFDO1FBRVAsU0FBUztRQUdELDZDQUE2QztRQUMvQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRTtZQUM1RSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQ0FBa0MsQ0FBQztZQUMvRCxPQUFPLEVBQUUsMkJBQTJCO1NBQ3JDLENBQUM7WUFDQSwrQ0FBK0M7WUFDakQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO2dCQUM5RCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO2dCQUNuQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsMkJBQTJCLENBQUMsRUFBQywyQkFBMkI7Z0JBQ3BGLE9BQU8sRUFBRSxvQkFBb0I7YUFDOUIsQ0FBQztZQUNGLHdGQUF3RjtZQUN4RixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7Z0JBQ3BFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7Z0JBQ25DLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyw4QkFBOEIsQ0FBQztnQkFDM0QsT0FBTyxFQUFFLHVCQUF1QjtnQkFDaEMsV0FBVyxFQUFFO29CQUNYLFlBQVksRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVM7aUJBQ3hDO2FBQ0YsQ0FBQztZQUNGLDhEQUE4RDtZQUM5RCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7Z0JBQ2xFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7Z0JBQ25DLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyw2QkFBNkIsQ0FBQztnQkFDMUQsT0FBTyxFQUFFLHNCQUFzQjtnQkFDL0IsV0FBVyxFQUFFO29CQUNYLFdBQVcsRUFBRSxZQUFZLENBQUMsZ0JBQWdCLENBQUMsVUFBVTtpQkFDdEQ7YUFDRixDQUFDO1lBRUEsMkNBQTJDO1lBQzdDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtnQkFDbEUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztnQkFDbkMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLDZCQUE2QixDQUFDO2dCQUMxRCxPQUFPLEVBQUUsc0JBQXNCO2FBQ2hDLENBQUM7WUFFQSxpRkFBaUY7WUFDbkYsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsOEJBQThCLEVBQUU7Z0JBQ2hGLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7Z0JBQ25DLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQ0FBaUMsQ0FBQztnQkFDOUQsT0FBTyxFQUFFLGdDQUFnQztnQkFDekMsV0FBVyxFQUFFO29CQUNYLGFBQWEsRUFBRSxZQUFZLENBQUMsaUJBQWlCLENBQUMsVUFBVTtvQkFDeEQsVUFBVSxFQUFFLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTO2lCQUNqRDthQUNGLENBQUM7WUFHSixJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxlQUFlLEVBQUU7Z0JBQy9DLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQztnQkFDdkQsU0FBUyxFQUFFLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTO2FBQ25ELENBQUMsQ0FBQztRQUVILFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FDaEQsRUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQzNCLElBQUksR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FDN0MsQ0FBQztRQUVGLGNBQWM7UUFDaEIsa0RBQWtEO1FBQ2xELFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVELHNFQUFzRTtRQUN0RSxZQUFZLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2pFLHFEQUFxRDtRQUNyRCxPQUFPLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN2RCx5REFBeUQ7UUFDekQsT0FBTyxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUVoRSxnRUFBZ0U7UUFDNUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQ3pELE9BQU8sRUFBRTtnQkFDUCxXQUFXO2dCQUNYLHFCQUFxQjtnQkFDckIsc0JBQXNCO2dCQUN0QixtQkFBbUI7Z0JBQ25CLFlBQVk7Z0JBQ1osY0FBYztnQkFDZCxjQUFjO2dCQUNkLGVBQWU7YUFDaEI7WUFDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBRSx3Q0FBd0M7U0FDM0QsQ0FBQyxDQUFDLENBQUM7UUFFSixJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUM1RCxPQUFPLEVBQUU7Z0JBQ1AsV0FBVztnQkFDWCxxQkFBcUI7Z0JBQ3JCLHNCQUFzQjtnQkFDdEIsbUJBQW1CO2dCQUNuQixZQUFZO2dCQUNaLGNBQWM7Z0JBQ2QsY0FBYztnQkFDZCxlQUFlO2FBQ2hCO1lBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUUsd0NBQXdDO1NBQzNELENBQUMsQ0FBQyxDQUFDO1FBRUosSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDN0QsT0FBTyxFQUFFO2dCQUNQLFdBQVc7Z0JBQ1gsY0FBYztnQkFDZCxxQkFBcUI7Z0JBQ3JCLHNCQUFzQjtnQkFDdEIsbUJBQW1CO2dCQUNuQixZQUFZO2dCQUNaLGNBQWM7Z0JBQ2QsY0FBYztnQkFDZCxlQUFlO2FBQ2hCO1lBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUUsd0NBQXdDO1NBQzNELENBQUMsQ0FBQyxDQUFDO1FBRUosSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQ3hELE9BQU8sRUFBRTtnQkFDUCxXQUFXO2dCQUNYLHFCQUFxQjtnQkFDckIsc0JBQXNCO2dCQUN0QixtQkFBbUI7Z0JBQ25CLFlBQVk7Z0JBQ1osY0FBYztnQkFDZCxjQUFjO2dCQUNkLGVBQWU7YUFDaEI7WUFDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBRSx3Q0FBd0M7U0FDM0QsQ0FBQyxDQUFDLENBQUM7UUFFSixJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDdEQsT0FBTyxFQUFFO2dCQUNQLFdBQVc7Z0JBQ1gsY0FBYztnQkFDZCxxQkFBcUI7Z0JBQ3JCLHNCQUFzQjtnQkFDdEIsbUJBQW1CO2dCQUNuQixZQUFZO2dCQUNaLGNBQWM7Z0JBQ2QsY0FBYztnQkFDZCxlQUFlO2FBQ2hCO1lBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUUsd0NBQXdDO1NBQzNELENBQUMsQ0FBQyxDQUFDO1FBRUosSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQ3hELE9BQU8sRUFBRTtnQkFDUCxXQUFXO2dCQUNYLFNBQVM7Z0JBQ1QscUJBQXFCO2dCQUNyQixzQkFBc0I7Z0JBQ3RCLG1CQUFtQjtnQkFDbkIsWUFBWTtnQkFDWixjQUFjO2dCQUNkLGNBQWM7Z0JBQ2QsZUFBZTthQUNoQjtZQUNELFNBQVMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFFLHdDQUF3QztTQUMzRCxDQUFDLENBQUMsQ0FBQztJQUVWLENBQUM7Q0FDRjtBQWpQRCxrQ0FpUEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSBcImF3cy1jZGstbGliL2F3cy1sYW1iZGFcIjtcbmltcG9ydCB7IERCU3RhY2sgfSBmcm9tIFwiLi4vREIvZGItc3RhY2tcIjsgLy8gSW1wb3J0IERCU3RhY2tcbmltcG9ydCAqIGFzIGxhbWJkYUV2ZW50U291cmNlcyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxhbWJkYS1ldmVudC1zb3VyY2VzXCI7IC8vIEltcG9ydCBsYW1iZGEgZXZlbnQgc291cmNlc1xuaW1wb3J0IHsgU3RvcmFnZVN0YWNrIH0gZnJvbSBcIi4uL1N0b3JhZ2Uvc3RvcmFnZS1zdGFja1wiOyAvLyBJbXBvcnQgU3RvcmFnZVN0YWNrXG5pbXBvcnQgeyBTaGFyZWRSZXNvdXJjZXNTdGFjayB9IGZyb20gXCIuLi9zaGFyZWRyZXNvdXJjZXMvU2hhcmVkUmVzb3VyY2VzU3RhY2tcIjtcbmltcG9ydCAqIGFzIGlhbSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuaW1wb3J0ICogYXMgczMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zM1wiO1xuaW1wb3J0ICogYXMgczNuIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczMtbm90aWZpY2F0aW9uc1wiO1xuXG5cbmV4cG9ydCBjbGFzcyBsYW1iZGFzdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gICAgcHVibGljIHJlYWRvbmx5IHBvc3RVcGxvYWRMYW1iZGE6IGxhbWJkYS5GdW5jdGlvbjtcbiAgICBwdWJsaWMgcmVhZG9ubHkgZ2V0RmlsZXNMYW1iZGE6IGxhbWJkYS5GdW5jdGlvbjtcbiAgICBwdWJsaWMgcmVhZG9ubHkgZGVsZXRlRmlsZXNMYW1iZGE6IGxhbWJkYS5GdW5jdGlvbjtcbiAgICBwdWJsaWMgcmVhZG9ubHkgQmVkUm9ja0Z1bmN0aW9uOiBsYW1iZGEuRnVuY3Rpb247IFxuICAgIHB1YmxpYyByZWFkb25seSBnZXRCb29rSW5mb0xhbWJkYTogbGFtYmRhLkZ1bmN0aW9uO1xuXG4gICAgcHVibGljIHJlYWRvbmx5IG1lc3NhZ2VQcm9jZXNzaW5nOiBsYW1iZGEuRnVuY3Rpb247IFxuICAgIHB1YmxpYyByZWFkb25seSBpbnZva2VCZWRyb2NrOiBsYW1iZGEuRnVuY3Rpb247IFxuICAgIHB1YmxpYyByZWFkb25seSBpbnZva2VCZWRyb2NrTGliOiBsYW1iZGEuRnVuY3Rpb247IFxuICAgIHB1YmxpYyByZWFkb25seSBwbGF5UmVzcG9uc2U6IGxhbWJkYS5GdW5jdGlvbjsgXG4gICAgcHVibGljIHJlYWRvbmx5IHRyYW5zY3JpYmU6IGxhbWJkYS5GdW5jdGlvbjsgXG4gICAgcHVibGljIHJlYWRvbmx5IHRyaWdnZXJQb2xseTogbGFtYmRhLkZ1bmN0aW9uOyBcblxuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQXBwLCBpZDogc3RyaW5nLCBkYlN0YWNrOiBEQlN0YWNrLCBTdG9yYWdlU3RhY2s6U3RvcmFnZVN0YWNrLCBzaGFyZWQ6U2hhcmVkUmVzb3VyY2VzU3RhY2ssIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vUE9TVCBMYW1iZGEgKFVwbG9hZClcbiAgICB0aGlzLnBvc3RVcGxvYWRMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdQb3N0VXBsb2FkTGFtYmRhJywge1xuICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCwvLyBleGVjdXRpb24gZW52aXJvbm1lbnRcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLC8vIGZpbGUgaXMgXCJpbmRleFwiLCBmdW5jdGlvbiBpcyBcImhhbmRsZXJcIiAgIGNoYW5nZSB0aGlzIHdoZW4geW91J2xsIGRvIHRoZSBmdW5jdGlvbiBpdHNlbGZcbiAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvcG9zdFVwbG9hZCcpLC8vIGNvZGUgbG9hZGVkIGZyb20gXCJsYW1iZGFcIiBkaXJlY3RvcnlcbiAgICAgIH0pO1xuICAgICAgLy9HRVQgTGFtYmRhIChMaXN0IGZpbGVzKVxuICAgIHRoaXMuZ2V0RmlsZXNMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdHZXRGaWxlc0xhbWJkYScsIHtcbiAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvR2V0RmlsZXMnKSxcbiAgICAgIH0pO1xuICAgICAgLy9ERUxFVEUgTGFtYmRhIChEZWxldGUgZmlsZSlcbiAgICB0aGlzLmRlbGV0ZUZpbGVzTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnRGVsZXRlRmlsZXNMYW1iZGEnLCB7XG4gICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL2RlbGV0ZUZpbGVzJyksXG4gICAgICB9KTtcbiAgICAvL2dpdmluZyBsYW1iZGEgZnVuY3Rpb25zIHBlcm1pc3Npb25zXG4gICAgU3RvcmFnZVN0YWNrLnJlYWRpbmdNYXRlcmlhbHMuZ3JhbnRSZWFkV3JpdGUodGhpcy5wb3N0VXBsb2FkTGFtYmRhKTtcbiAgICBTdG9yYWdlU3RhY2sucmVhZGluZ01hdGVyaWFscy5ncmFudFJlYWQodGhpcy5nZXRGaWxlc0xhbWJkYSk7XG4gICAgU3RvcmFnZVN0YWNrLnJlYWRpbmdNYXRlcmlhbHMuZ3JhbnRXcml0ZSh0aGlzLmRlbGV0ZUZpbGVzTGFtYmRhKTtcblxuIFxuICAgICAvLyBUaGlzIGlzIHRoZSBsYW1iZGEgZnVuY3Rpb24gdGhhdCB3aWxsIGhhdmUgdGhlIGF3cyB0ZXh0cmFjdCBjb2RlIHRvIGV4dHJhY3QgdGV4dCAgZnJvbSBvYmplY3QgKHBkZiwgZXB1YiBhbmQgd29yZCBmb3IgZXhhbXBsZSlcbiAgICBjb25zdCB0ZXh0RXh0cmFjdGlvbkxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1RleHRFeHRyYWN0aW9uTGFtYmRhJywge1xuICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYS9UZXh0RXh0cmFjdGlvbicpLCAvL2xvY2F0aW9uIG9mIHRoZSBmb2xkZXIgdGhhdCBzaG91bGQgaGF2ZSB0aGUgdGV4dCBleHRyYWN0ZWQgb2JqZWN0IFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgIE9VVFBVVF9RVUVVRV9VUkw6IFN0b3JhZ2VTdGFjay5leHRyYWN0ZWRUZXh0UXVldWUucXVldWVVcmwsXG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgLy8gUGVybWlzc2lvbnNcbiAgICAgIFN0b3JhZ2VTdGFjay5yZWFkaW5nTWF0ZXJpYWxzUXVldWUuZ3JhbnRDb25zdW1lTWVzc2FnZXModGV4dEV4dHJhY3Rpb25MYW1iZGEpO1xuICAgICAgU3RvcmFnZVN0YWNrLnJlYWRpbmdNYXRlcmlhbHMuZ3JhbnRSZWFkKHRleHRFeHRyYWN0aW9uTGFtYmRhKTtcbiAgICAgIFN0b3JhZ2VTdGFjay5leHRyYWN0ZWRUZXh0UXVldWUuZ3JhbnRTZW5kTWVzc2FnZXModGV4dEV4dHJhY3Rpb25MYW1iZGEpO1xuICBcbiAgICAgIGNvbnN0IHNhdmVFeHRyYWN0ZWRUZXh0TGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnU2F2ZUV4dHJhY3RlZFRleHRMYW1iZGEnLCB7XG4gICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL1NhdmVFeHRyYWN0ZWRUZXh0JyksIC8vcmVzcG9uc2libGUgZm9yIHNhdmluZyB0aGUgZXh0cmFjdGVkIHRleHQgdG8gdGhlIER5bmFtb0RCIHRhYmxlXG4gICAgICB9KTtcblxuICAgICAgLy8gUGVybWlzc2lvbnNcbiAgICAgIFN0b3JhZ2VTdGFjay5leHRyYWN0ZWRUZXh0UXVldWUuZ3JhbnRDb25zdW1lTWVzc2FnZXMoc2F2ZUV4dHJhY3RlZFRleHRMYW1iZGEpOy8vdGhpcyBwZXJtaXNzaW9uIHdpbGwgYWxsb3cgbGFtYmRhIGZ1bmN0aW9uIHRvIGNvbnN1bWUgdGhlIG1lc3NhZ2VzIGZyb20gdGhlIGV4dHJhY3RlZFRleHRRdWV1ZVxuICAgICAgZGJTdGFjay5leHRyYWN0ZWRUZXh0VGFibGUuZ3JhbnRXcml0ZURhdGEoc2F2ZUV4dHJhY3RlZFRleHRMYW1iZGEpOyAvL3RoaXMgcGVybWlzc2lvbiB3aWxsIGFsbG93IGxhbWJkYSBmdW5jdGlvbiB0byB3cml0ZSB0aGUgZXh0cmFjdGVkIHRleHQgdG8gdGhlIER5bmFtb0RCIHRhYmxlXG4gICAgICBzYXZlRXh0cmFjdGVkVGV4dExhbWJkYS5hZGRFdmVudFNvdXJjZShuZXcgbGFtYmRhRXZlbnRTb3VyY2VzLlNxc0V2ZW50U291cmNlKFN0b3JhZ2VTdGFjay5leHRyYWN0ZWRUZXh0UXVldWUpKTsgLy9cblxuICAgICAgdGhpcy5CZWRSb2NrRnVuY3Rpb24gPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdNeUJlZHJvY2tGdW5jdGlvbicsIHtcbiAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTIsXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5sYW1iZGFfaGFuZGxlcicsICAvLyBNYXRjaCB0aGUgUHl0aG9uIGhhbmRsZXJcbiAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvQmVkcm9jaycpLFxuICAgICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcyg5MDApLCAgLy8gSW5jcmVhc2UgdG8gMTUgbWludXRlc1xuICAgICAgICBtZW1vcnlTaXplOiAyMDQ4LFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgIFZJREVPX0JVQ0tFVDogU3RvcmFnZVN0YWNrLmdlblZpZGVvcy5idWNrZXROYW1lLCAgLy8gVXNlZCBpbiBQeXRob24gY29kZVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIFxuICAvL1N0dWRlbnRcblxuICBcbiAgICAgICAgICAvLyBMYW1iZGEgZnVuY3Rpb24gZm9yIHByb2Nlc3NpbmcgYXVkaW8gZmlsZXNcbiAgICAgICAgdGhpcy5tZXNzYWdlUHJvY2Vzc2luZyA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ01lc3NhZ2VQcm9jZXNzaW5nTGFtYmRhJywge1xuICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL1N0dWRlbnQvTWVzc2FnZVByb2Nlc3NpbmcnKSxcbiAgICAgICAgICBoYW5kbGVyOiAnbWVzc2FnZVByb2Nlc3NpbmcuaGFuZGxlcicsXG4gICAgICAgIH0pLFxuICAgICAgICAgIC8vIExhbWJkYSBmdW5jdGlvbiBmb3IgdHJhbnNjcmliaW5nIGF1ZGlvIGZpbGVzXG4gICAgICAgIHRoaXMudHJhbnNjcmliZSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1RyYW5zY3JpYmVMYW1iZGEnLCB7XG4gICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvU3R1ZGVudC9UcmFuc2NyaWJlJyksLy9yZW1vdmUsIG9uZSBsYW1iZGEgbmVlZGVkXG4gICAgICAgICAgaGFuZGxlcjogJ3RyYW5zY3JpYmUuaGFuZGxlcicsXG4gICAgICAgIH0pLCBcbiAgICAgICAgLy8gTGFtYmRhIGZ1bmN0aW9uOiAvLyBDYWxscyBCZWRyb2NrIHdpdGggdGhlIHRyYW5zY3JpYmVkIHRleHQgYW5kIHNhdmVzIFEmQSB0byBEeW5hbW9EQlxuICAgICAgICB0aGlzLmludm9rZUJlZHJvY2sgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdJbnZva2VCZWRyb2NrTGFtYmRhJywge1xuICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL1N0dWRlbnQvSW52b2tlQmVkcm9jaycpLFxuICAgICAgICAgIGhhbmRsZXI6ICdpbnZva2VCZWRyb2NrLmhhbmRsZXInLFxuICAgICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgICBRQVRBQkxFX05BTUU6IGRiU3RhY2sucWFUYWJsZS50YWJsZU5hbWUsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgICAgIC8vIExhbWJkYSBmdW5jdGlvbiBmb3IgdHJpZ2dlcmluZyBQb2xseSBhbmQgc2F2aW5nIGF1ZGlvIGluIFMzXG4gICAgICAgIHRoaXMudHJpZ2dlclBvbGx5ID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnVHJpZ2dlclBvbGx5TGFtYmRhJywge1xuICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL1N0dWRlbnQvVHJpZ2dlclBvbGx5JyksXG4gICAgICAgICAgaGFuZGxlcjogJ3RyaWdnZXJQb2xseS5oYW5kbGVyJyxcbiAgICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgICAgQlVDS0VUX05BTUU6IFN0b3JhZ2VTdGFjay5hdWRpb0ZpbGVzQnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgICAgIFxuICAgICAgICAgIC8vIExhbWJkYSBmdW5jdGlvbiBmb3IgcGxheWluZyB0aGUgcmVzcG9uc2VcbiAgICAgICAgdGhpcy5wbGF5UmVzcG9uc2UgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdQbGF5UmVzcG9uc2VMYW1iZGEnLCB7XG4gICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvU3R1ZGVudC9QbGF5UmVzcG9uc2UnKSxcbiAgICAgICAgICBoYW5kbGVyOiAncGxheVJlc3BvbnNlLmhhbmRsZXInLFxuICAgICAgICB9KSxcbiAgICAgIFxuICAgICAgICAgIC8vIExhbWJkYSBmdW5jdGlvbiBmb3IgaW52b2tpbmcgQmVkcm9jayAoTGlicmFyaWFuKSBhbmQgc3RvcmVzIE5vdmEgY29udGVudCBpbiBTM1xuICAgICAgICB0aGlzLmludm9rZUJlZHJvY2tMaWIgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdJbnZva2VCZWRyb2NrTGlicmFyaWFuTGFtYmRhJywge1xuICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL1N0dWRlbnQvTGliSW52b2tlQmVkcm9jaycpLFxuICAgICAgICAgIGhhbmRsZXI6ICdpbnZva2VCZWRyb2NrTGlicmFyaWFuLmhhbmRsZXInLFxuICAgICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgICBPVVRQVVRfQlVDS0VUOiBTdG9yYWdlU3RhY2subm92YUNvbnRlbnRCdWNrZXQuYnVja2V0TmFtZSxcbiAgICAgICAgICAgIFRFWFRfVEFCTEU6IGRiU3RhY2suZXh0cmFjdGVkVGV4dFRhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KSxcbiAgXG5cbiAgICAgIHRoaXMucGxheVJlc3BvbnNlLmFkZFBlcm1pc3Npb24oJ0FsbG93UzNJbnZva2UnLCB7XG4gICAgICAgIHByaW5jaXBhbDogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdzMy5hbWF6b25hd3MuY29tJyksXG4gICAgICAgIHNvdXJjZUFybjogU3RvcmFnZVN0YWNrLmF1ZGlvRmlsZXNCdWNrZXQuYnVja2V0QXJuLFxuICAgICAgfSk7XG5cbiAgICAgIFN0b3JhZ2VTdGFjay5hdWRpb0ZpbGVzQnVja2V0LmFkZEV2ZW50Tm90aWZpY2F0aW9uKFxuICAgICAgICBzMy5FdmVudFR5cGUuT0JKRUNUX0NSRUFURUQsXG4gICAgICAgIG5ldyBzM24uTGFtYmRhRGVzdGluYXRpb24odGhpcy5wbGF5UmVzcG9uc2UpXG4gICAgICApO1xuXG4gICAgICAvLyBQZXJtaXNzaW9uc1xuICAgIC8vIEFsbG93IFBvbGx5IExhbWJkYSB0byB3cml0ZSB0byB0aGUgYXVkaW8gYnVja2V0XG4gICAgU3RvcmFnZVN0YWNrLmF1ZGlvRmlsZXNCdWNrZXQuZ3JhbnRXcml0ZSh0aGlzLnRyaWdnZXJQb2xseSk7XG4gICAgLy8gQWxsb3cgbGlicmFyaWFuIEJlZHJvY2sgTGFtYmRhIHRvIHdyaXRlIE5vdmEgY29udGVudCB0byBOb3ZhIGJ1Y2tldFxuICAgIFN0b3JhZ2VTdGFjay5ub3ZhQ29udGVudEJ1Y2tldC5ncmFudFdyaXRlKHRoaXMuaW52b2tlQmVkcm9ja0xpYik7XG4gICAgLy8gQWxsb3cgU3R1ZGVudCBCZWRyb2NrIExhbWJkYSB0byB3cml0ZSB0byBRJkEgdGFibGVcbiAgICBkYlN0YWNrLnFhVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHRoaXMuaW52b2tlQmVkcm9jayk7XG4gICAgLy8gQWxsb3cgbGlicmFyaWFuIEJlZHJvY2sgTGFtYmRhIHRvIHJlYWQgZnJvbSB0ZXh0IHRhYmxlXG4gICAgZGJTdGFjay5leHRyYWN0ZWRUZXh0VGFibGUuZ3JhbnRSZWFkRGF0YSh0aGlzLmludm9rZUJlZHJvY2tMaWIpO1xuXG4gICAgLy8gUGVybWlzc2lvbnMgZm9yIGxhbWRhcyB0byBjYWxsIFRyYW5zY3JpYmUsIFBvbGx5LCBhbmQgQmVkcm9ja1xuICAgICAgICB0aGlzLmludm9rZUJlZHJvY2suYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAnYmVkcm9jazoqJyxcbiAgICAgICAgICAgICdsb2dzOkNyZWF0ZUxvZ0dyb3VwJyxcbiAgICAgICAgICAgICdsb2dzOkNyZWF0ZUxvZ1N0cmVhbScsXG4gICAgICAgICAgICAnbG9nczpQdXRMb2dFdmVudHMnLFxuICAgICAgICAgICAgJ2R5bmFtb2RiOionLFxuICAgICAgICAgICAgJ3MzOlB1dE9iamVjdCcsXG4gICAgICAgICAgICAnczM6R2V0T2JqZWN0JyxcbiAgICAgICAgICAgICdzMzpMaXN0QnVja2V0J1xuICAgICAgICAgIF0sXG4gICAgICAgICAgcmVzb3VyY2VzOiBbJyonXSAgLy8gVXNlIHNwZWNpZmljIEFSTnMgZm9yIHRpZ2h0ZXIgY29udHJvbFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdGhpcy5pbnZva2VCZWRyb2NrTGliLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgJ2JlZHJvY2s6KicsXG4gICAgICAgICAgICAnbG9nczpDcmVhdGVMb2dHcm91cCcsXG4gICAgICAgICAgICAnbG9nczpDcmVhdGVMb2dTdHJlYW0nLFxuICAgICAgICAgICAgJ2xvZ3M6UHV0TG9nRXZlbnRzJyxcbiAgICAgICAgICAgICdkeW5hbW9kYjoqJyxcbiAgICAgICAgICAgICdzMzpQdXRPYmplY3QnLFxuICAgICAgICAgICAgJ3MzOkdldE9iamVjdCcsXG4gICAgICAgICAgICAnczM6TGlzdEJ1Y2tldCdcbiAgICAgICAgICBdLFxuICAgICAgICAgIHJlc291cmNlczogWycqJ10gIC8vIFVzZSBzcGVjaWZpYyBBUk5zIGZvciB0aWdodGVyIGNvbnRyb2xcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMubWVzc2FnZVByb2Nlc3NpbmcuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAnYmVkcm9jazoqJyxcbiAgICAgICAgICAgICd0cmFuc2NyaWJlOionLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nR3JvdXAnLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nU3RyZWFtJyxcbiAgICAgICAgICAgICdsb2dzOlB1dExvZ0V2ZW50cycsXG4gICAgICAgICAgICAnZHluYW1vZGI6KicsXG4gICAgICAgICAgICAnczM6UHV0T2JqZWN0JyxcbiAgICAgICAgICAgICdzMzpHZXRPYmplY3QnLFxuICAgICAgICAgICAgJ3MzOkxpc3RCdWNrZXQnXG4gICAgICAgICAgXSxcbiAgICAgICAgICByZXNvdXJjZXM6IFsnKiddICAvLyBVc2Ugc3BlY2lmaWMgQVJOcyBmb3IgdGlnaHRlciBjb250cm9sXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLnBsYXlSZXNwb25zZS5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICdiZWRyb2NrOionLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nR3JvdXAnLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nU3RyZWFtJyxcbiAgICAgICAgICAgICdsb2dzOlB1dExvZ0V2ZW50cycsXG4gICAgICAgICAgICAnZHluYW1vZGI6KicsXG4gICAgICAgICAgICAnczM6UHV0T2JqZWN0JyxcbiAgICAgICAgICAgICdzMzpHZXRPYmplY3QnLFxuICAgICAgICAgICAgJ3MzOkxpc3RCdWNrZXQnXG4gICAgICAgICAgXSxcbiAgICAgICAgICByZXNvdXJjZXM6IFsnKiddICAvLyBVc2Ugc3BlY2lmaWMgQVJOcyBmb3IgdGlnaHRlciBjb250cm9sXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLnRyYW5zY3JpYmUuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAnYmVkcm9jazoqJyxcbiAgICAgICAgICAgICd0cmFuc2NyaWJlOionLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nR3JvdXAnLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nU3RyZWFtJyxcbiAgICAgICAgICAgICdsb2dzOlB1dExvZ0V2ZW50cycsXG4gICAgICAgICAgICAnZHluYW1vZGI6KicsXG4gICAgICAgICAgICAnczM6UHV0T2JqZWN0JyxcbiAgICAgICAgICAgICdzMzpHZXRPYmplY3QnLFxuICAgICAgICAgICAgJ3MzOkxpc3RCdWNrZXQnXG4gICAgICAgICAgXSxcbiAgICAgICAgICByZXNvdXJjZXM6IFsnKiddICAvLyBVc2Ugc3BlY2lmaWMgQVJOcyBmb3IgdGlnaHRlciBjb250cm9sXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLnRyaWdnZXJQb2xseS5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICdiZWRyb2NrOionLFxuICAgICAgICAgICAgJ3BvbGx5OionLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nR3JvdXAnLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nU3RyZWFtJyxcbiAgICAgICAgICAgICdsb2dzOlB1dExvZ0V2ZW50cycsXG4gICAgICAgICAgICAnZHluYW1vZGI6KicsXG4gICAgICAgICAgICAnczM6UHV0T2JqZWN0JyxcbiAgICAgICAgICAgICdzMzpHZXRPYmplY3QnLFxuICAgICAgICAgICAgJ3MzOkxpc3RCdWNrZXQnXG4gICAgICAgICAgXSxcbiAgICAgICAgICByZXNvdXJjZXM6IFsnKiddICAvLyBVc2Ugc3BlY2lmaWMgQVJOcyBmb3IgdGlnaHRlciBjb250cm9sXG4gICAgICAgIH0pKTtcblxuICB9XG59Il19