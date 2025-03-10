import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";

export class DBStack extends cdk.Stack {
  public readonly casesTable: dynamodb.Table;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB Table for cases
    this.casesTable = new dynamodb.Table(this, "[ChallengeName]CaseHistory", {
      partitionKey: { name: "caseID", type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY, // Ensure table is deleted during stack removal
    });
  }
}
