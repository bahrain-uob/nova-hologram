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
            sources: [s3deploy.Source.asset("./frontend-next/.next")], //the place where the static files are located.
            destinationBucket: this.websiteBucket,
            distribution: cloudfrontDistribution,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vic2l0ZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndlYnNpdGUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFFbkMsdURBQXlDO0FBQ3pDLHdFQUEwRDtBQUMxRCx1RUFBeUQ7QUFJekQsTUFBYSxhQUFjLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFHMUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUU5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUU1QixzREFBc0Q7UUFDbEQsaURBQWlEO1FBQ2pELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdEQsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxvQkFBb0IsRUFBRSxZQUFZO1lBQ2xDLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxnRUFBZ0U7WUFDMUcsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFNBQVM7U0FDbEQsQ0FBQyxDQUFDO1FBRUgseUJBQXlCO1FBQ3pCLHVEQUF1RDtRQUd2RCx3Q0FBd0M7UUFDeEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxVQUFVLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLHNCQUFzQixDQUFDLENBQUMsQ0FBQyw4REFBOEQ7UUFFdkosSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQywyQ0FBMkM7UUFFeEYsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUU7WUFDdEcsYUFBYSxFQUFFO2dCQUNiO29CQUNFLGNBQWMsRUFBRTt3QkFDZCxjQUFjLEVBQUUsSUFBSSxDQUFDLGFBQWE7d0JBQ2xDLG9CQUFvQixFQUFFLGFBQWEsRUFBRyxpREFBaUQ7cUJBQ3hGO29CQUNELFNBQVMsRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUM7aUJBQ3pDO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ25ELE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSwrQ0FBK0M7WUFDMUcsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGFBQWE7WUFDckMsWUFBWSxFQUFFLHNCQUFzQjtZQUNwQyxpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLG9DQUFvQztTQUNoRSxDQUFDLENBQUM7UUFHSCw0Q0FBNEM7UUFDNUMsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdkMsS0FBSyxFQUFFLHNCQUFzQixDQUFDLHNCQUFzQjtZQUNwRCxXQUFXLEVBQUUsd0RBQXdEO1NBQ3RFLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDRjtBQW5ERCxzQ0FtREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0ICogYXMgczMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zM1wiO1xuaW1wb3J0ICogYXMgczNkZXBsb3kgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zMy1kZXBsb3ltZW50XCI7XG5pbXBvcnQgKiBhcyBjbG91ZGZyb250IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udFwiO1xuXG5cblxuZXhwb3J0IGNsYXNzIEZyb250ZW5kU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICAgIHB1YmxpYyByZWFkb25seSB3ZWJzaXRlQnVja2V0OiBzMy5CdWNrZXQ7IC8vIERlY2xhcmUgUmVhZGluZ01hdGVyaWFsc0J1Y2tldCBhcyBhIHB1YmxpYyBwcm9wZXJ0eVxuICAgIHB1YmxpYyByZWFkb25seSBSZWFkaW5nTWF0ZXJpYWxzOiBzMy5CdWNrZXQ7IC8vIERlY2xhcmUgUmVhZGluZ01hdGVyaWFscyBhcyBhIHB1YmxpYyBwcm9wZXJ0eVxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbi8vIFMzIEJ1Y2tldCBmb3IgUmVhY3QgV2Vic2l0ZSAod2l0aG91dCBwdWJsaWMgYWNjZXNzKVxuICAgIC8vQ3JlYXRlcyBhIHByaXZhdGUgUzMgYnVja2V0IChub3QgcHVibGljLWZhY2luZylcbiAgICB0aGlzLndlYnNpdGVCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsIFwiV2Vic2l0ZUJ1Y2tldFwiLCB7XG4gICAgICAgIHdlYnNpdGVJbmRleERvY3VtZW50OiBcImluZGV4Lmh0bWxcIixcbiAgICAgICAgd2Vic2l0ZUVycm9yRG9jdW1lbnQ6IFwiZXJyb3IuaHRtbFwiLFxuICAgICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLCAvL3JlbW92YWxQb2xpY3k6IERFU1RST1kgbWVhbnMgaXQgd2lsbCBiZSBkZWxldGVkIG9uIGNkayBkZXN0cm95XG4gICAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXG4gICAgICB9KTtcbiAgXG4gICAgICAvLyBEZXBsb3kgUmVhY3QgQXBwIHRvIFMzXG4gICAgICAvL1NvIFJlYWN0IGFzc2V0cyBnbyBmcm9tIC4vZnJvbnRlbmQvYnVpbGQgdG8gUzMgYnVja2V0XG4gIFxuICBcbiAgICAgIC8vIENsb3VkRnJvbnQgRGlzdHJpYnV0aW9uIGZvciBTMyBidWNrZXRcbiAgICAgIGNvbnN0IGNsb3VkZnJvbnRPQUkgPSBuZXcgY2xvdWRmcm9udC5PcmlnaW5BY2Nlc3NJZGVudGl0eSh0aGlzLCBcIk9yaWdpbkFjY2Vzc0lkZW50aXR5XCIpOyAvL0l0IGlzIG5lZWRlZCB0byBhY2Nlc3MgdGhlIFBSSVZBVEUgUzMgYnVja2V0IGZyb20gQ2xvdWRGcm9udFxuICBcbiAgICAgIHRoaXMud2Vic2l0ZUJ1Y2tldC5ncmFudFJlYWQoY2xvdWRmcm9udE9BSSk7IC8vIEdyYW50IENsb3VkRnJvbnQgYWNjZXNzIHRvIHRoZSBTMyBidWNrZXRcbiAgXG4gICAgICBjb25zdCBjbG91ZGZyb250RGlzdHJpYnV0aW9uID0gbmV3IGNsb3VkZnJvbnQuQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbih0aGlzLCBcIkNsb3VkRnJvbnREaXN0cmlidXRpb25cIiwge1xuICAgICAgICBvcmlnaW5Db25maWdzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgczNPcmlnaW5Tb3VyY2U6IHtcbiAgICAgICAgICAgICAgczNCdWNrZXRTb3VyY2U6IHRoaXMud2Vic2l0ZUJ1Y2tldCxcbiAgICAgICAgICAgICAgb3JpZ2luQWNjZXNzSWRlbnRpdHk6IGNsb3VkZnJvbnRPQUksICAvLyBBc3NvY2lhdGUgT0FJIHdpdGggdGhlIENsb3VkRnJvbnQgZGlzdHJpYnV0aW9uXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmVoYXZpb3JzOiBbeyBpc0RlZmF1bHRCZWhhdmlvcjogdHJ1ZSB9XSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSk7XG4gIFxuICAgICAgbmV3IHMzZGVwbG95LkJ1Y2tldERlcGxveW1lbnQodGhpcywgXCJEZXBsb3lXZWJzaXRlXCIsIHtcbiAgICAgICAgc291cmNlczogW3MzZGVwbG95LlNvdXJjZS5hc3NldChcIi4vZnJvbnRlbmQtbmV4dC8ubmV4dFwiKV0sIC8vdGhlIHBsYWNlIHdoZXJlIHRoZSBzdGF0aWMgZmlsZXMgYXJlIGxvY2F0ZWQuXG4gICAgICAgIGRlc3RpbmF0aW9uQnVja2V0OiB0aGlzLndlYnNpdGVCdWNrZXQsXG4gICAgICAgIGRpc3RyaWJ1dGlvbjogY2xvdWRmcm9udERpc3RyaWJ1dGlvbixcbiAgICAgICAgZGlzdHJpYnV0aW9uUGF0aHM6IFsnLyonXSwgLy8gVGhpcyBpbnZhbGlkYXRlcyBDbG91ZEZyb250IGNhY2hlXG4gICAgICB9KTtcbiAgXG4gIFxuICAgICAgLy8gT3V0cHV0IHRoZSBDbG91ZEZyb250IFVSTCBmb3IgdGhlIHdlYnNpdGVcbiAgICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiQ2xvdWRGcm9udFVSTFwiLCB7XG4gICAgICAgIHZhbHVlOiBjbG91ZGZyb250RGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlRoZSBVUkwgb2YgdGhlIENsb3VkRnJvbnQgZGlzdHJpYnV0aW9uIGZvciB0aGUgd2Vic2l0ZVwiLFxuICAgICAgfSk7XG4gIH1cbn1cbiJdfQ==