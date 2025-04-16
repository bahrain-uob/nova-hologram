"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentInfraStack = void 0;
const cdk = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const lambda = require("aws-cdk-lib/aws-lambda");
const iam = require("aws-cdk-lib/aws-iam");
const path = require("path");
class StudentInfraStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // 1. S3 bucket to store Polly audio responses
        const audioFilesBucket = new s3.Bucket(this, 'AudioFilesBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });
        // 2. WebSocket API Gateway (simplified as REST for CDK v2)
        const readerApi = new apigateway.RestApi(this, 'ReaderApi', {
            restApiName: 'Reader API',
            deployOptions: { stageName: 'dev' },
        });
        // 3. DynamoDB for Q&A storage
        const qaTable = new dynamodb.Table(this, 'QATable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        // 4. Lambda: Message processing (entry point after WebSocket)
        const messageProcessingLambda = new lambda.Function(this, 'MessageProcessingLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')), // assumes you place code in /lambda
            handler: 'messageProcessing.handler',
        });
        // 5. Lambda: Invoke Transcribe
        const transcribeLambda = new lambda.Function(this, 'TranscribeLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
            handler: 'transcribe.handler',
        });
        // 6. Lambda: Invoke Bedrock
        const invokeBedrockLambda = new lambda.Function(this, 'InvokeBedrockLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
            handler: 'invokeBedrock.handler',
            environment: {
                QATABLE_NAME: qaTable.tableName,
            },
        });
        // 7. Lambda: Trigger Polly
        const triggerPollyLambda = new lambda.Function(this, 'TriggerPollyLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
            handler: 'triggerPolly.handler',
            environment: {
                BUCKET_NAME: audioFilesBucket.bucketName,
            },
        });
        // 8. Lambda: Play response (final audio output)
        const playResponseLambda = new lambda.Function(this, 'PlayResponseLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
            handler: 'playResponse.handler',
        });
        // 9. Permissions
        audioFilesBucket.grantWrite(triggerPollyLambda);
        qaTable.grantReadWriteData(invokeBedrockLambda);
        [
            messageProcessingLambda,
            transcribeLambda,
            invokeBedrockLambda,
            triggerPollyLambda,
            playResponseLambda,
        ].forEach(fn => {
            fn.addToRolePolicy(new iam.PolicyStatement({
                actions: [
                    'transcribe:StartTranscriptionJob',
                    'polly:SynthesizeSpeech',
                    'bedrock:InvokeModel',
                    'logs:CreateLogGroup',
                    'logs:CreateLogStream',
                    'logs:PutLogEvents',
                ],
                resources: ['*'],
            }));
        });
        // 10. Hook up API Gateway to messageProcessing lambda
        const audioResource = readerApi.root.addResource('audio');
        audioResource.addMethod('POST', new apigateway.LambdaIntegration(messageProcessingLambda));
        new cdk.CfnOutput(this, 'ReaderAPIURL', { value: readerApi.url });
        new cdk.CfnOutput(this, 'QATableName', { value: qaTable.tableName });
        new cdk.CfnOutput(this, 'AudioFilesBucket', { value: audioFilesBucket.bucketName });
    }
}
exports.StudentInfraStack = StudentInfraStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2Utc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBRW5DLHlDQUF5QztBQUN6Qyx5REFBeUQ7QUFDekQscURBQXFEO0FBQ3JELGlEQUFpRDtBQUNqRCwyQ0FBMkM7QUFDM0MsNkJBQTZCO0FBRTdCLE1BQWEsaUJBQWtCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDOUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qiw4Q0FBOEM7UUFDOUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQy9ELGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsaUJBQWlCLEVBQUUsSUFBSTtTQUN4QixDQUFDLENBQUM7UUFFSCwyREFBMkQ7UUFDM0QsTUFBTSxTQUFTLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7WUFDMUQsV0FBVyxFQUFFLFlBQVk7WUFDekIsYUFBYSxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRTtTQUNwQyxDQUFDLENBQUM7UUFFSCw4QkFBOEI7UUFDOUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDbEQsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDakUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsZUFBZTtZQUNqRCxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1NBQ3pDLENBQUMsQ0FBQztR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QUNOLENBQUMsQ0FBQyxDQUFDO1FBRUgsc0RBQXNEO1FBQ3RELE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFELGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztRQUUzRixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsR0FBSSxFQUFFLENBQUMsQ0FBQztRQUNuRSxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUNyRSxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDdEYsQ0FBQztDQUNGO0FBaEdELDhDQWdHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XHJcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xyXG5pbXBvcnQgKiBhcyBzMyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xyXG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcclxuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcclxuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xyXG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG5leHBvcnQgY2xhc3MgU3R1ZGVudEluZnJhU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcclxuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG5cclxuICAgIC8vIDEuIFMzIGJ1Y2tldCB0byBzdG9yZSBQb2xseSBhdWRpbyByZXNwb25zZXNcclxuICAgIGNvbnN0IGF1ZGlvRmlsZXNCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdBdWRpb0ZpbGVzQnVja2V0Jywge1xyXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxyXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIDIuIFdlYlNvY2tldCBBUEkgR2F0ZXdheSAoc2ltcGxpZmllZCBhcyBSRVNUIGZvciBDREsgdjIpXHJcbiAgICBjb25zdCByZWFkZXJBcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdSZWFkZXJBcGknLCB7XHJcbiAgICAgIHJlc3RBcGlOYW1lOiAnUmVhZGVyIEFQSScsXHJcbiAgICAgIGRlcGxveU9wdGlvbnM6IHsgc3RhZ2VOYW1lOiAnZGV2JyB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gMy4gRHluYW1vREIgZm9yIFEmQSBzdG9yYWdlXHJcbiAgICBjb25zdCBxYVRhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdRQVRhYmxlJywge1xyXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ2lkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcclxuICAgICAgYmlsbGluZ01vZGU6IGR5bmFtb2RiLkJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVCxcclxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIDQuIExhbWJkYTogTWVzc2FnZSBwcm9jZXNzaW5nIChlbnRyeSBwb2ludCBhZnRlciBXZWJTb2NrZXQpXHJcbiAgICBjb25zdCBtZXNzYWdlUHJvY2Vzc2luZ0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ01lc3NhZ2VQcm9jZXNzaW5nTGFtYmRhJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9sYW1iZGEnKSksIC8vIGFzc3VtZXMgeW91IHBsYWNlIGNvZGUgaW4gL2xhbWJkYVxyXG4gICAgICBoYW5kbGVyOiAnbWVzc2FnZVByb2Nlc3NpbmcuaGFuZGxlcicsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyA1LiBMYW1iZGE6IEludm9rZSBUcmFuc2NyaWJlXHJcbiAgICBjb25zdCB0cmFuc2NyaWJlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnVHJhbnNjcmliZUxhbWJkYScsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vbGFtYmRhJykpLFxyXG4gICAgICBoYW5kbGVyOiAndHJhbnNjcmliZS5oYW5kbGVyJyxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIDYuIExhbWJkYTogSW52b2tlIEJlZHJvY2tcclxuICAgIGNvbnN0IGludm9rZUJlZHJvY2tMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdJbnZva2VCZWRyb2NrTGFtYmRhJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9sYW1iZGEnKSksXHJcbiAgICAgIGhhbmRsZXI6ICdpbnZva2VCZWRyb2NrLmhhbmRsZXInLFxyXG4gICAgICBlbnZpcm9ubWVudDoge1xyXG4gICAgICAgIFFBVEFCTEVfTkFNRTogcWFUYWJsZS50YWJsZU5hbWUsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyA3LiBMYW1iZGE6IFRyaWdnZXIgUG9sbHlcclxuICAgIGNvbnN0IHRyaWdnZXJQb2xseUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1RyaWdnZXJQb2xseUxhbWJkYScsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vbGFtYmRhJykpLFxyXG4gICAgICBoYW5kbGVyOiAndHJpZ2dlclBvbGx5LmhhbmRsZXInLFxyXG4gICAgICBlbnZpcm9ubWVudDoge1xyXG4gICAgICAgIEJVQ0tFVF9OQU1FOiBhdWRpb0ZpbGVzQnVja2V0LmJ1Y2tldE5hbWUsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyA4LiBMYW1iZGE6IFBsYXkgcmVzcG9uc2UgKGZpbmFsIGF1ZGlvIG91dHB1dClcclxuICAgIGNvbnN0IHBsYXlSZXNwb25zZUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1BsYXlSZXNwb25zZUxhbWJkYScsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vbGFtYmRhJykpLFxyXG4gICAgICBoYW5kbGVyOiAncGxheVJlc3BvbnNlLmhhbmRsZXInLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gOS4gUGVybWlzc2lvbnNcclxuICAgIGF1ZGlvRmlsZXNCdWNrZXQuZ3JhbnRXcml0ZSh0cmlnZ2VyUG9sbHlMYW1iZGEpO1xyXG4gICAgcWFUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoaW52b2tlQmVkcm9ja0xhbWJkYSk7XHJcblxyXG4gICAgW1xyXG4gICAgICBtZXNzYWdlUHJvY2Vzc2luZ0xhbWJkYSxcclxuICAgICAgdHJhbnNjcmliZUxhbWJkYSxcclxuICAgICAgaW52b2tlQmVkcm9ja0xhbWJkYSxcclxuICAgICAgdHJpZ2dlclBvbGx5TGFtYmRhLFxyXG4gICAgICBwbGF5UmVzcG9uc2VMYW1iZGEsXHJcbiAgICBdLmZvckVhY2goZm4gPT4ge1xyXG4gICAgICBmbi5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICAgIGFjdGlvbnM6IFtcclxuICAgICAgICAgICd0cmFuc2NyaWJlOlN0YXJ0VHJhbnNjcmlwdGlvbkpvYicsXHJcbiAgICAgICAgICAncG9sbHk6U3ludGhlc2l6ZVNwZWVjaCcsXHJcbiAgICAgICAgICAnYmVkcm9jazpJbnZva2VNb2RlbCcsXHJcbiAgICAgICAgICAnbG9nczpDcmVhdGVMb2dHcm91cCcsXHJcbiAgICAgICAgICAnbG9nczpDcmVhdGVMb2dTdHJlYW0nLFxyXG4gICAgICAgICAgJ2xvZ3M6UHV0TG9nRXZlbnRzJyxcclxuICAgICAgICBdLFxyXG4gICAgICAgIHJlc291cmNlczogWycqJ10sXHJcbiAgICAgIH0pKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIDEwLiBIb29rIHVwIEFQSSBHYXRld2F5IHRvIG1lc3NhZ2VQcm9jZXNzaW5nIGxhbWJkYVxyXG4gICAgY29uc3QgYXVkaW9SZXNvdXJjZSA9IHJlYWRlckFwaS5yb290LmFkZFJlc291cmNlKCdhdWRpbycpO1xyXG4gICAgYXVkaW9SZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihtZXNzYWdlUHJvY2Vzc2luZ0xhbWJkYSkpO1xyXG5cclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdSZWFkZXJBUElVUkwnLCB7IHZhbHVlOiByZWFkZXJBcGkudXJsISB9KTtcclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdRQVRhYmxlTmFtZScsIHsgdmFsdWU6IHFhVGFibGUudGFibGVOYW1lIH0pO1xyXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0F1ZGlvRmlsZXNCdWNrZXQnLCB7IHZhbHVlOiBhdWRpb0ZpbGVzQnVja2V0LmJ1Y2tldE5hbWUgfSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==