import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class DBStack extends cdk.Stack {
  public readonly extractedTextTable: dynamodb.Table;
  public readonly qaTable: dynamodb.Table;
  public readonly collection: dynamodb.Table;
  public readonly languages: dynamodb.Table;
  public readonly book_file_description: dynamodb.Table;
  public readonly book: dynamodb.Table;
 

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.extractedTextTable = new dynamodb.Table(this, "ExtractedTextTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
       // Table for storing Q&A data
       this.qaTable = new dynamodb.Table(this, 'QATable', {
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });

      this.collection = new dynamodb.Table(this, 'collection', {
        partitionKey: { name: 'collection_id', type: dynamodb.AttributeType.STRING },
      });

      this.languages = new dynamodb.Table(this, 'languages', {
        partitionKey: { name: 'languages_id', type: dynamodb.AttributeType.STRING },
      });

      this.book_file_description = new dynamodb.Table(this, 'book_file_description', {
        partitionKey: { name: 'book_file_id', type: dynamodb.AttributeType.STRING },
      });

      this.book = new dynamodb.Table(this, 'book', {
        partitionKey: { name: 'book_id', type: dynamodb.AttributeType.STRING },
        sortKey: { name: 'composite_key', type: dynamodb.AttributeType.STRING },
      });
      //when inserting an item into this table, you can concatenate these values:
      //composite_key = `${collection_id}#${languages_id}#${user_id}`;



  }

}
