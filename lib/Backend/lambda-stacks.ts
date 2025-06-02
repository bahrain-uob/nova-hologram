import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { DBStack } from "../DB/db-stack"; // Import DBStack
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources"; // Import lambda event sources
// Removed StorageStack import - now using props instead
import { SharedResourcesStack } from "../sharedresources/SharedResourcesStack";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as sns from "aws-cdk-lib/aws-sns";
import * as sns_subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as sqs from "aws-cdk-lib/aws-sqs";

export class LambdaStack extends cdk.Stack {
  // Queue properties
  public readonly summaryQueue: sqs.Queue;
  public readonly scriptQueue: sqs.Queue;
  public readonly videoScriptQueue: sqs.Queue;
  public readonly ssmlQueue: sqs.Queue;
  public readonly pollyQueue: sqs.Queue;
  public readonly audioMergeQueue: sqs.Queue;
  // Topic properties
  public readonly textractNotificationTopic: sns.Topic;
  public readonly textractTriggerTopic: sns.Topic;

  // Lambda properties
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

  public readonly bookHandlerLambda: lambda.Function;
  public readonly getUploadUrlsLambda: lambda.Function;
  public readonly getBookLambda: lambda.Function;
  public readonly getAllBooksLambda: lambda.Function;
  public readonly deleteBookLambdav2: lambda.Function;
  public readonly updateBookLambdav2: lambda.Function;
  public readonly updateBookLambda: lambda.Function;
  public readonly deleteBookLambda: lambda.Function;
  // Additional Lambda functions for API integration
  public readonly bookRecommendationLambda: lambda.Function;
  public readonly readingProgressTrackerLambda: lambda.Function;
  public readonly userHighlightsLambda: lambda.Function;
  public readonly vocabularyManagerLambda: lambda.Function;
  public readonly quizAssessmentLambda: lambda.Function;
  public readonly studentAnalyticsLambda: lambda.Function;
  public readonly splitChaptersLambda: lambda.Function;
  public readonly textExtractionLambda: lambda.Function;
  public readonly startTextractJobLambda: lambda.Function;
  public readonly generateSummaryLambda: lambda.Function;
  public readonly generateScriptLambda: lambda.Function;
  public readonly generateSSMLLambda: lambda.Function;
  public readonly generateAudioLambda: lambda.Function;
  public readonly finalVideoLambda: lambda.Function;
  public readonly saveExtractedTextLambda: lambda.Function;
  public readonly textractServiceRole: iam.Role;

  // Queue properties
  public readonly extractedTextQueue: sqs.Queue;

  // Bucket properties
  public readonly readingMaterialsBucket: s3.Bucket;
  public readonly genVideosBucket: s3.Bucket;
  public readonly audioFilesBucket: s3.Bucket;
  public readonly novaContentBucket: s3.Bucket;

