import * as cdk from "aws-cdk-lib";
import { App } from "aws-cdk-lib";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import { DBStack } from "../lib/DB/db-stack";
import { StorageStack } from "../lib/Storage/storage-stack";
import { NotificationsStack } from "../lib/Storage/notifications-stack";
import { PermissionsStack } from "../lib/Storage/permissions-stack";
import { BedrockStack } from "../lib/Backend/bedrock-stack";
import { LambdaStack } from "../lib/Backend/lambda-stacks";
import { SharedResourcesStack } from "../lib/sharedresources/SharedResourcesStack";
import { EventNotificationsStack } from "../lib/sharedresources/EventNotificationsStack";
import { LexStack } from "../lib/Lex/lex-stack";
import { APIStack } from "../lib/Backend/api-stacks";
import { FrontendStack } from "../lib/Frontend/website-stack";

const app = new cdk.App();

const dbStack = new DBStack(app, "DBStack");
const sharedResourcesStack = new SharedResourcesStack(app, "SharedResourcesStack");

// Create LambdaStack with shared resources
const lambdaStack = new LambdaStack(
  app,
  "NovaLambdaStack",
  dbStack,
  sharedResourcesStack
);

// Create StorageStack with references to LambdaStack's buckets
const storageStack = new StorageStack(
  app,
  "StorageStack",
  sharedResourcesStack
);

// Create NotificationsStack to handle all event notifications
const notificationsStack = new NotificationsStack(app, "NotificationsStack");

// Add dependencies
lambdaStack.addDependency(dbStack);
lambdaStack.addDependency(sharedResourcesStack);
storageStack.addDependency(sharedResourcesStack);
notificationsStack.addDependency(lambdaStack);
notificationsStack.addDependency(storageStack);

// Create PermissionsStack to handle all cross-stack permissions
const permissionsStack = new PermissionsStack(
  app,
  "PermissionsStack",
  {
    // Storage resources
    readingMaterialsBucket: storageStack.readingMaterials,
    genVideosBucket: storageStack.genVideos,
    audioFilesBucket: storageStack.audioFilesBucket,
    novaContentBucket: storageStack.novaContentBucket,
    readingMaterialsQueue: storageStack.readingMaterialsQueue,
    extractedTextQueue: lambdaStack.extractedTextQueue,
    summaryQueue: lambdaStack.summaryQueue,
    scriptQueue: lambdaStack.scriptQueue,
    videoScriptQueue: lambdaStack.videoScriptQueue,
    ssmlQueue: lambdaStack.ssmlQueue,
    pollyQueue: lambdaStack.pollyQueue,
    audioMergeQueue: lambdaStack.audioMergeQueue,
    textractNotificationTopic: lambdaStack.textractNotificationTopic,
    textractTriggerTopic: lambdaStack.textractTriggerTopic,

    // Lambda functions
    postUploadLambda: lambdaStack.postUploadLambda,
    getFilesLambda: lambdaStack.getFilesLambda,
    deleteFilesLambda: lambdaStack.deleteFilesLambda,
    splitChaptersLambda: lambdaStack.splitChaptersLambda,
    deleteBookLambda: lambdaStack.deleteBookLambda,
    bookHandlerLambda: lambdaStack.bookHandlerLambda,
    getUploadUrlsLambda: lambdaStack.getUploadUrlsLambda,
    textExtractionLambda: lambdaStack.textExtractionLambda,
    startTextractJobLambda: lambdaStack.startTextractJobLambda,
    playResponseLambda: lambdaStack.playResponse,
    triggerPollyLambda: lambdaStack.triggerPolly,
    invokeBedrockLibLambda: lambdaStack.invokeBedrockLib,
    invokeBedrockLambda: lambdaStack.invokeBedrock,
    generateSummaryLambda: lambdaStack.generateSummaryLambda,
    generateScriptLambda: lambdaStack.generateScriptLambda,
    getBookLambda: lambdaStack.getBookLambda,
    updateBookLambda: lambdaStack.updateBookLambda,
    generateSSMLLambda: lambdaStack.generateSSMLLambda,
    generateAudioLambda: lambdaStack.generateAudioLambda,
    finalVideoLambda: lambdaStack.finalVideoLambda,
    saveExtractedTextLambda: lambdaStack.saveExtractedTextLambda,
    bedRockFunction: lambdaStack.BedRockFunction,
    textractServiceRole: lambdaStack.textractServiceRole,

    // DynamoDB tables
    qaTable: dbStack.qaTable,
    extractedTextTable: dbStack.extractedTextTable,
    bookTable: dbStack.book,
    chapterTable: dbStack.chapter
  }
);

// Create EventNotificationsStack for notification system and classroom management
const eventNotificationsStack = new EventNotificationsStack(
  app,
  "EventNotificationsStack"
);

// Create LexStack for chatbot functionality
const lexStack = new LexStack(
  app,
  "LexStack",
  dbStack,
  storageStack,
  eventNotificationsStack
);

const bedrockStack = new BedrockStack(app, "BedrockStack", lambdaStack, storageStack);
const apiStack = new APIStack(app, "APIStack", dbStack, lambdaStack, storageStack, eventNotificationsStack);
const frontendStack = new FrontendStack(app, "FrontendStack");

// Set up dependencies in the correct order to avoid cycles

// Base stacks have no dependencies
// - dbStack
// - sharedResourcesStack
// - storageStack

// LambdaStack depends on base stacks
lambdaStack.addDependency(dbStack);
lambdaStack.addDependency(sharedResourcesStack);

// NotificationsStack depends on both storage and lambda
notificationsStack.addDependency(storageStack);
notificationsStack.addDependency(lambdaStack);

// PermissionsStack depends on all resource stacks
permissionsStack.addDependency(dbStack);
permissionsStack.addDependency(storageStack);
permissionsStack.addDependency(lambdaStack);

// EventNotificationsStack depends on notifications
eventNotificationsStack.addDependency(notificationsStack);

// LexStack depends on event notifications
lexStack.addDependency(dbStack);
lexStack.addDependency(eventNotificationsStack);

// BedrockStack depends on lambda
bedrockStack.addDependency(lambdaStack);

// APIStack depends on all other stacks
apiStack.addDependency(dbStack);
apiStack.addDependency(storageStack);
apiStack.addDependency(lambdaStack);
apiStack.addDependency(eventNotificationsStack);


