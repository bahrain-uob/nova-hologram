import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { StorageStack } from "./storage-stack";
import { lambdastack } from "../Backend/lambda-stacks";

export interface StorageNotificationsProps extends cdk.StackProps {
  readingMaterialsBucket: s3.Bucket;
  readingMaterialsQueue: sqs.Queue;
}

export class StorageNotifications extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StorageNotificationsProps
  ) {
    super(scope, id, props);

    // Add notifications after both stacks are created
    props.readingMaterialsBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SqsDestination(props.readingMaterialsQueue)
    );

    // Audio file bucket notifications are now handled in PermissionsStack
  }
}