  constructor(
    scope: cdk.App,
    id: string,
    dbStack: DBStack,
    shared: SharedResourcesStack,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // Set bucket references from shared resources
    this.readingMaterialsBucket = shared.readingMaterialsBucket;
    this.genVideosBucket = shared.genVideosBucket;
    this.audioFilesBucket = shared.audioFilesBucket;
    this.novaContentBucket = shared.novaContentBucket;

    // Create SQS queues
    this.extractedTextQueue = new sqs.Queue(this, 'ExtractedTextQueue', {
      visibilityTimeout: cdk.Duration.seconds(300),
      retentionPeriod: cdk.Duration.days(1),
    });

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
    // Permissions are now handled in PermissionsStack


    // This is the lambda function that will have the aws textract code to extract text  from object (pdf, epub and word for example)
    this.textExtractionLambda = new lambda.Function(this, 'TextExtractionLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/TextExtraction'), //location of the folder that should have the text extracted object 
      environment: {
        OUTPUT_QUEUE_URL: this.extractedTextQueue.queueUrl,
      },
    });

    // Create SNS Topic for Textract job completion
    this.textractNotificationTopic = new sns.Topic(this, 'TextractJobCompleteTopic', {
      topicName: 'TextractJobComplete',
    });
    //  Output the topic ARN (can be seen in CloudFormation outputs)
    new cdk.CfnOutput(this, 'TextractTopicARN', {
      value: this.textractNotificationTopic.topicArn,
    });

    // Lambda to start Textract job
    this.startTextractJobLambda = new lambda.Function(this, 'StartTextractJobLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/StartTextractJob'),
      environment: {
        BUCKET_NAME: this.readingMaterialsBucket.bucketName,
        SNS_TOPIC_ARN: this.textractNotificationTopic.topicArn,
      },
    });

    this.textractNotificationTopic.grantPublish(this.startTextractJobLambda);

    this.textractServiceRole = new iam.Role(this, 'TextractServiceRole', {
      assumedBy: new iam.ServicePrincipal('textract.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSNSFullAccess'),
      ],
    });

    this.textractNotificationTopic.grantPublish(this.textractServiceRole); // grant topic publish access
    this.startTextractJobLambda.addEnvironment('TEXTRACT_SERVICE_ROLE_ARN', this.textractServiceRole.roleArn);

    // Subscribe the SNS topic to the SQS queue
    this.splitChaptersLambda = new lambda.Function(this, 'SplitChaptersLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/GetTextAndSplitChapters'),
      timeout: cdk.Duration.minutes(10),
    });

    this.splitChaptersLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'textract:GetDocumentTextDetection',
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
        'bedrock:InvokeModel',
      ],
      resources: ['*'],
    }));
    this.textractNotificationTopic.addSubscription(
      new sns_subs.LambdaSubscription(this.splitChaptersLambda)
    );
    this.textractNotificationTopic.grantPublish(this.splitChaptersLambda);
    this.splitChaptersLambda.addEnvironment("CHAPTERS_TABLE", dbStack.chapter.tableName);
    dbStack.chapter.grantWriteData(this.splitChaptersLambda);
    this.splitChaptersLambda.addEnvironment("READING_MATERIALS_BUCKET", this.readingMaterialsBucket.bucketName);

    //generate summary
    this.summaryQueue = new sqs.Queue(this, "SummaryQueue", {
      queueName: "SummaryQueue",
      visibilityTimeout: cdk.Duration.seconds(180),
    });

    this.scriptQueue = new sqs.Queue(this, "ScriptQueue", {
      queueName: "ScriptQueue",
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    this.generateSummaryLambda = new lambda.Function(this, 'GenerateSummaryLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/GenerateSummary'),
      environment: {
        CHAPTERS_TABLE: dbStack.chapter.tableName,
      },
      timeout: cdk.Duration.minutes(2),
    });
    this.generateSummaryLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:*', 'logs:*', 'dynamodb:*'],
      resources: ['*'],
    }));
    this.generateSummaryLambda.addEnvironment("BOOKS_TABLE", dbStack.book.tableName);
    dbStack.book.grantWriteData(this.generateSummaryLambda);
    dbStack.book.grantReadData(this.generateSummaryLambda);
    this.generateSummaryLambda.addEventSource(new lambdaEventSources.SqsEventSource(this.summaryQueue));
    this.splitChaptersLambda.addEnvironment("SUMMARY_QUEUE_URL", this.summaryQueue.queueUrl);
    new cdk.CfnOutput(this, 'SummaryQueueURL', {
      value: this.summaryQueue.queueUrl,
    });
    this.generateSummaryLambda.addEnvironment("SCRIPT_QUEUE_URL", this.scriptQueue.queueUrl);

    //generate script
    this.videoScriptQueue = new sqs.Queue(this, "VideoScriptQueue", {
      queueName: "VideoScriptQueue",
      visibilityTimeout: cdk.Duration.seconds(910),
    });

    this.ssmlQueue = new sqs.Queue(this, "SSMLQueue", {
      queueName: "SSMLQueue",
      visibilityTimeout: cdk.Duration.seconds(910),
    });
    this.pollyQueue = new sqs.Queue(this, "PollyQueue", {
      queueName: "PollyQueue",
      visibilityTimeout: cdk.Duration.seconds(910),
    });
    this.audioMergeQueue = new sqs.Queue(this, "AudioMergeQueue", {
      queueName: "AudioMergeQueue",
      visibilityTimeout: cdk.Duration.seconds(910),
    });

    this.generateScriptLambda = new lambda.Function(this, "GenerateScriptLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/GenerateScript"),
      timeout: cdk.Duration.minutes(2),
      environment: {
        CHAPTERS_TABLE: dbStack.chapter.tableName,
        BOOKS_TABLE: dbStack.book.tableName,
        VIDEO_QUEUE_URL: this.videoScriptQueue.queueUrl,
      },
    });

    this.generateScriptLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ["bedrock:*", "logs:*", "dynamodb:*", "sqs:SendMessage"],
      resources: ["*"], // You can narrow it down to specific ARNs if needed
    }));

    dbStack.book.grantReadWriteData(this.generateScriptLambda);
    this.generateScriptLambda.addEventSource(new lambdaEventSources.SqsEventSource(this.scriptQueue));

    this.videoScriptQueue.grantSendMessages(this.generateScriptLambda);

    new cdk.CfnOutput(this, "VideoScriptQueueURL", {
      value: this.videoScriptQueue.queueUrl,
    });


    //get book
    this.getBookLambda = new lambda.Function(this, "GetBookLambda", {
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
    dbStack.book.grantReadData(this.getBookLambda);
    //dbStack.chapter_summary.grantReadData(getBookLambda);
    dbStack.chapter.grantReadData(this.getBookLambda);

    this.getBookLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ["dynamodb:Query"],
      resources: [
        // GSI on book table
        `arn:aws:dynamodb:${this.region}:${this.account}:table/${dbStack.book.tableName}/index/GSI_by_book_id`,
        // GSI on chapter table
        `arn:aws:dynamodb:${this.region}:${this.account}:table/${dbStack.chapter.tableName}/index/Global_chapter_summary`
      ]
    }));
    this.getBookLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [
          "arn:aws:s3:::storagestack-readingmaterialse72d08c8-spmbixoyxput/*"
        ]
      })
    );
    // Save reference to use later if needed
    this.getBookLambda = this.getBookLambda;



    //update book
    this.updateBookLambda = new lambda.Function(this, "UpdateBookLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/UpdateBook"),
      timeout: cdk.Duration.seconds(30),
      environment: {
        BOOKS_TABLE: dbStack.book.tableName,
        CHAPTERS_TABLE: dbStack.chapter.tableName,
      },
    });

    dbStack.book.grantReadWriteData(this.updateBookLambda);
    dbStack.chapter.grantReadWriteData(this.updateBookLambda);

    this.updateBookLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ["dynamodb:Query"],
      resources: [
        `arn:aws:dynamodb:${this.region}:${this.account}:table/${dbStack.book.tableName}/index/GSI_by_book_id`,
      ],
    }));
    this.updateBookLambda = this.updateBookLambda;

    new cdk.CfnOutput(this, "UpdateBookLambdaArn", {
      value: this.updateBookLambda.functionArn,
      exportName: "UpdateBookLambdaArn",
    });

    //Delete book
    this.deleteBookLambda = new lambda.Function(this, "DeleteBookLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/DeleteBook"),
      timeout: cdk.Duration.seconds(30),
      environment: {
        BOOKS_TABLE: dbStack.book.tableName,
        CHAPTERS_TABLE: dbStack.chapter.tableName,
        READING_BUCKET: this.readingMaterialsBucket.bucketName,
        VIDEO_BUCKET: this.genVideosBucket.bucketName,
      },
    });
    dbStack.book.grantReadWriteData(this.deleteBookLambda);
    dbStack.chapter.grantReadWriteData(this.deleteBookLambda);
    this.deleteBookLambda = this.deleteBookLambda;
    new cdk.CfnOutput(this, "DeleteBookLambdaArn", {
      value: this.deleteBookLambda.functionArn,
      exportName: "DeleteBookLambdaArn",
    });

    //  generate SSML 
    this.generateSSMLLambda = new lambda.Function(this, "GenerateSSMLLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/GenerateSSML"),
      timeout: cdk.Duration.minutes(2),
      environment: {
        BOOKS_TABLE: dbStack.book.tableName,
        CHAPTERS_TABLE: dbStack.chapter.tableName,
        POLLY_QUEUE_URL: this.pollyQueue.queueUrl,
      },
    });
    this.generateSSMLLambda.addEventSource(new lambdaEventSources.SqsEventSource(this.ssmlQueue));
    dbStack.book.grantReadWriteData(this.generateSSMLLambda);
    dbStack.chapter.grantReadWriteData(this.generateSSMLLambda);

    this.generateSSMLLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:*", "logs:*", "dynamodb:*"],
        resources: ["*"],
      })
    );
    new cdk.CfnOutput(this, "GenerateSSMLQueueURL", {
      value: this.ssmlQueue.queueUrl,
    });

    new cdk.CfnOutput(this, "PollyQueueURL", {
      value: this.pollyQueue.queueUrl,
    });

    //////////////////////////////////////
    this.textractTriggerTopic = new sns.Topic(this, 'TextractTriggerTopic', {
      topicName: 'TriggerTextractStart',
    });
    new cdk.CfnOutput(this, 'TextractTriggerTopicArn', {
      value: this.textractTriggerTopic.topicArn,
    });

    this.bookHandlerLambda = new lambda.Function(this, 'BookHandlerLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/bookHandler'),
      environment: {
        S3_BUCKET: this.readingMaterialsBucket.bucketName,
        TABLE_NAME: dbStack.book.tableName,
        TEXTRACT_TRIGGER_TOPIC_ARN: this.textractTriggerTopic.topicArn,
      },
      timeout: cdk.Duration.minutes(5),
      memorySize: 1024,
    });
    dbStack.book.grantWriteData(this.bookHandlerLambda);
    this.bookHandlerLambda = this.bookHandlerLambda;

    this.textractTriggerTopic.grantPublish(this.bookHandlerLambda);
    this.textractTriggerTopic.addSubscription(
      new sns_subs.LambdaSubscription(this.startTextractJobLambda)
    );
    this.textractTriggerTopic.grantPublish(this.startTextractJobLambda);

    this.getUploadUrlsLambda = new lambda.Function(this, "GetUploadUrlsLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/GeneratePresignedUrl"),
      environment: {
        S3_BUCKET: this.readingMaterialsBucket.bucketName,
      },
    });


    //generate audio
    this.generateAudioLambda = new lambda.Function(this, "GenerateAudioLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/GenerateAudio"),
      timeout: cdk.Duration.minutes(3),
      environment: {
        BUCKET_NAME: this.genVideosBucket.bucketName,
        BOOKS_TABLE: dbStack.book.tableName,
        CHAPTERS_TABLE: dbStack.chapter.tableName,
        AUDIO_MERGE_QUEUE_URL: this.audioMergeQueue.queueUrl,
      },
    });


    dbStack.book.grantReadWriteData(this.generateAudioLambda);
    dbStack.chapter.grantReadWriteData(this.generateAudioLambda);
    this.generateAudioLambda.addEventSource(new lambdaEventSources.SqsEventSource(this.pollyQueue));
    this.pollyQueue.grantConsumeMessages(this.generateAudioLambda);

    this.generateAudioLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        "polly:SynthesizeSpeech",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "dynamodb:UpdateItem",
        "sqs:SendMessage"
      ],
      resources: ["*"],
    }));

    new cdk.CfnOutput(this, "AudioMergeQueueURL", {
      value: this.audioMergeQueue.queueUrl,
    });





    // final video
    this.finalVideoLambda = new lambda.Function(this, "FinalVideo", {
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
    this.finalVideoLambda.addToRolePolicy(new iam.PolicyStatement({
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
    this.finalVideoLambda.addLayers(lambda.LayerVersion.fromLayerVersionArn(this, "FFmpegLayer",
      "arn:aws:lambda:us-east-1:672461264983:layer:ffmpeg:1"
    ));
    this.finalVideoLambda.addEventSource(new lambdaEventSources.SqsEventSource(this.audioMergeQueue));
    dbStack.book.grantReadWriteData(this.finalVideoLambda);
    dbStack.chapter.grantReadWriteData(this.finalVideoLambda);
    this.finalVideoLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ["dynamodb:Query"],
      resources: [
        `arn:aws:dynamodb:${this.region}:${this.account}:table/${dbStack.book.tableName}/index/GSI_by_book_id`
      ]
    }));
    new cdk.CfnOutput(this, "FinalVideoLambdaArn", {
      value: this.finalVideoLambda.functionArn,
    });




    ////////////////////////////////////


    // Permissions

    this.saveExtractedTextLambda = new lambda.Function(this, 'SaveExtractedTextLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/SaveExtractedText'), //responsible for saving the extracted text to the DynamoDB table
    });

    // Permissions
    dbStack.extractedTextTable.grantWriteData(this.saveExtractedTextLambda); //this permission will allow lambda function to write the extracted text to the DynamoDB table
    // Queue event source will be added in PermissionsStack //
    new cdk.CfnOutput(this, 'BookHandlerLambdaArn', {
      value: this.bookHandlerLambda.functionArn,
    });


    this.BedRockFunction = new lambda.Function(this, 'MyBedrockFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'index.lambda_handler',  // Match the Python handler
      code: lambda.Code.fromAsset('lambda/Bedrock'),
      timeout: cdk.Duration.seconds(900),  // Increase to 15 minutes
      memorySize: 2048,
      environment: {
        VIDEO_BUCKET: this.genVideosBucket.bucketName,  // Used in Python code
        VIDEO_OUTPUT_S3_URI: `s3://${this.genVideosBucket.bucketName}/upload/`,
        BOOKS_TABLE: dbStack.book.tableName,
        CHAPTERS_TABLE: dbStack.chapter.tableName,
        SSML_QUEUE_URL: this.ssmlQueue.queueUrl,
      }
    });
    this.BedRockFunction.addEventSource(new lambdaEventSources.SqsEventSource(this.videoScriptQueue, {
      batchSize: 1,
      maxConcurrency: 2, // Add this line if your CDK version supports it
    }));

    this.ssmlQueue.grantSendMessages(this.BedRockFunction);
    dbStack.book.grantReadWriteData(this.BedRockFunction);

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
          BUCKET_NAME: this.audioFilesBucket.bucketName,
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
          OUTPUT_BUCKET: this.novaContentBucket.bucketName,
          TEXT_TABLE: dbStack.extractedTextTable.tableName,
        },
      });


    // Permissions are now handled in PermissionsStack

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
    // Grant permissions
    this.startTextractJobLambda.addToRolePolicy(new iam.PolicyStatement({
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
    this.getBookInfoLambda = new lambda.Function(this, "GetBookInfoLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/getBookInfo"),
    });
    this.getBookInfoLambda = this.getBookInfoLambda;

    this.getAllBooksLambda = new lambda.Function(this, "GetAllBooksLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/listBooks"),
      environment: {
        BOOK_TABLE_NAME: dbStack.book.tableName,
      },
    });

    dbStack.book.grantReadData(this.getAllBooksLambda);


    this.getAllBooksLambda = this.getAllBooksLambda;

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
    this.bookRecommendationLambda = new lambda.Function(this, "BookRecommendationLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/BookRecommendation"),
      environment: {
        DB_TABLE: dbStack.book.tableName,
        USER_TABLE: dbStack.user.tableName,
        COGNITO_USER_POOL_ID: "me-south-1_X7adr285t", // From memory
      },
    });
    this.bookRecommendationLambda = this.bookRecommendationLambda;

    // Grant permissions
    dbStack.book.grantReadWriteData(this.bookRecommendationLambda);
    dbStack.user.grantReadData(this.bookRecommendationLambda);

    // Reading Progress Tracker Lambda
    this.readingProgressTrackerLambda = new lambda.Function(this, "ReadingProgressTrackerLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/ReadingProgressTracker"),
      environment: {
        PROGRESS_TABLE: dbStack.reading_progress.tableName,
        USER_TABLE: dbStack.user.tableName,
        COGNITO_USER_POOL_ID: "me-south-1_X7adr285t", // From memory
      },
    });
    this.readingProgressTrackerLambda = this.readingProgressTrackerLambda;

    // Grant permissions
    dbStack.reading_progress.grantReadWriteData(this.readingProgressTrackerLambda);
    dbStack.user.grantReadData(this.readingProgressTrackerLambda);

    // User Highlights Lambda
    this.userHighlightsLambda = new lambda.Function(this, "UserHighlightsLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/UserHighlights"),
      environment: {
        HIGHLIGHTS_TABLE: dbStack.highlights.tableName,
        USER_TABLE: dbStack.user.tableName,
        COGNITO_USER_POOL_ID: "me-south-1_X7adr285t", // From memory
      },
    });
    this.userHighlightsLambda = this.userHighlightsLambda;

    // Grant permissions
    dbStack.highlights.grantReadWriteData(this.userHighlightsLambda);
    dbStack.user.grantReadData(this.userHighlightsLambda);

    // Vocabulary Manager Lambda
    this.vocabularyManagerLambda = new lambda.Function(this, "VocabularyManagerLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/VocabularyManager"),
      environment: {
        USER_TABLE: dbStack.user.tableName,
        COGNITO_USER_POOL_ID: "me-south-1_X7adr285t", // From memory
      },
    });
    this.vocabularyManagerLambda = this.vocabularyManagerLambda;

    // Grant permissions
    dbStack.user.grantReadData(this.vocabularyManagerLambda);

    // Quiz Assessment Lambda
    this.quizAssessmentLambda = new lambda.Function(this, "QuizAssessmentLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/QuizAssessment"),
      environment: {
        USER_TABLE: dbStack.user.tableName,
        COGNITO_USER_POOL_ID: "me-south-1_X7adr285t", // From memory
      },
    });
    this.quizAssessmentLambda = this.quizAssessmentLambda;

    // Grant permissions
    dbStack.user.grantReadData(this.quizAssessmentLambda);

    // Student Analytics Lambda
    this.studentAnalyticsLambda = new lambda.Function(this, "StudentAnalyticsLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/StudentAnalytics"),
      environment: {
        PROGRESS_TABLE: dbStack.reading_progress.tableName,
        USER_TABLE: dbStack.user.tableName,
        COGNITO_USER_POOL_ID: "me-south-1_X7adr285t", // From memory
      },
    });
    this.studentAnalyticsLambda = this.studentAnalyticsLambda;

    // Grant permissions
    dbStack.reading_progress.grantReadData(this.studentAnalyticsLambda);
    dbStack.user.grantReadData(this.studentAnalyticsLambda);
  }

}