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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0b3JhZ2Utc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFFbkMsdURBQXlDO0FBQ3pDLHNFQUF3RDtBQUV4RCx5REFBMkM7QUFFM0MsTUFBYSxZQUFhLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFLUyxDQUFDO0lBRW5ELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsTUFBMkIsRUFBRSxLQUFzQjtRQUMzRixLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUM5RCxvQkFBb0IsRUFBRSxZQUFZO1lBQ2xDLG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTztZQUN4QyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsU0FBUztTQUNsRCxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQ2hELG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTO1NBQ2xELENBQUMsQ0FBQztRQUVHLDZEQUE2RDtRQUNsRSxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLHNHQUFzRztRQUVwTCx1REFBdUQ7UUFDdkQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyw0SUFBNEk7UUFFcE4sZ01BQWdNO1FBQ2hNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FDdkMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQzNCLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FDbkQsQ0FBQztRQUVGLFNBQVM7UUFDUix5QkFBeUI7UUFDdEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDOUQsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTztZQUN4QyxpQkFBaUIsRUFBRSxJQUFJO1NBQ3hCLENBQUMsQ0FBQztRQUVILG9DQUFvQztRQUNwQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSw0QkFBNEIsRUFBRTtZQUN6RSxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLGlCQUFpQixFQUFFLElBQUk7U0FDeEIsQ0FBQyxDQUFDO0lBSVgsQ0FBQztDQUNGO0FBcERELG9DQW9EQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcclxuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcclxuaW1wb3J0ICogYXMgczMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zM1wiO1xyXG5pbXBvcnQgKiBhcyBzM24gZnJvbSBcImF3cy1jZGstbGliL2F3cy1zMy1ub3RpZmljYXRpb25zXCI7XHJcbmltcG9ydCB7IFNoYXJlZFJlc291cmNlc1N0YWNrIH0gZnJvbSBcIi4uL3NoYXJlZHJlc291cmNlcy9TaGFyZWRSZXNvdXJjZXNTdGFja1wiO1xyXG5pbXBvcnQgKiBhcyBzcXMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zcXNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBTdG9yYWdlU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gIHB1YmxpYyByZWFkb25seSByZWFkaW5nTWF0ZXJpYWxzOiBzMy5CdWNrZXQ7XHJcbiAgcHVibGljIHJlYWRvbmx5IGdlblZpZGVvczogczMuQnVja2V0O1xyXG4gIHB1YmxpYyByZWFkb25seSBhdWRpb0ZpbGVzQnVja2V0OiBzMy5CdWNrZXQ7XHJcbiAgcHVibGljIHJlYWRvbmx5IG5vdmFDb250ZW50QnVja2V0OiBzMy5CdWNrZXQ7XHJcbiAgcHVibGljIHJlYWRvbmx5IHJlYWRpbmdNYXRlcmlhbHNRdWV1ZTogc3FzLlF1ZXVlOyA7XHJcbiAgcHVibGljIHJlYWRvbmx5IGV4dHJhY3RlZFRleHRRdWV1ZTogc3FzLlF1ZXVlO1xyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHNoYXJlZDpTaGFyZWRSZXNvdXJjZXNTdGFjaywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgdGhpcy5yZWFkaW5nTWF0ZXJpYWxzID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCBcIlJlYWRpbmdNYXRlcmlhbHNcIiwge1xyXG4gICAgICB3ZWJzaXRlSW5kZXhEb2N1bWVudDogXCJpbmRleC5odG1sXCIsXHJcbiAgICAgIHdlYnNpdGVFcnJvckRvY3VtZW50OiBcImVycm9yLmh0bWxcIixcclxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcclxuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZ2VuVmlkZW9zID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCBcIkdlblZpZGVvc1wiLCB7XHJcbiAgICAgIHdlYnNpdGVJbmRleERvY3VtZW50OiBcImluZGV4Lmh0bWxcIixcclxuICAgICAgd2Vic2l0ZUVycm9yRG9jdW1lbnQ6IFwiZXJyb3IuaHRtbFwiLFxyXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxyXG4gICAgICBibG9ja1B1YmxpY0FjY2VzczogczMuQmxvY2tQdWJsaWNBY2Nlc3MuQkxPQ0tfQUxMLFxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgICAgICAgIC8vIFNRUyBRdWV1ZSBmb3IgbmV3IHVwbG9hZHMgZnJvbSByZWFkaW5nIG1hdGVyaWFscyBzMyBidWNrZXRcclxuICAgICB0aGlzLnJlYWRpbmdNYXRlcmlhbHNRdWV1ZSA9IG5ldyBzcXMuUXVldWUodGhpcywgXCJSZWFkaW5nTWF0ZXJpYWxzUXVldWVcIix7fSk7IC8vdGhpcyB0YWtlcyByZWFkaW5nbWF0ZXJpYWxzIHMzIG9iamVjdCBhbmQgcHV0cyBpdCBpbiB0aGUgcXVldWUgZm9yIHRoZSBsYW1iZGEgZnVuY3Rpb24gdG8gcHJvY2VzcyBpdFxyXG5cclxuICAgICAvLyBTUVMgUXVldWUgZm9yIGV4dHJhY3RlZCB0ZXh0IGZyb20gdGV4dHJhY3QgZnVuY3Rpb24gXHJcbiAgICAgdGhpcy5leHRyYWN0ZWRUZXh0UXVldWUgPSBuZXcgc3FzLlF1ZXVlKHRoaXMsIFwiRXh0cmFjdGVkVGV4dFF1ZXVlXCIse30pOyAvL2FmdGVyIHRoZSB0ZXh0ZXh0cmFjdGlvbiBsYW1iZGEgZnVuY3Rpb24gcHJvY2Vzc2VzIHRoZSBvYmplY3QsIGl0IHB1dHMgdGhlIHJlc3VsdCBpbiB0aGlzIHF1ZXVlIGZvciB0aGUgbmV4dCBsYW1iZGEgZnVuY3Rpb24gdG8gcHJvY2VzcyBpdFxyXG5cclxuICAgICAvLyB0cmlnZ2VyIHRoZSBTUVMgcmVhZGluZ21hdGVyaWFsc1F1ZXVlIHdoZW4gYSBuZXcgb2JqZWN0IGlzIGNyZWF0ZWQgaW4gdGhlIFJlYWRpbmdNYXRlcmlhbHMgczMgYnVja2V0ICh0aGlzIGlzIGhlcmUgYmVjYXVzZSBpZiBpIHB1dCBpdCBpbiBzdG9yYWdlIG9yIHF1ZXVlIGkgZ2V0IGEgY2lyY3VsYXIgZGVwZW5kZW5jeSBlcnJvcilcclxuICAgICB0aGlzLnJlYWRpbmdNYXRlcmlhbHMuYWRkRXZlbnROb3RpZmljYXRpb24oXHJcbiAgICAgICAgczMuRXZlbnRUeXBlLk9CSkVDVF9DUkVBVEVELFxyXG4gICAgICAgIG5ldyBzM24uU3FzRGVzdGluYXRpb24odGhpcy5yZWFkaW5nTWF0ZXJpYWxzUXVldWUpXHJcbiAgICAgICk7XHJcblxyXG4gICAgICAvL1N0dWRlbnRcclxuICAgICAgIC8vIEJ1Y2tldCBmb3IgYXVkaW8gZmlsZXNcclxuICAgICAgICAgIHRoaXMuYXVkaW9GaWxlc0J1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ0F1ZGlvRmlsZXNCdWNrZXQnLCB7XHJcbiAgICAgICAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXHJcbiAgICAgICAgICAgIGF1dG9EZWxldGVPYmplY3RzOiB0cnVlLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIFxyXG4gICAgICAgICAgLy8gQnVja2V0IGZvciBOb3ZhLWdlbmVyYXRlZCBjb250ZW50XHJcbiAgICAgICAgICB0aGlzLm5vdmFDb250ZW50QnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnTm92YUdlbmVyYXRlZENvbnRlbnRCdWNrZXQnLCB7XHJcbiAgICAgICAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXHJcbiAgICAgICAgICAgIGF1dG9EZWxldGVPYmplY3RzOiB0cnVlLFxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgXHJcblxyXG4gIH1cclxufVxyXG4iXX0=