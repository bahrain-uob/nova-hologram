import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import { SharedResourcesStack } from "../sharedresources/SharedResourcesStack";
import * as sqs from "aws-cdk-lib/aws-sqs";

export class StorageStack extends cdk.Stack {
  public readonly readingMaterials: s3.Bucket;
  public readonly genVideos: s3.Bucket;
  public readonly audioFilesBucket: s3.Bucket;
  public readonly novaContentBucket: s3.Bucket;
  public readonly readingMaterialsQueue: sqs.Queue;
  constructor(scope: Construct, id: string, shared: SharedResourcesStack, props?: cdk.StackProps) {
    super(scope, id, props);

    // Use buckets from SharedResourcesStack
    this.readingMaterials = shared.readingMaterialsBucket;
    this.genVideos = shared.genVideosBucket;
    this.audioFilesBucket = shared.audioFilesBucket;
    this.novaContentBucket = shared.novaContentBucket;
    
    // SQS Queue for new uploads from reading materials s3 bucket
    this.readingMaterialsQueue = new sqs.Queue(this, "ReadingMaterialsQueue", {
      visibilityTimeout: cdk.Duration.seconds(300),
      retentionPeriod: cdk.Duration.days(1),
    });

          // NOTE: Event notifications for these buckets are now handled in EventNotificationsStack
          // to avoid circular dependencies
          

  }
}
