import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as sns from "aws-cdk-lib/aws-sns";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";

export interface PermissionsStackProps extends cdk.StackProps {
  // Storage resources
  readingMaterialsBucket: s3.Bucket;
  genVideosBucket: s3.Bucket;
  audioFilesBucket: s3.Bucket;
  novaContentBucket: s3.Bucket;
  readingMaterialsQueue: sqs.Queue;
  extractedTextQueue: sqs.Queue;
  summaryQueue: sqs.Queue;
  scriptQueue: sqs.Queue;
  videoScriptQueue: sqs.Queue;
  ssmlQueue: sqs.Queue;
  pollyQueue: sqs.Queue;
  audioMergeQueue: sqs.Queue;
  textractNotificationTopic: sns.Topic;
  textractTriggerTopic: sns.Topic;

  // Lambda functions
  postUploadLambda: lambda.Function;
  getFilesLambda: lambda.Function;
  deleteFilesLambda: lambda.Function;
  splitChaptersLambda: lambda.Function;
  deleteBookLambda: lambda.Function;
  bookHandlerLambda: lambda.Function;
  getUploadUrlsLambda: lambda.Function;
  textExtractionLambda: lambda.Function;
  startTextractJobLambda: lambda.Function;
  playResponseLambda: lambda.Function;
  triggerPollyLambda: lambda.Function;
  invokeBedrockLibLambda: lambda.Function;
  invokeBedrockLambda: lambda.Function;
  generateSummaryLambda: lambda.Function;
  generateScriptLambda: lambda.Function;
  getBookLambda: lambda.Function;
  updateBookLambda: lambda.Function;
  generateSSMLLambda: lambda.Function;
  generateAudioLambda: lambda.Function;
  finalVideoLambda: lambda.Function;
  saveExtractedTextLambda: lambda.Function;
  bedRockFunction: lambda.Function;

  // DynamoDB tables
  qaTable: dynamodb.Table;
  extractedTextTable: dynamodb.Table;
  bookTable: dynamodb.Table;
  chapterTable: dynamodb.Table;

  // IAM roles
  textractServiceRole: iam.Role;
}

export class PermissionsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PermissionsStackProps) {
    super(scope, id);

    // Log any undefined props
    Object.entries(props).forEach(([key, value]) => {
      if (value === undefined) {
        console.error(`Warning: ${key} is undefined`);
      }
    });

    // Event notifications are now handled in NotificationsStack

    // Grant permissions for reading materials bucket
    try {
      if (!props.postUploadLambda) {
        console.error('postUploadLambda is undefined');
      } else {
        props.readingMaterialsBucket.grantReadWrite(props.postUploadLambda);
      }

      if (!props.getFilesLambda) {
        console.error('getFilesLambda is undefined');
      } else {
        props.readingMaterialsBucket.grantRead(props.getFilesLambda);
      }

      if (!props.deleteFilesLambda) {
        console.error('deleteFilesLambda is undefined');
      } else {
        props.readingMaterialsBucket.grantWrite(props.deleteFilesLambda);
      }

      if (!props.splitChaptersLambda) {
        console.error('splitChaptersLambda is undefined');
      } else {
        props.readingMaterialsBucket.grantWrite(props.splitChaptersLambda);
      }

      if (!props.deleteBookLambda) {
        console.error('deleteBookLambda is undefined');
      } else {
        props.readingMaterialsBucket.grantReadWrite(props.deleteBookLambda);
      }

      if (!props.bookHandlerLambda) {
        console.error('bookHandlerLambda is undefined');
      } else {
        props.readingMaterialsBucket.grantPut(props.bookHandlerLambda);
      }

      if (!props.getUploadUrlsLambda) {
        console.error('getUploadUrlsLambda is undefined');
      } else {
        props.readingMaterialsBucket.grantPut(props.getUploadUrlsLambda);
      }

      if (!props.textExtractionLambda) {
        console.error('textExtractionLambda is undefined');
      } else {
        props.readingMaterialsBucket.grantRead(props.textExtractionLambda);
      }

      if (!props.startTextractJobLambda) {
        console.error('startTextractJobLambda is undefined');
      } else {
        props.readingMaterialsBucket.grantRead(props.startTextractJobLambda);
      }
    } catch (error) {
      console.error('Error granting permissions:', error);
    }

