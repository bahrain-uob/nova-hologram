import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as iam from "aws-cdk-lib/aws-iam";
// Removed stack imports, using resource props instead

/**
 * EventNotificationsStack
 * 
 * This stack is responsible for setting up event notifications between resources
 * from other stacks. It resolves circular dependencies by being deployed after
 * both the source and target stacks are deployed.
 */
export class EventNotificationsStack extends cdk.Stack {
  // Expose resources that might be needed by other stacks
  public readonly notificationsTopic: sns.Topic;
  public readonly notificationsTable: dynamodb.Table;
  public readonly classroomTable: dynamodb.Table;
  public readonly classroomStudentTable: dynamodb.Table;
  public readonly classroomBookTable: dynamodb.Table;
  
  // Expose Lambda functions for API integration
  public readonly notificationManagerLambda: lambda.Function;
  public readonly classroomManagerLambda: lambda.Function;

  constructor(
    scope: Construct, 
    id: string, 
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // Audio file bucket notifications are now handled in PermissionsStack

    // Create SNS topic for real-time notifications
    this.notificationsTopic = new sns.Topic(this, 'NotificationsTopic', {
      displayName: 'Reading Platform Notifications',
    });

    // Create DynamoDB tables for notifications and classroom management
    this.notificationsTable = new dynamodb.Table(this, 'NotificationsTable', {
      tableName: 'Notifications',
      partitionKey: { name: 'notification_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for recipient_id to efficiently query notifications by recipient
    this.notificationsTable.addGlobalSecondaryIndex({
      indexName: 'RecipientIndex',
      partitionKey: { name: 'recipient_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'created_at', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Create tables for classroom management
    this.classroomTable = new dynamodb.Table(this, 'ClassroomsTable', {
      tableName: 'Classrooms',
      partitionKey: { name: 'classroom_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    this.classroomStudentTable = new dynamodb.Table(this, 'ClassroomStudentsTable', {
      tableName: 'ClassroomStudents',
      partitionKey: { name: 'classroom_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'student_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    this.classroomBookTable = new dynamodb.Table(this, 'ClassroomBooksTable', {
      tableName: 'ClassroomBooks',
      partitionKey: { name: 'classroom_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'book_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Create Lambda functions for notification and classroom management
    this.notificationManagerLambda = new lambda.Function(this, 'NotificationManagerFunction', {
      functionName: 'NotificationManager',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/NotificationManager'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        NOTIFICATIONS_TABLE: this.notificationsTable.tableName,
        SNS_TOPIC_ARN: this.notificationsTopic.topicArn,
        USER_POOL_ID: 'me-south-1_X7adr285t',
        FROM_EMAIL: 'notifications@example.com', // Replace with actual email
      },
    });

    this.classroomManagerLambda = new lambda.Function(this, 'ClassroomManagerFunction', {
      functionName: 'ClassroomManager',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/ClassroomManager'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        CLASSROOM_TABLE: this.classroomTable.tableName,
        CLASSROOM_STUDENT_TABLE: this.classroomStudentTable.tableName,
        CLASSROOM_BOOK_TABLE: this.classroomBookTable.tableName,
        USER_POOL_ID: 'me-south-1_X7adr285t',
      },
    });

    // Grant permissions to Lambda functions
    this.notificationsTable.grantReadWriteData(this.notificationManagerLambda);
    this.notificationsTopic.grantPublish(this.notificationManagerLambda);
    
    this.classroomTable.grantReadWriteData(this.classroomManagerLambda);
    this.classroomStudentTable.grantReadWriteData(this.classroomManagerLambda);
    this.classroomBookTable.grantReadWriteData(this.classroomManagerLambda);

    // Grant SES permissions to NotificationManager
    this.notificationManagerLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'],
    }));

    // Method to subscribe the Lex fulfillment Lambda to the SNS topic
    // This will be called from the LexStack after the LexFulfillment Lambda is created
  }

  /**
   * Adds a subscription to the notifications SNS topic for the provided Lambda function
   * @param lexFulfillmentLambda The Lambda function to subscribe to the SNS topic
   * @param filterTypes Optional array of notification types to filter (e.g., 'important', 'alert')
   */
  public addLexFulfillmentSubscription(lexFulfillmentLambda: lambda.Function, filterTypes: string[] = ['important', 'alert']): void {
    // Add SNS subscription for the Lex fulfillment Lambda
    this.notificationsTopic.addSubscription(
      new subs.LambdaSubscription(lexFulfillmentLambda, {
        filterPolicy: {
          notificationType: sns.SubscriptionFilter.stringFilter({
            allowlist: filterTypes
          })
        }
      })
    );
    
    // Grant the Lambda permission to access the notifications table
    this.notificationsTable.grantReadData(lexFulfillmentLambda);
  }
}
