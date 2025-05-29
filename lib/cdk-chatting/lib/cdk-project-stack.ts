import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as path from 'path';

// Create a stack for Bedrock-related resources in us-east-1
export class BedrockStack extends cdk.Stack {
  public readonly bedrockFunction: lambda.Function;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      ...props,
      env: { region: 'us-east-1' }, // Force us-east-1 for Bedrock
    });

    // Bedrock Lambda function
    this.bedrockFunction = new lambda.Function(this, 'BedrockFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/bedrock')),
      timeout: cdk.Duration.minutes(1),
      memorySize: 512,
    });

    // Grant Bedrock permissions
    this.bedrockFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream',
      ],
      resources: ['*'],
    }));
  }
}

// Main stack in me-central-1
export class CdkProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Reference to the Bedrock function in us-east-1
    const bedrockStack = new BedrockStack(scope, 'BedrockStack');

    // S3 bucket for audio files
    const audioBucket = new s3.Bucket(this, 'AudioBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
      lifecycleRules: [{
        expiration: cdk.Duration.days(1),
      }],
    });

    // DynamoDB table
    const table = new dynamodb.Table(this, 'ChatTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      timeToLiveAttribute: 'ttl',
    });

    // Process Message Lambda
    const processMessageLambda = new lambda.Function(this, 'ProcessMessageLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/process-message')),
      environment: {
        TABLE_NAME: table.tableName,
        BEDROCK_FUNCTION_ARN: bedrockStack.bedrockFunction.functionArn,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    // Polly Lambda
    const pollyFunction = new lambda.Function(this, 'PollyFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/polly')),
      environment: {
        AUDIO_BUCKET_NAME: audioBucket.bucketName,
      },
      timeout: cdk.Duration.minutes(1),
      memorySize: 256,
    });

    // Grant permissions
    table.grantReadWriteData(processMessageLambda);
    audioBucket.grantWrite(pollyFunction);
    audioBucket.grantRead(pollyFunction);

    // Grant cross-region Lambda invoke permissions
    bedrockStack.bedrockFunction.grantInvoke(processMessageLambda);
    pollyFunction.grantInvoke(processMessageLambda);

    // Grant Polly permissions
    pollyFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'polly:SynthesizeSpeech',
      ],
      resources: ['*'],
    }));

    // API Gateway
    const api = new apigateway.RestApi(this, 'HologramAPI', {
      restApiName: 'Hologram Chat API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
      },
    });

    // API Gateway Resources and Methods
    const chatResource = api.root.addResource('chat');
    chatResource.addMethod('POST', new apigateway.LambdaIntegration(processMessageLambda));

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'AudioBucketName', {
      value: audioBucket.bucketName,
      description: 'Audio Bucket Name',
    });
  }
}