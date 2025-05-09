import * as cdk from "aws-cdk-lib";
import { DBStack } from "../lib/DB/db-stack";
import { StorageStack } from "../lib/Storage/storage-stack";
import { BedrockStack } from "../lib/Backend/bedrock-stack";
import { lambdastack } from "../lib/Backend/lambda-stacks";
import { SharedResourcesStack } from "../lib/sharedresources/SharedResourcesStack";
import { APIStack } from "../lib/Backend/api-stacks";
import { FrontendStack } from "../lib/Frontend/website-stack";

/**
 * Nova Hologram CDK App
 * 
 * This is the main entry point for the CDK application.
 * The stacks are organized to avoid circular dependencies.
 */
const app = new cdk.App();

// Step 1: Create the shared resources and database stacks first
// These don't depend on any other stacks
const dbStack = new DBStack(app, "DBStack");
const sharedResourcesStack = new SharedResourcesStack(app, "SharedResourcesStack");

// Step 2: Create the storage stack
// This depends only on shared resources
const storageStack = new StorageStack(app, "StorageStack", sharedResourcesStack);

// Step 3: Create the lambda stack with a special flag to avoid circular dependencies
// We'll pass a special parameter to indicate we're in CDK synthesis mode
const lambdaStack = new lambdastack(
  app, 
  "LambdaStack", 
  dbStack, 
  storageStack, 
  sharedResourcesStack,
  {
    // This special property tells the stack to avoid creating circular references
    // during the CDK synthesis phase
    synthesisMode: true
  }
);

// Step 4: Create the remaining stacks
const Bedrock = new BedrockStack(app, "BedrockStack", lambdaStack, storageStack);
const apiStack = new APIStack(app, "APIStack", dbStack, lambdaStack, storageStack);
const frontendStack = new FrontendStack(app, "FrontendStack");

// Add explicit dependencies to ensure the correct deployment order
lambdaStack.addDependency(storageStack);
lambdaStack.addDependency(dbStack);
Bedrock.addDependency(lambdaStack);
apiStack.addDependency(lambdaStack);
apiStack.addDependency(storageStack);
apiStack.addDependency(dbStack);
