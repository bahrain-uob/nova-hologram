// Student part stack
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { Distribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';


export class StudentInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket to store Polly audio responses
    const audioFilesBucket = new s3.Bucket(this, 'AudioFilesBucket2', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    //reminder: change above s3 id to something different. 2 in the name represents nothing.

    //WebSocket API Gateway (simplified as REST for CDK v2)
    const readerApi = new apigateway.RestApi(this, 'ReaderApi', {
      restApiName: 'Reader API',
      deployOptions: { stageName: 'dev' },
    });

    // DynamoDB for Q&A storage
    const qaTable = new dynamodb.Table(this, 'QATable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda: Message processing (entry point after WebSocket)
    const messageProcessingLambda = new lambda.Function(this, 'MessageProcessingLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')), // assumes you place code in /lambda
      handler: 'messageProcessing.handler',
    });

    // Lambda: Invoke Transcribe
    const transcribeLambda = new lambda.Function(this, 'TranscribeLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      handler: 'transcribe.handler',
    });

    // Lambda: Invoke Bedrock
    const invokeBedrockLambda = new lambda.Function(this, 'InvokeBedrockLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      handler: 'invokeBedrock.handler',
      environment: {
        QATABLE_NAME: qaTable.tableName,
      },
    });

    // Lambda: Trigger Polly
    const triggerPollyLambda = new lambda.Function(this, 'TriggerPollyLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      handler: 'triggerPolly.handler',
      environment: {
        BUCKET_NAME: audioFilesBucket.bucketName,
      },
    });

    // Lambda: Play response (final audio output)
    const playResponseLambda = new lambda.Function(this, 'PlayResponseLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      handler: 'playResponse.handler',
    });

    // Permissions
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

    // Hook up API Gateway to messageProcessing lambda
    const audioResource = readerApi.root.addResource('audio');
    audioResource.addMethod('POST', new apigateway.LambdaIntegration(messageProcessingLambda));

    new cdk.CfnOutput(this, 'ReaderAPIURL', { value: readerApi.url! });
    new cdk.CfnOutput(this, 'QATableName', { value: qaTable.tableName });
    new cdk.CfnOutput(this, 'AudioFilesBucket', { value: audioFilesBucket.bucketName });
    //suggestion: change this id to AudioFilesBucketOutput
  }
}
