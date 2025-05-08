import * as cdk from "aws-cdk-lib";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { DBStack } from "../DB/db-stack"; // Import DBStack
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations"; // Import integrations
import { lambdastack } from "./lambda-stacks";
import { StorageStack } from "../Storage/storage-stack"; // Import StorageStack



export class APIStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, dbStack: DBStack, lambdastack: lambdastack, StorageStack:StorageStack,props?: cdk.StackProps) {
    super(scope, id, props);

    const PostGetDelete = new apigatewayv2.HttpApi(this, 'HttpApi', {
        apiName: 'WebAppHttpApi',
        corsPreflight: {
          allowHeaders: ['Content-Type', 'Authorization'],
          allowMethods: [apigatewayv2.CorsHttpMethod.GET, apigatewayv2.CorsHttpMethod.POST, apigatewayv2.CorsHttpMethod.DELETE],
          allowCredentials: true,
          allowOrigins: ['https://d3b5ch7wjgk3ht.cloudfront.net'] // ✅ valid
,
        }
      });   

    // Add route for upload 
    PostGetDelete.addRoutes({
        path: '/upload', //path of the api gateway url for example https://api-id.execute-api.region.amazonaws.com/upload
        methods: [apigatewayv2.HttpMethod.POST],
        integration: new integrations.HttpLambdaIntegration('PostIntegration', lambdastack.postUploadLambda),
      });
      //Add route for get 
      PostGetDelete.addRoutes({
        path: '/upload',
        methods: [apigatewayv2.HttpMethod.GET],
        integration: new integrations.HttpLambdaIntegration('GetIntegration', lambdastack.getFilesLambda),
      });
      // Add route for delete
      PostGetDelete.addRoutes({
        path: '/upload',
        methods: [apigatewayv2.HttpMethod.DELETE],
        integration: new integrations.HttpLambdaIntegration('DeleteIntegration', lambdastack.deleteFilesLambda),
      });


    new cdk.CfnOutput(this, 'HttpApiEndpoint', {
        value: PostGetDelete.apiEndpoint,
      });

      //Student

    // Reader API for audio files
    const readerApi = new apigateway.RestApi(this, 'ReaderApi', {
      restApiName: 'Reader API',
      deployOptions: { stageName: 'dev' },
    });

    // Librarian API for Bedrock
    const librarianApi = new apigateway.RestApi(this, 'LibrarianApi', {
      restApiName: 'Librarian API',
      deployOptions: { stageName: 'dev' },
    });

    // API Integrations
    // Reader API: POST request triggers messageProcessing Lambda (student side)
    readerApi.root.addResource('audio')
      .addMethod('POST', new apigateway.LambdaIntegration(lambdastack.messageProcessing));
    //Librarian: POST request triggers librarian Lambda
    librarianApi.root.addResource('generate')
      .addMethod('POST', new apigateway.LambdaIntegration(lambdastack.invokeBedrockLib));

    // Get Book Info Lambda (API: /get-book-info)
    librarianApi.root.addResource('get-book-info')
  .addMethod('POST', new apigateway.LambdaIntegration(lambdastack.getBookInfoLambda));

    const restApi = new apigateway.RestApi(this, 'QrApi', {
      restApiName: 'QR Code API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });
    const qrResource = restApi.root.addResource('qrcode');
    qrResource.addMethod('GET', new apigateway.LambdaIntegration(lambdastack.qrLambda));


    
    

  
    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'ReaderAPIURL', { value: readerApi.url! });
    new cdk.CfnOutput(this, 'LibrarianAPIURL', { value: librarianApi.url! });
    new cdk.CfnOutput(this, 'QATableName', { value: dbStack.qaTable.tableName });
    new cdk.CfnOutput(this, 'ExtractedTextTableName', { value: dbStack.extractedTextTable.tableName });
    new cdk.CfnOutput(this, 'AudioFilesBucketOutput', { value: StorageStack.audioFilesBucket.bucketName });
    new cdk.CfnOutput(this, 'NovaGeneratedContentBucket', { value: StorageStack.novaContentBucket.bucketName });
    new cdk.CfnOutput(this, 'GetBookInfoAPIURL', {value: `${librarianApi.url}get-book-info`,});
    new cdk.CfnOutput(this, 'QrCodeApiEndpoint', {value: `${restApi.url}qrcode`,});
    
    
  }
}