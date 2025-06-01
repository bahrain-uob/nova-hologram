import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sns_subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { DBStack } from '../DB/db-stack';
import { StorageStack } from '../Storage/storage-stack';
import { EventNotificationsStack } from '../sharedresources/EventNotificationsStack';

/**
 * LexStack
 * 
 * This stack is responsible for creating and configuring Amazon Lex resources
 * for the conversational AI capabilities of the reading platform.
 */
export class LexStack extends cdk.Stack {
  public readonly lexFulfillmentFunction: lambda.Function;

  constructor(
    scope: Construct,
    id: string,
    dbStack: DBStack,
    storageStack: StorageStack,
    notificationsStack: EventNotificationsStack,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // Create the Lex fulfillment Lambda function
    this.lexFulfillmentFunction = new lambda.Function(this, 'LexFulfillmentFunction', {
      functionName: 'LexFulfillment',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/LexFulfillment'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        CHAPTERS_TABLE: dbStack.chapter.tableName,
        BOOKS_TABLE: dbStack.book.tableName,
        USERS_TABLE: dbStack.user.tableName,
        NOTIFICATIONS_TABLE: notificationsStack.notificationsTable.tableName,
        CLASSROOM_TABLE: notificationsStack.classroomTable.tableName,
        CLASSROOM_STUDENT_TABLE: notificationsStack.classroomStudentTable.tableName,
        CLASSROOM_BOOK_TABLE: notificationsStack.classroomBookTable.tableName,
        READING_MATERIALS_BUCKET: storageStack.readingMaterials.bucketName,
        USER_POOL_ID: 'me-south-1_X7adr285t',
      },
    });

    // Grant permissions to the Lex fulfillment Lambda
    dbStack.chapter.grantReadData(this.lexFulfillmentFunction);
    dbStack.book.grantReadData(this.lexFulfillmentFunction);
    dbStack.user.grantReadData(this.lexFulfillmentFunction);
    notificationsStack.notificationsTable.grantReadWriteData(this.lexFulfillmentFunction);
    notificationsStack.classroomTable.grantReadData(this.lexFulfillmentFunction);
    notificationsStack.classroomStudentTable.grantReadData(this.lexFulfillmentFunction);
    notificationsStack.classroomBookTable.grantReadData(this.lexFulfillmentFunction);
    storageStack.readingMaterials.grantRead(this.lexFulfillmentFunction);

    // Grant Bedrock permissions for AI capabilities
    this.lexFulfillmentFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'bedrock:InvokeModel',
        'bedrock:ListFoundationModels',
      ],
      resources: ['*'],
    }));

    // Subscribe the Lex fulfillment Lambda to the notifications SNS topic using the method from EventNotificationsStack
    notificationsStack.addLexFulfillmentSubscription(this.lexFulfillmentFunction, ['important', 'alert', 'classroom']);

    // Output the Lex fulfillment Lambda ARN
    new cdk.CfnOutput(this, 'LexFulfillmentFunctionArn', {
      value: this.lexFulfillmentFunction.functionArn,
      description: 'ARN of the Lex fulfillment Lambda function',
    });

    // Note: The actual Lex bot configuration would typically be done through the AWS Console
    // or using a custom resource with the AWS SDK, as CDK doesn't have direct support for
    // all Lex v2 features. The following outputs provide information needed for manual setup.
    
    new cdk.CfnOutput(this, 'LexBotSetupInstructions', {
      value: 'Configure your Lex bot in the AWS Console and set the fulfillment Lambda ARN',
      description: 'Instructions for setting up the Lex bot',
    });
  }
}
