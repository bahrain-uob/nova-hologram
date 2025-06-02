import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class NotificationsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  }

  // Method to add notifications after stack creation
  public addBucketNotifications(
    readingMaterialsBucket: s3.Bucket,
    readingMaterialsQueue: sqs.Queue,
    audioFilesBucket: s3.Bucket,
    playResponseLambda: lambda.Function
  ): void {
    // Set up S3 event notification for reading materials bucket
    readingMaterialsBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SqsDestination(readingMaterialsQueue)
    );

    // Set up S3 event notification for audio files bucket
    audioFilesBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(playResponseLambda)
    );
  }
}
