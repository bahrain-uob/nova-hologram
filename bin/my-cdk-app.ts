import * as cdk from "aws-cdk-lib";
import { MyCdkStack } from "../lib/my-cdk-app-stack";
import { DBStack } from "../lib/DBstack"; // Import your DBStack
import { APIStack } from "../lib/api-stack"; // Import your APIStack

const app = new cdk.App();

// Create the DBStack
const dbStack = new DBStack(app, "DBStack", {
  // Any custom stack props you may have for DBStack
});

// Create the APIStack, passing in the DBStack as a dependency
// Pass the DBStack as the second argument along with required additional arguments

const myCdkStack = new MyCdkStack(app, "MyCdkStack", dbStack,);
new MyCdkStack(app, "MyCdkAppStack",dbStack);

new APIStack(app, "APIStack", dbStack);

// Optionally, you can create your other stacks here if needed

