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
  public readonly qrCodeBucket: s3.Bucket;
  public readonly readingMaterialsQueue: sqs.Queue; ;
  public readonly extractedTextQueue: sqs.Queue;
  constructor(scope: Construct, id: string, shared:SharedResourcesStack, props?: cdk.StackProps) {
    super(scope, id, props);

    this.readingMaterials = new s3.Bucket(this, "ReadingMaterials", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    this.genVideos = new s3.Bucket(this, "GenVideos", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
    
          // SQS Queue for new uploads from reading materials s3 bucket
     this.readingMaterialsQueue = new sqs.Queue(this, "ReadingMaterialsQueue",{}); //this takes readingmaterials s3 object and puts it in the queue for the lambda function to process it

     // SQS Queue for extracted text from textract function 
     this.extractedTextQueue = new sqs.Queue(this, "ExtractedTextQueue",{}); //after the textextraction lambda function processes the object, it puts the result in this queue for the next lambda function to process it

     // trigger the SQS readingmaterialsQueue when a new object is created in the ReadingMaterials s3 bucket (this is here because if i put it in storage or queue i get a circular dependency error)
     this.readingMaterials.addEventNotification(
        s3.EventType.OBJECT_CREATED,
        new s3n.SqsDestination(this.readingMaterialsQueue)
      );

      //Student
       // Bucket for audio files
          this.audioFilesBucket = new s3.Bucket(this, 'AudioFilesBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
          });
      
          // Bucket for Nova-generated content
          this.novaContentBucket = new s3.Bucket(this, 'NovaGeneratedContentBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
          });
          this.qrCodeBucket = new s3.Bucket(this, 'QrCodeBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Only for dev environments
          });
          
          

          // NOTE: Event notifications for these buckets are now handled in EventNotificationsStack
          // to avoid circular dependencies
          

  }
}