    // Grant permissions for other buckets
    try {
      if (!props.audioFilesBucket || !props.triggerPollyLambda) {
        console.error('audioFilesBucket or triggerPollyLambda is undefined');
      } else {
        props.audioFilesBucket.grantWrite(props.triggerPollyLambda);
      }

      if (!props.novaContentBucket || !props.invokeBedrockLibLambda) {
        console.error('novaContentBucket or invokeBedrockLibLambda is undefined');
      } else {
        props.novaContentBucket.grantWrite(props.invokeBedrockLibLambda);
      }

      if (!props.genVideosBucket || !props.getBookLambda) {
        console.error('genVideosBucket or getBookLambda is undefined');
      } else {
        props.genVideosBucket.grantRead(props.getBookLambda);
      }

      if (!props.genVideosBucket || !props.deleteBookLambda) {
        console.error('genVideosBucket or deleteBookLambda is undefined');
      } else {
        props.genVideosBucket.grantReadWrite(props.deleteBookLambda);
      }

      if (!props.genVideosBucket || !props.generateAudioLambda) {
        console.error('genVideosBucket or generateAudioLambda is undefined');
      } else {
        props.genVideosBucket.grantWrite(props.generateAudioLambda);
      }

      if (!props.genVideosBucket || !props.finalVideoLambda) {
        console.error('genVideosBucket or finalVideoLambda is undefined');
      } else {
        props.genVideosBucket.grantReadWrite(props.finalVideoLambda);
      }
    } catch (error) {
      console.error('Error granting bucket permissions:', error);
    }

    // Grant permissions for queues
    try {
      if (!props.readingMaterialsQueue || !props.textExtractionLambda) {
        console.error('readingMaterialsQueue or textExtractionLambda is undefined');
      } else {
        props.readingMaterialsQueue.grantConsumeMessages(props.textExtractionLambda);
      }

      if (!props.extractedTextQueue || !props.textExtractionLambda) {
        console.error('extractedTextQueue or textExtractionLambda is undefined');
      } else {
        props.extractedTextQueue.grantSendMessages(props.textExtractionLambda);
      }

      if (!props.extractedTextQueue || !props.saveExtractedTextLambda) {
        console.error('extractedTextQueue or saveExtractedTextLambda is undefined');
      } else {
        props.extractedTextQueue.grantConsumeMessages(props.saveExtractedTextLambda);
      }

      if (!props.summaryQueue || !props.generateSummaryLambda) {
        console.error('summaryQueue or generateSummaryLambda is undefined');
      } else {
        props.summaryQueue.grantConsumeMessages(props.generateSummaryLambda);
      }

      if (!props.summaryQueue || !props.splitChaptersLambda) {
        console.error('summaryQueue or splitChaptersLambda is undefined');
      } else {
        props.summaryQueue.grantSendMessages(props.splitChaptersLambda);
      }

      if (!props.scriptQueue || !props.generateSummaryLambda) {
        console.error('scriptQueue or generateSummaryLambda is undefined');
      } else {
        props.scriptQueue.grantSendMessages(props.generateSummaryLambda);
      }

      if (!props.scriptQueue || !props.generateScriptLambda) {
        console.error('scriptQueue or generateScriptLambda is undefined');
      } else {
        props.scriptQueue.grantConsumeMessages(props.generateScriptLambda);
      }

      if (!props.videoScriptQueue || !props.generateScriptLambda) {
        console.error('videoScriptQueue or generateScriptLambda is undefined');
      } else {
        props.videoScriptQueue.grantSendMessages(props.generateScriptLambda);
      }

      if (!props.ssmlQueue || !props.generateSSMLLambda) {
        console.error('ssmlQueue or generateSSMLLambda is undefined');
      } else {
        props.ssmlQueue.grantConsumeMessages(props.generateSSMLLambda);
      }

      if (!props.ssmlQueue || !props.bedRockFunction) {
        console.error('ssmlQueue or bedRockFunction is undefined');
      } else {
        props.ssmlQueue.grantSendMessages(props.bedRockFunction);
      }

      if (!props.pollyQueue || !props.generateSSMLLambda) {
        console.error('pollyQueue or generateSSMLLambda is undefined');
      } else {
        props.pollyQueue.grantSendMessages(props.generateSSMLLambda);
      }

      if (!props.pollyQueue || !props.generateAudioLambda) {
        console.error('pollyQueue or generateAudioLambda is undefined');
      } else {
        props.pollyQueue.grantConsumeMessages(props.generateAudioLambda);
      }

      if (!props.audioMergeQueue || !props.generateAudioLambda) {
        console.error('audioMergeQueue or generateAudioLambda is undefined');
      } else {
        props.audioMergeQueue.grantSendMessages(props.generateAudioLambda);
      }

      if (!props.audioMergeQueue || !props.finalVideoLambda) {
        console.error('audioMergeQueue or finalVideoLambda is undefined');
      } else {
        props.audioMergeQueue.grantConsumeMessages(props.finalVideoLambda);
      }
    } catch (error) {
      console.error('Error granting queue permissions:', error);
    }

