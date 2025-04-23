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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLXN0YWNrcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxhbWJkYS1zdGFja3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsK0RBQWlEO0FBRWpELHlGQUEyRSxDQUFDLDhCQUE4QjtBQUcxRyx5REFBMkM7QUFDM0MsdURBQXlDO0FBQ3pDLHNFQUF3RDtBQUd4RCxNQUFhLFdBQVksU0FBUSxHQUFHLENBQUMsS0FBSztJQWV4QyxZQUFZLEtBQWMsRUFBRSxFQUFVLEVBQUUsT0FBZ0IsRUFBRSxZQUF5QixFQUFFLE1BQTJCLEVBQUUsS0FBc0I7UUFDdEksS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsc0JBQXNCO1FBQ3RCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ2xFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBQyx3QkFBd0I7WUFDNUQsT0FBTyxFQUFFLGVBQWUsRUFBQywwRkFBMEY7WUFDbkgsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLEVBQUMsc0NBQXNDO1NBQ3hGLENBQUMsQ0FBQztRQUNILHlCQUF5QjtRQUMzQixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDOUQsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsZUFBZTtZQUN4QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUM7U0FDL0MsQ0FBQyxDQUFDO1FBQ0gsNkJBQTZCO1FBQy9CLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ3BFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLGVBQWU7WUFDeEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDO1NBQ2xELENBQUMsQ0FBQztRQUNMLHFDQUFxQztRQUNyQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3BFLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzdELFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFHaEUsaUlBQWlJO1FBQ2xJLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUMzRSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLG9FQUFvRTtZQUMxSCxXQUFXLEVBQUU7Z0JBQ1gsZ0JBQWdCLEVBQUUsWUFBWSxDQUFDLGtCQUFrQixDQUFDLFFBQVE7YUFDM0Q7U0FDRixDQUFDLENBQUM7UUFFSCxjQUFjO1FBQ2QsWUFBWSxDQUFDLHFCQUFxQixDQUFDLG9CQUFvQixDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDOUUsWUFBWSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzlELFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBRXhFLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRTtZQUNuRixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxFQUFFLGlFQUFpRTtTQUMzSCxDQUFDLENBQUM7UUFFSCxjQUFjO1FBQ2QsWUFBWSxDQUFDLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQSxnR0FBZ0c7UUFDOUssT0FBTyxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsOEZBQThGO1FBQ2xLLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUVsSCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDcEUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUcsMkJBQTJCO1lBQzdELElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQztZQUM3QyxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUcseUJBQXlCO1lBQzlELFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFdBQVcsRUFBRTtnQkFDWCxZQUFZLEVBQUUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUcsc0JBQXNCO2FBQ3pFO1NBQ0YsQ0FBQyxDQUFDO1FBRVAsU0FBUztRQUdELDZDQUE2QztRQUMvQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRTtZQUM1RSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQ0FBa0MsQ0FBQztZQUMvRCxPQUFPLEVBQUUsMkJBQTJCO1NBQ3JDLENBQUM7WUFDQSwrQ0FBK0M7WUFDakQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO2dCQUM5RCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO2dCQUNuQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsMkJBQTJCLENBQUMsRUFBQywyQkFBMkI7Z0JBQ3BGLE9BQU8sRUFBRSxvQkFBb0I7YUFDOUIsQ0FBQztZQUNGLHdGQUF3RjtZQUN4RixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7Z0JBQ3BFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7Z0JBQ25DLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyw4QkFBOEIsQ0FBQztnQkFDM0QsT0FBTyxFQUFFLHVCQUF1QjtnQkFDaEMsV0FBVyxFQUFFO29CQUNYLFlBQVksRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVM7aUJBQ3hDO2FBQ0YsQ0FBQztZQUNGLDhEQUE4RDtZQUM5RCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7Z0JBQ2xFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7Z0JBQ25DLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyw2QkFBNkIsQ0FBQztnQkFDMUQsT0FBTyxFQUFFLHNCQUFzQjtnQkFDL0IsV0FBVyxFQUFFO29CQUNYLFdBQVcsRUFBRSxZQUFZLENBQUMsZ0JBQWdCLENBQUMsVUFBVTtpQkFDdEQ7YUFDRixDQUFDO1lBRUEsMkNBQTJDO1lBQzdDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtnQkFDbEUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztnQkFDbkMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLDZCQUE2QixDQUFDO2dCQUMxRCxPQUFPLEVBQUUsc0JBQXNCO2FBQ2hDLENBQUM7WUFFQSxpRkFBaUY7WUFDbkYsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsOEJBQThCLEVBQUU7Z0JBQ2hGLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7Z0JBQ25DLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQ0FBaUMsQ0FBQztnQkFDOUQsT0FBTyxFQUFFLGdDQUFnQztnQkFDekMsV0FBVyxFQUFFO29CQUNYLGFBQWEsRUFBRSxZQUFZLENBQUMsaUJBQWlCLENBQUMsVUFBVTtvQkFDeEQsVUFBVSxFQUFFLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTO2lCQUNqRDthQUNGLENBQUM7WUFHSixJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxlQUFlLEVBQUU7Z0JBQy9DLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQztnQkFDdkQsU0FBUyxFQUFFLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTO2FBQ25ELENBQUMsQ0FBQztRQUVILFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FDaEQsRUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQzNCLElBQUksR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FDN0MsQ0FBQztRQUVGLGNBQWM7UUFDaEIsa0RBQWtEO1FBQ2xELFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVELHNFQUFzRTtRQUN0RSxZQUFZLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2pFLHFEQUFxRDtRQUNyRCxPQUFPLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN2RCx5REFBeUQ7UUFDekQsT0FBTyxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUVoRSxnRUFBZ0U7UUFDNUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQ3pELE9BQU8sRUFBRTtnQkFDUCxXQUFXO2dCQUNYLHFCQUFxQjtnQkFDckIsc0JBQXNCO2dCQUN0QixtQkFBbUI7Z0JBQ25CLFlBQVk7Z0JBQ1osY0FBYztnQkFDZCxjQUFjO2dCQUNkLGVBQWU7YUFDaEI7WUFDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBRSx3Q0FBd0M7U0FDM0QsQ0FBQyxDQUFDLENBQUM7UUFFSixJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUM1RCxPQUFPLEVBQUU7Z0JBQ1AsV0FBVztnQkFDWCxxQkFBcUI7Z0JBQ3JCLHNCQUFzQjtnQkFDdEIsbUJBQW1CO2dCQUNuQixZQUFZO2dCQUNaLGNBQWM7Z0JBQ2QsY0FBYztnQkFDZCxlQUFlO2FBQ2hCO1lBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUUsd0NBQXdDO1NBQzNELENBQUMsQ0FBQyxDQUFDO1FBRUosSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDN0QsT0FBTyxFQUFFO2dCQUNQLFdBQVc7Z0JBQ1gsY0FBYztnQkFDZCxxQkFBcUI7Z0JBQ3JCLHNCQUFzQjtnQkFDdEIsbUJBQW1CO2dCQUNuQixZQUFZO2dCQUNaLGNBQWM7Z0JBQ2QsY0FBYztnQkFDZCxlQUFlO2FBQ2hCO1lBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUUsd0NBQXdDO1NBQzNELENBQUMsQ0FBQyxDQUFDO1FBRUosSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQ3hELE9BQU8sRUFBRTtnQkFDUCxXQUFXO2dCQUNYLHFCQUFxQjtnQkFDckIsc0JBQXNCO2dCQUN0QixtQkFBbUI7Z0JBQ25CLFlBQVk7Z0JBQ1osY0FBYztnQkFDZCxjQUFjO2dCQUNkLGVBQWU7YUFDaEI7WUFDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBRSx3Q0FBd0M7U0FDM0QsQ0FBQyxDQUFDLENBQUM7UUFFSixJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDdEQsT0FBTyxFQUFFO2dCQUNQLFdBQVc7Z0JBQ1gsY0FBYztnQkFDZCxxQkFBcUI7Z0JBQ3JCLHNCQUFzQjtnQkFDdEIsbUJBQW1CO2dCQUNuQixZQUFZO2dCQUNaLGNBQWM7Z0JBQ2QsY0FBYztnQkFDZCxlQUFlO2FBQ2hCO1lBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUUsd0NBQXdDO1NBQzNELENBQUMsQ0FBQyxDQUFDO1FBRUosSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQ3hELE9BQU8sRUFBRTtnQkFDUCxXQUFXO2dCQUNYLFNBQVM7Z0JBQ1QscUJBQXFCO2dCQUNyQixzQkFBc0I7Z0JBQ3RCLG1CQUFtQjtnQkFDbkIsWUFBWTtnQkFDWixjQUFjO2dCQUNkLGNBQWM7Z0JBQ2QsZUFBZTthQUNoQjtZQUNELFNBQVMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFFLHdDQUF3QztTQUMzRCxDQUFDLENBQUMsQ0FBQztJQUVWLENBQUM7Q0FDRjtBQWpQRCxrQ0FpUEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcImF3cy1jZGstbGliXCI7XHJcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxhbWJkYVwiO1xyXG5pbXBvcnQgeyBEQlN0YWNrIH0gZnJvbSBcIi4uL0RCL2RiLXN0YWNrXCI7IC8vIEltcG9ydCBEQlN0YWNrXHJcbmltcG9ydCAqIGFzIGxhbWJkYUV2ZW50U291cmNlcyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxhbWJkYS1ldmVudC1zb3VyY2VzXCI7IC8vIEltcG9ydCBsYW1iZGEgZXZlbnQgc291cmNlc1xyXG5pbXBvcnQgeyBTdG9yYWdlU3RhY2sgfSBmcm9tIFwiLi4vU3RvcmFnZS9zdG9yYWdlLXN0YWNrXCI7IC8vIEltcG9ydCBTdG9yYWdlU3RhY2tcclxuaW1wb3J0IHsgU2hhcmVkUmVzb3VyY2VzU3RhY2sgfSBmcm9tIFwiLi4vc2hhcmVkcmVzb3VyY2VzL1NoYXJlZFJlc291cmNlc1N0YWNrXCI7XHJcbmltcG9ydCAqIGFzIGlhbSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xyXG5pbXBvcnQgKiBhcyBzMyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXMzXCI7XHJcbmltcG9ydCAqIGFzIHMzbiBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXMzLW5vdGlmaWNhdGlvbnNcIjtcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgbGFtYmRhc3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gICAgcHVibGljIHJlYWRvbmx5IHBvc3RVcGxvYWRMYW1iZGE6IGxhbWJkYS5GdW5jdGlvbjtcclxuICAgIHB1YmxpYyByZWFkb25seSBnZXRGaWxlc0xhbWJkYTogbGFtYmRhLkZ1bmN0aW9uO1xyXG4gICAgcHVibGljIHJlYWRvbmx5IGRlbGV0ZUZpbGVzTGFtYmRhOiBsYW1iZGEuRnVuY3Rpb247XHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgQmVkUm9ja0Z1bmN0aW9uOiBsYW1iZGEuRnVuY3Rpb247IFxyXG4gICAgcHVibGljIHJlYWRvbmx5IGdldEJvb2tJbmZvTGFtYmRhOiBsYW1iZGEuRnVuY3Rpb247XHJcblxyXG4gICAgcHVibGljIHJlYWRvbmx5IG1lc3NhZ2VQcm9jZXNzaW5nOiBsYW1iZGEuRnVuY3Rpb247IFxyXG4gICAgcHVibGljIHJlYWRvbmx5IGludm9rZUJlZHJvY2s6IGxhbWJkYS5GdW5jdGlvbjsgXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgaW52b2tlQmVkcm9ja0xpYjogbGFtYmRhLkZ1bmN0aW9uOyBcclxuICAgIHB1YmxpYyByZWFkb25seSBwbGF5UmVzcG9uc2U6IGxhbWJkYS5GdW5jdGlvbjsgXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgdHJhbnNjcmliZTogbGFtYmRhLkZ1bmN0aW9uOyBcclxuICAgIHB1YmxpYyByZWFkb25seSB0cmlnZ2VyUG9sbHk6IGxhbWJkYS5GdW5jdGlvbjsgXHJcblxyXG5cclxuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkFwcCwgaWQ6IHN0cmluZywgZGJTdGFjazogREJTdGFjaywgU3RvcmFnZVN0YWNrOlN0b3JhZ2VTdGFjaywgc2hhcmVkOlNoYXJlZFJlc291cmNlc1N0YWNrLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XHJcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuXHJcbiAgICAvL1BPU1QgTGFtYmRhIChVcGxvYWQpXHJcbiAgICB0aGlzLnBvc3RVcGxvYWRMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdQb3N0VXBsb2FkTGFtYmRhJywge1xyXG4gICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLC8vIGV4ZWN1dGlvbiBlbnZpcm9ubWVudFxyXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJywvLyBmaWxlIGlzIFwiaW5kZXhcIiwgZnVuY3Rpb24gaXMgXCJoYW5kbGVyXCIgICBjaGFuZ2UgdGhpcyB3aGVuIHlvdSdsbCBkbyB0aGUgZnVuY3Rpb24gaXRzZWxmXHJcbiAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvcG9zdFVwbG9hZCcpLC8vIGNvZGUgbG9hZGVkIGZyb20gXCJsYW1iZGFcIiBkaXJlY3RvcnlcclxuICAgICAgfSk7XHJcbiAgICAgIC8vR0VUIExhbWJkYSAoTGlzdCBmaWxlcylcclxuICAgIHRoaXMuZ2V0RmlsZXNMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdHZXRGaWxlc0xhbWJkYScsIHtcclxuICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXHJcbiAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvR2V0RmlsZXMnKSxcclxuICAgICAgfSk7XHJcbiAgICAgIC8vREVMRVRFIExhbWJkYSAoRGVsZXRlIGZpbGUpXHJcbiAgICB0aGlzLmRlbGV0ZUZpbGVzTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnRGVsZXRlRmlsZXNMYW1iZGEnLCB7XHJcbiAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxyXG4gICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL2RlbGV0ZUZpbGVzJyksXHJcbiAgICAgIH0pO1xyXG4gICAgLy9naXZpbmcgbGFtYmRhIGZ1bmN0aW9ucyBwZXJtaXNzaW9uc1xyXG4gICAgU3RvcmFnZVN0YWNrLnJlYWRpbmdNYXRlcmlhbHMuZ3JhbnRSZWFkV3JpdGUodGhpcy5wb3N0VXBsb2FkTGFtYmRhKTtcclxuICAgIFN0b3JhZ2VTdGFjay5yZWFkaW5nTWF0ZXJpYWxzLmdyYW50UmVhZCh0aGlzLmdldEZpbGVzTGFtYmRhKTtcclxuICAgIFN0b3JhZ2VTdGFjay5yZWFkaW5nTWF0ZXJpYWxzLmdyYW50V3JpdGUodGhpcy5kZWxldGVGaWxlc0xhbWJkYSk7XHJcblxyXG4gXHJcbiAgICAgLy8gVGhpcyBpcyB0aGUgbGFtYmRhIGZ1bmN0aW9uIHRoYXQgd2lsbCBoYXZlIHRoZSBhd3MgdGV4dHJhY3QgY29kZSB0byBleHRyYWN0IHRleHQgIGZyb20gb2JqZWN0IChwZGYsIGVwdWIgYW5kIHdvcmQgZm9yIGV4YW1wbGUpXHJcbiAgICBjb25zdCB0ZXh0RXh0cmFjdGlvbkxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1RleHRFeHRyYWN0aW9uTGFtYmRhJywge1xyXG4gICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcclxuICAgICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYS9UZXh0RXh0cmFjdGlvbicpLCAvL2xvY2F0aW9uIG9mIHRoZSBmb2xkZXIgdGhhdCBzaG91bGQgaGF2ZSB0aGUgdGV4dCBleHRyYWN0ZWQgb2JqZWN0IFxyXG4gICAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgICBPVVRQVVRfUVVFVUVfVVJMOiBTdG9yYWdlU3RhY2suZXh0cmFjdGVkVGV4dFF1ZXVlLnF1ZXVlVXJsLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gUGVybWlzc2lvbnNcclxuICAgICAgU3RvcmFnZVN0YWNrLnJlYWRpbmdNYXRlcmlhbHNRdWV1ZS5ncmFudENvbnN1bWVNZXNzYWdlcyh0ZXh0RXh0cmFjdGlvbkxhbWJkYSk7XHJcbiAgICAgIFN0b3JhZ2VTdGFjay5yZWFkaW5nTWF0ZXJpYWxzLmdyYW50UmVhZCh0ZXh0RXh0cmFjdGlvbkxhbWJkYSk7XHJcbiAgICAgIFN0b3JhZ2VTdGFjay5leHRyYWN0ZWRUZXh0UXVldWUuZ3JhbnRTZW5kTWVzc2FnZXModGV4dEV4dHJhY3Rpb25MYW1iZGEpO1xyXG4gIFxyXG4gICAgICBjb25zdCBzYXZlRXh0cmFjdGVkVGV4dExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1NhdmVFeHRyYWN0ZWRUZXh0TGFtYmRhJywge1xyXG4gICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcclxuICAgICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYS9TYXZlRXh0cmFjdGVkVGV4dCcpLCAvL3Jlc3BvbnNpYmxlIGZvciBzYXZpbmcgdGhlIGV4dHJhY3RlZCB0ZXh0IHRvIHRoZSBEeW5hbW9EQiB0YWJsZVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFBlcm1pc3Npb25zXHJcbiAgICAgIFN0b3JhZ2VTdGFjay5leHRyYWN0ZWRUZXh0UXVldWUuZ3JhbnRDb25zdW1lTWVzc2FnZXMoc2F2ZUV4dHJhY3RlZFRleHRMYW1iZGEpOy8vdGhpcyBwZXJtaXNzaW9uIHdpbGwgYWxsb3cgbGFtYmRhIGZ1bmN0aW9uIHRvIGNvbnN1bWUgdGhlIG1lc3NhZ2VzIGZyb20gdGhlIGV4dHJhY3RlZFRleHRRdWV1ZVxyXG4gICAgICBkYlN0YWNrLmV4dHJhY3RlZFRleHRUYWJsZS5ncmFudFdyaXRlRGF0YShzYXZlRXh0cmFjdGVkVGV4dExhbWJkYSk7IC8vdGhpcyBwZXJtaXNzaW9uIHdpbGwgYWxsb3cgbGFtYmRhIGZ1bmN0aW9uIHRvIHdyaXRlIHRoZSBleHRyYWN0ZWQgdGV4dCB0byB0aGUgRHluYW1vREIgdGFibGVcclxuICAgICAgc2F2ZUV4dHJhY3RlZFRleHRMYW1iZGEuYWRkRXZlbnRTb3VyY2UobmV3IGxhbWJkYUV2ZW50U291cmNlcy5TcXNFdmVudFNvdXJjZShTdG9yYWdlU3RhY2suZXh0cmFjdGVkVGV4dFF1ZXVlKSk7IC8vXHJcblxyXG4gICAgICB0aGlzLkJlZFJvY2tGdW5jdGlvbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ015QmVkcm9ja0Z1bmN0aW9uJywge1xyXG4gICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzEyLFxyXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5sYW1iZGFfaGFuZGxlcicsICAvLyBNYXRjaCB0aGUgUHl0aG9uIGhhbmRsZXJcclxuICAgICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYS9CZWRyb2NrJyksXHJcbiAgICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoOTAwKSwgIC8vIEluY3JlYXNlIHRvIDE1IG1pbnV0ZXNcclxuICAgICAgICBtZW1vcnlTaXplOiAyMDQ4LFxyXG4gICAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgICBWSURFT19CVUNLRVQ6IFN0b3JhZ2VTdGFjay5nZW5WaWRlb3MuYnVja2V0TmFtZSwgIC8vIFVzZWQgaW4gUHl0aG9uIGNvZGVcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBcclxuICAvL1N0dWRlbnRcclxuXHJcbiAgXHJcbiAgICAgICAgICAvLyBMYW1iZGEgZnVuY3Rpb24gZm9yIHByb2Nlc3NpbmcgYXVkaW8gZmlsZXNcclxuICAgICAgICB0aGlzLm1lc3NhZ2VQcm9jZXNzaW5nID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnTWVzc2FnZVByb2Nlc3NpbmdMYW1iZGEnLCB7XHJcbiAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL1N0dWRlbnQvTWVzc2FnZVByb2Nlc3NpbmcnKSxcclxuICAgICAgICAgIGhhbmRsZXI6ICdtZXNzYWdlUHJvY2Vzc2luZy5oYW5kbGVyJyxcclxuICAgICAgICB9KSxcclxuICAgICAgICAgIC8vIExhbWJkYSBmdW5jdGlvbiBmb3IgdHJhbnNjcmliaW5nIGF1ZGlvIGZpbGVzXHJcbiAgICAgICAgdGhpcy50cmFuc2NyaWJlID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnVHJhbnNjcmliZUxhbWJkYScsIHtcclxuICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvU3R1ZGVudC9UcmFuc2NyaWJlJyksLy9yZW1vdmUsIG9uZSBsYW1iZGEgbmVlZGVkXHJcbiAgICAgICAgICBoYW5kbGVyOiAndHJhbnNjcmliZS5oYW5kbGVyJyxcclxuICAgICAgICB9KSwgXHJcbiAgICAgICAgLy8gTGFtYmRhIGZ1bmN0aW9uOiAvLyBDYWxscyBCZWRyb2NrIHdpdGggdGhlIHRyYW5zY3JpYmVkIHRleHQgYW5kIHNhdmVzIFEmQSB0byBEeW5hbW9EQlxyXG4gICAgICAgIHRoaXMuaW52b2tlQmVkcm9jayA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0ludm9rZUJlZHJvY2tMYW1iZGEnLCB7XHJcbiAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL1N0dWRlbnQvSW52b2tlQmVkcm9jaycpLFxyXG4gICAgICAgICAgaGFuZGxlcjogJ2ludm9rZUJlZHJvY2suaGFuZGxlcicsXHJcbiAgICAgICAgICBlbnZpcm9ubWVudDoge1xyXG4gICAgICAgICAgICBRQVRBQkxFX05BTUU6IGRiU3RhY2sucWFUYWJsZS50YWJsZU5hbWUsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIC8vIExhbWJkYSBmdW5jdGlvbiBmb3IgdHJpZ2dlcmluZyBQb2xseSBhbmQgc2F2aW5nIGF1ZGlvIGluIFMzXHJcbiAgICAgICAgdGhpcy50cmlnZ2VyUG9sbHkgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdUcmlnZ2VyUG9sbHlMYW1iZGEnLCB7XHJcbiAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL1N0dWRlbnQvVHJpZ2dlclBvbGx5JyksXHJcbiAgICAgICAgICBoYW5kbGVyOiAndHJpZ2dlclBvbGx5LmhhbmRsZXInLFxyXG4gICAgICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICAgICAgQlVDS0VUX05BTUU6IFN0b3JhZ2VTdGFjay5hdWRpb0ZpbGVzQnVja2V0LmJ1Y2tldE5hbWUsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIFxyXG4gICAgICAgICAgLy8gTGFtYmRhIGZ1bmN0aW9uIGZvciBwbGF5aW5nIHRoZSByZXNwb25zZVxyXG4gICAgICAgIHRoaXMucGxheVJlc3BvbnNlID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnUGxheVJlc3BvbnNlTGFtYmRhJywge1xyXG4gICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYS9TdHVkZW50L1BsYXlSZXNwb25zZScpLFxyXG4gICAgICAgICAgaGFuZGxlcjogJ3BsYXlSZXNwb25zZS5oYW5kbGVyJyxcclxuICAgICAgICB9KSxcclxuICAgICAgXHJcbiAgICAgICAgICAvLyBMYW1iZGEgZnVuY3Rpb24gZm9yIGludm9raW5nIEJlZHJvY2sgKExpYnJhcmlhbikgYW5kIHN0b3JlcyBOb3ZhIGNvbnRlbnQgaW4gUzNcclxuICAgICAgICB0aGlzLmludm9rZUJlZHJvY2tMaWIgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdJbnZva2VCZWRyb2NrTGlicmFyaWFuTGFtYmRhJywge1xyXG4gICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYS9TdHVkZW50L0xpYkludm9rZUJlZHJvY2snKSxcclxuICAgICAgICAgIGhhbmRsZXI6ICdpbnZva2VCZWRyb2NrTGlicmFyaWFuLmhhbmRsZXInLFxyXG4gICAgICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICAgICAgT1VUUFVUX0JVQ0tFVDogU3RvcmFnZVN0YWNrLm5vdmFDb250ZW50QnVja2V0LmJ1Y2tldE5hbWUsXHJcbiAgICAgICAgICAgIFRFWFRfVEFCTEU6IGRiU3RhY2suZXh0cmFjdGVkVGV4dFRhYmxlLnRhYmxlTmFtZSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSksXHJcbiAgXHJcblxyXG4gICAgICB0aGlzLnBsYXlSZXNwb25zZS5hZGRQZXJtaXNzaW9uKCdBbGxvd1MzSW52b2tlJywge1xyXG4gICAgICAgIHByaW5jaXBhbDogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdzMy5hbWF6b25hd3MuY29tJyksXHJcbiAgICAgICAgc291cmNlQXJuOiBTdG9yYWdlU3RhY2suYXVkaW9GaWxlc0J1Y2tldC5idWNrZXRBcm4sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgU3RvcmFnZVN0YWNrLmF1ZGlvRmlsZXNCdWNrZXQuYWRkRXZlbnROb3RpZmljYXRpb24oXHJcbiAgICAgICAgczMuRXZlbnRUeXBlLk9CSkVDVF9DUkVBVEVELFxyXG4gICAgICAgIG5ldyBzM24uTGFtYmRhRGVzdGluYXRpb24odGhpcy5wbGF5UmVzcG9uc2UpXHJcbiAgICAgICk7XHJcblxyXG4gICAgICAvLyBQZXJtaXNzaW9uc1xyXG4gICAgLy8gQWxsb3cgUG9sbHkgTGFtYmRhIHRvIHdyaXRlIHRvIHRoZSBhdWRpbyBidWNrZXRcclxuICAgIFN0b3JhZ2VTdGFjay5hdWRpb0ZpbGVzQnVja2V0LmdyYW50V3JpdGUodGhpcy50cmlnZ2VyUG9sbHkpO1xyXG4gICAgLy8gQWxsb3cgbGlicmFyaWFuIEJlZHJvY2sgTGFtYmRhIHRvIHdyaXRlIE5vdmEgY29udGVudCB0byBOb3ZhIGJ1Y2tldFxyXG4gICAgU3RvcmFnZVN0YWNrLm5vdmFDb250ZW50QnVja2V0LmdyYW50V3JpdGUodGhpcy5pbnZva2VCZWRyb2NrTGliKTtcclxuICAgIC8vIEFsbG93IFN0dWRlbnQgQmVkcm9jayBMYW1iZGEgdG8gd3JpdGUgdG8gUSZBIHRhYmxlXHJcbiAgICBkYlN0YWNrLnFhVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHRoaXMuaW52b2tlQmVkcm9jayk7XHJcbiAgICAvLyBBbGxvdyBsaWJyYXJpYW4gQmVkcm9jayBMYW1iZGEgdG8gcmVhZCBmcm9tIHRleHQgdGFibGVcclxuICAgIGRiU3RhY2suZXh0cmFjdGVkVGV4dFRhYmxlLmdyYW50UmVhZERhdGEodGhpcy5pbnZva2VCZWRyb2NrTGliKTtcclxuXHJcbiAgICAvLyBQZXJtaXNzaW9ucyBmb3IgbGFtZGFzIHRvIGNhbGwgVHJhbnNjcmliZSwgUG9sbHksIGFuZCBCZWRyb2NrXHJcbiAgICAgICAgdGhpcy5pbnZva2VCZWRyb2NrLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XHJcbiAgICAgICAgICBhY3Rpb25zOiBbXHJcbiAgICAgICAgICAgICdiZWRyb2NrOionLFxyXG4gICAgICAgICAgICAnbG9nczpDcmVhdGVMb2dHcm91cCcsXHJcbiAgICAgICAgICAgICdsb2dzOkNyZWF0ZUxvZ1N0cmVhbScsXHJcbiAgICAgICAgICAgICdsb2dzOlB1dExvZ0V2ZW50cycsXHJcbiAgICAgICAgICAgICdkeW5hbW9kYjoqJyxcclxuICAgICAgICAgICAgJ3MzOlB1dE9iamVjdCcsXHJcbiAgICAgICAgICAgICdzMzpHZXRPYmplY3QnLFxyXG4gICAgICAgICAgICAnczM6TGlzdEJ1Y2tldCdcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICByZXNvdXJjZXM6IFsnKiddICAvLyBVc2Ugc3BlY2lmaWMgQVJOcyBmb3IgdGlnaHRlciBjb250cm9sXHJcbiAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICB0aGlzLmludm9rZUJlZHJvY2tMaWIuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcclxuICAgICAgICAgIGFjdGlvbnM6IFtcclxuICAgICAgICAgICAgJ2JlZHJvY2s6KicsXHJcbiAgICAgICAgICAgICdsb2dzOkNyZWF0ZUxvZ0dyb3VwJyxcclxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nU3RyZWFtJyxcclxuICAgICAgICAgICAgJ2xvZ3M6UHV0TG9nRXZlbnRzJyxcclxuICAgICAgICAgICAgJ2R5bmFtb2RiOionLFxyXG4gICAgICAgICAgICAnczM6UHV0T2JqZWN0JyxcclxuICAgICAgICAgICAgJ3MzOkdldE9iamVjdCcsXHJcbiAgICAgICAgICAgICdzMzpMaXN0QnVja2V0J1xyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIHJlc291cmNlczogWycqJ10gIC8vIFVzZSBzcGVjaWZpYyBBUk5zIGZvciB0aWdodGVyIGNvbnRyb2xcclxuICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgIHRoaXMubWVzc2FnZVByb2Nlc3NpbmcuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcclxuICAgICAgICAgIGFjdGlvbnM6IFtcclxuICAgICAgICAgICAgJ2JlZHJvY2s6KicsXHJcbiAgICAgICAgICAgICd0cmFuc2NyaWJlOionLFxyXG4gICAgICAgICAgICAnbG9nczpDcmVhdGVMb2dHcm91cCcsXHJcbiAgICAgICAgICAgICdsb2dzOkNyZWF0ZUxvZ1N0cmVhbScsXHJcbiAgICAgICAgICAgICdsb2dzOlB1dExvZ0V2ZW50cycsXHJcbiAgICAgICAgICAgICdkeW5hbW9kYjoqJyxcclxuICAgICAgICAgICAgJ3MzOlB1dE9iamVjdCcsXHJcbiAgICAgICAgICAgICdzMzpHZXRPYmplY3QnLFxyXG4gICAgICAgICAgICAnczM6TGlzdEJ1Y2tldCdcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICByZXNvdXJjZXM6IFsnKiddICAvLyBVc2Ugc3BlY2lmaWMgQVJOcyBmb3IgdGlnaHRlciBjb250cm9sXHJcbiAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXlSZXNwb25zZS5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICAgICAgYWN0aW9uczogW1xyXG4gICAgICAgICAgICAnYmVkcm9jazoqJyxcclxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nR3JvdXAnLFxyXG4gICAgICAgICAgICAnbG9nczpDcmVhdGVMb2dTdHJlYW0nLFxyXG4gICAgICAgICAgICAnbG9nczpQdXRMb2dFdmVudHMnLFxyXG4gICAgICAgICAgICAnZHluYW1vZGI6KicsXHJcbiAgICAgICAgICAgICdzMzpQdXRPYmplY3QnLFxyXG4gICAgICAgICAgICAnczM6R2V0T2JqZWN0JyxcclxuICAgICAgICAgICAgJ3MzOkxpc3RCdWNrZXQnXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgcmVzb3VyY2VzOiBbJyonXSAgLy8gVXNlIHNwZWNpZmljIEFSTnMgZm9yIHRpZ2h0ZXIgY29udHJvbFxyXG4gICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgdGhpcy50cmFuc2NyaWJlLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XHJcbiAgICAgICAgICBhY3Rpb25zOiBbXHJcbiAgICAgICAgICAgICdiZWRyb2NrOionLFxyXG4gICAgICAgICAgICAndHJhbnNjcmliZToqJyxcclxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nR3JvdXAnLFxyXG4gICAgICAgICAgICAnbG9nczpDcmVhdGVMb2dTdHJlYW0nLFxyXG4gICAgICAgICAgICAnbG9nczpQdXRMb2dFdmVudHMnLFxyXG4gICAgICAgICAgICAnZHluYW1vZGI6KicsXHJcbiAgICAgICAgICAgICdzMzpQdXRPYmplY3QnLFxyXG4gICAgICAgICAgICAnczM6R2V0T2JqZWN0JyxcclxuICAgICAgICAgICAgJ3MzOkxpc3RCdWNrZXQnXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgcmVzb3VyY2VzOiBbJyonXSAgLy8gVXNlIHNwZWNpZmljIEFSTnMgZm9yIHRpZ2h0ZXIgY29udHJvbFxyXG4gICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgdGhpcy50cmlnZ2VyUG9sbHkuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcclxuICAgICAgICAgIGFjdGlvbnM6IFtcclxuICAgICAgICAgICAgJ2JlZHJvY2s6KicsXHJcbiAgICAgICAgICAgICdwb2xseToqJyxcclxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nR3JvdXAnLFxyXG4gICAgICAgICAgICAnbG9nczpDcmVhdGVMb2dTdHJlYW0nLFxyXG4gICAgICAgICAgICAnbG9nczpQdXRMb2dFdmVudHMnLFxyXG4gICAgICAgICAgICAnZHluYW1vZGI6KicsXHJcbiAgICAgICAgICAgICdzMzpQdXRPYmplY3QnLFxyXG4gICAgICAgICAgICAnczM6R2V0T2JqZWN0JyxcclxuICAgICAgICAgICAgJ3MzOkxpc3RCdWNrZXQnXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgcmVzb3VyY2VzOiBbJyonXSAgLy8gVXNlIHNwZWNpZmljIEFSTnMgZm9yIHRpZ2h0ZXIgY29udHJvbFxyXG4gICAgICAgIH0pKTtcclxuXHJcbiAgfVxyXG59Il19