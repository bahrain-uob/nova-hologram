import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import { StorageStack } from "../Storage/storage-stack";
import { lambdastack } from "./lambda-stacks";

export class BedrockStack extends cdk.Stack {
  constructor(scope: Construct, id: string, lambdastack: lambdastack, storagestack: StorageStack,  props?: cdk.StackProps) {
    super(scope, id, props);

    // Update the addToRolePolicy statement
    lambdastack.BedRockFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'bedrock:*',  // Full access to Amazon Bedrock
        's3:PutObject',
        's3:GetObject',
        's3:ListBucket'
      ],
      resources: ['*']  // Use specific ARNs for tighter control
    }));
    
    

        
        storagestack.genVideos.grantReadWrite(lambdastack.BedRockFunction);
        
        new cdk.CfnOutput(this, "GenVideosBucketURI", {
        value: `s3://${storagestack.genVideos.bucketName}/upload/`,
        description: "S3 URI where generated videos will be stored by the Nova Reel Lambda"
        });
  }
}
