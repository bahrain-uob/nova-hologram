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
const sns = __importStar(require("aws-cdk-lib/aws-sns"));
const sns_subs = __importStar(require("aws-cdk-lib/aws-sns-subscriptions"));
const sqs = __importStar(require("aws-cdk-lib/aws-sqs"));
class lambdastack extends cdk.Stack {
    constructor(scope, id, dbStack, StorageStack, shared, props) {
        // Extract synthesisMode from props if present
        const synthesisMode = props?.synthesisMode || false;
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
        // Create SNS Topic for Textract job completion
        const textractNotificationTopic = new sns.Topic(this, 'TextractJobCompleteTopic', {
            topicName: 'TextractJobComplete',
        });
        //  Output the topic ARN (can be seen in CloudFormation outputs)
        new cdk.CfnOutput(this, 'TextractTopicARN', {
            value: textractNotificationTopic.topicArn,
        });
        // Lambda to start Textract job
        const startTextractJobLambda = new lambda.Function(this, 'StartTextractJobLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda/StartTextractJob'),
            environment: {
                BUCKET_NAME: StorageStack.readingMaterials.bucketName,
                SNS_TOPIC_ARN: textractNotificationTopic.topicArn,
            },
        });
        textractNotificationTopic.grantPublish(startTextractJobLambda);
        const textractServiceRole = new iam.Role(this, 'TextractServiceRole', {
            assumedBy: new iam.ServicePrincipal('textract.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSNSFullAccess'),
            ],
        });
        textractNotificationTopic.grantPublish(textractServiceRole); // grant topic publish access
        startTextractJobLambda.addEnvironment('TEXTRACT_SERVICE_ROLE_ARN', textractServiceRole.roleArn);
        // Subscribe the SNS topic to the SQS queue
        const splitChaptersLambda = new lambda.Function(this, 'SplitChaptersLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda/GetTextAndSplitChapters'),
            timeout: cdk.Duration.minutes(10),
        });
        splitChaptersLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                'textract:GetDocumentTextDetection',
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
                'bedrock:InvokeModel',
            ],
            resources: ['*'],
        }));
        textractNotificationTopic.addSubscription(new sns_subs.LambdaSubscription(splitChaptersLambda));
        textractNotificationTopic.grantPublish(splitChaptersLambda);
        StorageStack.readingMaterials.grantWrite(splitChaptersLambda);
        splitChaptersLambda.addEnvironment("CHAPTERS_TABLE", dbStack.chapter.tableName);
        dbStack.chapter.grantWriteData(splitChaptersLambda);
        splitChaptersLambda.addEnvironment("READING_MATERIALS_BUCKET", StorageStack.readingMaterials.bucketName);
        //generate sammury
        const summaryQueue = new sqs.Queue(this, "SummaryQueue", {
            queueName: "SummaryQueue",
            visibilityTimeout: cdk.Duration.seconds(180),
        });
        const scriptQueue = new sqs.Queue(this, "ScriptQueue", {
            queueName: "ScriptQueue",
            visibilityTimeout: cdk.Duration.seconds(300),
        });
        const generateSummaryLambda = new lambda.Function(this, 'GenerateSummaryLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda/GenerateSummary'),
            environment: {
                CHAPTERS_TABLE: dbStack.chapter.tableName,
            },
            timeout: cdk.Duration.minutes(2),
        });
        generateSummaryLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ['bedrock:*', 'logs:*', 'dynamodb:*'],
            resources: ['*'],
        }));
        generateSummaryLambda.addEnvironment("BOOKS_TABLE", dbStack.book.tableName);
        dbStack.book.grantWriteData(generateSummaryLambda);
        dbStack.book.grantReadData(generateSummaryLambda);
        generateSummaryLambda.addEventSource(new lambdaEventSources.SqsEventSource(summaryQueue));
        summaryQueue.grantConsumeMessages(generateSummaryLambda);
        dbStack.chapter.grantReadWriteData(generateSummaryLambda);
        summaryQueue.grantSendMessages(splitChaptersLambda);
        splitChaptersLambda.addEnvironment("SUMMARY_QUEUE_URL", summaryQueue.queueUrl);
        new cdk.CfnOutput(this, 'SummaryQueueURL', {
            value: summaryQueue.queueUrl,
        });
        generateSummaryLambda.addEnvironment("SCRIPT_QUEUE_URL", scriptQueue.queueUrl);
        scriptQueue.grantSendMessages(generateSummaryLambda);
        //generate script
        const videoScriptQueue = new sqs.Queue(this, "VideoScriptQueue", {
            queueName: "VideoScriptQueue",
            visibilityTimeout: cdk.Duration.seconds(910),
        });
        const ssmlQueue = new sqs.Queue(this, "SSMLQueue", {
            queueName: "SSMLQueue",
            visibilityTimeout: cdk.Duration.seconds(910),
        });
        const pollyQueue = new sqs.Queue(this, "PollyQueue", {
            queueName: "PollyQueue",
            visibilityTimeout: cdk.Duration.seconds(910),
        });
        const audioMergeQueue = new sqs.Queue(this, "AudioMergeQueue", {
            queueName: "AudioMergeQueue",
            visibilityTimeout: cdk.Duration.seconds(910),
        });
        const generateScriptLambda = new lambda.Function(this, "GenerateScriptLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/GenerateScript"),
            timeout: cdk.Duration.minutes(2),
            environment: {
                CHAPTERS_TABLE: dbStack.chapter.tableName,
                BOOKS_TABLE: dbStack.book.tableName,
                VIDEO_QUEUE_URL: videoScriptQueue.queueUrl,
            },
        });
        generateScriptLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ["bedrock:*", "logs:*", "dynamodb:*", "sqs:SendMessage"],
            resources: ["*"], // You can narrow it down to specific ARNs if needed
        }));
        dbStack.book.grantReadWriteData(generateScriptLambda);
        dbStack.chapter.grantReadWriteData(generateScriptLambda);
        scriptQueue.grantConsumeMessages(generateScriptLambda);
        generateScriptLambda.addEventSource(new lambdaEventSources.SqsEventSource(scriptQueue));
        videoScriptQueue.grantSendMessages(generateScriptLambda);
        new cdk.CfnOutput(this, "VideoScriptQueueURL", {
            value: videoScriptQueue.queueUrl,
        });
        //get book
        const getBookLambda = new lambda.Function(this, "GetBookLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/GetBook"),
            timeout: cdk.Duration.seconds(30),
            environment: {
                BOOKS_TABLE: dbStack.book.tableName,
                //CHAPTER_SUMMARY_TABLE: dbStack.chapter_summary.tableName,
                CHAPTERS_TABLE: dbStack.chapter.tableName,
            },
        });
        // Permissions
        dbStack.book.grantReadData(getBookLambda);
        //dbStack.chapter_summary.grantReadData(getBookLambda);
        dbStack.chapter.grantReadData(getBookLambda);
        StorageStack.genVideos.grantRead(getBookLambda);
        getBookLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ["dynamodb:Query"],
            resources: [
                // GSI on book table
                `arn:aws:dynamodb:${this.region}:${this.account}:table/${dbStack.book.tableName}/index/GSI_by_book_id`,
                // GSI on chapter table
                `arn:aws:dynamodb:${this.region}:${this.account}:table/${dbStack.chapter.tableName}/index/Global_chapter_summary`
            ]
        }));
        getBookLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ["s3:GetObject"],
            resources: [
                "arn:aws:s3:::storagestack-readingmaterialse72d08c8-spmbixoyxput/*"
            ]
        }));
        // Save reference to use later if needed
        this.getBookLambda = getBookLambda;
        //update book
        const updateBookLambda = new lambda.Function(this, "UpdateBookLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/UpdateBook"),
            timeout: cdk.Duration.seconds(30),
            environment: {
                BOOKS_TABLE: dbStack.book.tableName,
                CHAPTERS_TABLE: dbStack.chapter.tableName,
            },
        });
        dbStack.book.grantReadWriteData(updateBookLambda);
        dbStack.chapter.grantReadWriteData(updateBookLambda);
        updateBookLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ["dynamodb:Query"],
            resources: [
                `arn:aws:dynamodb:${this.region}:${this.account}:table/${dbStack.book.tableName}/index/GSI_by_book_id`,
            ],
        }));
        this.updateBookLambda = updateBookLambda;
        new cdk.CfnOutput(this, "UpdateBookLambdaArn", {
            value: updateBookLambda.functionArn,
            exportName: "UpdateBookLambdaArn",
        });
        //Delete book
        const deleteBookLambda = new lambda.Function(this, "DeleteBookLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/DeleteBook"),
            timeout: cdk.Duration.seconds(30),
            environment: {
                BOOKS_TABLE: dbStack.book.tableName,
                CHAPTERS_TABLE: dbStack.chapter.tableName,
                READING_BUCKET: StorageStack.readingMaterials.bucketName,
                VIDEO_BUCKET: StorageStack.genVideos.bucketName,
            },
        });
        dbStack.book.grantReadWriteData(deleteBookLambda);
        dbStack.chapter.grantReadWriteData(deleteBookLambda);
        StorageStack.readingMaterials.grantReadWrite(deleteBookLambda);
        StorageStack.genVideos.grantReadWrite(deleteBookLambda);
        this.deleteBookLambda = deleteBookLambda;
        new cdk.CfnOutput(this, "DeleteBookLambdaArn", {
            value: deleteBookLambda.functionArn,
            exportName: "DeleteBookLambdaArn",
        });
        //  generate SSML 
        const generateSSMLLambda = new lambda.Function(this, "GenerateSSMLLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/GenerateSSML"),
            timeout: cdk.Duration.minutes(2),
            environment: {
                BOOKS_TABLE: dbStack.book.tableName,
                CHAPTERS_TABLE: dbStack.chapter.tableName,
                POLLY_QUEUE_URL: pollyQueue.queueUrl,
            },
        });
        ssmlQueue.grantConsumeMessages(generateSSMLLambda);
        pollyQueue.grantSendMessages(generateSSMLLambda);
        generateSSMLLambda.addEventSource(new lambdaEventSources.SqsEventSource(ssmlQueue));
        dbStack.book.grantReadWriteData(generateSSMLLambda);
        dbStack.chapter.grantReadWriteData(generateSSMLLambda);
        generateSSMLLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ["bedrock:*", "logs:*", "dynamodb:*"],
            resources: ["*"],
        }));
        new cdk.CfnOutput(this, "GenerateSSMLQueueURL", {
            value: ssmlQueue.queueUrl,
        });
        new cdk.CfnOutput(this, "PollyQueueURL", {
            value: pollyQueue.queueUrl,
        });
        //////////////////////////////////////
        const textractTriggerTopic = new sns.Topic(this, 'TextractTriggerTopic', {
            topicName: 'TriggerTextractStart',
        });
        new cdk.CfnOutput(this, 'TextractTriggerTopicArn', {
            value: textractTriggerTopic.topicArn,
        });
        const bookHandlerLambda = new lambda.Function(this, 'BookHandlerLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda/bookHandler'),
            environment: {
                S3_BUCKET: StorageStack.readingMaterials.bucketName,
                TABLE_NAME: dbStack.book.tableName,
                TEXTRACT_TRIGGER_TOPIC_ARN: textractTriggerTopic.topicArn,
            },
            timeout: cdk.Duration.minutes(5),
            memorySize: 1024,
        });
        dbStack.book.grantWriteData(bookHandlerLambda);
        StorageStack.readingMaterials.grantPut(bookHandlerLambda);
        this.bookHandlerLambda = bookHandlerLambda;
        textractTriggerTopic.grantPublish(bookHandlerLambda);
        textractTriggerTopic.addSubscription(new sns_subs.LambdaSubscription(startTextractJobLambda));
        textractTriggerTopic.grantPublish(startTextractJobLambda);
        this.getUploadUrlsLambda = new lambda.Function(this, "GetUploadUrlsLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/GeneratePresignedUrl"),
            environment: {
                S3_BUCKET: StorageStack.readingMaterials.bucketName,
            },
        });
        StorageStack.readingMaterials.grantPut(this.getUploadUrlsLambda);
        //generate audio
        const generateAudioLambda = new lambda.Function(this, "GenerateAudioLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/GenerateAudio"),
            timeout: cdk.Duration.minutes(3),
            environment: {
                BUCKET_NAME: StorageStack.genVideos.bucketName,
                BOOKS_TABLE: dbStack.book.tableName,
                CHAPTERS_TABLE: dbStack.chapter.tableName,
                AUDIO_MERGE_QUEUE_URL: audioMergeQueue.queueUrl,
            },
        });
        StorageStack.genVideos.grantWrite(generateAudioLambda);
        dbStack.book.grantReadWriteData(generateAudioLambda);
        dbStack.chapter.grantReadWriteData(generateAudioLambda);
        audioMergeQueue.grantSendMessages(generateAudioLambda);
        generateAudioLambda.addEventSource(new lambdaEventSources.SqsEventSource(pollyQueue));
        pollyQueue.grantConsumeMessages(generateAudioLambda);
        generateAudioLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                "polly:SynthesizeSpeech",
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "s3:PutObject",
                "s3:GetObject",
                "dynamodb:UpdateItem",
                "sqs:SendMessage"
            ],
            resources: ["*"],
        }));
        new cdk.CfnOutput(this, "AudioMergeQueueURL", {
            value: audioMergeQueue.queueUrl,
        });
        // final video
        const finalVideoLambda = new lambda.Function(this, "FinalVideo", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/FinalVideo"), // path to your FFmpeg merge code
            timeout: cdk.Duration.minutes(3),
            memorySize: 1024,
            environment: {
                BOOKS_TABLE: dbStack.book.tableName,
                CHAPTERS_TABLE: dbStack.chapter.tableName,
            },
        });
        finalVideoLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                "s3:GetObject",
                "s3:PutObject",
                "s3:ListBucket",
                "dynamodb:UpdateItem",
                "dynamodb:Query",
                "logs:*",
            ],
            resources: ["*"],
        }));
        finalVideoLambda.addLayers(lambda.LayerVersion.fromLayerVersionArn(this, "FFmpegLayer", "arn:aws:lambda:us-east-1:672461264983:layer:ffmpeg:1"));
        finalVideoLambda.addEventSource(new lambdaEventSources.SqsEventSource(audioMergeQueue));
        audioMergeQueue.grantConsumeMessages(finalVideoLambda);
        StorageStack.genVideos.grantReadWrite(finalVideoLambda);
        dbStack.book.grantReadWriteData(finalVideoLambda);
        dbStack.chapter.grantReadWriteData(finalVideoLambda);
        finalVideoLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ["dynamodb:Query"],
            resources: [
                `arn:aws:dynamodb:${this.region}:${this.account}:table/${dbStack.book.tableName}/index/GSI_by_book_id`
            ]
        }));
        new cdk.CfnOutput(this, "FinalVideoLambdaArn", {
            value: finalVideoLambda.functionArn,
        });
        ////////////////////////////////////
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
        new cdk.CfnOutput(this, 'BookHandlerLambdaArn', {
            value: bookHandlerLambda.functionArn,
        });
        this.BedRockFunction = new lambda.Function(this, 'MyBedrockFunction', {
            runtime: lambda.Runtime.PYTHON_3_12,
            handler: 'index.lambda_handler', // Match the Python handler
            code: lambda.Code.fromAsset('lambda/Bedrock'),
            timeout: cdk.Duration.seconds(900), // Increase to 15 minutes
            memorySize: 2048,
            environment: {
                VIDEO_BUCKET: StorageStack.genVideos.bucketName, // Used in Python code
                VIDEO_OUTPUT_S3_URI: `s3://${StorageStack.genVideos.bucketName}/upload/`,
                BOOKS_TABLE: dbStack.book.tableName,
                CHAPTERS_TABLE: dbStack.chapter.tableName,
                SSML_QUEUE_URL: ssmlQueue.queueUrl,
            }
        });
        this.BedRockFunction.addEventSource(new lambdaEventSources.SqsEventSource(videoScriptQueue, {
            batchSize: 1,
            maxConcurrency: 2, // Add this line if your CDK version supports it
        }));
        ssmlQueue.grantSendMessages(this.BedRockFunction);
        dbStack.book.grantReadWriteData(this.BedRockFunction);
        dbStack.chapter.grantReadWriteData(this.BedRockFunction);
        StorageStack.genVideos.grantWrite(this.BedRockFunction);
        videoScriptQueue.grantConsumeMessages(this.BedRockFunction);
        this.BedRockFunction.addToRolePolicy(new iam.PolicyStatement({
            actions: ['bedrock:*', 'dynamodb:*', 's3:*', 'logs:*'],
            resources: ['*'], // You can restrict it later if needed
        }));
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
                StorageStack.audioFilesBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(this.playResponse));
            }
            catch (error) {
                // Ignore circular dependency errors during synthesis
                console.warn('Skipping event notification setup during synthesis to avoid circular dependencies');
            }
        }
        else {
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
        // Grant permissions
        StorageStack.readingMaterials.grantRead(startTextractJobLambda);
        startTextractJobLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                'textract:StartDocumentTextDetection',
                'textract:GetDocumentTextDetection',
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
            ],
            resources: ['*'],
        }));
        // Lambda to get book info using ISBN or DOI
        const getBookInfoLambda = new lambda.Function(this, "GetBookInfoLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/getBookInfo"),
        });
        this.getBookInfoLambda = getBookInfoLambda;
        const getAllBooksLambda = new lambda.Function(this, "GetAllBooksLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/listBooks"),
            environment: {
                BOOK_TABLE_NAME: dbStack.book.tableName,
            },
        });
        dbStack.book.grantReadData(getAllBooksLambda);
        this.getAllBooksLambda = getAllBooksLambda;
        this.deleteBookLambdav2 = new lambda.Function(this, "DeleteBookLambdav2", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/deleteBook"),
            environment: {
                BOOK_TABLE_NAME: dbStack.book.tableName,
            },
        });
        this.updateBookLambdav2 = new lambda.Function(this, "UpdateBookLambdav2", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/updateBook"),
            environment: {
                BOOK_TABLE_NAME: dbStack.book.tableName,
            },
        });
        this.deleteBookLambdav2.addToRolePolicy(new iam.PolicyStatement({
            actions: ["dynamodb:*"],
            resources: ["arn:aws:dynamodb:us-east-1:672461264983:table/DBStack-bookF0785129-1B9WR0J1EB4DN"]
        }));
        // Grant permissions to access the DynamoDB table
        dbStack.book.grantFullAccess(this.deleteBookLambdav2);
        dbStack.book.grantReadWriteData(this.updateBookLambdav2);
        // Book Recommendation Lambda
        const bookRecommendationLambda = new lambda.Function(this, "BookRecommendationLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/BookRecommendation"),
            environment: {
                DB_TABLE: dbStack.book.tableName,
                USER_TABLE: dbStack.user.tableName,
                COGNITO_USER_POOL_ID: "me-south-1_X7adr285t", // From memory
            },
        });
        this.bookRecommendationLambda = bookRecommendationLambda;
        // Grant permissions
        dbStack.book.grantReadWriteData(bookRecommendationLambda);
        dbStack.user.grantReadData(bookRecommendationLambda);
        // Reading Progress Tracker Lambda
        const readingProgressTrackerLambda = new lambda.Function(this, "ReadingProgressTrackerLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/ReadingProgressTracker"),
            environment: {
                PROGRESS_TABLE: dbStack.reading_progress.tableName,
                USER_TABLE: dbStack.user.tableName,
                COGNITO_USER_POOL_ID: "me-south-1_X7adr285t", // From memory
            },
        });
        this.readingProgressTrackerLambda = readingProgressTrackerLambda;
        // Grant permissions
        dbStack.reading_progress.grantReadWriteData(readingProgressTrackerLambda);
        dbStack.user.grantReadData(readingProgressTrackerLambda);
        // User Highlights Lambda
        const userHighlightsLambda = new lambda.Function(this, "UserHighlightsLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/UserHighlights"),
            environment: {
                HIGHLIGHTS_TABLE: dbStack.highlights.tableName,
                USER_TABLE: dbStack.user.tableName,
                COGNITO_USER_POOL_ID: "me-south-1_X7adr285t", // From memory
            },
        });
        this.userHighlightsLambda = userHighlightsLambda;
        // Grant permissions
        dbStack.highlights.grantReadWriteData(userHighlightsLambda);
        dbStack.user.grantReadData(userHighlightsLambda);
        // Vocabulary Manager Lambda
        const vocabularyManagerLambda = new lambda.Function(this, "VocabularyManagerLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/VocabularyManager"),
            environment: {
                USER_TABLE: dbStack.user.tableName,
                COGNITO_USER_POOL_ID: "me-south-1_X7adr285t", // From memory
            },
        });
        this.vocabularyManagerLambda = vocabularyManagerLambda;
        // Grant permissions
        dbStack.user.grantReadData(vocabularyManagerLambda);
        // Quiz Assessment Lambda
        const quizAssessmentLambda = new lambda.Function(this, "QuizAssessmentLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/QuizAssessment"),
            environment: {
                USER_TABLE: dbStack.user.tableName,
                COGNITO_USER_POOL_ID: "me-south-1_X7adr285t", // From memory
            },
        });
        this.quizAssessmentLambda = quizAssessmentLambda;
        // Grant permissions
        dbStack.user.grantReadData(quizAssessmentLambda);
        // Student Analytics Lambda
        const studentAnalyticsLambda = new lambda.Function(this, "StudentAnalyticsLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda/StudentAnalytics"),
            environment: {
                PROGRESS_TABLE: dbStack.reading_progress.tableName,
                USER_TABLE: dbStack.user.tableName,
                COGNITO_USER_POOL_ID: "me-south-1_X7adr285t", // From memory
            },
        });
        this.studentAnalyticsLambda = studentAnalyticsLambda;
        // Grant permissions
        dbStack.reading_progress.grantReadData(studentAnalyticsLambda);
        dbStack.user.grantReadData(studentAnalyticsLambda);
    }
}
exports.lambdastack = lambdastack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLXN0YWNrcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxhbWJkYS1zdGFja3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsK0RBQWlEO0FBRWpELHlGQUEyRSxDQUFDLDhCQUE4QjtBQUcxRyx5REFBMkM7QUFDM0MsdURBQXlDO0FBQ3pDLHNFQUF3RDtBQUN4RCx5REFBMkM7QUFDM0MsNEVBQThEO0FBQzlELHlEQUEyQztBQUUzQyxNQUFhLFdBQVksU0FBUSxHQUFHLENBQUMsS0FBSztJQStCeEMsWUFBWSxLQUFjLEVBQUUsRUFBVSxFQUFFLE9BQWdCLEVBQUUsWUFBeUIsRUFBRSxNQUEyQixFQUFFLEtBQW9EO1FBQ3BLLDhDQUE4QztRQUM5QyxNQUFNLGFBQWEsR0FBRyxLQUFLLEVBQUUsYUFBYSxJQUFJLEtBQUssQ0FBQztRQUNwRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixzQkFBc0I7UUFDdEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDbEUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFDLHdCQUF3QjtZQUM1RCxPQUFPLEVBQUUsZUFBZSxFQUFDLDBGQUEwRjtZQUNuSCxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsRUFBQyxzQ0FBc0M7U0FDeEYsQ0FBQyxDQUFDO1FBQ0gseUJBQXlCO1FBQzNCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUM5RCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLElB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QUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQXlCLENBQUM7WUFDdEQsV0FBVyxFQUFFO2dCQUNYLGNBQWMsRUFBRSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsU0FBUztnQkFDbEQsVUFBVSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUztnQkFDbEMsb0JBQW9CLEVBQUUsc0JBQXNCLEVBQUUsY0FBYzthQUM3RDtTQUNGLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxzQkFBc0IsR0FBRyxzQkFBc0IsQ0FBQztRQUVyRCxvQkFBb0I7UUFDcEIsT0FBTyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQy9ELE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFDM0QsQ0FBQztDQUVGO0FBNzFCRCxrQ0E2MUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbGFtYmRhXCI7XG5pbXBvcnQgeyBEQlN0YWNrIH0gZnJvbSBcIi4uL0RCL2RiLXN0YWNrXCI7IC8vIEltcG9ydCBEQlN0YWNrXG5pbXBvcnQgKiBhcyBsYW1iZGFFdmVudFNvdXJjZXMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1sYW1iZGEtZXZlbnQtc291cmNlc1wiOyAvLyBJbXBvcnQgbGFtYmRhIGV2ZW50IHNvdXJjZXNcbmltcG9ydCB7IFN0b3JhZ2VTdGFjayB9IGZyb20gXCIuLi9TdG9yYWdlL3N0b3JhZ2Utc3RhY2tcIjsgLy8gSW1wb3J0IFN0b3JhZ2VTdGFja1xuaW1wb3J0IHsgU2hhcmVkUmVzb3VyY2VzU3RhY2sgfSBmcm9tIFwiLi4vc2hhcmVkcmVzb3VyY2VzL1NoYXJlZFJlc291cmNlc1N0YWNrXCI7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcbmltcG9ydCAqIGFzIHMzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczNcIjtcbmltcG9ydCAqIGFzIHMzbiBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXMzLW5vdGlmaWNhdGlvbnNcIjtcbmltcG9ydCAqIGFzIHNucyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXNuc1wiO1xuaW1wb3J0ICogYXMgc25zX3N1YnMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zbnMtc3Vic2NyaXB0aW9uc1wiO1xuaW1wb3J0ICogYXMgc3FzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3Mtc3FzXCI7XG5cbmV4cG9ydCBjbGFzcyBsYW1iZGFzdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gICAgcHVibGljIHJlYWRvbmx5IHBvc3RVcGxvYWRMYW1iZGE6IGxhbWJkYS5GdW5jdGlvbjtcbiAgICBwdWJsaWMgcmVhZG9ubHkgZ2V0RmlsZXNMYW1iZGE6IGxhbWJkYS5GdW5jdGlvbjtcbiAgICBwdWJsaWMgcmVhZG9ubHkgZGVsZXRlRmlsZXNMYW1iZGE6IGxhbWJkYS5GdW5jdGlvbjtcbiAgICBwdWJsaWMgcmVhZG9ubHkgQmVkUm9ja0Z1bmN0aW9uOiBsYW1iZGEuRnVuY3Rpb247IFxuICAgIHB1YmxpYyByZWFkb25seSBnZXRCb29rSW5mb0xhbWJkYTogbGFtYmRhLkZ1bmN0aW9uO1xuXG4gICAgcHVibGljIHJlYWRvbmx5IG1lc3NhZ2VQcm9jZXNzaW5nOiBsYW1iZGEuRnVuY3Rpb247IFxuICAgIHB1YmxpYyByZWFkb25seSBpbnZva2VCZWRyb2NrOiBsYW1iZGEuRnVuY3Rpb247IFxuICAgIHB1YmxpYyByZWFkb25seSBpbnZva2VCZWRyb2NrTGliOiBsYW1iZGEuRnVuY3Rpb247IFxuICAgIHB1YmxpYyByZWFkb25seSBwbGF5UmVzcG9uc2U6IGxhbWJkYS5GdW5jdGlvbjsgXG4gICAgcHVibGljIHJlYWRvbmx5IHRyYW5zY3JpYmU6IGxhbWJkYS5GdW5jdGlvbjsgXG4gICAgcHVibGljIHJlYWRvbmx5IHRyaWdnZXJQb2xseTogbGFtYmRhLkZ1bmN0aW9uOyBcblxuICAgIHB1YmxpYyByZWFkb25seSBib29rSGFuZGxlckxhbWJkYTogbGFtYmRhLkZ1bmN0aW9uO1xuICAgIHB1YmxpYyByZWFkb25seSBnZXRVcGxvYWRVcmxzTGFtYmRhOiBsYW1iZGEuRnVuY3Rpb247XG4gICAgcHVibGljIHJlYWRvbmx5IGdldEJvb2tMYW1iZGE6IGxhbWJkYS5GdW5jdGlvbjtcbiAgICBwdWJsaWMgcmVhZG9ubHkgZ2V0QWxsQm9va3NMYW1iZGE6IGxhbWJkYS5GdW5jdGlvbjtcbiAgICBwdWJsaWMgcmVhZG9ubHkgZGVsZXRlQm9va0xhbWJkYXYyOiBsYW1iZGEuRnVuY3Rpb247XG4gICAgcHVibGljIHJlYWRvbmx5IHVwZGF0ZUJvb2tMYW1iZGF2MjogbGFtYmRhLkZ1bmN0aW9uO1xuICAgIHB1YmxpYyByZWFkb25seSB1cGRhdGVCb29rTGFtYmRhOiBsYW1iZGEuRnVuY3Rpb247XG4gICAgcHVibGljIHJlYWRvbmx5IGRlbGV0ZUJvb2tMYW1iZGE6IGxhbWJkYS5GdW5jdGlvbjsgICAgXG4gICAgLy8gQWRkaXRpb25hbCBMYW1iZGEgZnVuY3Rpb25zIGZvciBBUEkgaW50ZWdyYXRpb25cbiAgICBwdWJsaWMgcmVhZG9ubHkgYm9va1JlY29tbWVuZGF0aW9uTGFtYmRhOiBsYW1iZGEuRnVuY3Rpb247XG4gICAgcHVibGljIHJlYWRvbmx5IHJlYWRpbmdQcm9ncmVzc1RyYWNrZXJMYW1iZGE6IGxhbWJkYS5GdW5jdGlvbjtcbiAgICBwdWJsaWMgcmVhZG9ubHkgdXNlckhpZ2hsaWdodHNMYW1iZGE6IGxhbWJkYS5GdW5jdGlvbjtcbiAgICBwdWJsaWMgcmVhZG9ubHkgdm9jYWJ1bGFyeU1hbmFnZXJMYW1iZGE6IGxhbWJkYS5GdW5jdGlvbjtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcXVpekFzc2Vzc21lbnRMYW1iZGE6IGxhbWJkYS5GdW5jdGlvbjtcbiAgICBwdWJsaWMgcmVhZG9ubHkgc3R1ZGVudEFuYWx5dGljc0xhbWJkYTogbGFtYmRhLkZ1bmN0aW9uO1xuXG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5BcHAsIGlkOiBzdHJpbmcsIGRiU3RhY2s6IERCU3RhY2ssIFN0b3JhZ2VTdGFjazpTdG9yYWdlU3RhY2ssIHNoYXJlZDpTaGFyZWRSZXNvdXJjZXNTdGFjaywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcyAmIHsgc3ludGhlc2lzTW9kZT86IGJvb2xlYW4gfSkge1xuICAgIC8vIEV4dHJhY3Qgc3ludGhlc2lzTW9kZSBmcm9tIHByb3BzIGlmIHByZXNlbnRcbiAgICBjb25zdCBzeW50aGVzaXNNb2RlID0gcHJvcHM/LnN5bnRoZXNpc01vZGUgfHwgZmFsc2U7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvL1BPU1QgTGFtYmRhIChVcGxvYWQpXG4gICAgdGhpcy5wb3N0VXBsb2FkTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnUG9zdFVwbG9hZExhbWJkYScsIHtcbiAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsLy8gZXhlY3V0aW9uIGVudmlyb25tZW50XG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJywvLyBmaWxlIGlzIFwiaW5kZXhcIiwgZnVuY3Rpb24gaXMgXCJoYW5kbGVyXCIgICBjaGFuZ2UgdGhpcyB3aGVuIHlvdSdsbCBkbyB0aGUgZnVuY3Rpb24gaXRzZWxmXG4gICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL3Bvc3RVcGxvYWQnKSwvLyBjb2RlIGxvYWRlZCBmcm9tIFwibGFtYmRhXCIgZGlyZWN0b3J5XG4gICAgICB9KTtcbiAgICAgIC8vR0VUIExhbWJkYSAoTGlzdCBmaWxlcylcbiAgICB0aGlzLmdldEZpbGVzTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnR2V0RmlsZXNMYW1iZGEnLCB7XG4gICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL0dldEZpbGVzJyksXG4gICAgICB9KTtcbiAgICAgIC8vREVMRVRFIExhbWJkYSAoRGVsZXRlIGZpbGUpXG4gICAgdGhpcy5kZWxldGVGaWxlc0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0RlbGV0ZUZpbGVzTGFtYmRhJywge1xuICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYS9kZWxldGVGaWxlcycpLFxuICAgICAgfSk7XG4gICAgLy9naXZpbmcgbGFtYmRhIGZ1bmN0aW9ucyBwZXJtaXNzaW9uc1xuICAgIFN0b3JhZ2VTdGFjay5yZWFkaW5nTWF0ZXJpYWxzLmdyYW50UmVhZFdyaXRlKHRoaXMucG9zdFVwbG9hZExhbWJkYSk7XG4gICAgU3RvcmFnZVN0YWNrLnJlYWRpbmdNYXRlcmlhbHMuZ3JhbnRSZWFkKHRoaXMuZ2V0RmlsZXNMYW1iZGEpO1xuICAgIFN0b3JhZ2VTdGFjay5yZWFkaW5nTWF0ZXJpYWxzLmdyYW50V3JpdGUodGhpcy5kZWxldGVGaWxlc0xhbWJkYSk7XG5cbiBcbiAgICAgLy8gVGhpcyBpcyB0aGUgbGFtYmRhIGZ1bmN0aW9uIHRoYXQgd2lsbCBoYXZlIHRoZSBhd3MgdGV4dHJhY3QgY29kZSB0byBleHRyYWN0IHRleHQgIGZyb20gb2JqZWN0IChwZGYsIGVwdWIgYW5kIHdvcmQgZm9yIGV4YW1wbGUpXG4gICAgY29uc3QgdGV4dEV4dHJhY3Rpb25MYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdUZXh0RXh0cmFjdGlvbkxhbWJkYScsIHtcbiAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvVGV4dEV4dHJhY3Rpb24nKSwgLy9sb2NhdGlvbiBvZiB0aGUgZm9sZGVyIHRoYXQgc2hvdWxkIGhhdmUgdGhlIHRleHQgZXh0cmFjdGVkIG9iamVjdCBcbiAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICBPVVRQVVRfUVVFVUVfVVJMOiBTdG9yYWdlU3RhY2suZXh0cmFjdGVkVGV4dFF1ZXVlLnF1ZXVlVXJsLFxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIC8vIENyZWF0ZSBTTlMgVG9waWMgZm9yIFRleHRyYWN0IGpvYiBjb21wbGV0aW9uXG4gICAgICBjb25zdCB0ZXh0cmFjdE5vdGlmaWNhdGlvblRvcGljID0gbmV3IHNucy5Ub3BpYyh0aGlzLCAnVGV4dHJhY3RKb2JDb21wbGV0ZVRvcGljJywge1xuICAgICAgICB0b3BpY05hbWU6ICdUZXh0cmFjdEpvYkNvbXBsZXRlJyxcbiAgICAgIH0pO1xuICAgICAgLy8gIE91dHB1dCB0aGUgdG9waWMgQVJOIChjYW4gYmUgc2VlbiBpbiBDbG91ZEZvcm1hdGlvbiBvdXRwdXRzKVxuICAgICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1RleHRyYWN0VG9waWNBUk4nLCB7XG4gICAgICAgIHZhbHVlOiB0ZXh0cmFjdE5vdGlmaWNhdGlvblRvcGljLnRvcGljQXJuLFxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIC8vIExhbWJkYSB0byBzdGFydCBUZXh0cmFjdCBqb2JcbiAgICAgIGNvbnN0IHN0YXJ0VGV4dHJhY3RKb2JMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdTdGFydFRleHRyYWN0Sm9iTGFtYmRhJywge1xuICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCwgIFxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsICBcbiAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvU3RhcnRUZXh0cmFjdEpvYicpLCBcbiAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICBCVUNLRVRfTkFNRTogU3RvcmFnZVN0YWNrLnJlYWRpbmdNYXRlcmlhbHMuYnVja2V0TmFtZSwgIFxuICAgICAgICAgIFNOU19UT1BJQ19BUk46IHRleHRyYWN0Tm90aWZpY2F0aW9uVG9waWMudG9waWNBcm4sXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgdGV4dHJhY3ROb3RpZmljYXRpb25Ub3BpYy5ncmFudFB1Ymxpc2goc3RhcnRUZXh0cmFjdEpvYkxhbWJkYSk7XG5cbiAgICAgIGNvbnN0IHRleHRyYWN0U2VydmljZVJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ1RleHRyYWN0U2VydmljZVJvbGUnLCB7XG4gICAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCd0ZXh0cmFjdC5hbWF6b25hd3MuY29tJyksXG4gICAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQW1hem9uU05TRnVsbEFjY2VzcycpLFxuICAgICAgICBdLFxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIHRleHRyYWN0Tm90aWZpY2F0aW9uVG9waWMuZ3JhbnRQdWJsaXNoKHRleHRyYWN0U2VydmljZVJvbGUpOyAvLyBncmFudCB0b3BpYyBwdWJsaXNoIGFjY2Vzc1xuICAgICAgc3RhcnRUZXh0cmFjdEpvYkxhbWJkYS5hZGRFbnZpcm9ubWVudCgnVEVYVFJBQ1RfU0VSVklDRV9ST0xFX0FSTicsIHRleHRyYWN0U2VydmljZVJvbGUucm9sZUFybik7XG4gICAgICBcbiAgICAgIC8vIFN1YnNjcmliZSB0aGUgU05TIHRvcGljIHRvIHRoZSBTUVMgcXVldWVcbiAgICAgIGNvbnN0IHNwbGl0Q2hhcHRlcnNMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdTcGxpdENoYXB0ZXJzTGFtYmRhJywge1xuICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYS9HZXRUZXh0QW5kU3BsaXRDaGFwdGVycycpLFxuICAgICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24ubWludXRlcygxMCksIFxuICAgIH0pO1xuICAgIFxuICAgIHNwbGl0Q2hhcHRlcnNMYW1iZGEuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAndGV4dHJhY3Q6R2V0RG9jdW1lbnRUZXh0RGV0ZWN0aW9uJyxcbiAgICAgICAgICAnbG9nczpDcmVhdGVMb2dHcm91cCcsXG4gICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nU3RyZWFtJyxcbiAgICAgICAgICAnbG9nczpQdXRMb2dFdmVudHMnLFxuICAgICAgICAgICdiZWRyb2NrOkludm9rZU1vZGVsJyxcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFsnKiddLFxuICB9KSk7XG4gIHRleHRyYWN0Tm90aWZpY2F0aW9uVG9waWMuYWRkU3Vic2NyaXB0aW9uKFxuICAgIG5ldyBzbnNfc3Vicy5MYW1iZGFTdWJzY3JpcHRpb24oc3BsaXRDaGFwdGVyc0xhbWJkYSlcbiAgKTtcbiAgdGV4dHJhY3ROb3RpZmljYXRpb25Ub3BpYy5ncmFudFB1Ymxpc2goc3BsaXRDaGFwdGVyc0xhbWJkYSk7XG4gIFN0b3JhZ2VTdGFjay5yZWFkaW5nTWF0ZXJpYWxzLmdyYW50V3JpdGUoc3BsaXRDaGFwdGVyc0xhbWJkYSk7XG4gIHNwbGl0Q2hhcHRlcnNMYW1iZGEuYWRkRW52aXJvbm1lbnQoXCJDSEFQVEVSU19UQUJMRVwiLCBkYlN0YWNrLmNoYXB0ZXIudGFibGVOYW1lKTtcbiAgZGJTdGFjay5jaGFwdGVyLmdyYW50V3JpdGVEYXRhKHNwbGl0Q2hhcHRlcnNMYW1iZGEpO1xuICBzcGxpdENoYXB0ZXJzTGFtYmRhLmFkZEVudmlyb25tZW50KFwiUkVBRElOR19NQVRFUklBTFNfQlVDS0VUXCIsIFN0b3JhZ2VTdGFjay5yZWFkaW5nTWF0ZXJpYWxzLmJ1Y2tldE5hbWUpO1xuXG4gIC8vZ2VuZXJhdGUgc2FtbXVyeVxuICBjb25zdCBzdW1tYXJ5UXVldWUgPSBuZXcgc3FzLlF1ZXVlKHRoaXMsIFwiU3VtbWFyeVF1ZXVlXCIsIHtcbiAgICBxdWV1ZU5hbWU6IFwiU3VtbWFyeVF1ZXVlXCIsXG4gICAgdmlzaWJpbGl0eVRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDE4MCksXG4gIH0pO1xuICBcbiAgY29uc3Qgc2NyaXB0UXVldWUgPSBuZXcgc3FzLlF1ZXVlKHRoaXMsIFwiU2NyaXB0UXVldWVcIiwge1xuICAgIHF1ZXVlTmFtZTogXCJTY3JpcHRRdWV1ZVwiLFxuICAgIHZpc2liaWxpdHlUaW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMDApLFxuICB9KTtcbiAgXG4gIGNvbnN0IGdlbmVyYXRlU3VtbWFyeUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0dlbmVyYXRlU3VtbWFyeUxhbWJkYScsIHtcbiAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvR2VuZXJhdGVTdW1tYXJ5JyksXG4gICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgIENIQVBURVJTX1RBQkxFOiBkYlN0YWNrLmNoYXB0ZXIudGFibGVOYW1lLFxuICAgIH0sXG4gICAgdGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoMiksXG4gIH0pO1xuICBnZW5lcmF0ZVN1bW1hcnlMYW1iZGEuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICBhY3Rpb25zOiBbJ2JlZHJvY2s6KicsICdsb2dzOionLCAnZHluYW1vZGI6KiddLFxuICAgIHJlc291cmNlczogWycqJ10sXG4gIH0pKTtcbiAgZ2VuZXJhdGVTdW1tYXJ5TGFtYmRhLmFkZEVudmlyb25tZW50KFwiQk9PS1NfVEFCTEVcIiwgZGJTdGFjay5ib29rLnRhYmxlTmFtZSk7XG4gIGRiU3RhY2suYm9vay5ncmFudFdyaXRlRGF0YShnZW5lcmF0ZVN1bW1hcnlMYW1iZGEpO1xuICBkYlN0YWNrLmJvb2suZ3JhbnRSZWFkRGF0YShnZW5lcmF0ZVN1bW1hcnlMYW1iZGEpO1xuICBnZW5lcmF0ZVN1bW1hcnlMYW1iZGEuYWRkRXZlbnRTb3VyY2UobmV3IGxhbWJkYUV2ZW50U291cmNlcy5TcXNFdmVudFNvdXJjZShzdW1tYXJ5UXVldWUpKTtcbiAgc3VtbWFyeVF1ZXVlLmdyYW50Q29uc3VtZU1lc3NhZ2VzKGdlbmVyYXRlU3VtbWFyeUxhbWJkYSk7XG4gIGRiU3RhY2suY2hhcHRlci5ncmFudFJlYWRXcml0ZURhdGEoZ2VuZXJhdGVTdW1tYXJ5TGFtYmRhKTtcbiAgc3VtbWFyeVF1ZXVlLmdyYW50U2VuZE1lc3NhZ2VzKHNwbGl0Q2hhcHRlcnNMYW1iZGEpO1xuICBzcGxpdENoYXB0ZXJzTGFtYmRhLmFkZEVudmlyb25tZW50KFwiU1VNTUFSWV9RVUVVRV9VUkxcIiwgc3VtbWFyeVF1ZXVlLnF1ZXVlVXJsKTtcbiAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1N1bW1hcnlRdWV1ZVVSTCcsIHtcbiAgICB2YWx1ZTogc3VtbWFyeVF1ZXVlLnF1ZXVlVXJsLFxuICB9KTtcbiAgZ2VuZXJhdGVTdW1tYXJ5TGFtYmRhLmFkZEVudmlyb25tZW50KFwiU0NSSVBUX1FVRVVFX1VSTFwiLCBzY3JpcHRRdWV1ZS5xdWV1ZVVybCk7XG4gIHNjcmlwdFF1ZXVlLmdyYW50U2VuZE1lc3NhZ2VzKGdlbmVyYXRlU3VtbWFyeUxhbWJkYSk7XG5cbiAgLy9nZW5lcmF0ZSBzY3JpcHRcbiAgY29uc3QgdmlkZW9TY3JpcHRRdWV1ZSA9IG5ldyBzcXMuUXVldWUodGhpcywgXCJWaWRlb1NjcmlwdFF1ZXVlXCIsIHtcbiAgICBxdWV1ZU5hbWU6IFwiVmlkZW9TY3JpcHRRdWV1ZVwiLFxuICAgIHZpc2liaWxpdHlUaW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcyg5MTApLFxuICB9KTtcblxuICBjb25zdCBzc21sUXVldWUgPSBuZXcgc3FzLlF1ZXVlKHRoaXMsIFwiU1NNTFF1ZXVlXCIsIHtcbiAgICBxdWV1ZU5hbWU6IFwiU1NNTFF1ZXVlXCIsXG4gICAgdmlzaWJpbGl0eVRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDkxMCksXG4gIH0pO1xuICBjb25zdCBwb2xseVF1ZXVlID0gbmV3IHNxcy5RdWV1ZSh0aGlzLCBcIlBvbGx5UXVldWVcIiwge1xuICAgIHF1ZXVlTmFtZTogXCJQb2xseVF1ZXVlXCIsXG4gICAgdmlzaWJpbGl0eVRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDkxMCksXG4gIH0pO1xuICBjb25zdCBhdWRpb01lcmdlUXVldWUgPSBuZXcgc3FzLlF1ZXVlKHRoaXMsIFwiQXVkaW9NZXJnZVF1ZXVlXCIsIHtcbiAgICBxdWV1ZU5hbWU6IFwiQXVkaW9NZXJnZVF1ZXVlXCIsXG4gICAgdmlzaWJpbGl0eVRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDkxMCksIFxuICB9KTtcbiAgXG4gIGNvbnN0IGdlbmVyYXRlU2NyaXB0TGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIkdlbmVyYXRlU2NyaXB0TGFtYmRhXCIsIHtcbiAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICBoYW5kbGVyOiBcImluZGV4LmhhbmRsZXJcIixcbiAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGEvR2VuZXJhdGVTY3JpcHRcIiksXG4gICAgdGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoMiksXG4gICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgIENIQVBURVJTX1RBQkxFOiBkYlN0YWNrLmNoYXB0ZXIudGFibGVOYW1lLFxuICAgICAgQk9PS1NfVEFCTEU6IGRiU3RhY2suYm9vay50YWJsZU5hbWUsXG4gICAgICBWSURFT19RVUVVRV9VUkw6IHZpZGVvU2NyaXB0UXVldWUucXVldWVVcmwsXG4gICAgfSxcbiAgfSk7XG5cbiAgZ2VuZXJhdGVTY3JpcHRMYW1iZGEuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICBhY3Rpb25zOiBbXCJiZWRyb2NrOipcIiwgXCJsb2dzOipcIiwgXCJkeW5hbW9kYjoqXCIsIFwic3FzOlNlbmRNZXNzYWdlXCJdLFxuICAgIHJlc291cmNlczogW1wiKlwiXSwgLy8gWW91IGNhbiBuYXJyb3cgaXQgZG93biB0byBzcGVjaWZpYyBBUk5zIGlmIG5lZWRlZFxuICB9KSk7XG5cbiAgZGJTdGFjay5ib29rLmdyYW50UmVhZFdyaXRlRGF0YShnZW5lcmF0ZVNjcmlwdExhbWJkYSk7XG4gIGRiU3RhY2suY2hhcHRlci5ncmFudFJlYWRXcml0ZURhdGEoZ2VuZXJhdGVTY3JpcHRMYW1iZGEpO1xuXG4gIHNjcmlwdFF1ZXVlLmdyYW50Q29uc3VtZU1lc3NhZ2VzKGdlbmVyYXRlU2NyaXB0TGFtYmRhKTtcbiAgZ2VuZXJhdGVTY3JpcHRMYW1iZGEuYWRkRXZlbnRTb3VyY2UobmV3IGxhbWJkYUV2ZW50U291cmNlcy5TcXNFdmVudFNvdXJjZShzY3JpcHRRdWV1ZSkpO1xuXG4gIHZpZGVvU2NyaXB0UXVldWUuZ3JhbnRTZW5kTWVzc2FnZXMoZ2VuZXJhdGVTY3JpcHRMYW1iZGEpO1xuXG4gIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiVmlkZW9TY3JpcHRRdWV1ZVVSTFwiLCB7XG4gICAgdmFsdWU6IHZpZGVvU2NyaXB0UXVldWUucXVldWVVcmwsXG4gIH0pO1xuXG5cbiAgLy9nZXQgYm9va1xuICBjb25zdCBnZXRCb29rTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIkdldEJvb2tMYW1iZGFcIiwge1xuICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChcImxhbWJkYS9HZXRCb29rXCIpLFxuICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICBlbnZpcm9ubWVudDoge1xuICAgICAgQk9PS1NfVEFCTEU6IGRiU3RhY2suYm9vay50YWJsZU5hbWUsXG4gICAgICAvL0NIQVBURVJfU1VNTUFSWV9UQUJMRTogZGJTdGFjay5jaGFwdGVyX3N1bW1hcnkudGFibGVOYW1lLFxuICAgICAgQ0hBUFRFUlNfVEFCTEU6IGRiU3RhY2suY2hhcHRlci50YWJsZU5hbWUsXG4gICAgfSxcbiAgfSk7XG4gIFxuICAvLyBQZXJtaXNzaW9uc1xuICBkYlN0YWNrLmJvb2suZ3JhbnRSZWFkRGF0YShnZXRCb29rTGFtYmRhKTtcbiAgLy9kYlN0YWNrLmNoYXB0ZXJfc3VtbWFyeS5ncmFudFJlYWREYXRhKGdldEJvb2tMYW1iZGEpO1xuICBkYlN0YWNrLmNoYXB0ZXIuZ3JhbnRSZWFkRGF0YShnZXRCb29rTGFtYmRhKTtcbiAgU3RvcmFnZVN0YWNrLmdlblZpZGVvcy5ncmFudFJlYWQoZ2V0Qm9va0xhbWJkYSk7XG5cbiAgZ2V0Qm9va0xhbWJkYS5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgIGFjdGlvbnM6IFtcImR5bmFtb2RiOlF1ZXJ5XCJdLFxuICAgIHJlc291cmNlczogW1xuICAgICAgLy8gR1NJIG9uIGJvb2sgdGFibGVcbiAgICAgIGBhcm46YXdzOmR5bmFtb2RiOiR7dGhpcy5yZWdpb259OiR7dGhpcy5hY2NvdW50fTp0YWJsZS8ke2RiU3RhY2suYm9vay50YWJsZU5hbWV9L2luZGV4L0dTSV9ieV9ib29rX2lkYCxcbiAgICAgIC8vIEdTSSBvbiBjaGFwdGVyIHRhYmxlXG4gICAgICBgYXJuOmF3czpkeW5hbW9kYjoke3RoaXMucmVnaW9ufToke3RoaXMuYWNjb3VudH06dGFibGUvJHtkYlN0YWNrLmNoYXB0ZXIudGFibGVOYW1lfS9pbmRleC9HbG9iYWxfY2hhcHRlcl9zdW1tYXJ5YFxuICAgIF1cbiAgfSkpO1xuICBnZXRCb29rTGFtYmRhLmFkZFRvUm9sZVBvbGljeShcbiAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBhY3Rpb25zOiBbXCJzMzpHZXRPYmplY3RcIl0sXG4gICAgICByZXNvdXJjZXM6IFtcbiAgICAgICAgXCJhcm46YXdzOnMzOjo6c3RvcmFnZXN0YWNrLXJlYWRpbmdtYXRlcmlhbHNlNzJkMDhjOC1zcG1iaXhveXhwdXQvKlwiXG4gICAgICBdXG4gICAgfSlcbiAgKTtcbiAgLy8gU2F2ZSByZWZlcmVuY2UgdG8gdXNlIGxhdGVyIGlmIG5lZWRlZFxuICB0aGlzLmdldEJvb2tMYW1iZGEgPSBnZXRCb29rTGFtYmRhO1xuICBcblxuICBcbiAgLy91cGRhdGUgYm9va1xuICBjb25zdCB1cGRhdGVCb29rTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIlVwZGF0ZUJvb2tMYW1iZGFcIiwge1xuICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChcImxhbWJkYS9VcGRhdGVCb29rXCIpLFxuICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICBlbnZpcm9ubWVudDoge1xuICAgICAgQk9PS1NfVEFCTEU6IGRiU3RhY2suYm9vay50YWJsZU5hbWUsXG4gICAgICBDSEFQVEVSU19UQUJMRTogZGJTdGFjay5jaGFwdGVyLnRhYmxlTmFtZSxcbiAgICB9LFxuICB9KTtcbiAgXG4gIGRiU3RhY2suYm9vay5ncmFudFJlYWRXcml0ZURhdGEodXBkYXRlQm9va0xhbWJkYSk7XG4gIGRiU3RhY2suY2hhcHRlci5ncmFudFJlYWRXcml0ZURhdGEodXBkYXRlQm9va0xhbWJkYSk7XG5cbiAgdXBkYXRlQm9va0xhbWJkYS5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgIGFjdGlvbnM6IFtcImR5bmFtb2RiOlF1ZXJ5XCJdLFxuICAgIHJlc291cmNlczogW1xuICAgICAgYGFybjphd3M6ZHluYW1vZGI6JHt0aGlzLnJlZ2lvbn06JHt0aGlzLmFjY291bnR9OnRhYmxlLyR7ZGJTdGFjay5ib29rLnRhYmxlTmFtZX0vaW5kZXgvR1NJX2J5X2Jvb2tfaWRgLFxuICAgIF0sXG4gIH0pKTtcbiAgdGhpcy51cGRhdGVCb29rTGFtYmRhID0gdXBkYXRlQm9va0xhbWJkYTtcblxuICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIlVwZGF0ZUJvb2tMYW1iZGFBcm5cIiwge1xuICAgIHZhbHVlOiB1cGRhdGVCb29rTGFtYmRhLmZ1bmN0aW9uQXJuLFxuICAgIGV4cG9ydE5hbWU6IFwiVXBkYXRlQm9va0xhbWJkYUFyblwiLFxuICB9KTtcbiAgXG4gIC8vRGVsZXRlIGJvb2tcbiAgY29uc3QgZGVsZXRlQm9va0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJEZWxldGVCb29rTGFtYmRhXCIsIHtcbiAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICBoYW5kbGVyOiBcImluZGV4LmhhbmRsZXJcIixcbiAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGEvRGVsZXRlQm9va1wiKSxcbiAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgIEJPT0tTX1RBQkxFOiBkYlN0YWNrLmJvb2sudGFibGVOYW1lLFxuICAgICAgQ0hBUFRFUlNfVEFCTEU6IGRiU3RhY2suY2hhcHRlci50YWJsZU5hbWUsXG4gICAgICBSRUFESU5HX0JVQ0tFVDogU3RvcmFnZVN0YWNrLnJlYWRpbmdNYXRlcmlhbHMuYnVja2V0TmFtZSxcbiAgICAgIFZJREVPX0JVQ0tFVDogU3RvcmFnZVN0YWNrLmdlblZpZGVvcy5idWNrZXROYW1lLFxuICAgIH0sXG4gIH0pO1xuICBkYlN0YWNrLmJvb2suZ3JhbnRSZWFkV3JpdGVEYXRhKGRlbGV0ZUJvb2tMYW1iZGEpO1xuICBkYlN0YWNrLmNoYXB0ZXIuZ3JhbnRSZWFkV3JpdGVEYXRhKGRlbGV0ZUJvb2tMYW1iZGEpO1xuICBTdG9yYWdlU3RhY2sucmVhZGluZ01hdGVyaWFscy5ncmFudFJlYWRXcml0ZShkZWxldGVCb29rTGFtYmRhKTtcbiAgU3RvcmFnZVN0YWNrLmdlblZpZGVvcy5ncmFudFJlYWRXcml0ZShkZWxldGVCb29rTGFtYmRhKTtcbiAgdGhpcy5kZWxldGVCb29rTGFtYmRhID0gZGVsZXRlQm9va0xhbWJkYTsgICAgXG4gIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiRGVsZXRlQm9va0xhbWJkYUFyblwiLCB7XG4gICAgdmFsdWU6IGRlbGV0ZUJvb2tMYW1iZGEuZnVuY3Rpb25Bcm4sXG4gICAgZXhwb3J0TmFtZTogXCJEZWxldGVCb29rTGFtYmRhQXJuXCIsXG4gIH0pO1xuICBcbi8vICBnZW5lcmF0ZSBTU01MIFxuY29uc3QgZ2VuZXJhdGVTU01MTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIkdlbmVyYXRlU1NNTExhbWJkYVwiLCB7XG4gIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICBoYW5kbGVyOiBcImluZGV4LmhhbmRsZXJcIixcbiAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhL0dlbmVyYXRlU1NNTFwiKSxcbiAgdGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoMiksXG4gIGVudmlyb25tZW50OiB7XG4gICAgQk9PS1NfVEFCTEU6IGRiU3RhY2suYm9vay50YWJsZU5hbWUsXG4gICAgQ0hBUFRFUlNfVEFCTEU6IGRiU3RhY2suY2hhcHRlci50YWJsZU5hbWUsXG4gICAgUE9MTFlfUVVFVUVfVVJMOiBwb2xseVF1ZXVlLnF1ZXVlVXJsLFxuICB9LFxufSk7XG5zc21sUXVldWUuZ3JhbnRDb25zdW1lTWVzc2FnZXMoZ2VuZXJhdGVTU01MTGFtYmRhKTtcbnBvbGx5UXVldWUuZ3JhbnRTZW5kTWVzc2FnZXMoZ2VuZXJhdGVTU01MTGFtYmRhKTtcbmdlbmVyYXRlU1NNTExhbWJkYS5hZGRFdmVudFNvdXJjZShuZXcgbGFtYmRhRXZlbnRTb3VyY2VzLlNxc0V2ZW50U291cmNlKHNzbWxRdWV1ZSkpO1xuZGJTdGFjay5ib29rLmdyYW50UmVhZFdyaXRlRGF0YShnZW5lcmF0ZVNTTUxMYW1iZGEpO1xuZGJTdGFjay5jaGFwdGVyLmdyYW50UmVhZFdyaXRlRGF0YShnZW5lcmF0ZVNTTUxMYW1iZGEpO1xuXG5nZW5lcmF0ZVNTTUxMYW1iZGEuYWRkVG9Sb2xlUG9saWN5KFxuICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgYWN0aW9uczogW1wiYmVkcm9jazoqXCIsXCJsb2dzOipcIiwgXCJkeW5hbW9kYjoqXCJdLFxuICAgIHJlc291cmNlczogW1wiKlwiXSwgXG4gIH0pXG4pO1xubmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJHZW5lcmF0ZVNTTUxRdWV1ZVVSTFwiLCB7XG4gIHZhbHVlOiBzc21sUXVldWUucXVldWVVcmwsXG59KTtcblxubmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJQb2xseVF1ZXVlVVJMXCIsIHtcbiAgdmFsdWU6IHBvbGx5UXVldWUucXVldWVVcmwsXG59KTtcblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICBjb25zdCB0ZXh0cmFjdFRyaWdnZXJUb3BpYyA9IG5ldyBzbnMuVG9waWModGhpcywgJ1RleHRyYWN0VHJpZ2dlclRvcGljJywge1xuICAgIHRvcGljTmFtZTogJ1RyaWdnZXJUZXh0cmFjdFN0YXJ0JyxcbiAgfSk7XG4gIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdUZXh0cmFjdFRyaWdnZXJUb3BpY0FybicsIHtcbiAgICB2YWx1ZTogdGV4dHJhY3RUcmlnZ2VyVG9waWMudG9waWNBcm4sXG4gIH0pO1xuXG4gIGNvbnN0IGJvb2tIYW5kbGVyTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQm9va0hhbmRsZXJMYW1iZGEnLCB7XG4gICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL2Jvb2tIYW5kbGVyJyksXG4gICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgIFMzX0JVQ0tFVDogU3RvcmFnZVN0YWNrLnJlYWRpbmdNYXRlcmlhbHMuYnVja2V0TmFtZSwgIFxuICAgICAgVEFCTEVfTkFNRTogZGJTdGFjay5ib29rLnRhYmxlTmFtZSwgIFxuICAgICAgVEVYVFJBQ1RfVFJJR0dFUl9UT1BJQ19BUk46IHRleHRyYWN0VHJpZ2dlclRvcGljLnRvcGljQXJuLCAgICAgICAgICAgICAgICBcbiAgICB9LFxuICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgIG1lbW9yeVNpemU6IDEwMjQsXG4gIH0pO1xuICBkYlN0YWNrLmJvb2suZ3JhbnRXcml0ZURhdGEoYm9va0hhbmRsZXJMYW1iZGEpO1xuICBTdG9yYWdlU3RhY2sucmVhZGluZ01hdGVyaWFscy5ncmFudFB1dChib29rSGFuZGxlckxhbWJkYSk7XG4gIHRoaXMuYm9va0hhbmRsZXJMYW1iZGEgPSBib29rSGFuZGxlckxhbWJkYTtcblxuICB0ZXh0cmFjdFRyaWdnZXJUb3BpYy5ncmFudFB1Ymxpc2goYm9va0hhbmRsZXJMYW1iZGEpO1xuICB0ZXh0cmFjdFRyaWdnZXJUb3BpYy5hZGRTdWJzY3JpcHRpb24oXG4gICAgbmV3IHNuc19zdWJzLkxhbWJkYVN1YnNjcmlwdGlvbihzdGFydFRleHRyYWN0Sm9iTGFtYmRhKVxuICApO1xuICB0ZXh0cmFjdFRyaWdnZXJUb3BpYy5ncmFudFB1Ymxpc2goc3RhcnRUZXh0cmFjdEpvYkxhbWJkYSk7XG4gIFxuICB0aGlzLmdldFVwbG9hZFVybHNMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwiR2V0VXBsb2FkVXJsc0xhbWJkYVwiLCB7XG4gICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgaGFuZGxlcjogXCJpbmRleC5oYW5kbGVyXCIsXG4gICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhL0dlbmVyYXRlUHJlc2lnbmVkVXJsXCIpLFxuICAgIGVudmlyb25tZW50OiB7XG4gICAgICBTM19CVUNLRVQ6IFN0b3JhZ2VTdGFjay5yZWFkaW5nTWF0ZXJpYWxzLmJ1Y2tldE5hbWUsXG4gICAgfSxcbiAgfSk7XG4gIFN0b3JhZ2VTdGFjay5yZWFkaW5nTWF0ZXJpYWxzLmdyYW50UHV0KHRoaXMuZ2V0VXBsb2FkVXJsc0xhbWJkYSk7XG5cblxuICAvL2dlbmVyYXRlIGF1ZGlvXG4gIGNvbnN0IGdlbmVyYXRlQXVkaW9MYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwiR2VuZXJhdGVBdWRpb0xhbWJkYVwiLCB7XG4gICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgaGFuZGxlcjogXCJpbmRleC5oYW5kbGVyXCIsXG4gICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhL0dlbmVyYXRlQXVkaW9cIiksXG4gICAgdGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoMyksXG4gICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgIEJVQ0tFVF9OQU1FOiBTdG9yYWdlU3RhY2suZ2VuVmlkZW9zLmJ1Y2tldE5hbWUsIFxuICAgICAgQk9PS1NfVEFCTEU6IGRiU3RhY2suYm9vay50YWJsZU5hbWUsXG4gICAgICBDSEFQVEVSU19UQUJMRTogZGJTdGFjay5jaGFwdGVyLnRhYmxlTmFtZSxcbiAgICAgIEFVRElPX01FUkdFX1FVRVVFX1VSTDogYXVkaW9NZXJnZVF1ZXVlLnF1ZXVlVXJsLFxuICAgIH0sXG4gIH0pO1xuICBcbiAgU3RvcmFnZVN0YWNrLmdlblZpZGVvcy5ncmFudFdyaXRlKGdlbmVyYXRlQXVkaW9MYW1iZGEpOyBcbiAgXG4gIGRiU3RhY2suYm9vay5ncmFudFJlYWRXcml0ZURhdGEoZ2VuZXJhdGVBdWRpb0xhbWJkYSk7XG4gIGRiU3RhY2suY2hhcHRlci5ncmFudFJlYWRXcml0ZURhdGEoZ2VuZXJhdGVBdWRpb0xhbWJkYSk7XG4gIGF1ZGlvTWVyZ2VRdWV1ZS5ncmFudFNlbmRNZXNzYWdlcyhnZW5lcmF0ZUF1ZGlvTGFtYmRhKTtcbiAgZ2VuZXJhdGVBdWRpb0xhbWJkYS5hZGRFdmVudFNvdXJjZShuZXcgbGFtYmRhRXZlbnRTb3VyY2VzLlNxc0V2ZW50U291cmNlKHBvbGx5UXVldWUpKTtcbiAgcG9sbHlRdWV1ZS5ncmFudENvbnN1bWVNZXNzYWdlcyhnZW5lcmF0ZUF1ZGlvTGFtYmRhKTtcblxuICBnZW5lcmF0ZUF1ZGlvTGFtYmRhLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgYWN0aW9uczogW1xuICAgICAgXCJwb2xseTpTeW50aGVzaXplU3BlZWNoXCIsXG4gICAgICBcImxvZ3M6Q3JlYXRlTG9nR3JvdXBcIixcbiAgICAgIFwibG9nczpDcmVhdGVMb2dTdHJlYW1cIixcbiAgICAgIFwibG9nczpQdXRMb2dFdmVudHNcIixcbiAgICAgIFwiczM6UHV0T2JqZWN0XCIsXG4gICAgICBcInMzOkdldE9iamVjdFwiLFxuICAgICAgXCJkeW5hbW9kYjpVcGRhdGVJdGVtXCIsXG4gICAgICBcInNxczpTZW5kTWVzc2FnZVwiXG4gICAgXSxcbiAgICByZXNvdXJjZXM6IFtcIipcIl0sXG4gIH0pKTtcbiAgXG4gIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiQXVkaW9NZXJnZVF1ZXVlVVJMXCIsIHtcbiAgICB2YWx1ZTogYXVkaW9NZXJnZVF1ZXVlLnF1ZXVlVXJsLFxuICB9KTtcbiAgXG5cbiAgXG4gICAgICBcblxuICAvLyBmaW5hbCB2aWRlb1xuICBjb25zdCBmaW5hbFZpZGVvTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIkZpbmFsVmlkZW9cIiwge1xuICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChcImxhbWJkYS9GaW5hbFZpZGVvXCIpLCAvLyBwYXRoIHRvIHlvdXIgRkZtcGVnIG1lcmdlIGNvZGVcbiAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24ubWludXRlcygzKSxcbiAgICBtZW1vcnlTaXplOiAxMDI0LFxuICAgIGVudmlyb25tZW50OiB7XG4gICAgICBCT09LU19UQUJMRTogZGJTdGFjay5ib29rLnRhYmxlTmFtZSxcbiAgICAgIENIQVBURVJTX1RBQkxFOiBkYlN0YWNrLmNoYXB0ZXIudGFibGVOYW1lLFxuICAgIH0sXG4gIH0pO1xuICBmaW5hbFZpZGVvTGFtYmRhLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgYWN0aW9uczogW1xuICAgICAgXCJzMzpHZXRPYmplY3RcIixcbiAgICAgIFwiczM6UHV0T2JqZWN0XCIsXG4gICAgICBcInMzOkxpc3RCdWNrZXRcIixcbiAgICAgIFwiZHluYW1vZGI6VXBkYXRlSXRlbVwiLFxuICAgICAgXCJkeW5hbW9kYjpRdWVyeVwiLFxuICAgICAgXCJsb2dzOipcIixcbiAgICBdLFxuICAgIHJlc291cmNlczogW1wiKlwiXSxcbiAgfSkpO1xuICBmaW5hbFZpZGVvTGFtYmRhLmFkZExheWVycyhsYW1iZGEuTGF5ZXJWZXJzaW9uLmZyb21MYXllclZlcnNpb25Bcm4odGhpcywgXCJGRm1wZWdMYXllclwiLCBcbiAgICBcImFybjphd3M6bGFtYmRhOnVzLWVhc3QtMTo2NzI0NjEyNjQ5ODM6bGF5ZXI6ZmZtcGVnOjFcIlxuICApKTtcbiAgZmluYWxWaWRlb0xhbWJkYS5hZGRFdmVudFNvdXJjZShuZXcgbGFtYmRhRXZlbnRTb3VyY2VzLlNxc0V2ZW50U291cmNlKGF1ZGlvTWVyZ2VRdWV1ZSkpO1xuICBhdWRpb01lcmdlUXVldWUuZ3JhbnRDb25zdW1lTWVzc2FnZXMoZmluYWxWaWRlb0xhbWJkYSk7XG4gIFN0b3JhZ2VTdGFjay5nZW5WaWRlb3MuZ3JhbnRSZWFkV3JpdGUoZmluYWxWaWRlb0xhbWJkYSk7XG4gIGRiU3RhY2suYm9vay5ncmFudFJlYWRXcml0ZURhdGEoZmluYWxWaWRlb0xhbWJkYSk7XG4gIGRiU3RhY2suY2hhcHRlci5ncmFudFJlYWRXcml0ZURhdGEoZmluYWxWaWRlb0xhbWJkYSk7XG4gIGZpbmFsVmlkZW9MYW1iZGEuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICBhY3Rpb25zOiBbXCJkeW5hbW9kYjpRdWVyeVwiXSxcbiAgICByZXNvdXJjZXM6IFtcbiAgICAgIGBhcm46YXdzOmR5bmFtb2RiOiR7dGhpcy5yZWdpb259OiR7dGhpcy5hY2NvdW50fTp0YWJsZS8ke2RiU3RhY2suYm9vay50YWJsZU5hbWV9L2luZGV4L0dTSV9ieV9ib29rX2lkYFxuICAgIF1cbiAgfSkpO1xuICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIkZpbmFsVmlkZW9MYW1iZGFBcm5cIiwge1xuICAgIHZhbHVlOiBmaW5hbFZpZGVvTGFtYmRhLmZ1bmN0aW9uQXJuLFxuICB9KTtcbiAgICAgICAgICBcbiAgXG5cblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgXG4gIFxuICAgICAgLy8gUGVybWlzc2lvbnNcbiAgICAgIFN0b3JhZ2VTdGFjay5yZWFkaW5nTWF0ZXJpYWxzUXVldWUuZ3JhbnRDb25zdW1lTWVzc2FnZXModGV4dEV4dHJhY3Rpb25MYW1iZGEpO1xuICAgICAgU3RvcmFnZVN0YWNrLnJlYWRpbmdNYXRlcmlhbHMuZ3JhbnRSZWFkKHRleHRFeHRyYWN0aW9uTGFtYmRhKTtcbiAgICAgIFN0b3JhZ2VTdGFjay5leHRyYWN0ZWRUZXh0UXVldWUuZ3JhbnRTZW5kTWVzc2FnZXModGV4dEV4dHJhY3Rpb25MYW1iZGEpO1xuICBcbiAgICAgIGNvbnN0IHNhdmVFeHRyYWN0ZWRUZXh0TGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnU2F2ZUV4dHJhY3RlZFRleHRMYW1iZGEnLCB7XG4gICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL1NhdmVFeHRyYWN0ZWRUZXh0JyksIC8vcmVzcG9uc2libGUgZm9yIHNhdmluZyB0aGUgZXh0cmFjdGVkIHRleHQgdG8gdGhlIER5bmFtb0RCIHRhYmxlXG4gICAgICB9KTtcblxuICAgICAgLy8gUGVybWlzc2lvbnNcbiAgICAgIFN0b3JhZ2VTdGFjay5leHRyYWN0ZWRUZXh0UXVldWUuZ3JhbnRDb25zdW1lTWVzc2FnZXMoc2F2ZUV4dHJhY3RlZFRleHRMYW1iZGEpOy8vdGhpcyBwZXJtaXNzaW9uIHdpbGwgYWxsb3cgbGFtYmRhIGZ1bmN0aW9uIHRvIGNvbnN1bWUgdGhlIG1lc3NhZ2VzIGZyb20gdGhlIGV4dHJhY3RlZFRleHRRdWV1ZVxuICAgICAgZGJTdGFjay5leHRyYWN0ZWRUZXh0VGFibGUuZ3JhbnRXcml0ZURhdGEoc2F2ZUV4dHJhY3RlZFRleHRMYW1iZGEpOyAvL3RoaXMgcGVybWlzc2lvbiB3aWxsIGFsbG93IGxhbWJkYSBmdW5jdGlvbiB0byB3cml0ZSB0aGUgZXh0cmFjdGVkIHRleHQgdG8gdGhlIER5bmFtb0RCIHRhYmxlXG4gICAgICBzYXZlRXh0cmFjdGVkVGV4dExhbWJkYS5hZGRFdmVudFNvdXJjZShuZXcgbGFtYmRhRXZlbnRTb3VyY2VzLlNxc0V2ZW50U291cmNlKFN0b3JhZ2VTdGFjay5leHRyYWN0ZWRUZXh0UXVldWUpKTsgLy9cbiAgICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdCb29rSGFuZGxlckxhbWJkYUFybicsIHtcbiAgICAgICAgdmFsdWU6IGJvb2tIYW5kbGVyTGFtYmRhLmZ1bmN0aW9uQXJuLFxuICAgICAgfSk7XG5cbiAgICAgIFxuICAgICAgdGhpcy5CZWRSb2NrRnVuY3Rpb24gPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdNeUJlZHJvY2tGdW5jdGlvbicsIHtcbiAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTIsXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5sYW1iZGFfaGFuZGxlcicsICAvLyBNYXRjaCB0aGUgUHl0aG9uIGhhbmRsZXJcbiAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvQmVkcm9jaycpLFxuICAgICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcyg5MDApLCAgLy8gSW5jcmVhc2UgdG8gMTUgbWludXRlc1xuICAgICAgICBtZW1vcnlTaXplOiAyMDQ4LFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgIFZJREVPX0JVQ0tFVDogU3RvcmFnZVN0YWNrLmdlblZpZGVvcy5idWNrZXROYW1lLCAgLy8gVXNlZCBpbiBQeXRob24gY29kZVxuICAgICAgICAgIFZJREVPX09VVFBVVF9TM19VUkk6IGBzMzovLyR7U3RvcmFnZVN0YWNrLmdlblZpZGVvcy5idWNrZXROYW1lfS91cGxvYWQvYCxcbiAgICAgICAgICBCT09LU19UQUJMRTogZGJTdGFjay5ib29rLnRhYmxlTmFtZSxcbiAgICAgICAgICBDSEFQVEVSU19UQUJMRTogZGJTdGFjay5jaGFwdGVyLnRhYmxlTmFtZSxcbiAgICAgICAgICBTU01MX1FVRVVFX1VSTDogc3NtbFF1ZXVlLnF1ZXVlVXJsLFxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuQmVkUm9ja0Z1bmN0aW9uLmFkZEV2ZW50U291cmNlKG5ldyBsYW1iZGFFdmVudFNvdXJjZXMuU3FzRXZlbnRTb3VyY2UodmlkZW9TY3JpcHRRdWV1ZSwge1xuICAgICAgICBiYXRjaFNpemU6IDEsXG4gICAgICAgIG1heENvbmN1cnJlbmN5OiAyLCAvLyBBZGQgdGhpcyBsaW5lIGlmIHlvdXIgQ0RLIHZlcnNpb24gc3VwcG9ydHMgaXRcbiAgICAgIH0pKTtcblxuICAgICAgc3NtbFF1ZXVlLmdyYW50U2VuZE1lc3NhZ2VzKHRoaXMuQmVkUm9ja0Z1bmN0aW9uKTtcbiAgICAgIGRiU3RhY2suYm9vay5ncmFudFJlYWRXcml0ZURhdGEodGhpcy5CZWRSb2NrRnVuY3Rpb24pO1xuICAgICAgZGJTdGFjay5jaGFwdGVyLmdyYW50UmVhZFdyaXRlRGF0YSh0aGlzLkJlZFJvY2tGdW5jdGlvbik7XG4gICAgICBTdG9yYWdlU3RhY2suZ2VuVmlkZW9zLmdyYW50V3JpdGUodGhpcy5CZWRSb2NrRnVuY3Rpb24pO1xuICAgICAgdmlkZW9TY3JpcHRRdWV1ZS5ncmFudENvbnN1bWVNZXNzYWdlcyh0aGlzLkJlZFJvY2tGdW5jdGlvbik7XG4gICAgICBcbiAgICAgIHRoaXMuQmVkUm9ja0Z1bmN0aW9uLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgIGFjdGlvbnM6IFsnYmVkcm9jazoqJywgJ2R5bmFtb2RiOionLCAnczM6KicsICdsb2dzOionXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbJyonXSwgLy8gWW91IGNhbiByZXN0cmljdCBpdCBsYXRlciBpZiBuZWVkZWRcbiAgICAgIH0pKTtcbiAgICAgIFxuICAgICAgXG4gIC8vU3R1ZGVudFxuXG4gIFxuICAgICAgICAgIC8vIExhbWJkYSBmdW5jdGlvbiBmb3IgcHJvY2Vzc2luZyBhdWRpbyBmaWxlc1xuICAgICAgICB0aGlzLm1lc3NhZ2VQcm9jZXNzaW5nID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnTWVzc2FnZVByb2Nlc3NpbmdMYW1iZGEnLCB7XG4gICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvU3R1ZGVudC9NZXNzYWdlUHJvY2Vzc2luZycpLFxuICAgICAgICAgIGhhbmRsZXI6ICdtZXNzYWdlUHJvY2Vzc2luZy5oYW5kbGVyJyxcbiAgICAgICAgfSksXG4gICAgICAgICAgLy8gTGFtYmRhIGZ1bmN0aW9uIGZvciB0cmFuc2NyaWJpbmcgYXVkaW8gZmlsZXNcbiAgICAgICAgdGhpcy50cmFuc2NyaWJlID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnVHJhbnNjcmliZUxhbWJkYScsIHtcbiAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYS9TdHVkZW50L1RyYW5zY3JpYmUnKSwvL3JlbW92ZSwgb25lIGxhbWJkYSBuZWVkZWRcbiAgICAgICAgICBoYW5kbGVyOiAndHJhbnNjcmliZS5oYW5kbGVyJyxcbiAgICAgICAgfSksIFxuICAgICAgICAvLyBMYW1iZGEgZnVuY3Rpb246IC8vIENhbGxzIEJlZHJvY2sgd2l0aCB0aGUgdHJhbnNjcmliZWQgdGV4dCBhbmQgc2F2ZXMgUSZBIHRvIER5bmFtb0RCXG4gICAgICAgIHRoaXMuaW52b2tlQmVkcm9jayA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0ludm9rZUJlZHJvY2tMYW1iZGEnLCB7XG4gICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvU3R1ZGVudC9JbnZva2VCZWRyb2NrJyksXG4gICAgICAgICAgaGFuZGxlcjogJ2ludm9rZUJlZHJvY2suaGFuZGxlcicsXG4gICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgIFFBVEFCTEVfTkFNRTogZGJTdGFjay5xYVRhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KSxcbiAgICAgICAgLy8gTGFtYmRhIGZ1bmN0aW9uIGZvciB0cmlnZ2VyaW5nIFBvbGx5IGFuZCBzYXZpbmcgYXVkaW8gaW4gUzNcbiAgICAgICAgdGhpcy50cmlnZ2VyUG9sbHkgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdUcmlnZ2VyUG9sbHlMYW1iZGEnLCB7XG4gICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvU3R1ZGVudC9UcmlnZ2VyUG9sbHknKSxcbiAgICAgICAgICBoYW5kbGVyOiAndHJpZ2dlclBvbGx5LmhhbmRsZXInLFxuICAgICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgICBCVUNLRVRfTkFNRTogU3RvcmFnZVN0YWNrLmF1ZGlvRmlsZXNCdWNrZXQuYnVja2V0TmFtZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KSxcbiAgICAgICAgXG4gICAgICAgICAgLy8gTGFtYmRhIGZ1bmN0aW9uIGZvciBwbGF5aW5nIHRoZSByZXNwb25zZVxuICAgICAgICB0aGlzLnBsYXlSZXNwb25zZSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1BsYXlSZXNwb25zZUxhbWJkYScsIHtcbiAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYS9TdHVkZW50L1BsYXlSZXNwb25zZScpLFxuICAgICAgICAgIGhhbmRsZXI6ICdwbGF5UmVzcG9uc2UuaGFuZGxlcicsXG4gICAgICAgIH0pLFxuICAgICAgXG4gICAgICAgICAgLy8gTGFtYmRhIGZ1bmN0aW9uIGZvciBpbnZva2luZyBCZWRyb2NrIChMaWJyYXJpYW4pIGFuZCBzdG9yZXMgTm92YSBjb250ZW50IGluIFMzXG4gICAgICAgIHRoaXMuaW52b2tlQmVkcm9ja0xpYiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0ludm9rZUJlZHJvY2tMaWJyYXJpYW5MYW1iZGEnLCB7XG4gICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEvU3R1ZGVudC9MaWJJbnZva2VCZWRyb2NrJyksXG4gICAgICAgICAgaGFuZGxlcjogJ2ludm9rZUJlZHJvY2tMaWJyYXJpYW4uaGFuZGxlcicsXG4gICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgIE9VVFBVVF9CVUNLRVQ6IFN0b3JhZ2VTdGFjay5ub3ZhQ29udGVudEJ1Y2tldC5idWNrZXROYW1lLFxuICAgICAgICAgICAgVEVYVF9UQUJMRTogZGJTdGFjay5leHRyYWN0ZWRUZXh0VGFibGUudGFibGVOYW1lLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICBcblxuICAgICAgLy8gT25seSBhZGQgcGVybWlzc2lvbnMgYW5kIGV2ZW50IG5vdGlmaWNhdGlvbnMgaWYgbm90IGluIHN5bnRoZXNpcyBtb2RlXG4gICAgICAvLyBUaGlzIGJyZWFrcyB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jeSBkdXJpbmcgQ0RLIHN5bnRoZXNpc1xuICAgICAgaWYgKCFzeW50aGVzaXNNb2RlKSB7XG4gICAgICAgIC8vIEFkZCBwZXJtaXNzaW9uIGZvciBTMyB0byBpbnZva2UgdGhlIExhbWJkYVxuICAgICAgICB0aGlzLnBsYXlSZXNwb25zZS5hZGRQZXJtaXNzaW9uKCdBbGxvd1MzSW52b2tlJywge1xuICAgICAgICAgIHByaW5jaXBhbDogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdzMy5hbWF6b25hd3MuY29tJyksXG4gICAgICAgICAgc291cmNlQXJuOiBTdG9yYWdlU3RhY2suYXVkaW9GaWxlc0J1Y2tldC5idWNrZXRBcm5cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgdGhlIGV2ZW50IG5vdGlmaWNhdGlvbiBkaXJlY3RseSBoZXJlXG4gICAgICAgIC8vIFRoaXMgd2lsbCBvbmx5IHJ1biBkdXJpbmcgYWN0dWFsIGRlcGxveW1lbnQsIG5vdCBkdXJpbmcgc3ludGhlc2lzXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgU3RvcmFnZVN0YWNrLmF1ZGlvRmlsZXNCdWNrZXQuYWRkRXZlbnROb3RpZmljYXRpb24oXG4gICAgICAgICAgICBzMy5FdmVudFR5cGUuT0JKRUNUX0NSRUFURUQsXG4gICAgICAgICAgICBuZXcgczNuLkxhbWJkYURlc3RpbmF0aW9uKHRoaXMucGxheVJlc3BvbnNlKVxuICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgLy8gSWdub3JlIGNpcmN1bGFyIGRlcGVuZGVuY3kgZXJyb3JzIGR1cmluZyBzeW50aGVzaXNcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1NraXBwaW5nIGV2ZW50IG5vdGlmaWNhdGlvbiBzZXR1cCBkdXJpbmcgc3ludGhlc2lzIHRvIGF2b2lkIGNpcmN1bGFyIGRlcGVuZGVuY2llcycpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnUnVubmluZyBpbiBzeW50aGVzaXMgbW9kZSAtIHNraXBwaW5nIGV2ZW50IG5vdGlmaWNhdGlvbiBzZXR1cCcpO1xuICAgICAgfVxuXG4gICAgICAvLyBQZXJtaXNzaW9uc1xuICAgIC8vIEFsbG93IFBvbGx5IExhbWJkYSB0byB3cml0ZSB0byB0aGUgYXVkaW8gYnVja2V0XG4gICAgU3RvcmFnZVN0YWNrLmF1ZGlvRmlsZXNCdWNrZXQuZ3JhbnRXcml0ZSh0aGlzLnRyaWdnZXJQb2xseSk7XG4gICAgLy8gQWxsb3cgbGlicmFyaWFuIEJlZHJvY2sgTGFtYmRhIHRvIHdyaXRlIE5vdmEgY29udGVudCB0byBOb3ZhIGJ1Y2tldFxuICAgIFN0b3JhZ2VTdGFjay5ub3ZhQ29udGVudEJ1Y2tldC5ncmFudFdyaXRlKHRoaXMuaW52b2tlQmVkcm9ja0xpYik7XG4gICAgLy8gQWxsb3cgU3R1ZGVudCBCZWRyb2NrIExhbWJkYSB0byB3cml0ZSB0byBRJkEgdGFibGVcbiAgICBkYlN0YWNrLnFhVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHRoaXMuaW52b2tlQmVkcm9jayk7XG4gICAgLy8gQWxsb3cgbGlicmFyaWFuIEJlZHJvY2sgTGFtYmRhIHRvIHJlYWQgZnJvbSB0ZXh0IHRhYmxlXG4gICAgZGJTdGFjay5leHRyYWN0ZWRUZXh0VGFibGUuZ3JhbnRSZWFkRGF0YSh0aGlzLmludm9rZUJlZHJvY2tMaWIpO1xuXG4gICAgLy8gUGVybWlzc2lvbnMgZm9yIGxhbWRhcyB0byBjYWxsIFRyYW5zY3JpYmUsIFBvbGx5LCBhbmQgQmVkcm9ja1xuICAgICAgICB0aGlzLmludm9rZUJlZHJvY2suYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAnYmVkcm9jazoqJyxcbiAgICAgICAgICAgICdsb2dzOkNyZWF0ZUxvZ0dyb3VwJyxcbiAgICAgICAgICAgICdsb2dzOkNyZWF0ZUxvZ1N0cmVhbScsXG4gICAgICAgICAgICAnbG9nczpQdXRMb2dFdmVudHMnLFxuICAgICAgICAgICAgJ2R5bmFtb2RiOionLFxuICAgICAgICAgICAgJ3MzOlB1dE9iamVjdCcsXG4gICAgICAgICAgICAnczM6R2V0T2JqZWN0JyxcbiAgICAgICAgICAgICdzMzpMaXN0QnVja2V0J1xuICAgICAgICAgIF0sXG4gICAgICAgICAgcmVzb3VyY2VzOiBbJyonXSAgLy8gVXNlIHNwZWNpZmljIEFSTnMgZm9yIHRpZ2h0ZXIgY29udHJvbFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdGhpcy5pbnZva2VCZWRyb2NrTGliLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgJ2JlZHJvY2s6KicsXG4gICAgICAgICAgICAnbG9nczpDcmVhdGVMb2dHcm91cCcsXG4gICAgICAgICAgICAnbG9nczpDcmVhdGVMb2dTdHJlYW0nLFxuICAgICAgICAgICAgJ2xvZ3M6UHV0TG9nRXZlbnRzJyxcbiAgICAgICAgICAgICdkeW5hbW9kYjoqJyxcbiAgICAgICAgICAgICdzMzpQdXRPYmplY3QnLFxuICAgICAgICAgICAgJ3MzOkdldE9iamVjdCcsXG4gICAgICAgICAgICAnczM6TGlzdEJ1Y2tldCdcbiAgICAgICAgICBdLFxuICAgICAgICAgIHJlc291cmNlczogWycqJ10gIC8vIFVzZSBzcGVjaWZpYyBBUk5zIGZvciB0aWdodGVyIGNvbnRyb2xcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMubWVzc2FnZVByb2Nlc3NpbmcuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAnYmVkcm9jazoqJyxcbiAgICAgICAgICAgICd0cmFuc2NyaWJlOionLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nR3JvdXAnLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nU3RyZWFtJyxcbiAgICAgICAgICAgICdsb2dzOlB1dExvZ0V2ZW50cycsXG4gICAgICAgICAgICAnZHluYW1vZGI6KicsXG4gICAgICAgICAgICAnczM6UHV0T2JqZWN0JyxcbiAgICAgICAgICAgICdzMzpHZXRPYmplY3QnLFxuICAgICAgICAgICAgJ3MzOkxpc3RCdWNrZXQnXG4gICAgICAgICAgXSxcbiAgICAgICAgICByZXNvdXJjZXM6IFsnKiddICAvLyBVc2Ugc3BlY2lmaWMgQVJOcyBmb3IgdGlnaHRlciBjb250cm9sXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLnBsYXlSZXNwb25zZS5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICdiZWRyb2NrOionLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nR3JvdXAnLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nU3RyZWFtJyxcbiAgICAgICAgICAgICdsb2dzOlB1dExvZ0V2ZW50cycsXG4gICAgICAgICAgICAnZHluYW1vZGI6KicsXG4gICAgICAgICAgICAnczM6UHV0T2JqZWN0JyxcbiAgICAgICAgICAgICdzMzpHZXRPYmplY3QnLFxuICAgICAgICAgICAgJ3MzOkxpc3RCdWNrZXQnXG4gICAgICAgICAgXSxcbiAgICAgICAgICByZXNvdXJjZXM6IFsnKiddICAvLyBVc2Ugc3BlY2lmaWMgQVJOcyBmb3IgdGlnaHRlciBjb250cm9sXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLnRyYW5zY3JpYmUuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAnYmVkcm9jazoqJyxcbiAgICAgICAgICAgICd0cmFuc2NyaWJlOionLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nR3JvdXAnLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nU3RyZWFtJyxcbiAgICAgICAgICAgICdsb2dzOlB1dExvZ0V2ZW50cycsXG4gICAgICAgICAgICAnZHluYW1vZGI6KicsXG4gICAgICAgICAgICAnczM6UHV0T2JqZWN0JyxcbiAgICAgICAgICAgICdzMzpHZXRPYmplY3QnLFxuICAgICAgICAgICAgJ3MzOkxpc3RCdWNrZXQnXG4gICAgICAgICAgXSxcbiAgICAgICAgICByZXNvdXJjZXM6IFsnKiddICAvLyBVc2Ugc3BlY2lmaWMgQVJOcyBmb3IgdGlnaHRlciBjb250cm9sXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLnRyaWdnZXJQb2xseS5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICdiZWRyb2NrOionLFxuICAgICAgICAgICAgJ3BvbGx5OionLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nR3JvdXAnLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nU3RyZWFtJyxcbiAgICAgICAgICAgICdsb2dzOlB1dExvZ0V2ZW50cycsXG4gICAgICAgICAgICAnZHluYW1vZGI6KicsXG4gICAgICAgICAgICAnczM6UHV0T2JqZWN0JyxcbiAgICAgICAgICAgICdzMzpHZXRPYmplY3QnLFxuICAgICAgICAgICAgJ3MzOkxpc3RCdWNrZXQnXG4gICAgICAgICAgXSxcbiAgICAgICAgICByZXNvdXJjZXM6IFsnKiddICAvLyBVc2Ugc3BlY2lmaWMgQVJOcyBmb3IgdGlnaHRlciBjb250cm9sXG4gICAgICAgIH0pKTtcbiAgICAgICAgLy8gR3JhbnQgcGVybWlzc2lvbnNcbiAgICAgICAgU3RvcmFnZVN0YWNrLnJlYWRpbmdNYXRlcmlhbHMuZ3JhbnRSZWFkKHN0YXJ0VGV4dHJhY3RKb2JMYW1iZGEpO1xuICAgICAgICBzdGFydFRleHRyYWN0Sm9iTGFtYmRhLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgJ3RleHRyYWN0OlN0YXJ0RG9jdW1lbnRUZXh0RGV0ZWN0aW9uJyxcbiAgICAgICAgICAgICd0ZXh0cmFjdDpHZXREb2N1bWVudFRleHREZXRlY3Rpb24nLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nR3JvdXAnLFxuICAgICAgICAgICAgJ2xvZ3M6Q3JlYXRlTG9nU3RyZWFtJyxcbiAgICAgICAgICAgICdsb2dzOlB1dExvZ0V2ZW50cycsXG4gICAgICAgICAgXSxcbiAgICAgICAgICByZXNvdXJjZXM6IFsnKiddLCAgXG4gICAgICAgIH0pKTtcblxuICAgICAgICAgLy8gTGFtYmRhIHRvIGdldCBib29rIGluZm8gdXNpbmcgSVNCTiBvciBET0lcbiAgICAgICAgY29uc3QgZ2V0Qm9va0luZm9MYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwiR2V0Qm9va0luZm9MYW1iZGFcIiwge1xuICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChcImxhbWJkYS9nZXRCb29rSW5mb1wiKSwgXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5nZXRCb29rSW5mb0xhbWJkYSA9IGdldEJvb2tJbmZvTGFtYmRhO1xuXG5jb25zdCBnZXRBbGxCb29rc0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJHZXRBbGxCb29rc0xhbWJkYVwiLCB7XG4gIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICBoYW5kbGVyOiBcImluZGV4LmhhbmRsZXJcIixcbiAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhL2xpc3RCb29rc1wiKSxcbiAgZW52aXJvbm1lbnQ6IHtcbiAgICBCT09LX1RBQkxFX05BTUU6IGRiU3RhY2suYm9vay50YWJsZU5hbWUsXG4gIH0sXG59KTtcblxuZGJTdGFjay5ib29rLmdyYW50UmVhZERhdGEoZ2V0QWxsQm9va3NMYW1iZGEpO1xuXG5cbnRoaXMuZ2V0QWxsQm9va3NMYW1iZGEgPSBnZXRBbGxCb29rc0xhbWJkYTtcblxudGhpcy5kZWxldGVCb29rTGFtYmRhdjIgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwiRGVsZXRlQm9va0xhbWJkYXYyXCIsIHtcbiAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGEvZGVsZXRlQm9va1wiKSxcbiAgZW52aXJvbm1lbnQ6IHtcbiAgICBCT09LX1RBQkxFX05BTUU6IGRiU3RhY2suYm9vay50YWJsZU5hbWUsXG4gIH0sXG59KTtcblxudGhpcy51cGRhdGVCb29rTGFtYmRhdjIgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwiVXBkYXRlQm9va0xhbWJkYXYyXCIsIHtcbiAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGEvdXBkYXRlQm9va1wiKSxcbiAgZW52aXJvbm1lbnQ6IHtcbiAgICBCT09LX1RBQkxFX05BTUU6IGRiU3RhY2suYm9vay50YWJsZU5hbWUsXG4gIH0sXG59KTtcbnRoaXMuZGVsZXRlQm9va0xhbWJkYXYyLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gIGFjdGlvbnM6IFtcImR5bmFtb2RiOipcIl0sXG4gIHJlc291cmNlczogW1wiYXJuOmF3czpkeW5hbW9kYjp1cy1lYXN0LTE6NjcyNDYxMjY0OTgzOnRhYmxlL0RCU3RhY2stYm9va0YwNzg1MTI5LTFCOVdSMEoxRUI0RE5cIl1cbn0pKTtcblxuXG5cblxuLy8gR3JhbnQgcGVybWlzc2lvbnMgdG8gYWNjZXNzIHRoZSBEeW5hbW9EQiB0YWJsZVxuZGJTdGFjay5ib29rLmdyYW50RnVsbEFjY2Vzcyh0aGlzLmRlbGV0ZUJvb2tMYW1iZGF2Mik7XG5kYlN0YWNrLmJvb2suZ3JhbnRSZWFkV3JpdGVEYXRhKHRoaXMudXBkYXRlQm9va0xhbWJkYXYyKTtcblxuICAgICAgICAgIFxuICAgICAgICAgIC8vIEJvb2sgUmVjb21tZW5kYXRpb24gTGFtYmRhXG4gICAgICAgICAgY29uc3QgYm9va1JlY29tbWVuZGF0aW9uTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIkJvb2tSZWNvbW1lbmRhdGlvbkxhbWJkYVwiLCB7XG4gICAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhL0Jvb2tSZWNvbW1lbmRhdGlvblwiKSxcbiAgICAgICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgICAgIERCX1RBQkxFOiBkYlN0YWNrLmJvb2sudGFibGVOYW1lLFxuICAgICAgICAgICAgICBVU0VSX1RBQkxFOiBkYlN0YWNrLnVzZXIudGFibGVOYW1lLFxuICAgICAgICAgICAgICBDT0dOSVRPX1VTRVJfUE9PTF9JRDogXCJtZS1zb3V0aC0xX1g3YWRyMjg1dFwiLCAvLyBGcm9tIG1lbW9yeVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLmJvb2tSZWNvbW1lbmRhdGlvbkxhbWJkYSA9IGJvb2tSZWNvbW1lbmRhdGlvbkxhbWJkYTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBHcmFudCBwZXJtaXNzaW9uc1xuICAgICAgICAgIGRiU3RhY2suYm9vay5ncmFudFJlYWRXcml0ZURhdGEoYm9va1JlY29tbWVuZGF0aW9uTGFtYmRhKTtcbiAgICAgICAgICBkYlN0YWNrLnVzZXIuZ3JhbnRSZWFkRGF0YShib29rUmVjb21tZW5kYXRpb25MYW1iZGEpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFJlYWRpbmcgUHJvZ3Jlc3MgVHJhY2tlciBMYW1iZGFcbiAgICAgICAgICBjb25zdCByZWFkaW5nUHJvZ3Jlc3NUcmFja2VyTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIlJlYWRpbmdQcm9ncmVzc1RyYWNrZXJMYW1iZGFcIiwge1xuICAgICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICAgICAgICBoYW5kbGVyOiBcImluZGV4LmhhbmRsZXJcIixcbiAgICAgICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChcImxhbWJkYS9SZWFkaW5nUHJvZ3Jlc3NUcmFja2VyXCIpLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgUFJPR1JFU1NfVEFCTEU6IGRiU3RhY2sucmVhZGluZ19wcm9ncmVzcy50YWJsZU5hbWUsXG4gICAgICAgICAgICAgIFVTRVJfVEFCTEU6IGRiU3RhY2sudXNlci50YWJsZU5hbWUsXG4gICAgICAgICAgICAgIENPR05JVE9fVVNFUl9QT09MX0lEOiBcIm1lLXNvdXRoLTFfWDdhZHIyODV0XCIsIC8vIEZyb20gbWVtb3J5XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMucmVhZGluZ1Byb2dyZXNzVHJhY2tlckxhbWJkYSA9IHJlYWRpbmdQcm9ncmVzc1RyYWNrZXJMYW1iZGE7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gR3JhbnQgcGVybWlzc2lvbnNcbiAgICAgICAgICBkYlN0YWNrLnJlYWRpbmdfcHJvZ3Jlc3MuZ3JhbnRSZWFkV3JpdGVEYXRhKHJlYWRpbmdQcm9ncmVzc1RyYWNrZXJMYW1iZGEpO1xuICAgICAgICAgIGRiU3RhY2sudXNlci5ncmFudFJlYWREYXRhKHJlYWRpbmdQcm9ncmVzc1RyYWNrZXJMYW1iZGEpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFVzZXIgSGlnaGxpZ2h0cyBMYW1iZGFcbiAgICAgICAgICBjb25zdCB1c2VySGlnaGxpZ2h0c0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJVc2VySGlnaGxpZ2h0c0xhbWJkYVwiLCB7XG4gICAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhL1VzZXJIaWdobGlnaHRzXCIpLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgSElHSExJR0hUU19UQUJMRTogZGJTdGFjay5oaWdobGlnaHRzLnRhYmxlTmFtZSxcbiAgICAgICAgICAgICAgVVNFUl9UQUJMRTogZGJTdGFjay51c2VyLnRhYmxlTmFtZSxcbiAgICAgICAgICAgICAgQ09HTklUT19VU0VSX1BPT0xfSUQ6IFwibWUtc291dGgtMV9YN2FkcjI4NXRcIiwgLy8gRnJvbSBtZW1vcnlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy51c2VySGlnaGxpZ2h0c0xhbWJkYSA9IHVzZXJIaWdobGlnaHRzTGFtYmRhO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIEdyYW50IHBlcm1pc3Npb25zXG4gICAgICAgICAgZGJTdGFjay5oaWdobGlnaHRzLmdyYW50UmVhZFdyaXRlRGF0YSh1c2VySGlnaGxpZ2h0c0xhbWJkYSk7XG4gICAgICAgICAgZGJTdGFjay51c2VyLmdyYW50UmVhZERhdGEodXNlckhpZ2hsaWdodHNMYW1iZGEpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFZvY2FidWxhcnkgTWFuYWdlciBMYW1iZGFcbiAgICAgICAgICBjb25zdCB2b2NhYnVsYXJ5TWFuYWdlckxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJWb2NhYnVsYXJ5TWFuYWdlckxhbWJkYVwiLCB7XG4gICAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhL1ZvY2FidWxhcnlNYW5hZ2VyXCIpLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgVVNFUl9UQUJMRTogZGJTdGFjay51c2VyLnRhYmxlTmFtZSxcbiAgICAgICAgICAgICAgQ09HTklUT19VU0VSX1BPT0xfSUQ6IFwibWUtc291dGgtMV9YN2FkcjI4NXRcIiwgLy8gRnJvbSBtZW1vcnlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy52b2NhYnVsYXJ5TWFuYWdlckxhbWJkYSA9IHZvY2FidWxhcnlNYW5hZ2VyTGFtYmRhO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIEdyYW50IHBlcm1pc3Npb25zXG4gICAgICAgICAgZGJTdGFjay51c2VyLmdyYW50UmVhZERhdGEodm9jYWJ1bGFyeU1hbmFnZXJMYW1iZGEpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFF1aXogQXNzZXNzbWVudCBMYW1iZGFcbiAgICAgICAgICBjb25zdCBxdWl6QXNzZXNzbWVudExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJRdWl6QXNzZXNzbWVudExhbWJkYVwiLCB7XG4gICAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhL1F1aXpBc3Nlc3NtZW50XCIpLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgVVNFUl9UQUJMRTogZGJTdGFjay51c2VyLnRhYmxlTmFtZSxcbiAgICAgICAgICAgICAgQ09HTklUT19VU0VSX1BPT0xfSUQ6IFwibWUtc291dGgtMV9YN2FkcjI4NXRcIiwgLy8gRnJvbSBtZW1vcnlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5xdWl6QXNzZXNzbWVudExhbWJkYSA9IHF1aXpBc3Nlc3NtZW50TGFtYmRhO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIEdyYW50IHBlcm1pc3Npb25zXG4gICAgICAgICAgZGJTdGFjay51c2VyLmdyYW50UmVhZERhdGEocXVpekFzc2Vzc21lbnRMYW1iZGEpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFN0dWRlbnQgQW5hbHl0aWNzIExhbWJkYVxuICAgICAgICAgIGNvbnN0IHN0dWRlbnRBbmFseXRpY3NMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwiU3R1ZGVudEFuYWx5dGljc0xhbWJkYVwiLCB7XG4gICAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhL1N0dWRlbnRBbmFseXRpY3NcIiksXG4gICAgICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgICAgICBQUk9HUkVTU19UQUJMRTogZGJTdGFjay5yZWFkaW5nX3Byb2dyZXNzLnRhYmxlTmFtZSxcbiAgICAgICAgICAgICAgVVNFUl9UQUJMRTogZGJTdGFjay51c2VyLnRhYmxlTmFtZSxcbiAgICAgICAgICAgICAgQ09HTklUT19VU0VSX1BPT0xfSUQ6IFwibWUtc291dGgtMV9YN2FkcjI4NXRcIiwgLy8gRnJvbSBtZW1vcnlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5zdHVkZW50QW5hbHl0aWNzTGFtYmRhID0gc3R1ZGVudEFuYWx5dGljc0xhbWJkYTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBHcmFudCBwZXJtaXNzaW9uc1xuICAgICAgICAgIGRiU3RhY2sucmVhZGluZ19wcm9ncmVzcy5ncmFudFJlYWREYXRhKHN0dWRlbnRBbmFseXRpY3NMYW1iZGEpO1xuICAgICAgICAgIGRiU3RhY2sudXNlci5ncmFudFJlYWREYXRhKHN0dWRlbnRBbmFseXRpY3NMYW1iZGEpO1xuICB9XG4gIFxufSJdfQ==