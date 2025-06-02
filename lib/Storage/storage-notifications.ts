import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import { StorageStack } from "./storage-stack";
import { lambdastack } from "../Backend/lambda-stacks";

export class StorageNotifications extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    storageStack: StorageStack,
    lambdaStack: lambdastack,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // Add notifications after both stacks are created
    storageStack.readingMaterials.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SqsDestination(storageStack.readingMaterialsQueue)
    );
  }
}
