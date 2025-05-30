import * as cdk from "aws-cdk-lib";
import { DBStack } from "../lib/DB/db-stack";
import { StorageStack } from "../lib/Storage/storage-stack";
import { BedrockStack } from "../lib/Backend/bedrock-stack";
import { lambdastack } from "../lib/Backend/lambda-stacks";
import { SharedResourcesStack } from "../lib/sharedresources/SharedResourcesStack";
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

const bedrockStack = new BedrockStack(app, "BedrockStack", lambdaStack, storageStack);
const apiStack = new APIStack(app, "APIStack", dbStack, lambdaStack, storageStack);
const frontendStack = new FrontendStack(app, "FrontendStack");

lambdaStack.addDependency(storageStack);
lambdaStack.addDependency(dbStack);
bedrockStack.addDependency(lambdaStack);
apiStack.addDependency(lambdaStack);
apiStack.addDependency(storageStack);
apiStack.addDependency(dbStack);
