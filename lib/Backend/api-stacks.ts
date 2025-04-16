import * as cdk from "aws-cdk-lib";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import { DBStack } from "../DB/db-stack"; // Import DBStack
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations"; // Import integrations
import { lambdastack } from "./lambda-stacks";


export class APIStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, dbStack: DBStack,lambdastack: lambdastack, props?: cdk.StackProps) {
    super(scope, id, props);

    const PostGetDelete = new apigatewayv2.HttpApi(this, 'HttpApi', {
        apiName: 'WebAppHttpApi',
        corsPreflight: {
          allowHeaders: ['Content-Type', 'Authorization'],
          allowMethods: [apigatewayv2.CorsHttpMethod.GET, apigatewayv2.CorsHttpMethod.POST, apigatewayv2.CorsHttpMethod.DELETE],
          allowCredentials: true,
          allowOrigins: ['XXXXXXXXXXXXXXXXXXXXX'],
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
  }
}