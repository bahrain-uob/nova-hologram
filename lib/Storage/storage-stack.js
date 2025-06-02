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
        // Notifications are now handled in storage-notifications.ts
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
        // NOTE: Event notifications for these buckets are now handled in EventNotificationsStack
        // to avoid circular dependencies
    }
}
exports.StorageStack = StorageStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0b3JhZ2Utc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFFbkMsdURBQXlDO0FBR3pDLHlEQUEyQztBQUUzQyxNQUFhLFlBQWEsU0FBUSxHQUFHLENBQUMsS0FBSztJQUtTLENBQUM7SUFFbkQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxNQUEyQixFQUFFLEtBQXNCO1FBQzNGLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQzlELG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTO1NBQ2xELENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7WUFDaEQsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxvQkFBb0IsRUFBRSxZQUFZO1lBQ2xDLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFNBQVM7U0FDbEQsQ0FBQyxDQUFDO1FBRUcsNkRBQTZEO1FBQ2xFLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsc0dBQXNHO1FBRXBMLHVEQUF1RDtRQUN2RCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLDRJQUE0STtRQUVwTiw0REFBNEQ7UUFFM0QsU0FBUztRQUNSLHlCQUF5QjtRQUN0QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUM5RCxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLGlCQUFpQixFQUFFLElBQUk7U0FDeEIsQ0FBQyxDQUFDO1FBRUgsb0NBQW9DO1FBQ3BDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLDRCQUE0QixFQUFFO1lBQ3pFLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsaUJBQWlCLEVBQUUsSUFBSTtTQUN4QixDQUFDLENBQUM7UUFFSCx5RkFBeUY7UUFDekYsaUNBQWlDO0lBR3pDLENBQUM7Q0FDRjtBQWxERCxvQ0FrREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0ICogYXMgczMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zM1wiO1xuaW1wb3J0ICogYXMgczNuIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczMtbm90aWZpY2F0aW9uc1wiO1xuaW1wb3J0IHsgU2hhcmVkUmVzb3VyY2VzU3RhY2sgfSBmcm9tIFwiLi4vc2hhcmVkcmVzb3VyY2VzL1NoYXJlZFJlc291cmNlc1N0YWNrXCI7XG5pbXBvcnQgKiBhcyBzcXMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zcXNcIjtcblxuZXhwb3J0IGNsYXNzIFN0b3JhZ2VTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIHB1YmxpYyByZWFkb25seSByZWFkaW5nTWF0ZXJpYWxzOiBzMy5CdWNrZXQ7XG4gIHB1YmxpYyByZWFkb25seSBnZW5WaWRlb3M6IHMzLkJ1Y2tldDtcbiAgcHVibGljIHJlYWRvbmx5IGF1ZGlvRmlsZXNCdWNrZXQ6IHMzLkJ1Y2tldDtcbiAgcHVibGljIHJlYWRvbmx5IG5vdmFDb250ZW50QnVja2V0OiBzMy5CdWNrZXQ7XG4gIHB1YmxpYyByZWFkb25seSByZWFkaW5nTWF0ZXJpYWxzUXVldWU6IHNxcy5RdWV1ZTsgO1xuICBwdWJsaWMgcmVhZG9ubHkgZXh0cmFjdGVkVGV4dFF1ZXVlOiBzcXMuUXVldWU7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHNoYXJlZDpTaGFyZWRSZXNvdXJjZXNTdGFjaywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgdGhpcy5yZWFkaW5nTWF0ZXJpYWxzID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCBcIlJlYWRpbmdNYXRlcmlhbHNcIiwge1xuICAgICAgd2Vic2l0ZUluZGV4RG9jdW1lbnQ6IFwiaW5kZXguaHRtbFwiLFxuICAgICAgd2Vic2l0ZUVycm9yRG9jdW1lbnQ6IFwiZXJyb3IuaHRtbFwiLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXG4gICAgfSk7XG5cbiAgICB0aGlzLmdlblZpZGVvcyA9IG5ldyBzMy5CdWNrZXQodGhpcywgXCJHZW5WaWRlb3NcIiwge1xuICAgICAgd2Vic2l0ZUluZGV4RG9jdW1lbnQ6IFwiaW5kZXguaHRtbFwiLFxuICAgICAgd2Vic2l0ZUVycm9yRG9jdW1lbnQ6IFwiZXJyb3IuaHRtbFwiLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXG4gICAgfSk7XG4gICAgXG4gICAgICAgICAgLy8gU1FTIFF1ZXVlIGZvciBuZXcgdXBsb2FkcyBmcm9tIHJlYWRpbmcgbWF0ZXJpYWxzIHMzIGJ1Y2tldFxuICAgICB0aGlzLnJlYWRpbmdNYXRlcmlhbHNRdWV1ZSA9IG5ldyBzcXMuUXVldWUodGhpcywgXCJSZWFkaW5nTWF0ZXJpYWxzUXVldWVcIix7fSk7IC8vdGhpcyB0YWtlcyByZWFkaW5nbWF0ZXJpYWxzIHMzIG9iamVjdCBhbmQgcHV0cyBpdCBpbiB0aGUgcXVldWUgZm9yIHRoZSBsYW1iZGEgZnVuY3Rpb24gdG8gcHJvY2VzcyBpdFxuXG4gICAgIC8vIFNRUyBRdWV1ZSBmb3IgZXh0cmFjdGVkIHRleHQgZnJvbSB0ZXh0cmFjdCBmdW5jdGlvbiBcbiAgICAgdGhpcy5leHRyYWN0ZWRUZXh0UXVldWUgPSBuZXcgc3FzLlF1ZXVlKHRoaXMsIFwiRXh0cmFjdGVkVGV4dFF1ZXVlXCIse30pOyAvL2FmdGVyIHRoZSB0ZXh0ZXh0cmFjdGlvbiBsYW1iZGEgZnVuY3Rpb24gcHJvY2Vzc2VzIHRoZSBvYmplY3QsIGl0IHB1dHMgdGhlIHJlc3VsdCBpbiB0aGlzIHF1ZXVlIGZvciB0aGUgbmV4dCBsYW1iZGEgZnVuY3Rpb24gdG8gcHJvY2VzcyBpdFxuXG4gICAgIC8vIE5vdGlmaWNhdGlvbnMgYXJlIG5vdyBoYW5kbGVkIGluIHN0b3JhZ2Utbm90aWZpY2F0aW9ucy50c1xuXG4gICAgICAvL1N0dWRlbnRcbiAgICAgICAvLyBCdWNrZXQgZm9yIGF1ZGlvIGZpbGVzXG4gICAgICAgICAgdGhpcy5hdWRpb0ZpbGVzQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnQXVkaW9GaWxlc0J1Y2tldCcsIHtcbiAgICAgICAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICAgICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSxcbiAgICAgICAgICB9KTtcbiAgICAgIFxuICAgICAgICAgIC8vIEJ1Y2tldCBmb3IgTm92YS1nZW5lcmF0ZWQgY29udGVudFxuICAgICAgICAgIHRoaXMubm92YUNvbnRlbnRCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdOb3ZhR2VuZXJhdGVkQ29udGVudEJ1Y2tldCcsIHtcbiAgICAgICAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICAgICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSxcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIE5PVEU6IEV2ZW50IG5vdGlmaWNhdGlvbnMgZm9yIHRoZXNlIGJ1Y2tldHMgYXJlIG5vdyBoYW5kbGVkIGluIEV2ZW50Tm90aWZpY2F0aW9uc1N0YWNrXG4gICAgICAgICAgLy8gdG8gYXZvaWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzXG4gICAgICAgICAgXG5cbiAgfVxufVxuIl19