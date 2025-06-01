import * as cdk from "aws-cdk-lib";
import { DBStack } from "../lib/DB/db-stack";
import { StorageStack } from "../lib/Storage/storage-stack";
import { BedrockStack } from "../lib/Backend/bedrock-stack";
import { lambdastack } from "../lib/Backend/lambda-stacks";
import { SharedResourcesStack } from "../lib/sharedresources/SharedResourcesStack";
import { EventNotificationsStack } from "../lib/sharedresources/EventNotificationsStack";
import { LexStack } from "../lib/Lex/lex-stack";
import { APIStack } from "../lib/Backend/api-stacks";
import { FrontendStack } from "../lib/Frontend/website-stack";

const app = new cdk.App();

const dbStack = new DBStack(app, "DBStack");
const sharedResourcesStack = new SharedResourcesStack(app, "SharedResourcesStack");
const storageStack = new StorageStack(app, "StorageStack", sharedResourcesStack);

const lambdaStack = new lambdastack(
  app,
  "LambdaStack",
  dbStack,
  storageStack,
  sharedResourcesStack,
  {
    synthesisMode: true
  }
);

// Create EventNotificationsStack for notification system and classroom management
const eventNotificationsStack = new EventNotificationsStack(
  app,
  "EventNotificationsStack",
  storageStack,
  lambdaStack
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

lambdaStack.addDependency(storageStack);
lambdaStack.addDependency(dbStack);

// Add dependencies for EventNotificationsStack
eventNotificationsStack.addDependency(lambdaStack);
eventNotificationsStack.addDependency(storageStack);

// Add dependencies for LexStack
lexStack.addDependency(dbStack);
lexStack.addDependency(storageStack);
lexStack.addDependency(eventNotificationsStack);

bedrockStack.addDependency(lambdaStack);
apiStack.addDependency(lambdaStack);
apiStack.addDependency(storageStack);
apiStack.addDependency(dbStack);
apiStack.addDependency(eventNotificationsStack); // API Gateway needs access to notification resources


