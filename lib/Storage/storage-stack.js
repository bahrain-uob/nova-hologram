"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
const s3n = __importStar(require("aws-cdk-lib/aws-s3-notifications"));
const sqs = __importStar(require("aws-cdk-lib/aws-sqs"));
class StorageStack extends cdk.Stack {
    ;
    constructor(scope, id, shared, props) {
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
        this.readingMaterialsQueue = new sqs.Queue(this, "ReadingMaterialsQueue", {}); //this takes readingmaterials s3 object and puts it in the queue for the lambda function to process it
        // SQS Queue for extracted text from textract function 
        this.extractedTextQueue = new sqs.Queue(this, "ExtractedTextQueue", {}); //after the textextraction lambda function processes the object, it puts the result in this queue for the next lambda function to process it
        // trigger the SQS readingmaterialsQueue when a new object is created in the ReadingMaterials s3 bucket (this is here because if i put it in storage or queue i get a circular dependency error)
        this.readingMaterials.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.SqsDestination(this.readingMaterialsQueue));
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
    }
}
exports.StorageStack = StorageStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0b3JhZ2Utc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFFbkMsdURBQXlDO0FBQ3pDLHNFQUF3RDtBQUV4RCx5REFBMkM7QUFFM0MsTUFBYSxZQUFhLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFLUyxDQUFDO0lBRW5ELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsTUFBMkIsRUFBRSxLQUFzQjtRQUMzRixLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUM5RCxvQkFBb0IsRUFBRSxZQUFZO1lBQ2xDLG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTztZQUN4QyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsU0FBUztTQUNsRCxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQ2hELG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTO1NBQ2xELENBQUMsQ0FBQztRQUVHLDZEQUE2RDtRQUNsRSxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLHNHQUFzRztRQUVwTCx1REFBdUQ7UUFDdkQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyw0SUFBNEk7UUFFcE4sZ01BQWdNO1FBQ2hNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FDdkMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQzNCLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FDbkQsQ0FBQztRQUVGLFNBQVM7UUFDUix5QkFBeUI7UUFDdEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDOUQsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTztZQUN4QyxpQkFBaUIsRUFBRSxJQUFJO1NBQ3hCLENBQUMsQ0FBQztRQUVILG9DQUFvQztRQUNwQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSw0QkFBNEIsRUFBRTtZQUN6RSxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLGlCQUFpQixFQUFFLElBQUk7U0FDeEIsQ0FBQyxDQUFDO0lBSVgsQ0FBQztDQUNGO0FBcERELG9DQW9EQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgKiBhcyBzMyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXMzXCI7XG5pbXBvcnQgKiBhcyBzM24gZnJvbSBcImF3cy1jZGstbGliL2F3cy1zMy1ub3RpZmljYXRpb25zXCI7XG5pbXBvcnQgeyBTaGFyZWRSZXNvdXJjZXNTdGFjayB9IGZyb20gXCIuLi9zaGFyZWRyZXNvdXJjZXMvU2hhcmVkUmVzb3VyY2VzU3RhY2tcIjtcbmltcG9ydCAqIGFzIHNxcyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXNxc1wiO1xuXG5leHBvcnQgY2xhc3MgU3RvcmFnZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IHJlYWRpbmdNYXRlcmlhbHM6IHMzLkJ1Y2tldDtcbiAgcHVibGljIHJlYWRvbmx5IGdlblZpZGVvczogczMuQnVja2V0O1xuICBwdWJsaWMgcmVhZG9ubHkgYXVkaW9GaWxlc0J1Y2tldDogczMuQnVja2V0O1xuICBwdWJsaWMgcmVhZG9ubHkgbm92YUNvbnRlbnRCdWNrZXQ6IHMzLkJ1Y2tldDtcbiAgcHVibGljIHJlYWRvbmx5IHJlYWRpbmdNYXRlcmlhbHNRdWV1ZTogc3FzLlF1ZXVlOyA7XG4gIHB1YmxpYyByZWFkb25seSBleHRyYWN0ZWRUZXh0UXVldWU6IHNxcy5RdWV1ZTtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgc2hhcmVkOlNoYXJlZFJlc291cmNlc1N0YWNrLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICB0aGlzLnJlYWRpbmdNYXRlcmlhbHMgPSBuZXcgczMuQnVja2V0KHRoaXMsIFwiUmVhZGluZ01hdGVyaWFsc1wiLCB7XG4gICAgICB3ZWJzaXRlSW5kZXhEb2N1bWVudDogXCJpbmRleC5odG1sXCIsXG4gICAgICB3ZWJzaXRlRXJyb3JEb2N1bWVudDogXCJlcnJvci5odG1sXCIsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcbiAgICB9KTtcblxuICAgIHRoaXMuZ2VuVmlkZW9zID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCBcIkdlblZpZGVvc1wiLCB7XG4gICAgICB3ZWJzaXRlSW5kZXhEb2N1bWVudDogXCJpbmRleC5odG1sXCIsXG4gICAgICB3ZWJzaXRlRXJyb3JEb2N1bWVudDogXCJlcnJvci5odG1sXCIsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcbiAgICB9KTtcbiAgICBcbiAgICAgICAgICAvLyBTUVMgUXVldWUgZm9yIG5ldyB1cGxvYWRzIGZyb20gcmVhZGluZyBtYXRlcmlhbHMgczMgYnVja2V0XG4gICAgIHRoaXMucmVhZGluZ01hdGVyaWFsc1F1ZXVlID0gbmV3IHNxcy5RdWV1ZSh0aGlzLCBcIlJlYWRpbmdNYXRlcmlhbHNRdWV1ZVwiLHt9KTsgLy90aGlzIHRha2VzIHJlYWRpbmdtYXRlcmlhbHMgczMgb2JqZWN0IGFuZCBwdXRzIGl0IGluIHRoZSBxdWV1ZSBmb3IgdGhlIGxhbWJkYSBmdW5jdGlvbiB0byBwcm9jZXNzIGl0XG5cbiAgICAgLy8gU1FTIFF1ZXVlIGZvciBleHRyYWN0ZWQgdGV4dCBmcm9tIHRleHRyYWN0IGZ1bmN0aW9uIFxuICAgICB0aGlzLmV4dHJhY3RlZFRleHRRdWV1ZSA9IG5ldyBzcXMuUXVldWUodGhpcywgXCJFeHRyYWN0ZWRUZXh0UXVldWVcIix7fSk7IC8vYWZ0ZXIgdGhlIHRleHRleHRyYWN0aW9uIGxhbWJkYSBmdW5jdGlvbiBwcm9jZXNzZXMgdGhlIG9iamVjdCwgaXQgcHV0cyB0aGUgcmVzdWx0IGluIHRoaXMgcXVldWUgZm9yIHRoZSBuZXh0IGxhbWJkYSBmdW5jdGlvbiB0byBwcm9jZXNzIGl0XG5cbiAgICAgLy8gdHJpZ2dlciB0aGUgU1FTIHJlYWRpbmdtYXRlcmlhbHNRdWV1ZSB3aGVuIGEgbmV3IG9iamVjdCBpcyBjcmVhdGVkIGluIHRoZSBSZWFkaW5nTWF0ZXJpYWxzIHMzIGJ1Y2tldCAodGhpcyBpcyBoZXJlIGJlY2F1c2UgaWYgaSBwdXQgaXQgaW4gc3RvcmFnZSBvciBxdWV1ZSBpIGdldCBhIGNpcmN1bGFyIGRlcGVuZGVuY3kgZXJyb3IpXG4gICAgIHRoaXMucmVhZGluZ01hdGVyaWFscy5hZGRFdmVudE5vdGlmaWNhdGlvbihcbiAgICAgICAgczMuRXZlbnRUeXBlLk9CSkVDVF9DUkVBVEVELFxuICAgICAgICBuZXcgczNuLlNxc0Rlc3RpbmF0aW9uKHRoaXMucmVhZGluZ01hdGVyaWFsc1F1ZXVlKVxuICAgICAgKTtcblxuICAgICAgLy9TdHVkZW50XG4gICAgICAgLy8gQnVja2V0IGZvciBhdWRpbyBmaWxlc1xuICAgICAgICAgIHRoaXMuYXVkaW9GaWxlc0J1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ0F1ZGlvRmlsZXNCdWNrZXQnLCB7XG4gICAgICAgICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgICAgICAgYXV0b0RlbGV0ZU9iamVjdHM6IHRydWUsXG4gICAgICAgICAgfSk7XG4gICAgICBcbiAgICAgICAgICAvLyBCdWNrZXQgZm9yIE5vdmEtZ2VuZXJhdGVkIGNvbnRlbnRcbiAgICAgICAgICB0aGlzLm5vdmFDb250ZW50QnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnTm92YUdlbmVyYXRlZENvbnRlbnRCdWNrZXQnLCB7XG4gICAgICAgICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgICAgICAgYXV0b0RlbGV0ZU9iamVjdHM6IHRydWUsXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBcblxuICB9XG59XG4iXX0=