import * as cdk from "aws-cdk-lib";
import { DBStack } from "../lib/DB/db-stack";
import { StorageStack } from "../lib/Storage/storage-stack";
import { BedrockStack } from "../lib/Backend/bedrock-stack";
import { lambdastack } from "../lib/Backend/lambda-stacks";
import { SharedResourcesStack } from "../lib/sharedresources/SharedResourcesStack";
import { APIStack } from "../lib/Backend/api-stacks";
import { FrontendStack } from "../lib/Frontend/website-stack";
import { LexStack } from "../lib/Lex/lex-stack";

const app = new cdk.App();

const dbStack = new DBStack(app, "DBStack");
const sharedResourcesStack = new SharedResourcesStack(app, "SharedResourcesStack");
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
    synthesisMode: true
  }
);

const bedrockStack = new BedrockStack(app, "BedrockStack", lambdaStack, storageStack);
const apiStack = new APIStack(app, "APIStack", dbStack, lambdaStack, storageStack);
const frontendStack = new FrontendStack(app, "FrontendStack");
const lexStack = new LexStack(app, "LexStack");


lambdaStack.addDependency(storageStack);
lambdaStack.addDependency(dbStack);
bedrockStack.addDependency(lambdaStack);
apiStack.addDependency(lambdaStack);
apiStack.addDependency(storageStack);
apiStack.addDependency(dbStack);
lexStack.addDependency(lambdaStack);

