import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";



export class FrontendStack extends cdk.Stack {
    public readonly websiteBucket: s3.Bucket; // Declare ReadingMaterialsBucket as a public property
    public readonly ReadingMaterials: s3.Bucket; // Declare ReadingMaterials as a public property
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    
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
        distributionPaths: ['/*'], // This invalidates CloudFront cache
      });
  
  
      // Output the CloudFront URL for the website
      new cdk.CfnOutput(this, "CloudFrontURL", {
        value: cloudfrontDistribution.distributionDomainName,
        description: "The URL of the CloudFront distribution for the website",
      });
  }
}
