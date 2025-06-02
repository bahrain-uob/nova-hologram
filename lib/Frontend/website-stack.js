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
exports.FrontendStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
const s3deploy = __importStar(require("aws-cdk-lib/aws-s3-deployment"));
const cloudfront = __importStar(require("aws-cdk-lib/aws-cloudfront"));
const origins = __importStar(require("aws-cdk-lib/aws-cloudfront-origins"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
class FrontendStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // S3 Bucket for React Website (without public access)
        //Creates a private S3 bucket (not public-facing)
        this.websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
            websiteIndexDocument: "index.html",
            websiteErrorDocument: "error.html",
            removalPolicy: cdk.RemovalPolicy.DESTROY, //removalPolicy: DESTROY means it will be deleted on cdk destroy
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        });
        // Deploy React App to S3
        //So React assets go from ./frontend/build to S3 bucket
        // CloudFront Distribution for S3 bucket
        // Create an Origin Access Control for CloudFront (modern replacement for OAI)
        const cloudfrontOAC = new cloudfront.CfnOriginAccessControl(this, 'CloudFrontOAC', {
            originAccessControlConfig: {
                name: 'OAC for Website Bucket',
                originAccessControlOriginType: 's3',
                signingBehavior: 'always',
                signingProtocol: 'sigv4',
            }
        });
        // Grant CloudFront access to the S3 bucket
        this.websiteBucket.grantRead(new iam.ServicePrincipal('cloudfront.amazonaws.com'));
        // Create the CloudFront distribution using the modern Distribution class
        const cloudfrontDistribution = new cloudfront.Distribution(this, 'CloudFrontDistribution', {
            defaultBehavior: {
                origin: new origins.S3Origin(this.websiteBucket),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
            },
            defaultRootObject: 'index.html',
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html', // SPA support - redirect 404s to index.html
                }
            ],
        });
        new s3deploy.BucketDeployment(this, "DeployWebsite", {
            sources: [s3deploy.Source.asset("./frontend-next/.next")], //the place where the static files are located.
            destinationBucket: this.websiteBucket,
            distribution: cloudfrontDistribution,
            memoryLimit: 1024,
            distributionPaths: ['/*'], // This invalidates CloudFront cache
        });
        // Output the CloudFront URL for the website
        new cdk.CfnOutput(this, "CloudFrontURL", {
            value: cloudfrontDistribution.distributionDomainName,
            description: "The URL of the CloudFront distribution for the website",
        });
    }
}
exports.FrontendStack = FrontendStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vic2l0ZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndlYnNpdGUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFFbkMsdURBQXlDO0FBQ3pDLHdFQUEwRDtBQUMxRCx1RUFBeUQ7QUFDekQsNEVBQThEO0FBQzlELHlEQUEyQztBQUkzQyxNQUFhLGFBQWMsU0FBUSxHQUFHLENBQUMsS0FBSztJQUcxQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBRTlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRTVCLHNEQUFzRDtRQUNsRCxpREFBaUQ7UUFDakQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUN0RCxvQkFBb0IsRUFBRSxZQUFZO1lBQ2xDLG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLGdFQUFnRTtZQUMxRyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsU0FBUztTQUNsRCxDQUFDLENBQUM7UUFFSCx5QkFBeUI7UUFDekIsdURBQXVEO1FBR3ZELHdDQUF3QztRQUN4Qyw4RUFBOEU7UUFDOUUsTUFBTSxhQUFhLEdBQUcsSUFBSSxVQUFVLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUNqRix5QkFBeUIsRUFBRTtnQkFDekIsSUFBSSxFQUFFLHdCQUF3QjtnQkFDOUIsNkJBQTZCLEVBQUUsSUFBSTtnQkFDbkMsZUFBZSxFQUFFLFFBQVE7Z0JBQ3pCLGVBQWUsRUFBRSxPQUFPO2FBQ3pCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsMkNBQTJDO1FBQzNDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQztRQUVuRix5RUFBeUU7UUFDekUsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLFVBQVUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFO1lBQ3pGLGVBQWUsRUFBRTtnQkFDZixNQUFNLEVBQUUsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7Z0JBQ2hELG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUI7Z0JBQ3ZFLGNBQWMsRUFBRSxVQUFVLENBQUMsY0FBYyxDQUFDLGNBQWM7Z0JBQ3hELFdBQVcsRUFBRSxVQUFVLENBQUMsV0FBVyxDQUFDLGlCQUFpQjthQUN0RDtZQUNELGlCQUFpQixFQUFFLFlBQVk7WUFDL0IsY0FBYyxFQUFFO2dCQUNkO29CQUNFLFVBQVUsRUFBRSxHQUFHO29CQUNmLGtCQUFrQixFQUFFLEdBQUc7b0JBQ3ZCLGdCQUFnQixFQUFFLGFBQWEsRUFBRSw0Q0FBNEM7aUJBQzlFO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ25ELE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSwrQ0FBK0M7WUFDMUcsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGFBQWE7WUFDckMsWUFBWSxFQUFFLHNCQUFzQjtZQUNwQyxXQUFXLEVBQUUsSUFBSTtZQUNqQixpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLG9DQUFvQztTQUNoRSxDQUFDLENBQUM7UUFHSCw0Q0FBNEM7UUFDNUMsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdkMsS0FBSyxFQUFFLHNCQUFzQixDQUFDLHNCQUFzQjtZQUNwRCxXQUFXLEVBQUUsd0RBQXdEO1NBQ3RFLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDRjtBQW5FRCxzQ0FtRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0ICogYXMgczMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zM1wiO1xuaW1wb3J0ICogYXMgczNkZXBsb3kgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zMy1kZXBsb3ltZW50XCI7XG5pbXBvcnQgKiBhcyBjbG91ZGZyb250IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udFwiO1xuaW1wb3J0ICogYXMgb3JpZ2lucyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNsb3VkZnJvbnQtb3JpZ2luc1wiO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaWFtXCI7XG5cblxuXG5leHBvcnQgY2xhc3MgRnJvbnRlbmRTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gICAgcHVibGljIHJlYWRvbmx5IHdlYnNpdGVCdWNrZXQ6IHMzLkJ1Y2tldDsgLy8gRGVjbGFyZSBSZWFkaW5nTWF0ZXJpYWxzQnVja2V0IGFzIGEgcHVibGljIHByb3BlcnR5XG4gICAgcHVibGljIHJlYWRvbmx5IFJlYWRpbmdNYXRlcmlhbHM6IHMzLkJ1Y2tldDsgLy8gRGVjbGFyZSBSZWFkaW5nTWF0ZXJpYWxzIGFzIGEgcHVibGljIHByb3BlcnR5XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuLy8gUzMgQnVja2V0IGZvciBSZWFjdCBXZWJzaXRlICh3aXRob3V0IHB1YmxpYyBhY2Nlc3MpXG4gICAgLy9DcmVhdGVzIGEgcHJpdmF0ZSBTMyBidWNrZXQgKG5vdCBwdWJsaWMtZmFjaW5nKVxuICAgIHRoaXMud2Vic2l0ZUJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgXCJXZWJzaXRlQnVja2V0XCIsIHtcbiAgICAgICAgd2Vic2l0ZUluZGV4RG9jdW1lbnQ6IFwiaW5kZXguaHRtbFwiLFxuICAgICAgICB3ZWJzaXRlRXJyb3JEb2N1bWVudDogXCJlcnJvci5odG1sXCIsXG4gICAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksIC8vcmVtb3ZhbFBvbGljeTogREVTVFJPWSBtZWFucyBpdCB3aWxsIGJlIGRlbGV0ZWQgb24gY2RrIGRlc3Ryb3lcbiAgICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcbiAgICAgIH0pO1xuICBcbiAgICAgIC8vIERlcGxveSBSZWFjdCBBcHAgdG8gUzNcbiAgICAgIC8vU28gUmVhY3QgYXNzZXRzIGdvIGZyb20gLi9mcm9udGVuZC9idWlsZCB0byBTMyBidWNrZXRcbiAgXG4gIFxuICAgICAgLy8gQ2xvdWRGcm9udCBEaXN0cmlidXRpb24gZm9yIFMzIGJ1Y2tldFxuICAgICAgLy8gQ3JlYXRlIGFuIE9yaWdpbiBBY2Nlc3MgQ29udHJvbCBmb3IgQ2xvdWRGcm9udCAobW9kZXJuIHJlcGxhY2VtZW50IGZvciBPQUkpXG4gICAgICBjb25zdCBjbG91ZGZyb250T0FDID0gbmV3IGNsb3VkZnJvbnQuQ2ZuT3JpZ2luQWNjZXNzQ29udHJvbCh0aGlzLCAnQ2xvdWRGcm9udE9BQycsIHtcbiAgICAgICAgb3JpZ2luQWNjZXNzQ29udHJvbENvbmZpZzoge1xuICAgICAgICAgIG5hbWU6ICdPQUMgZm9yIFdlYnNpdGUgQnVja2V0JyxcbiAgICAgICAgICBvcmlnaW5BY2Nlc3NDb250cm9sT3JpZ2luVHlwZTogJ3MzJyxcbiAgICAgICAgICBzaWduaW5nQmVoYXZpb3I6ICdhbHdheXMnLFxuICAgICAgICAgIHNpZ25pbmdQcm90b2NvbDogJ3NpZ3Y0JyxcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIC8vIEdyYW50IENsb3VkRnJvbnQgYWNjZXNzIHRvIHRoZSBTMyBidWNrZXRcbiAgICAgIHRoaXMud2Vic2l0ZUJ1Y2tldC5ncmFudFJlYWQobmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdjbG91ZGZyb250LmFtYXpvbmF3cy5jb20nKSk7XG4gICAgICBcbiAgICAgIC8vIENyZWF0ZSB0aGUgQ2xvdWRGcm9udCBkaXN0cmlidXRpb24gdXNpbmcgdGhlIG1vZGVybiBEaXN0cmlidXRpb24gY2xhc3NcbiAgICAgIGNvbnN0IGNsb3VkZnJvbnREaXN0cmlidXRpb24gPSBuZXcgY2xvdWRmcm9udC5EaXN0cmlidXRpb24odGhpcywgJ0Nsb3VkRnJvbnREaXN0cmlidXRpb24nLCB7XG4gICAgICAgIGRlZmF1bHRCZWhhdmlvcjoge1xuICAgICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuUzNPcmlnaW4odGhpcy53ZWJzaXRlQnVja2V0KSxcbiAgICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgICAgICBhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5BbGxvd2VkTWV0aG9kcy5BTExPV19HRVRfSEVBRCxcbiAgICAgICAgICBjYWNoZVBvbGljeTogY2xvdWRmcm9udC5DYWNoZVBvbGljeS5DQUNISU5HX09QVElNSVpFRCxcbiAgICAgICAgfSxcbiAgICAgICAgZGVmYXVsdFJvb3RPYmplY3Q6ICdpbmRleC5odG1sJyxcbiAgICAgICAgZXJyb3JSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBodHRwU3RhdHVzOiA0MDQsXG4gICAgICAgICAgICByZXNwb25zZUh0dHBTdGF0dXM6IDIwMCxcbiAgICAgICAgICAgIHJlc3BvbnNlUGFnZVBhdGg6ICcvaW5kZXguaHRtbCcsIC8vIFNQQSBzdXBwb3J0IC0gcmVkaXJlY3QgNDA0cyB0byBpbmRleC5odG1sXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgfSk7XG4gIFxuICAgICAgbmV3IHMzZGVwbG95LkJ1Y2tldERlcGxveW1lbnQodGhpcywgXCJEZXBsb3lXZWJzaXRlXCIsIHtcbiAgICAgICAgc291cmNlczogW3MzZGVwbG95LlNvdXJjZS5hc3NldChcIi4vZnJvbnRlbmQtbmV4dC8ubmV4dFwiKV0sIC8vdGhlIHBsYWNlIHdoZXJlIHRoZSBzdGF0aWMgZmlsZXMgYXJlIGxvY2F0ZWQuXG4gICAgICAgIGRlc3RpbmF0aW9uQnVja2V0OiB0aGlzLndlYnNpdGVCdWNrZXQsXG4gICAgICAgIGRpc3RyaWJ1dGlvbjogY2xvdWRmcm9udERpc3RyaWJ1dGlvbixcbiAgICAgICAgbWVtb3J5TGltaXQ6IDEwMjQsXG4gICAgICAgIGRpc3RyaWJ1dGlvblBhdGhzOiBbJy8qJ10sIC8vIFRoaXMgaW52YWxpZGF0ZXMgQ2xvdWRGcm9udCBjYWNoZVxuICAgICAgfSk7XG4gIFxuICBcbiAgICAgIC8vIE91dHB1dCB0aGUgQ2xvdWRGcm9udCBVUkwgZm9yIHRoZSB3ZWJzaXRlXG4gICAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIkNsb3VkRnJvbnRVUkxcIiwge1xuICAgICAgICB2YWx1ZTogY2xvdWRmcm9udERpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25Eb21haW5OYW1lLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJUaGUgVVJMIG9mIHRoZSBDbG91ZEZyb250IGRpc3RyaWJ1dGlvbiBmb3IgdGhlIHdlYnNpdGVcIixcbiAgICAgIH0pO1xuICB9XG59XG4iXX0=