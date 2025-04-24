import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
// import * as lambda from "aws-cdk-lib/aws-lambda";
// import * as sqs from "aws-cdk-lib/aws-sqs";
import { StorageStack } from "../Storage/storage-stack";
import { lambdastack } from "../Backend/lambda-stacks";

/**
 * EventNotificationsStack
 * 
 * This stack is responsible for setting up event notifications between resources
 * from other stacks. It resolves circular dependencies by being deployed after
 * both the source and target stacks are deployed.
 */
export class EventNotificationsStack extends cdk.Stack {
  constructor(
    scope: Construct, 
    id: string, 
    storageStack: StorageStack,
    lambdaStack: lambdastack,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // Set up S3 event notification to trigger Lambda
    // This fixes the circular dependency between StorageStack and LambdaStack
    storageStack.audioFilesBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(lambdaStack.playResponse)
    );

    // If there are any other event notifications that cause circular dependencies,
    // move them here from the original stacks
  }
}
