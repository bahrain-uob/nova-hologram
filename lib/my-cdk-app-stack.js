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
const aws_cdk_lib_1 = require("aws-cdk-lib");
class MyCdkStack extends cdk.Stack {
    constructor(scope, id, props) {
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
            path: '/upload',
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
        // Output the API endpoint URL
        new cdk.CfnOutput(this, 'HttpApiEndpoint', {
            value: PostGetDelete.apiEndpoint,
        });
    }
}
exports.MyCdkStack = MyCdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktY2RrLWFwcC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm15LWNkay1hcHAtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLHlDQUF5QztBQUN6QywwREFBMEQ7QUFDMUQseURBQXlEO0FBQ3pELDZEQUE2RDtBQUM3RCxpREFBaUQ7QUFFakQsMEVBQTBFO0FBRzFFLDZDQUE0QztBQUk1QyxNQUFhLFVBQVcsU0FBUSxHQUFHLENBQUMsS0FBSztJQUd2QyxZQUFZLEtBQWMsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDNUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsc0RBQXNEO1FBQ3RELGlEQUFpRDtRQUNqRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ3hELG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxhQUFhLEVBQUUsMkJBQWEsQ0FBQyxPQUFPLEVBQUUsZ0VBQWdFO1lBQ3RHLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTO1NBQ2xELENBQUMsQ0FBQztRQUVILHlCQUF5QjtRQUN6Qix1REFBdUQ7UUFHdkQsd0NBQXdDO1FBQ3hDLE1BQU0sYUFBYSxHQUFHLElBQUksVUFBVSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsOERBQThEO1FBRXZKLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsMkNBQTJDO1FBRXhGLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxVQUFVLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFO1lBQ3RHLGFBQWEsRUFBRTtnQkFDYjtvQkFDRSxjQUFjLEVBQUU7d0JBQ2QsY0FB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RUFBRSxTQUFTO1lBQ2YsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUM7WUFDdEMsV0FBVyxFQUFFLElBQUksWUFBWSxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixFQUFFLGNBQWMsQ0FBQztTQUN0RixDQUFDLENBQUM7UUFDSCx1QkFBdUI7UUFDdkIsYUFBYSxDQUFDLFNBQVMsQ0FBQztZQUN0QixJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO1lBQ3pDLFdBQVcsRUFBRSxJQUFJLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsRUFBRSxpQkFBaUIsQ0FBQztTQUM1RixDQUFDLENBQUM7UUFDSCxxQ0FBcUM7UUFDckMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBRXBELDhCQUE4QjtRQUM5QixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQ3pDLEtBQUssRUFBRSxhQUFhLENBQUMsV0FBVztTQUNqQyxDQUFDLENBQUM7SUFFTCxDQUFDO0NBQ0Y7QUEzR0QsZ0NBMkdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xyXG5pbXBvcnQgKiBhcyBzMyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXMzXCI7XHJcbmltcG9ydCAqIGFzIHMzZGVwbG95IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczMtZGVwbG95bWVudFwiO1xyXG5pbXBvcnQgKiBhcyBjbG91ZGZyb250IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udFwiO1xyXG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5djIgZnJvbSBcImF3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5djJcIjtcclxuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbGFtYmRhXCI7XHJcbmltcG9ydCAqIGFzIGR5bmFtb2RiIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGJcIjtcclxuaW1wb3J0ICogYXMgaW50ZWdyYXRpb25zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5djItaW50ZWdyYXRpb25zJztcclxuaW1wb3J0ICogYXMgc3FzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zcXMnO1xyXG5pbXBvcnQgKiBhcyBzM24gZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzLW5vdGlmaWNhdGlvbnMnO1xyXG5pbXBvcnQgeyBSZW1vdmFsUG9saWN5IH0gZnJvbSBcImF3cy1jZGstbGliXCI7XHJcblxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBNeUNka1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcclxuICBwdWJsaWMgcmVhZG9ubHkgd2Vic2l0ZUJ1Y2tldDogczMuQnVja2V0OyAvLyBEZWNsYXJlIFJlYWRpbmdNYXRlcmlhbHNCdWNrZXQgYXMgYSBwdWJsaWMgcHJvcGVydHlcclxuICBwdWJsaWMgcmVhZG9ubHkgUmVhZGluZ01hdGVyaWFsczogczMuQnVja2V0OyAvLyBEZWNsYXJlIFJlYWRpbmdNYXRlcmlhbHMgYXMgYSBwdWJsaWMgcHJvcGVydHlcclxuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkFwcCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgLy8gUzMgQnVja2V0IGZvciBSZWFjdCBXZWJzaXRlICh3aXRob3V0IHB1YmxpYyBhY2Nlc3MpXHJcbiAgICAvL0NyZWF0ZXMgYSBwcml2YXRlIFMzIGJ1Y2tldCAobm90IHB1YmxpYy1mYWNpbmcpXHJcbiAgICB0aGlzLndlYnNpdGVCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsIFwiV2Vic2l0ZUJ1Y2tldFwiLCB7XHJcbiAgICAgIHdlYnNpdGVJbmRleERvY3VtZW50OiBcImluZGV4Lmh0bWxcIixcclxuICAgICAgd2Vic2l0ZUVycm9yRG9jdW1lbnQ6IFwiZXJyb3IuaHRtbFwiLFxyXG4gICAgICByZW1vdmFsUG9saWN5OiBSZW1vdmFsUG9saWN5LkRFU1RST1ksIC8vcmVtb3ZhbFBvbGljeTogREVTVFJPWSBtZWFucyBpdCB3aWxsIGJlIGRlbGV0ZWQgb24gY2RrIGRlc3Ryb3lcclxuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIERlcGxveSBSZWFjdCBBcHAgdG8gUzNcclxuICAgIC8vU28gUmVhY3QgYXNzZXRzIGdvIGZyb20gLi9mcm9udGVuZC9idWlsZCB0byBTMyBidWNrZXRcclxuXHJcblxyXG4gICAgLy8gQ2xvdWRGcm9udCBEaXN0cmlidXRpb24gZm9yIFMzIGJ1Y2tldFxyXG4gICAgY29uc3QgY2xvdWRmcm9udE9BSSA9IG5ldyBjbG91ZGZyb250Lk9yaWdpbkFjY2Vzc0lkZW50aXR5KHRoaXMsIFwiT3JpZ2luQWNjZXNzSWRlbnRpdHlcIik7IC8vSXQgaXMgbmVlZGVkIHRvIGFjY2VzcyB0aGUgUFJJVkFURSBTMyBidWNrZXQgZnJvbSBDbG91ZEZyb250XHJcblxyXG4gICAgdGhpcy53ZWJzaXRlQnVja2V0LmdyYW50UmVhZChjbG91ZGZyb250T0FJKTsgLy8gR3JhbnQgQ2xvdWRGcm9udCBhY2Nlc3MgdG8gdGhlIFMzIGJ1Y2tldFxyXG5cclxuICAgIGNvbnN0IGNsb3VkZnJvbnREaXN0cmlidXRpb24gPSBuZXcgY2xvdWRmcm9udC5DbG91ZEZyb250V2ViRGlzdHJpYnV0aW9uKHRoaXMsIFwiQ2xvdWRGcm9udERpc3RyaWJ1dGlvblwiLCB7XHJcbiAgICAgIG9yaWdpbkNvbmZpZ3M6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzM09yaWdpblNvdXJjZToge1xyXG4gICAgICAgICAgICBzM0J1Y2tldFNvdXJjZTogdGhpcy53ZWJzaXRlQnVja2V0LFxyXG4gICAgICAgICAgICBvcmlnaW5BY2Nlc3NJZGVudGl0eTogY2xvdWRmcm9udE9BSSwgIC8vIEFzc29jaWF0ZSBPQUkgd2l0aCB0aGUgQ2xvdWRGcm9udCBkaXN0cmlidXRpb25cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBiZWhhdmlvcnM6IFt7IGlzRGVmYXVsdEJlaGF2aW9yOiB0cnVlIH1dLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBuZXcgczNkZXBsb3kuQnVja2V0RGVwbG95bWVudCh0aGlzLCBcIkRlcGxveVdlYnNpdGVcIiwge1xyXG4gICAgICBzb3VyY2VzOiBbczNkZXBsb3kuU291cmNlLmFzc2V0KFwiLi9mcm9udGVuZC9idWlsZFwiKV0sIC8vdGhlIHBsYWNlIHdoZXJlIHRoZSBzdGF0aWMgZmlsZXMgYXJlIGxvY2F0ZWQuXHJcbiAgICAgIGRlc3RpbmF0aW9uQnVja2V0OiB0aGlzLndlYnNpdGVCdWNrZXQsXHJcbiAgICAgIGRpc3RyaWJ1dGlvbjogY2xvdWRmcm9udERpc3RyaWJ1dGlvbixcclxuICAgICAgZGlzdHJpYnV0aW9uUGF0aHM6IFsnLyonXSwgLy8gVGhpcyBpbnZhbGlkYXRlcyBDbG91ZEZyb250IGNhY2hlXHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgLy8gT3V0cHV0IHRoZSBDbG91ZEZyb250IFVSTCBmb3IgdGhlIHdlYnNpdGVcclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiQ2xvdWRGcm9udFVSTFwiLCB7XHJcbiAgICAgIHZhbHVlOiBjbG91ZGZyb250RGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWUsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlRoZSBVUkwgb2YgdGhlIENsb3VkRnJvbnQgZGlzdHJpYnV0aW9uIGZvciB0aGUgd2Vic2l0ZVwiLFxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHRoaXMuUmVhZGluZ01hdGVyaWFscyA9IG5ldyBzMy5CdWNrZXQodGhpcywgXCJSZWFkaW5nTWF0ZXJpYWxzXCIsIHtcclxuICAgICAgd2Vic2l0ZUluZGV4RG9jdW1lbnQ6IFwiaW5kZXguaHRtbFwiLFxyXG4gICAgICB3ZWJzaXRlRXJyb3JEb2N1bWVudDogXCJlcnJvci5odG1sXCIsXHJcbiAgICAgIHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcclxuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCwgIC8vIEJsb2NrIHB1YmxpYyBhY2Nlc3MgdG8gdGhlIGJ1Y2tldFxyXG4gICAgfSk7XHJcbiAgICAvL1BPU1QgTGFtYmRhIChVcGxvYWQpXHJcbiAgICBjb25zdCBwb3N0VXBsb2FkTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnUG9zdFVwbG9hZExhbWJkYScsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsLy8gZXhlY3V0aW9uIGVudmlyb25tZW50XHJcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJywvLyBmaWxlIGlzIFwiaW5kZXhcIiwgZnVuY3Rpb24gaXMgXCJoYW5kbGVyXCIgICBjaGFuZ2UgdGhpcyB3aGVuIHlvdSdsbCBkbyB0aGUgZnVuY3Rpb24gaXRzZWxmXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL3Bvc3RVcGxvYWQnKSwvLyBjb2RlIGxvYWRlZCBmcm9tIFwibGFtYmRhXCIgZGlyZWN0b3J5XHJcbiAgICB9KTtcclxuICAgIC8vR0VUIExhbWJkYSAoTGlzdCBmaWxlcylcclxuICAgIGNvbnN0IGdldEZpbGVzTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnR2V0RmlsZXNMYW1iZGEnLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhL0dldEZpbGVzJyksXHJcbiAgICB9KTtcclxuICAgIC8vREVMRVRFIExhbWJkYSAoRGVsZXRlIGZpbGUpXHJcbiAgICBjb25zdCBkZWxldGVGaWxlc0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0RlbGV0ZUZpbGVzTGFtYmRhJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYS9kZWxldGVGaWxlcycpLFxyXG4gICAgfSk7XHJcbiAgICAgLy9BUEkgR2F0ZXdheSB0byBkbyB0aGUgbWV0aG9kcyBmcm9tIHRoZSBzMyB3ZWJzaXRlIGhvc3RlZCBidWNrZXRcclxuICAgICBjb25zdCBQb3N0R2V0RGVsZXRlID0gbmV3IGFwaWdhdGV3YXl2Mi5IdHRwQXBpKHRoaXMsICdIdHRwQXBpJywge1xyXG4gICAgICBhcGlOYW1lOiAnV2ViQXBwSHR0cEFwaScsXHJcbiAgICB9KTtcclxuICAgIC8vIEFkZCByb3V0ZSBmb3IgdXBsb2FkIFxyXG4gICAgUG9zdEdldERlbGV0ZS5hZGRSb3V0ZXMoe1xyXG4gICAgICBwYXRoOiAnL3VwbG9hZCcsXHJcbiAgICAgIG1ldGhvZHM6IFthcGlnYXRld2F5djIuSHR0cE1ldGhvZC5QT1NUXSxcclxuICAgICAgaW50ZWdyYXRpb246IG5ldyBpbnRlZ3JhdGlvbnMuSHR0cExhbWJkYUludGVncmF0aW9uKCdQb3N0SW50ZWdyYXRpb24nLCBwb3N0VXBsb2FkTGFtYmRhKSxcclxuICAgIH0pO1xyXG4gICAgLy9BZGQgcm91dGUgZm9yIGdldCBcclxuICAgIFBvc3RHZXREZWxldGUuYWRkUm91dGVzKHtcclxuICAgICAgcGF0aDogJy91cGxvYWQnLFxyXG4gICAgICBtZXRob2RzOiBbYXBpZ2F0ZXdheXYyLkh0dHBNZXRob2QuR0VUXSxcclxuICAgICAgaW50ZWdyYXRpb246IG5ldyBpbnRlZ3JhdGlvbnMuSHR0cExhbWJkYUludGVncmF0aW9uKCdHZXRJbnRlZ3JhdGlvbicsIGdldEZpbGVzTGFtYmRhKSxcclxuICAgIH0pO1xyXG4gICAgLy8gQWRkIHJvdXRlIGZvciBkZWxldGVcclxuICAgIFBvc3RHZXREZWxldGUuYWRkUm91dGVzKHtcclxuICAgICAgcGF0aDogJy91cGxvYWQnLFxyXG4gICAgICBtZXRob2RzOiBbYXBpZ2F0ZXdheXYyLkh0dHBNZXRob2QuREVMRVRFXSxcclxuICAgICAgaW50ZWdyYXRpb246IG5ldyBpbnRlZ3JhdGlvbnMuSHR0cExhbWJkYUludGVncmF0aW9uKCdEZWxldGVJbnRlZ3JhdGlvbicsIGRlbGV0ZUZpbGVzTGFtYmRhKSxcclxuICAgIH0pO1xyXG4gICAgLy9naXZpbmcgbGFtYmRhIGZ1bmN0aW9ucyBwZXJtaXNzaW9uc1xyXG4gICAgdGhpcy5SZWFkaW5nTWF0ZXJpYWxzLmdyYW50UmVhZFdyaXRlKHBvc3RVcGxvYWRMYW1iZGEpO1xyXG4gICAgdGhpcy5SZWFkaW5nTWF0ZXJpYWxzLmdyYW50UmVhZChnZXRGaWxlc0xhbWJkYSk7XHJcbiAgICB0aGlzLlJlYWRpbmdNYXRlcmlhbHMuZ3JhbnRXcml0ZShkZWxldGVGaWxlc0xhbWJkYSk7XHJcblxyXG4gICAgLy8gT3V0cHV0IHRoZSBBUEkgZW5kcG9pbnQgVVJMXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnSHR0cEFwaUVuZHBvaW50Jywge1xyXG4gICAgICB2YWx1ZTogUG9zdEdldERlbGV0ZS5hcGlFbmRwb2ludCxcclxuICAgIH0pO1xyXG5cclxuICB9XHJcbn1cclxuXHJcbiJdfQ==