    // Grant permissions for SNS topics
    try {
      if (!props.textractNotificationTopic || !props.startTextractJobLambda) {
        console.error('textractNotificationTopic or startTextractJobLambda is undefined');
      } else {
        props.textractNotificationTopic.grantPublish(props.startTextractJobLambda);
      }

      if (!props.textractNotificationTopic || !props.textractServiceRole) {
        console.error('textractNotificationTopic or textractServiceRole is undefined');
      } else {
        props.textractNotificationTopic.grantPublish(props.textractServiceRole);
      }

      if (!props.textractTriggerTopic || !props.bookHandlerLambda) {
        console.error('textractTriggerTopic or bookHandlerLambda is undefined');
      } else {
        props.textractTriggerTopic.grantPublish(props.bookHandlerLambda);
      }

      if (!props.textractTriggerTopic || !props.startTextractJobLambda) {
        console.error('textractTriggerTopic or startTextractJobLambda is undefined');
      } else {
        props.textractTriggerTopic.grantPublish(props.startTextractJobLambda);
      }
    } catch (error) {
      console.error('Error granting SNS topic permissions:', error);
    }

    // Grant permissions for DynamoDB tables
    try {
      if (!props.qaTable || !props.invokeBedrockLambda) {
        console.error('qaTable or invokeBedrockLambda is undefined');
      } else {
        props.qaTable.grantReadWriteData(props.invokeBedrockLambda);
      }

      if (!props.extractedTextTable || !props.invokeBedrockLibLambda) {
        console.error('extractedTextTable or invokeBedrockLibLambda is undefined');
      } else {
        props.extractedTextTable.grantReadData(props.invokeBedrockLibLambda);
      }

      if (!props.extractedTextTable || !props.saveExtractedTextLambda) {
        console.error('extractedTextTable or saveExtractedTextLambda is undefined');
      } else {
        props.extractedTextTable.grantWriteData(props.saveExtractedTextLambda);
      }

      if (!props.bookTable || !props.generateSummaryLambda) {
        console.error('bookTable or generateSummaryLambda is undefined');
      } else {
        props.bookTable.grantWriteData(props.generateSummaryLambda);
      }

      if (!props.bookTable || !props.getBookLambda) {
        console.error('bookTable or getBookLambda is undefined');
      } else {
        props.bookTable.grantReadData(props.getBookLambda);
      }

      if (!props.bookTable || !props.updateBookLambda) {
        console.error('bookTable or updateBookLambda is undefined');
      } else {
        props.bookTable.grantReadWriteData(props.updateBookLambda);
      }

      if (!props.bookTable || !props.deleteBookLambda) {
        console.error('bookTable or deleteBookLambda is undefined');
      } else {
        props.bookTable.grantReadWriteData(props.deleteBookLambda);
      }

      if (!props.bookTable || !props.generateSSMLLambda) {
        console.error('bookTable or generateSSMLLambda is undefined');
      } else {
        props.bookTable.grantReadWriteData(props.generateSSMLLambda);
      }

      if (!props.bookTable || !props.bookHandlerLambda) {
        console.error('bookTable or bookHandlerLambda is undefined');
      } else {
        props.bookTable.grantWriteData(props.bookHandlerLambda);
      }

      if (!props.bookTable || !props.generateAudioLambda) {
        console.error('bookTable or generateAudioLambda is undefined');
      } else {
        props.bookTable.grantReadWriteData(props.generateAudioLambda);
      }

      if (!props.bookTable || !props.finalVideoLambda) {
        console.error('bookTable or finalVideoLambda is undefined');
      } else {
        props.bookTable.grantReadWriteData(props.finalVideoLambda);
      }

      if (!props.bookTable || !props.bedRockFunction) {
        console.error('bookTable or bedRockFunction is undefined');
      } else {
        props.bookTable.grantReadWriteData(props.bedRockFunction);
      }

      if (!props.chapterTable || !props.splitChaptersLambda) {
        console.error('chapterTable or splitChaptersLambda is undefined');
      } else {
        props.chapterTable.grantWriteData(props.splitChaptersLambda);
      }

      if (!props.chapterTable || !props.generateSummaryLambda) {
        console.error('chapterTable or generateSummaryLambda is undefined');
      } else {
        props.chapterTable.grantReadWriteData(props.generateSummaryLambda);
      }

      if (!props.chapterTable || !props.generateScriptLambda) {
        console.error('chapterTable or generateScriptLambda is undefined');
      } else {
        props.chapterTable.grantReadWriteData(props.generateScriptLambda);
      }

      if (!props.chapterTable || !props.getBookLambda) {
        console.error('chapterTable or getBookLambda is undefined');
      } else {
        props.chapterTable.grantReadData(props.getBookLambda);
      }

      if (!props.chapterTable || !props.updateBookLambda) {
        console.error('chapterTable or updateBookLambda is undefined');
      } else {
        props.chapterTable.grantReadWriteData(props.updateBookLambda);
      }

      if (!props.chapterTable || !props.deleteBookLambda) {
        console.error('chapterTable or deleteBookLambda is undefined');
      } else {
        props.chapterTable.grantReadWriteData(props.deleteBookLambda);
      }

      if (!props.chapterTable || !props.generateSSMLLambda) {
        console.error('chapterTable or generateSSMLLambda is undefined');
      } else {
        props.chapterTable.grantReadWriteData(props.generateSSMLLambda);
      }

      if (!props.chapterTable || !props.generateAudioLambda) {
        console.error('chapterTable or generateAudioLambda is undefined');
      } else {
        props.chapterTable.grantReadWriteData(props.generateAudioLambda);
      }

      if (!props.chapterTable || !props.finalVideoLambda) {
        console.error('chapterTable or finalVideoLambda is undefined');
      } else {
        props.chapterTable.grantReadWriteData(props.finalVideoLambda);
      }
    } catch (error) {
      console.error('Error granting DynamoDB table permissions:', error);
    }

    // Add S3 invoke permissions for Lambda functions
    props.playResponseLambda.addPermission('AllowS3Invoke', {
      principal: new cdk.aws_iam.ServicePrincipal('s3.amazonaws.com'),
      sourceArn: props.audioFilesBucket.bucketArn
    });
  }
}
