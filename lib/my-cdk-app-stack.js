"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyCdkStack = void 0;
const cdk = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");
const s3deploy = require("aws-cdk-lib/aws-s3-deployment");
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const aws_cdk_lib_1 = require("aws-cdk-lib");
class MyCdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // S3 Bucket for React Website (without public access)
        const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
            websiteIndexDocument: "index.html",
            websiteErrorDocument: "error.html",
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Block public access to the bucket
        });
        // Deploy React App to S3
        new s3deploy.BucketDeployment(this, "DeployWebsite", {
            sources: [s3deploy.Source.asset("./frontend/build")],
            destinationBucket: websiteBucket,
        });
        // CloudFront Distribution for S3 bucket
        const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, "OriginAccessIdentity");
        websiteBucket.grantRead(cloudfrontOAI); // Grant CloudFront access to the S3 bucket
        const cloudfrontDistribution = new cloudfront.CloudFrontWebDistribution(this, "CloudFrontDistribution", {
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: websiteBucket,
                        originAccessIdentity: cloudfrontOAI, // Associate OAI with the CloudFront distribution
                    },
                    behaviors: [{ isDefaultBehavior: true }],
                },
            ],
        });
        // Output the CloudFront URL for the website
        new cdk.CfnOutput(this, "CloudFrontURL", {
            value: cloudfrontDistribution.distributionDomainName,
            description: "The URL of the CloudFront distribution for the website",
        });
    }
}
exports.MyCdkStack = MyCdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktY2RrLWFwcC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm15LWNkay1hcHAtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLHlDQUF5QztBQUN6QywwREFBMEQ7QUFDMUQseURBQXlEO0FBQ3pELDZDQUE0QztBQUU1QyxNQUFhLFVBQVcsU0FBUSxHQUFHLENBQUMsS0FBSztJQUN2QyxZQUFZLEtBQWMsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDNUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsc0RBQXNEO1FBQ3RELE1BQU0sYUFBYSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ3pELG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxhQUFhLEVBQUUsMkJBQWEsQ0FBQyxPQUFPO1lBQ3BDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUcsb0NBQW9DO1NBQ3pGLENBQUMsQ0FBQztRQUVILHlCQUF5QjtRQUN6QixJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ25ELE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDcEQsaUJBQWlCLEVBQUUsYUFBYTtTQUNqQyxDQUFDLENBQUM7UUFFSCx3Q0FBd0M7UUFDeEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxVQUFVLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFFeEYsYUFBYSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLDJDQUEyQztRQUVuRixNQUFNLHNCQUFzQixHQUFHLElBQUksVUFBVSxDQUFDLHlCQUF5QixDQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRTtZQUN0RyxhQUFhLEVBQUU7Z0JBQ2I7b0JBQ0UsY0FBYyxFQUFFO3dCQUNkLGNBQWMsRUFBRSxhQUFhO3dCQUM3QixvQkFBb0IsRUFBRSxhQUFhLEVBQUcsaURBQWlEO3FCQUN4RjtvQkFDRCxTQUFTLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDO2lCQUN6QzthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsNENBQTRDO1FBQzVDLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ3ZDLEtBQUssRUFBRSxzQkFBc0IsQ0FBQyxzQkFBc0I7WUFDcEQsV0FBVyxFQUFFLHdEQUF3RDtTQUN0RSxDQUFDLENBQUM7SUFFTCxDQUFDO0NBQ0Y7QUExQ0QsZ0NBMENDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0ICogYXMgczMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zM1wiO1xuaW1wb3J0ICogYXMgczNkZXBsb3kgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zMy1kZXBsb3ltZW50XCI7XG5pbXBvcnQgKiBhcyBjbG91ZGZyb250IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udFwiO1xuaW1wb3J0IHsgUmVtb3ZhbFBvbGljeSB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuXG5leHBvcnQgY2xhc3MgTXlDZGtTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQXBwLCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBTMyBCdWNrZXQgZm9yIFJlYWN0IFdlYnNpdGUgKHdpdGhvdXQgcHVibGljIGFjY2VzcylcbiAgICBjb25zdCB3ZWJzaXRlQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCBcIldlYnNpdGVCdWNrZXRcIiwge1xuICAgICAgd2Vic2l0ZUluZGV4RG9jdW1lbnQ6IFwiaW5kZXguaHRtbFwiLFxuICAgICAgd2Vic2l0ZUVycm9yRG9jdW1lbnQ6IFwiZXJyb3IuaHRtbFwiLFxuICAgICAgcmVtb3ZhbFBvbGljeTogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCwgIC8vIEJsb2NrIHB1YmxpYyBhY2Nlc3MgdG8gdGhlIGJ1Y2tldFxuICAgIH0pO1xuXG4gICAgLy8gRGVwbG95IFJlYWN0IEFwcCB0byBTM1xuICAgIG5ldyBzM2RlcGxveS5CdWNrZXREZXBsb3ltZW50KHRoaXMsIFwiRGVwbG95V2Vic2l0ZVwiLCB7XG4gICAgICBzb3VyY2VzOiBbczNkZXBsb3kuU291cmNlLmFzc2V0KFwiLi9mcm9udGVuZC9idWlsZFwiKV0sXG4gICAgICBkZXN0aW5hdGlvbkJ1Y2tldDogd2Vic2l0ZUJ1Y2tldCxcbiAgICB9KTtcblxuICAgIC8vIENsb3VkRnJvbnQgRGlzdHJpYnV0aW9uIGZvciBTMyBidWNrZXRcbiAgICBjb25zdCBjbG91ZGZyb250T0FJID0gbmV3IGNsb3VkZnJvbnQuT3JpZ2luQWNjZXNzSWRlbnRpdHkodGhpcywgXCJPcmlnaW5BY2Nlc3NJZGVudGl0eVwiKTtcblxuICAgIHdlYnNpdGVCdWNrZXQuZ3JhbnRSZWFkKGNsb3VkZnJvbnRPQUkpOyAvLyBHcmFudCBDbG91ZEZyb250IGFjY2VzcyB0byB0aGUgUzMgYnVja2V0XG5cbiAgICBjb25zdCBjbG91ZGZyb250RGlzdHJpYnV0aW9uID0gbmV3IGNsb3VkZnJvbnQuQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbih0aGlzLCBcIkNsb3VkRnJvbnREaXN0cmlidXRpb25cIiwge1xuICAgICAgb3JpZ2luQ29uZmlnczogW1xuICAgICAgICB7XG4gICAgICAgICAgczNPcmlnaW5Tb3VyY2U6IHtcbiAgICAgICAgICAgIHMzQnVja2V0U291cmNlOiB3ZWJzaXRlQnVja2V0LFxuICAgICAgICAgICAgb3JpZ2luQWNjZXNzSWRlbnRpdHk6IGNsb3VkZnJvbnRPQUksICAvLyBBc3NvY2lhdGUgT0FJIHdpdGggdGhlIENsb3VkRnJvbnQgZGlzdHJpYnV0aW9uXG4gICAgICAgICAgfSxcbiAgICAgICAgICBiZWhhdmlvcnM6IFt7IGlzRGVmYXVsdEJlaGF2aW9yOiB0cnVlIH1dLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIC8vIE91dHB1dCB0aGUgQ2xvdWRGcm9udCBVUkwgZm9yIHRoZSB3ZWJzaXRlXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJDbG91ZEZyb250VVJMXCIsIHtcbiAgICAgIHZhbHVlOiBjbG91ZGZyb250RGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogXCJUaGUgVVJMIG9mIHRoZSBDbG91ZEZyb250IGRpc3RyaWJ1dGlvbiBmb3IgdGhlIHdlYnNpdGVcIixcbiAgICB9KTtcbiAgICBcbiAgfVxufVxuXG4iXX0=