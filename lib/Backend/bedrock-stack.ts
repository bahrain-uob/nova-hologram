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
        'bedrock:InvokeModel',
        'bedrock:StartAsyncInvoke',
        'bedrock:GetAsyncInvoke',
        's3:PutObject',
        's3:GetObject',
        's3:ListBucket'
      ],
      resources: [
        'arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-reel-v1',
        'arn:aws:bedrock:us-east-1:672461264983:async-invoke/amazon.nova-reel-v1',
        `arn:aws:s3:::${storagestack.genVideos.bucketName}`,
        `arn:aws:s3:::${storagestack.genVideos.bucketName}/*`
      ]
    }));
    

        
        storagestack.genVideos.grantReadWrite(lambdastack.BedRockFunction);
        
        new cdk.CfnOutput(this, "GenVideosBucketURI", {
        value: `s3://${storagestack.genVideos.bucketName}/upload/`,
        description: "S3 URI where generated videos will be stored by the Nova Reel Lambda"
        });
  }
}
