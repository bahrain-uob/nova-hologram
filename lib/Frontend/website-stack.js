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
            sources: [s3deploy.Source.asset("../../frontend-next/build")], //the place where the static files are located.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vic2l0ZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndlYnNpdGUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFFbkMsdURBQXlDO0FBQ3pDLHdFQUEwRDtBQUMxRCx1RUFBeUQ7QUFJekQsTUFBYSxhQUFjLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFHMUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUU5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUU1QixzREFBc0Q7UUFDbEQsaURBQWlEO1FBQ2pELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdEQsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxvQkFBb0IsRUFBRSxZQUFZO1lBQ2xDLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxnRUFBZ0U7WUFDMUcsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFNBQVM7U0FDbEQsQ0FBQyxDQUFDO1FBRUgseUJBQXlCO1FBQ3pCLHVEQUF1RDtRQUd2RCx3Q0FBd0M7UUFDeEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxVQUFVLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLHNCQUFzQixDQUFDLENBQUMsQ0FBQyw4REFBOEQ7UUFFdkosSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQywyQ0FBMkM7UUFFeEYsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUU7WUFDdEcsYUFBYSxFQUFFO2dCQUNiO29CQUNFLGNBQWMsRUFBRTt3QkFDZCxjQUFjLEVBQUUsSUFBSSxDQUFDLGFBQWE7d0JBQ2xDLG9CQUFvQixFQUFFLGFBQWEsRUFBRyxpREFBaUQ7cUJBQ3hGO29CQUNELFNBQVMsRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUM7aUJBQ3pDO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ25ELE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUMsRUFBRSwrQ0FBK0M7WUFDOUcsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGFBQWE7WUFDckMsWUFBWSxFQUFFLHNCQUFzQjtZQUNwQyxpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLG9DQUFvQztTQUNoRSxDQUFDLENBQUM7UUFHSCw0Q0FBNEM7UUFDNUMsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdkMsS0FBSyxFQUFFLHNCQUFzQixDQUFDLHNCQUFzQjtZQUNwRCxXQUFXLEVBQUUsd0RBQXdEO1NBQ3RFLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDRjtBQW5ERCxzQ0FtREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcImF3cy1jZGstbGliXCI7XHJcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XHJcbmltcG9ydCAqIGFzIHMzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczNcIjtcclxuaW1wb3J0ICogYXMgczNkZXBsb3kgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zMy1kZXBsb3ltZW50XCI7XHJcbmltcG9ydCAqIGFzIGNsb3VkZnJvbnQgZnJvbSBcImF3cy1jZGstbGliL2F3cy1jbG91ZGZyb250XCI7XHJcblxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBGcm9udGVuZFN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcclxuICAgIHB1YmxpYyByZWFkb25seSB3ZWJzaXRlQnVja2V0OiBzMy5CdWNrZXQ7IC8vIERlY2xhcmUgUmVhZGluZ01hdGVyaWFsc0J1Y2tldCBhcyBhIHB1YmxpYyBwcm9wZXJ0eVxyXG4gICAgcHVibGljIHJlYWRvbmx5IFJlYWRpbmdNYXRlcmlhbHM6IHMzLkJ1Y2tldDsgLy8gRGVjbGFyZSBSZWFkaW5nTWF0ZXJpYWxzIGFzIGEgcHVibGljIHByb3BlcnR5XHJcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xyXG4gICAgXHJcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuXHJcbi8vIFMzIEJ1Y2tldCBmb3IgUmVhY3QgV2Vic2l0ZSAod2l0aG91dCBwdWJsaWMgYWNjZXNzKVxyXG4gICAgLy9DcmVhdGVzIGEgcHJpdmF0ZSBTMyBidWNrZXQgKG5vdCBwdWJsaWMtZmFjaW5nKVxyXG4gICAgdGhpcy53ZWJzaXRlQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCBcIldlYnNpdGVCdWNrZXRcIiwge1xyXG4gICAgICAgIHdlYnNpdGVJbmRleERvY3VtZW50OiBcImluZGV4Lmh0bWxcIixcclxuICAgICAgICB3ZWJzaXRlRXJyb3JEb2N1bWVudDogXCJlcnJvci5odG1sXCIsXHJcbiAgICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSwgLy9yZW1vdmFsUG9saWN5OiBERVNUUk9ZIG1lYW5zIGl0IHdpbGwgYmUgZGVsZXRlZCBvbiBjZGsgZGVzdHJveVxyXG4gICAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXHJcbiAgICAgIH0pO1xyXG4gIFxyXG4gICAgICAvLyBEZXBsb3kgUmVhY3QgQXBwIHRvIFMzXHJcbiAgICAgIC8vU28gUmVhY3QgYXNzZXRzIGdvIGZyb20gLi9mcm9udGVuZC9idWlsZCB0byBTMyBidWNrZXRcclxuICBcclxuICBcclxuICAgICAgLy8gQ2xvdWRGcm9udCBEaXN0cmlidXRpb24gZm9yIFMzIGJ1Y2tldFxyXG4gICAgICBjb25zdCBjbG91ZGZyb250T0FJID0gbmV3IGNsb3VkZnJvbnQuT3JpZ2luQWNjZXNzSWRlbnRpdHkodGhpcywgXCJPcmlnaW5BY2Nlc3NJZGVudGl0eVwiKTsgLy9JdCBpcyBuZWVkZWQgdG8gYWNjZXNzIHRoZSBQUklWQVRFIFMzIGJ1Y2tldCBmcm9tIENsb3VkRnJvbnRcclxuICBcclxuICAgICAgdGhpcy53ZWJzaXRlQnVja2V0LmdyYW50UmVhZChjbG91ZGZyb250T0FJKTsgLy8gR3JhbnQgQ2xvdWRGcm9udCBhY2Nlc3MgdG8gdGhlIFMzIGJ1Y2tldFxyXG4gIFxyXG4gICAgICBjb25zdCBjbG91ZGZyb250RGlzdHJpYnV0aW9uID0gbmV3IGNsb3VkZnJvbnQuQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbih0aGlzLCBcIkNsb3VkRnJvbnREaXN0cmlidXRpb25cIiwge1xyXG4gICAgICAgIG9yaWdpbkNvbmZpZ3M6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgczNPcmlnaW5Tb3VyY2U6IHtcclxuICAgICAgICAgICAgICBzM0J1Y2tldFNvdXJjZTogdGhpcy53ZWJzaXRlQnVja2V0LFxyXG4gICAgICAgICAgICAgIG9yaWdpbkFjY2Vzc0lkZW50aXR5OiBjbG91ZGZyb250T0FJLCAgLy8gQXNzb2NpYXRlIE9BSSB3aXRoIHRoZSBDbG91ZEZyb250IGRpc3RyaWJ1dGlvblxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBiZWhhdmlvcnM6IFt7IGlzRGVmYXVsdEJlaGF2aW9yOiB0cnVlIH1dLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgICB9KTtcclxuICBcclxuICAgICAgbmV3IHMzZGVwbG95LkJ1Y2tldERlcGxveW1lbnQodGhpcywgXCJEZXBsb3lXZWJzaXRlXCIsIHtcclxuICAgICAgICBzb3VyY2VzOiBbczNkZXBsb3kuU291cmNlLmFzc2V0KFwiLi4vLi4vZnJvbnRlbmQtbmV4dC9idWlsZFwiKV0sIC8vdGhlIHBsYWNlIHdoZXJlIHRoZSBzdGF0aWMgZmlsZXMgYXJlIGxvY2F0ZWQuXHJcbiAgICAgICAgZGVzdGluYXRpb25CdWNrZXQ6IHRoaXMud2Vic2l0ZUJ1Y2tldCxcclxuICAgICAgICBkaXN0cmlidXRpb246IGNsb3VkZnJvbnREaXN0cmlidXRpb24sXHJcbiAgICAgICAgZGlzdHJpYnV0aW9uUGF0aHM6IFsnLyonXSwgLy8gVGhpcyBpbnZhbGlkYXRlcyBDbG91ZEZyb250IGNhY2hlXHJcbiAgICAgIH0pO1xyXG4gIFxyXG4gIFxyXG4gICAgICAvLyBPdXRwdXQgdGhlIENsb3VkRnJvbnQgVVJMIGZvciB0aGUgd2Vic2l0ZVxyXG4gICAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIkNsb3VkRnJvbnRVUkxcIiwge1xyXG4gICAgICAgIHZhbHVlOiBjbG91ZGZyb250RGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWUsXHJcbiAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIFVSTCBvZiB0aGUgQ2xvdWRGcm9udCBkaXN0cmlidXRpb24gZm9yIHRoZSB3ZWJzaXRlXCIsXHJcbiAgICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXX0=