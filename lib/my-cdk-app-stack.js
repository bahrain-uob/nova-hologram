"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyCdkStack = void 0;
const cdk = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");
const s3deploy = require("aws-cdk-lib/aws-s3-deployment");
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const apigatewayv2 = require("aws-cdk-lib/aws-apigatewayv2");
const lambda = require("aws-cdk-lib/aws-lambda");
const integrations = require("aws-cdk-lib/aws-apigatewayv2-integrations");
const sqs = require("aws-cdk-lib/aws-sqs");
const s3n = require("aws-cdk-lib/aws-s3-notifications");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const lambdaEventSources = require("aws-cdk-lib/aws-lambda-event-sources");
class MyCdkStack extends cdk.Stack {
    constructor(scope, id, dbStack, props) {
        super(scope, id, props);
        // S3 Bucket for React Website (without public access)
        //Creates a private S3 bucket (not public-facing)
        this.websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
            websiteIndexDocument: "index.html",
            websiteErrorDocument: "error.html",
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY, //removalPolicy: DESTROY means it will be deleted on cdk destroy
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        });
        // Deploy React App to S3
        //So React assets go from ./frontend/build to S3 bucket
        // CloudFront Distribution for S3 bucket
        const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, "OriginAccessIdentity"); //It is needed to access the PRIVATE S3 bucket from CloudFront
        this.websiteBucket.grantRead(cloudfrontOAI); // Grant CloudFront access to the S3 bucket
        const cloudfrontDistribution = new cloudfront.CloudFrontWebDistribution(this, "CloudFrontDistribution", {
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: this.websiteBucket,
                        originAccessIdentity: cloudfrontOAI, // Associate OAI with the CloudFront distribution
                    },
                    behaviors: [{ isDefaultBehavior: true }],
                },
            ],
        });
        new s3deploy.BucketDeployment(this, "DeployWebsite", {
            sources: [s3deploy.Source.asset("./frontend/build")], //the place where the static files are located.
            destinationBucket: this.websiteBucket,
            distribution: cloudfrontDistribution,
            distributionPaths: ['/*'], // This invalidates CloudFront cache
        });
        // Output the CloudFront URL for the website
        new cdk.CfnOutput(this, "CloudFrontURL", {
            value: cloudfrontDistribution.distributionDomainName,
            description: "The URL of the CloudFront distribution for the website",
        });
        this.ReadingMaterials = new s3.Bucket(this, "ReadingMaterials", {
            websiteIndexDocument: "index.html",
            websiteErrorDocument: "error.html",
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Block public access to the bucket
        });
        //POST Lambda (Upload)
        const postUploadLambda = new lambda.Function(this, 'PostUploadLambda', {
            runtime: lambda.Runtime.NODEJS_18_X, // execution environment
            handler: 'index.handler', // file is "index", function is "handler"   change this when you'll do the function itself
            code: lambda.Code.fromAsset('lambda/postUpload'), // code loaded from "lambda" directory
        });
        //GET Lambda (List files)
        const getFilesLambda = new lambda.Function(this, 'GetFilesLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda/GetFiles'),
        });
        //DELETE Lambda (Delete file)
        const deleteFilesLambda = new lambda.Function(this, 'DeleteFilesLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda/deleteFiles'),
        });
        //API Gateway to do the methods from the s3 website hosted bucket
        const PostGetDelete = new apigatewayv2.HttpApi(this, 'HttpApi', {
            apiName: 'WebAppHttpApi',
        });
        // Add route for upload 
        PostGetDelete.addRoutes({
            path: '/upload', //path of the api gateway url for example https://api-id.execute-api.region.amazonaws.com/upload
            methods: [apigatewayv2.HttpMethod.POST],
            integration: new integrations.HttpLambdaIntegration('PostIntegration', postUploadLambda),
        });
        //Add route for get 
        PostGetDelete.addRoutes({
            path: '/upload',
            methods: [apigatewayv2.HttpMethod.GET],
            integration: new integrations.HttpLambdaIntegration('GetIntegration', getFilesLambda),
        });
        // Add route for delete
        PostGetDelete.addRoutes({
            path: '/upload',
            methods: [apigatewayv2.HttpMethod.DELETE],
            integration: new integrations.HttpLambdaIntegration('DeleteIntegration', deleteFilesLambda),
        });
        //giving lambda functions permissions
        this.ReadingMaterials.grantReadWrite(postUploadLambda);
        this.ReadingMaterials.grantRead(getFilesLambda);
        this.ReadingMaterials.grantWrite(deleteFilesLambda);
        // Output the API endpoint URL example: https://api-id.execute-api.region.amazonaws.com
        new cdk.CfnOutput(this, 'HttpApiEndpoint', {
            value: PostGetDelete.apiEndpoint,
        });
        // SQS Queue for new uploads from reading materials s3 bucket
        const readingMaterialsQueue = new sqs.Queue(this, "ReadingMaterialsQueue", {}); //this takes readingmaterials s3 object and puts it in the queue for the lambda function to process it
        // SQS Queue for extracted text from textract function 
        const extractedTextQueue = new sqs.Queue(this, "ExtractedTextQueue", {}); //after the textextraction lambda function processes the object, it puts the result in this queue for the next lambda function to process it
        // trigger the SQS readingmaterialsQueue when a new object is created in the ReadingMaterials s3 bucket
        this.ReadingMaterials.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.SqsDestination(readingMaterialsQueue));
        // This is the lambda function that will have the aws textract code to extract text  from object (pdf, epub and word for example)
        const textExtractionLambda = new lambda.Function(this, 'TextExtractionLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda/TextExtraction'), //location of the folder that should have the text extracted object 
            environment: {
                OUTPUT_QUEUE_URL: extractedTextQueue.queueUrl,
            },
        });
        // Permissions
        readingMaterialsQueue.grantConsumeMessages(textExtractionLambda);
        this.ReadingMaterials.grantRead(textExtractionLambda);
        extractedTextQueue.grantSendMessages(textExtractionLambda);
        const saveExtractedTextLambda = new lambda.Function(this, 'SaveExtractedTextLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda/SaveExtractedText'), //responsible for saving the extracted text to the DynamoDB table
        });
        // Permissions
        extractedTextQueue.grantConsumeMessages(saveExtractedTextLambda); //this permission will allow lambda function to consume the messages from the extractedTextQueue
        dbStack.extractedTextTable.grantWriteData(saveExtractedTextLambda); //this permission will allow lambda function to write the extracted text to the DynamoDB table
        saveExtractedTextLambda.addEventSource(new lambdaEventSources.SqsEventSource(extractedTextQueue)); //
    }
}
exports.MyCdkStack = MyCdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktY2RrLWFwcC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm15LWNkay1hcHAtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLHlDQUF5QztBQUN6QywwREFBMEQ7QUFDMUQseURBQXlEO0FBQ3pELDZEQUE2RDtBQUM3RCxpREFBaUQ7QUFDakQsMEVBQTBFO0FBQzFFLDJDQUEyQztBQUMzQyx3REFBd0Q7QUFDeEQsNkNBQTRDO0FBRTVDLDJFQUEyRTtBQUszRSxNQUFhLFVBQVcsU0FBUSxHQUFHLENBQUMsS0FBSztJQUd2QyxZQUFZLEtBQWMsRUFBRSxFQUFVLEVBQUMsT0FBZ0IsRUFBRSxLQUFzQjtRQUM3RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixzREFBc0Q7UUFDdEQsaURBQWlEO1FBQ2pELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDeEQsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxvQkFBb0IsRUFBRSxZQUFZO1lBQ2xDLGFBQWEsRUFBRSwyQkFBYSxDQUFDLE9BQU8sRUFBRSxnRUFBZ0U7WUFDdEcsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFNBQVM7U0FDbEQsQ0FBQyxDQUFDO1FBRUgseUJBQXlCO1FBQ3pCLHVEQUF1RDtRQUd2RCx3Q0FBd0M7UUFDeEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxVQUFVLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLHNCQUFzQixDQUFDLENBQUMsQ0FBQyw4REFBOEQ7UUFFdkosSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQywyQ0FBMkM7UUFFeEYsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVB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QUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyw4RkFBOEY7UUFDbEssdUJBQXVCLENBQUMsY0FBYyxDQUFDLElBQUksa0JBQWtCLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFTdkcsQ0FBQztDQUNGO0FBMUpELGdDQTBKQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcclxuaW1wb3J0ICogYXMgczMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zM1wiO1xyXG5pbXBvcnQgKiBhcyBzM2RlcGxveSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXMzLWRlcGxveW1lbnRcIjtcclxuaW1wb3J0ICogYXMgY2xvdWRmcm9udCBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNsb3VkZnJvbnRcIjtcclxuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheXYyIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheXYyXCI7XHJcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxhbWJkYVwiO1xyXG5pbXBvcnQgKiBhcyBpbnRlZ3JhdGlvbnMgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXl2Mi1pbnRlZ3JhdGlvbnMnO1xyXG5pbXBvcnQgKiBhcyBzcXMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNxcyc7XHJcbmltcG9ydCAqIGFzIHMzbiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMtbm90aWZpY2F0aW9ucyc7XHJcbmltcG9ydCB7IFJlbW92YWxQb2xpY3kgfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcclxuaW1wb3J0IHsgREJTdGFjayB9IGZyb20gXCIuL0RCc3RhY2tcIjsgLy8gSW1wb3J0IERCU3RhY2tcclxuaW1wb3J0ICogYXMgbGFtYmRhRXZlbnRTb3VyY2VzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEtZXZlbnQtc291cmNlcyc7XHJcblxyXG5cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgTXlDZGtTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XHJcbiAgcHVibGljIHJlYWRvbmx5IHdlYnNpdGVCdWNrZXQ6IHMzLkJ1Y2tldDsgLy8gRGVjbGFyZSBSZWFkaW5nTWF0ZXJpYWxzQnVja2V0IGFzIGEgcHVibGljIHByb3BlcnR5XHJcbiAgcHVibGljIHJlYWRvbmx5IFJlYWRpbmdNYXRlcmlhbHM6IHMzLkJ1Y2tldDsgLy8gRGVjbGFyZSBSZWFkaW5nTWF0ZXJpYWxzIGFzIGEgcHVibGljIHByb3BlcnR5XHJcbiAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5BcHAsIGlkOiBzdHJpbmcsZGJTdGFjazogREJTdGFjaywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgLy8gUzMgQnVja2V0IGZvciBSZWFjdCBXZWJzaXRlICh3aXRob3V0IHB1YmxpYyBhY2Nlc3MpXHJcbiAgICAvL0NyZWF0ZXMgYSBwcml2YXRlIFMzIGJ1Y2tldCAobm90IHB1YmxpYy1mYWNpbmcpXHJcbiAgICB0aGlzLndlYnNpdGVCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsIFwiV2Vic2l0ZUJ1Y2tldFwiLCB7XHJcbiAgICAgIHdlYnNpdGVJbmRleERvY3VtZW50OiBcImluZGV4Lmh0bWxcIixcclxuICAgICAgd2Vic2l0ZUVycm9yRG9jdW1lbnQ6IFwiZXJyb3IuaHRtbFwiLFxyXG4gICAgICByZW1vdmFsUG9saWN5OiBSZW1vdmFsUG9saWN5LkRFU1RST1ksIC8vcmVtb3ZhbFBvbGljeTogREVTVFJPWSBtZWFucyBpdCB3aWxsIGJlIGRlbGV0ZWQgb24gY2RrIGRlc3Ryb3lcclxuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIERlcGxveSBSZWFjdCBBcHAgdG8gUzNcclxuICAgIC8vU28gUmVhY3QgYXNzZXRzIGdvIGZyb20gLi9mcm9udGVuZC9idWlsZCB0byBTMyBidWNrZXRcclxuXHJcblxyXG4gICAgLy8gQ2xvdWRGcm9udCBEaXN0cmlidXRpb24gZm9yIFMzIGJ1Y2tldFxyXG4gICAgY29uc3QgY2xvdWRmcm9udE9BSSA9IG5ldyBjbG91ZGZyb250Lk9yaWdpbkFjY2Vzc0lkZW50aXR5KHRoaXMsIFwiT3JpZ2luQWNjZXNzSWRlbnRpdHlcIik7IC8vSXQgaXMgbmVlZGVkIHRvIGFjY2VzcyB0aGUgUFJJVkFURSBTMyBidWNrZXQgZnJvbSBDbG91ZEZyb250XHJcblxyXG4gICAgdGhpcy53ZWJzaXRlQnVja2V0LmdyYW50UmVhZChjbG91ZGZyb250T0FJKTsgLy8gR3JhbnQgQ2xvdWRGcm9udCBhY2Nlc3MgdG8gdGhlIFMzIGJ1Y2tldFxyXG5cclxuICAgIGNvbnN0IGNsb3VkZnJvbnREaXN0cmlidXRpb24gPSBuZXcgY2xvdWRmcm9udC5DbG91ZEZyb250V2ViRGlzdHJpYnV0aW9uKHRoaXMsIFwiQ2xvdWRGcm9udERpc3RyaWJ1dGlvblwiLCB7XHJcbiAgICAgIG9yaWdpbkNvbmZpZ3M6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzM09yaWdpblNvdXJjZToge1xyXG4gICAgICAgICAgICBzM0J1Y2tldFNvdXJjZTogdGhpcy53ZWJzaXRlQnVja2V0LFxyXG4gICAgICAgICAgICBvcmlnaW5BY2Nlc3NJZGVudGl0eTogY2xvdWRmcm9udE9BSSwgIC8vIEFzc29jaWF0ZSBPQUkgd2l0aCB0aGUgQ2xvdWRGcm9udCBkaXN0cmlidXRpb25cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBiZWhhdmlvcnM6IFt7IGlzRGVmYXVsdEJlaGF2aW9yOiB0cnVlIH1dLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBuZXcgczNkZXBsb3kuQnVja2V0RGVwbG95bWVudCh0aGlzLCBcIkRlcGxveVdlYnNpdGVcIiwge1xyXG4gICAgICBzb3VyY2VzOiBbczNkZXBsb3kuU291cmNlLmFzc2V0KFwiLi9mcm9udGVuZC9idWlsZFwiKV0sIC8vdGhlIHBsYWNlIHdoZXJlIHRoZSBzdGF0aWMgZmlsZXMgYXJlIGxvY2F0ZWQuXHJcbiAgICAgIGRlc3RpbmF0aW9uQnVja2V0OiB0aGlzLndlYnNpdGVCdWNrZXQsXHJcbiAgICAgIGRpc3RyaWJ1dGlvbjogY2xvdWRmcm9udERpc3RyaWJ1dGlvbixcclxuICAgICAgZGlzdHJpYnV0aW9uUGF0aHM6IFsnLyonXSwgLy8gVGhpcyBpbnZhbGlkYXRlcyBDbG91ZEZyb250IGNhY2hlXHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgLy8gT3V0cHV0IHRoZSBDbG91ZEZyb250IFVSTCBmb3IgdGhlIHdlYnNpdGVcclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiQ2xvdWRGcm9udFVSTFwiLCB7XHJcbiAgICAgIHZhbHVlOiBjbG91ZGZyb250RGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWUsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlRoZSBVUkwgb2YgdGhlIENsb3VkRnJvbnQgZGlzdHJpYnV0aW9uIGZvciB0aGUgd2Vic2l0ZVwiLFxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHRoaXMuUmVhZGluZ01hdGVyaWFscyA9IG5ldyBzMy5CdWNrZXQodGhpcywgXCJSZWFkaW5nTWF0ZXJpYWxzXCIsIHtcclxuICAgICAgd2Vic2l0ZUluZGV4RG9jdW1lbnQ6IFwiaW5kZXguaHRtbFwiLFxyXG4gICAgICB3ZWJzaXRlRXJyb3JEb2N1bWVudDogXCJlcnJvci5odG1sXCIsXHJcbiAgICAgIHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcclxuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCwgIC8vIEJsb2NrIHB1YmxpYyBhY2Nlc3MgdG8gdGhlIGJ1Y2tldFxyXG4gICAgfSk7XHJcbiAgICAvL1BPU1QgTGFtYmRhIChVcGxvYWQpXHJcbiAgICBjb25zdCBwb3N0VXBsb2FkTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnUG9zdFVwbG9hZExhbWJkYScsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsLy8gZXhlY3V0aW9uIGVudmlyb25tZW50XHJcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJywvLyBmaWxlIGlzIFwiaW5kZXhcIiwgZnVuY3Rpb24gaXMgXCJoYW5kbGVyXCIgICBjaGFuZ2UgdGhpcyB3aGVuIHlvdSdsbCBkbyB0aGUgZnVuY3Rpb24gaXRzZWxmXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL3Bvc3RVcGxvYWQnKSwvLyBjb2RlIGxvYWRlZCBmcm9tIFwibGFtYmRhXCIgZGlyZWN0b3J5XHJcbiAgICB9KTtcclxuICAgIC8vR0VUIExhbWJkYSAoTGlzdCBmaWxlcylcclxuICAgIGNvbnN0IGdldEZpbGVzTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnR2V0RmlsZXNMYW1iZGEnLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL0dldEZpbGVzJyksXHJcbiAgICB9KTtcclxuICAgIC8vREVMRVRFIExhbWJkYSAoRGVsZXRlIGZpbGUpXHJcbiAgICBjb25zdCBkZWxldGVGaWxlc0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0RlbGV0ZUZpbGVzTGFtYmRhJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYS9kZWxldGVGaWxlcycpLFxyXG4gICAgfSk7XHJcbiAgICAgLy9BUEkgR2F0ZXdheSB0byBkbyB0aGUgbWV0aG9kcyBmcm9tIHRoZSBzMyB3ZWJzaXRlIGhvc3RlZCBidWNrZXRcclxuICAgICBjb25zdCBQb3N0R2V0RGVsZXRlID0gbmV3IGFwaWdhdGV3YXl2Mi5IdHRwQXBpKHRoaXMsICdIdHRwQXBpJywge1xyXG4gICAgICBhcGlOYW1lOiAnV2ViQXBwSHR0cEFwaScsXHJcbiAgICB9KTtcclxuICAgIC8vIEFkZCByb3V0ZSBmb3IgdXBsb2FkIFxyXG4gICAgUG9zdEdldERlbGV0ZS5hZGRSb3V0ZXMoe1xyXG4gICAgICBwYXRoOiAnL3VwbG9hZCcsIC8vcGF0aCBvZiB0aGUgYXBpIGdhdGV3YXkgdXJsIGZvciBleGFtcGxlIGh0dHBzOi8vYXBpLWlkLmV4ZWN1dGUtYXBpLnJlZ2lvbi5hbWF6b25hd3MuY29tL3VwbG9hZFxyXG4gICAgICBtZXRob2RzOiBbYXBpZ2F0ZXdheXYyLkh0dHBNZXRob2QuUE9TVF0sXHJcbiAgICAgIGludGVncmF0aW9uOiBuZXcgaW50ZWdyYXRpb25zLkh0dHBMYW1iZGFJbnRlZ3JhdGlvbignUG9zdEludGVncmF0aW9uJywgcG9zdFVwbG9hZExhbWJkYSksXHJcbiAgICB9KTtcclxuICAgIC8vQWRkIHJvdXRlIGZvciBnZXQgXHJcbiAgICBQb3N0R2V0RGVsZXRlLmFkZFJvdXRlcyh7XHJcbiAgICAgIHBhdGg6ICcvdXBsb2FkJyxcclxuICAgICAgbWV0aG9kczogW2FwaWdhdGV3YXl2Mi5IdHRwTWV0aG9kLkdFVF0sXHJcbiAgICAgIGludGVncmF0aW9uOiBuZXcgaW50ZWdyYXRpb25zLkh0dHBMYW1iZGFJbnRlZ3JhdGlvbignR2V0SW50ZWdyYXRpb24nLCBnZXRGaWxlc0xhbWJkYSksXHJcbiAgICB9KTtcclxuICAgIC8vIEFkZCByb3V0ZSBmb3IgZGVsZXRlXHJcbiAgICBQb3N0R2V0RGVsZXRlLmFkZFJvdXRlcyh7XHJcbiAgICAgIHBhdGg6ICcvdXBsb2FkJyxcclxuICAgICAgbWV0aG9kczogW2FwaWdhdGV3YXl2Mi5IdHRwTWV0aG9kLkRFTEVURV0sXHJcbiAgICAgIGludGVncmF0aW9uOiBuZXcgaW50ZWdyYXRpb25zLkh0dHBMYW1iZGFJbnRlZ3JhdGlvbignRGVsZXRlSW50ZWdyYXRpb24nLCBkZWxldGVGaWxlc0xhbWJkYSksXHJcbiAgICB9KTtcclxuICAgIC8vZ2l2aW5nIGxhbWJkYSBmdW5jdGlvbnMgcGVybWlzc2lvbnNcclxuICAgIHRoaXMuUmVhZGluZ01hdGVyaWFscy5ncmFudFJlYWRXcml0ZShwb3N0VXBsb2FkTGFtYmRhKTtcclxuICAgIHRoaXMuUmVhZGluZ01hdGVyaWFscy5ncmFudFJlYWQoZ2V0RmlsZXNMYW1iZGEpO1xyXG4gICAgdGhpcy5SZWFkaW5nTWF0ZXJpYWxzLmdyYW50V3JpdGUoZGVsZXRlRmlsZXNMYW1iZGEpO1xyXG5cclxuICAgIC8vIE91dHB1dCB0aGUgQVBJIGVuZHBvaW50IFVSTCBleGFtcGxlOiBodHRwczovL2FwaS1pZC5leGVjdXRlLWFwaS5yZWdpb24uYW1hem9uYXdzLmNvbVxyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0h0dHBBcGlFbmRwb2ludCcsIHtcclxuICAgICAgdmFsdWU6IFBvc3RHZXREZWxldGUuYXBpRW5kcG9pbnQsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTUVMgUXVldWUgZm9yIG5ldyB1cGxvYWRzIGZyb20gcmVhZGluZyBtYXRlcmlhbHMgczMgYnVja2V0XHJcbiAgICBjb25zdCByZWFkaW5nTWF0ZXJpYWxzUXVldWUgPSBuZXcgc3FzLlF1ZXVlKHRoaXMsIFwiUmVhZGluZ01hdGVyaWFsc1F1ZXVlXCIse30pOyAvL3RoaXMgdGFrZXMgcmVhZGluZ21hdGVyaWFscyBzMyBvYmplY3QgYW5kIHB1dHMgaXQgaW4gdGhlIHF1ZXVlIGZvciB0aGUgbGFtYmRhIGZ1bmN0aW9uIHRvIHByb2Nlc3MgaXRcclxuXHJcbiAgICAvLyBTUVMgUXVldWUgZm9yIGV4dHJhY3RlZCB0ZXh0IGZyb20gdGV4dHJhY3QgZnVuY3Rpb24gXHJcbiAgICBjb25zdCBleHRyYWN0ZWRUZXh0UXVldWUgPSBuZXcgc3FzLlF1ZXVlKHRoaXMsIFwiRXh0cmFjdGVkVGV4dFF1ZXVlXCIse30pOyAvL2FmdGVyIHRoZSB0ZXh0ZXh0cmFjdGlvbiBsYW1iZGEgZnVuY3Rpb24gcHJvY2Vzc2VzIHRoZSBvYmplY3QsIGl0IHB1dHMgdGhlIHJlc3VsdCBpbiB0aGlzIHF1ZXVlIGZvciB0aGUgbmV4dCBsYW1iZGEgZnVuY3Rpb24gdG8gcHJvY2VzcyBpdFxyXG5cclxuICAgIC8vIHRyaWdnZXIgdGhlIFNRUyByZWFkaW5nbWF0ZXJpYWxzUXVldWUgd2hlbiBhIG5ldyBvYmplY3QgaXMgY3JlYXRlZCBpbiB0aGUgUmVhZGluZ01hdGVyaWFscyBzMyBidWNrZXRcclxuICAgIHRoaXMuUmVhZGluZ01hdGVyaWFscy5hZGRFdmVudE5vdGlmaWNhdGlvbihcclxuICAgICAgczMuRXZlbnRUeXBlLk9CSkVDVF9DUkVBVEVELFxyXG4gICAgICBuZXcgczNuLlNxc0Rlc3RpbmF0aW9uKHJlYWRpbmdNYXRlcmlhbHNRdWV1ZSlcclxuICAgICk7XHJcblxyXG4gICAgLy8gVGhpcyBpcyB0aGUgbGFtYmRhIGZ1bmN0aW9uIHRoYXQgd2lsbCBoYXZlIHRoZSBhd3MgdGV4dHJhY3QgY29kZSB0byBleHRyYWN0IHRleHQgIGZyb20gb2JqZWN0IChwZGYsIGVwdWIgYW5kIHdvcmQgZm9yIGV4YW1wbGUpXHJcbiAgICBjb25zdCB0ZXh0RXh0cmFjdGlvbkxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1RleHRFeHRyYWN0aW9uTGFtYmRhJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYS9UZXh0RXh0cmFjdGlvbicpLCAvL2xvY2F0aW9uIG9mIHRoZSBmb2xkZXIgdGhhdCBzaG91bGQgaGF2ZSB0aGUgdGV4dCBleHRyYWN0ZWQgb2JqZWN0IFxyXG4gICAgICBlbnZpcm9ubWVudDoge1xyXG4gICAgICAgIE9VVFBVVF9RVUVVRV9VUkw6IGV4dHJhY3RlZFRleHRRdWV1ZS5xdWV1ZVVybCxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICAvLyBQZXJtaXNzaW9uc1xyXG4gICAgcmVhZGluZ01hdGVyaWFsc1F1ZXVlLmdyYW50Q29uc3VtZU1lc3NhZ2VzKHRleHRFeHRyYWN0aW9uTGFtYmRhKTtcclxuICAgIHRoaXMuUmVhZGluZ01hdGVyaWFscy5ncmFudFJlYWQodGV4dEV4dHJhY3Rpb25MYW1iZGEpO1xyXG4gICAgZXh0cmFjdGVkVGV4dFF1ZXVlLmdyYW50U2VuZE1lc3NhZ2VzKHRleHRFeHRyYWN0aW9uTGFtYmRhKTtcclxuXHJcbiAgICBjb25zdCBzYXZlRXh0cmFjdGVkVGV4dExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1NhdmVFeHRyYWN0ZWRUZXh0TGFtYmRhJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYS9TYXZlRXh0cmFjdGVkVGV4dCcpLCAvL3Jlc3BvbnNpYmxlIGZvciBzYXZpbmcgdGhlIGV4dHJhY3RlZCB0ZXh0IHRvIHRoZSBEeW5hbW9EQiB0YWJsZVxyXG4gICAgfSk7XHJcbiAgICBcclxuXHJcbiAgICBcclxuICAgIC8vIFBlcm1pc3Npb25zXHJcbiAgICBleHRyYWN0ZWRUZXh0UXVldWUuZ3JhbnRDb25zdW1lTWVzc2FnZXMoc2F2ZUV4dHJhY3RlZFRleHRMYW1iZGEpOy8vdGhpcyBwZXJtaXNzaW9uIHdpbGwgYWxsb3cgbGFtYmRhIGZ1bmN0aW9uIHRvIGNvbnN1bWUgdGhlIG1lc3NhZ2VzIGZyb20gdGhlIGV4dHJhY3RlZFRleHRRdWV1ZVxyXG4gICAgZGJTdGFjay5leHRyYWN0ZWRUZXh0VGFibGUuZ3JhbnRXcml0ZURhdGEoc2F2ZUV4dHJhY3RlZFRleHRMYW1iZGEpOyAvL3RoaXMgcGVybWlzc2lvbiB3aWxsIGFsbG93IGxhbWJkYSBmdW5jdGlvbiB0byB3cml0ZSB0aGUgZXh0cmFjdGVkIHRleHQgdG8gdGhlIER5bmFtb0RCIHRhYmxlXHJcbiAgICBzYXZlRXh0cmFjdGVkVGV4dExhbWJkYS5hZGRFdmVudFNvdXJjZShuZXcgbGFtYmRhRXZlbnRTb3VyY2VzLlNxc0V2ZW50U291cmNlKGV4dHJhY3RlZFRleHRRdWV1ZSkpOyAvL1xyXG5cclxuICAgIFxyXG5cclxuXHJcbiAgICBcclxuXHJcbiAgICBcclxuXHJcbiAgfVxyXG59XHJcblxyXG5cclxuXHJcblxyXG4iXX0=