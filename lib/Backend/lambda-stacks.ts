import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { DBStack } from "../DB/db-stack"; // Import DBStack
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources"; // Import lambda event sources
import { StorageStack } from "../Storage/storage-stack"; // Import StorageStack
import { SharedResourcesStack } from "../sharedresources/SharedResourcesStack";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as sns from "aws-cdk-lib/aws-sns";
import * as sns_subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as sqs from "aws-cdk-lib/aws-sqs";


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
    public readonly qrLambda: lambda.Function;

    public readonly bookHandlerLambda: lambda.Function;
    public readonly getUploadUrlsLambda: lambda.Function;
    public readonly getBookLambda: lambda.Function;


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
        timeout: cdk.Duration.minutes(5), 
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
  textractNotificationTopic.addSubscription(
    new sns_subs.LambdaSubscription(splitChaptersLambda)
  );
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
      CHAPTER_SUMMARY_TABLE: dbStack.chapter_summary.tableName,
      CHAPTERS_TABLE: dbStack.chapter.tableName,
    },
  });
  
  // Permissions
  dbStack.book.grantReadData(getBookLambda);
  dbStack.chapter_summary.grantReadData(getBookLambda);
  dbStack.chapter.grantReadData(getBookLambda);
  StorageStack.genVideos.grantRead(getBookLambda);

  getBookLambda.addToRolePolicy(new iam.PolicyStatement({
    actions: ["dynamodb:Query"],
    resources: [
      // GSI on book table
      `arn:aws:dynamodb:${this.region}:${this.account}:table/${dbStack.book.tableName}/index/GSI_by_book_id`,
      // GSI on chapter table
      `arn:aws:dynamodb:${this.region}:${this.account}:table/${dbStack.chapter.tableName}/index/GSI_by_book_id`
    ]
  }));
  
  // Save reference to use later if needed
  this.getBookLambda = getBookLambda;
  
  

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
  textractTriggerTopic.addSubscription(
    new sns_subs.LambdaSubscription(startTextractJobLambda)
  );
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
      StorageStack.extractedTextQueue.grantConsumeMessages(saveExtractedTextLambda);//this permission will allow lambda function to consume the messages from the extractedTextQueue
      dbStack.extractedTextTable.grantWriteData(saveExtractedTextLambda); //this permission will allow lambda function to write the extracted text to the DynamoDB table
      saveExtractedTextLambda.addEventSource(new lambdaEventSources.SqsEventSource(StorageStack.extractedTextQueue)); //
      new cdk.CfnOutput(this, 'BookHandlerLambdaArn', {
        value: bookHandlerLambda.functionArn,
      });

      
      this.BedRockFunction = new lambda.Function(this, 'MyBedrockFunction', {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: 'index.lambda_handler',  // Match the Python handler
        code: lambda.Code.fromAsset('lambda/Bedrock'),
        timeout: cdk.Duration.seconds(900),  // Increase to 15 minutes
        memorySize: 2048,
        environment: {
          VIDEO_BUCKET: StorageStack.genVideos.bucketName,  // Used in Python code
          VIDEO_OUTPUT_S3_URI: `s3://${StorageStack.genVideos.bucketName}/upload/`,
          BOOKS_TABLE: dbStack.book.tableName,
          CHAPTERS_TABLE: dbStack.chapter.tableName,
        }
      });
      this.BedRockFunction.addEventSource(new lambdaEventSources.SqsEventSource(videoScriptQueue, {
        batchSize: 1,
        maxConcurrency: 2, // Add this line if your CDK version supports it
      }));
      
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
          //this is the qr code generator lambda function
        this.qrLambda = new lambda.Function(this, 'QrCodeFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'qr-code-generator.handler',
            code: lambda.Code.fromAsset('lambda/interactivity/qrcode'), // location of the folder that should have the qr code generator code
        });
        StorageStack.qrCodeBucket.grantWrite(this.qrLambda); //to save the qr code in the s3 bucket



        
  }
  
}