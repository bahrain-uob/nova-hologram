import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";

export class DBStack extends cdk.Stack {
  public readonly casesTable: dynamodb.Table;
  public readonly casesTable2: dynamodb.Table;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // First table in the architecture (the one that saves the extracted text)
    this.casesTable = new dynamodb.Table(this, "[ChallengeName]CaseHistory", {
      partitionKey: { name: "caseID", type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY, // Ensure table is deleted during stack removal
    });    
    // Second table in the architecture (the one that saves Q&A)
    this.casesTable2 = new dynamodb.Table(this, "[ChallengeName]CaseHistory", {
      partitionKey: { name: "caseID", type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY, // Ensure table is deleted during stack removal
    });

  }
}
