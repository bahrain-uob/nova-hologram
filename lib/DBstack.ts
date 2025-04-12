import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";

export class DBStack extends cdk.Stack {
  public readonly casesTable: dynamodb.Table;
  public readonly extractedTextTable: dynamodb.Table;


  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // First table in the architecture (the one that saves the extracted text)
    this.casesTable = new dynamodb.Table(this, "[ChallengeName]CaseHistory", {
      partitionKey: { name: "caseID", type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY, // Ensure table is deleted during stack removal
    });    

        // DynamoDB Table that is used in the architecture to save the extracted text
      this.extractedTextTable = new dynamodb.Table(this, 'ExtractedTextTable', {
      partitionKey: { name: 'documentId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });



  }
}
