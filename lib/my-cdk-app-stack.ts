import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';


import { RemovalPolicy } from "aws-cdk-lib";

export class MyCdkStack extends cdk.Stack {
  public readonly ReadingMaterials: s3.Bucket; // Declare ReadingMaterials as a public property
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket for React Website (without public access)
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,  // Block public access to the bucket
    });

    // Deploy React App to S3
    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset("./frontend/build")], //the place where the static files are located.
      destinationBucket: websiteBucket,
    });

    // CloudFront Distribution for S3 bucket
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, "OriginAccessIdentity"); //It is needed to access the PRIVATE S3 bucket from CloudFront

    websiteBucket.grantRead(cloudfrontOAI); // Grant CloudFront access to the S3 bucket

    const cloudfrontDistribution = new cloudfront.CloudFrontWebDistribution(this, "CloudFrontDistribution", {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
            originAccessIdentity: cloudfrontOAI,  // Associate OAI with the CloudFront distribution
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

