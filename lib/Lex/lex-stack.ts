import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";

export class LexStack extends cdk.Stack {
  public readonly lexBotId: string;
  public readonly lexBotAliasId: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a Lambda function for Lex fulfillment
    const lexFulfillmentLambda = new lambda.Function(this, "LexFulfillmentLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../../lambda/LexFulfillment")),
      environment: {
        // Add any environment variables needed by the Lambda
      },
    });

    // Create IAM role for Lex to invoke Lambda
    const lexServiceRole = new iam.Role(this, "LexServiceRole", {
      assumedBy: new iam.ServicePrincipal("lexv2.amazonaws.com"),
    });

    // Allow Lex to invoke the Lambda function
    lexFulfillmentLambda.grantInvoke(lexServiceRole);

    // Instead of using CDK constructs for Lex which have type issues,
    // we'll output the Lambda ARN and IAM role ARN for manual Lex bot creation
    // through the AWS Console or CLI
    
    // Output the Lambda ARN for Lex fulfillment
    new cdk.CfnOutput(this, "LexFulfillmentLambdaArn", {
      value: lexFulfillmentLambda.functionArn,
      description: "The ARN of the Lambda function for Lex fulfillment",
    });

    // Output the IAM role ARN for Lex
    new cdk.CfnOutput(this, "LexServiceRoleArn", {
      value: lexServiceRole.roleArn,
      description: "The ARN of the IAM role for Lex",
    });

    // These would be populated after manual creation of the Lex bot
    this.lexBotId = 'MANUAL_CREATION_REQUIRED';
    this.lexBotAliasId = 'MANUAL_CREATION_REQUIRED';

    // Output placeholder for Lex bot ID and alias ID
    new cdk.CfnOutput(this, "LexBotId", {
      value: "Create Lex bot manually and note the bot ID",
      description: "The ID of the Lex bot (requires manual creation)",
    });

    new cdk.CfnOutput(this, "LexBotAliasId", {
      value: "Create Lex bot alias manually and note the alias ID",
      description: "The ID of the Lex bot alias (requires manual creation)",
    });
  }
}
