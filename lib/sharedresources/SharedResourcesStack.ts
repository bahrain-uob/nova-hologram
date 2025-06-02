import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";

export class SharedResourcesStack extends cdk.Stack {
  public readonly readingMaterialsBucket: s3.Bucket;
  public readonly genVideosBucket: s3.Bucket;
  public readonly audioFilesBucket: s3.Bucket;
  public readonly novaContentBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create shared S3 buckets
    this.readingMaterialsBucket = new s3.Bucket(this, "ReadingMaterials", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
    });

    this.genVideosBucket = new s3.Bucket(this, "GenVideos", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    this.audioFilesBucket = new s3.Bucket(this, "AudioFiles", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    this.novaContentBucket = new s3.Bucket(this, "NovaGeneratedContent", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
  }
}
