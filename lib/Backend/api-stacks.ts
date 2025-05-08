import * as cdk from "aws-cdk-lib";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { DBStack } from "../DB/db-stack";
import { lambdastack } from "./lambda-stacks";
import { StorageStack } from "../Storage/storage-stack";

// Import dotenv to load environment variables
import * as dotenv from "dotenv";
dotenv.config(); // Load .env file

// Define APIStack without cloudfrontDomain in props
export class APIStack extends cdk.Stack {
  constructor(
    scope: cdk.App,
    id: string,
    dbStack: DBStack,
    lambdaStack: lambdastack,
    storageStack: StorageStack,
    props?: cdk.StackProps 
  ) {
    super(scope, id, props);

    // Access environment variables from .env
    const readerApiUrl = process.env.READER_API_URL!;
    const librarianApiUrl = process.env.LIBRARIAN_API_URL!;
    const getBookInfoApiUrl = process.env.GET_BOOK_INFO_API_URL!;
    const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN!;
    const corsAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS!.split(',');

    const httpApi = new apigatewayv2.HttpApi(this, "HttpApi", {
      apiName: "WebAppHttpApi",
      corsPreflight: {
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: [
          apigatewayv2.CorsHttpMethod.GET,
          apigatewayv2.CorsHttpMethod.POST,
          apigatewayv2.CorsHttpMethod.DELETE,
        ],
        allowCredentials: true,
        allowOrigins: corsAllowedOrigins, 
      },
    });

    httpApi.addRoutes({
      path: "/upload",
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration(
        "PostIntegration",
        lambdaStack.postUploadLambda
      ),
    });

    httpApi.addRoutes({
      path: "/upload",
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration(
        "GetIntegration",
        lambdaStack.getFilesLambda
      ),
    });

    httpApi.addRoutes({
      path: "/upload",
      methods: [apigatewayv2.HttpMethod.DELETE],
      integration: new integrations.HttpLambdaIntegration(
        "DeleteIntegration",
        lambdaStack.deleteFilesLambda
      ),
    });

    new cdk.CfnOutput(this, "HttpApiEndpoint", {
      value: httpApi.apiEndpoint,
    });

    // Reader and Librarian APIs
    const readerApi = new apigateway.RestApi(this, "ReaderApi", {
      restApiName: "Reader API",
      deployOptions: { stageName: "dev" },
    });

    const librarianApi = new apigateway.RestApi(this, "LibrarianApi", {
      restApiName: "Librarian API",
      deployOptions: { stageName: "dev" },
    });

    readerApi.root
      .addResource("audio")
      .addMethod("POST", new apigateway.LambdaIntegration(lambdaStack.messageProcessing));

    librarianApi.root
      .addResource("generate")
      .addMethod("POST", new apigateway.LambdaIntegration(lambdaStack.invokeBedrockLib));

    librarianApi.root
      .addResource("get-book-info")
      .addMethod("POST", new apigateway.LambdaIntegration(lambdaStack.getBookInfoLambda));

    new cdk.CfnOutput(this, "ReaderAPIURL", { value: readerApiUrl });
    new cdk.CfnOutput(this, "LibrarianAPIURL", { value: librarianApiUrl });
    new cdk.CfnOutput(this, "QATableName", { value: dbStack.qaTable.tableName });
    new cdk.CfnOutput(this, "ExtractedTextTableName", {
      value: dbStack.extractedTextTable.tableName,
    });
    new cdk.CfnOutput(this, "AudioFilesBucketOutput", {
      value: storageStack.audioFilesBucket.bucketName,
    });
    new cdk.CfnOutput(this, "NovaGeneratedContentBucket", {
      value: storageStack.novaContentBucket.bucketName,
    });
    new cdk.CfnOutput(this, "GetBookInfoAPIURL", {
      value: `${librarianApi.url}get-book-info`,
    });
  }
}
