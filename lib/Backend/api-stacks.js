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
exports.APIStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const apigatewayv2 = __importStar(require("aws-cdk-lib/aws-apigatewayv2"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const integrations = __importStar(require("aws-cdk-lib/aws-apigatewayv2-integrations"));
// Import dotenv to load environment variables
const dotenv = __importStar(require("dotenv"));
dotenv.config(); // Load .env file
// Define APIStack without cloudfrontDomain in props
class APIStack extends cdk.Stack {
    constructor(scope, id, dbStack, lambdaStack, storageStack, eventNotificationsStack, props) {
        super(scope, id, props);
        ///////////////////////////
        // New standalone REST API for GetBookInfo
        const newGetBookInfoApi = new apigateway.RestApi(this, "NewGetBookInfoApi", {
            restApiName: "NewGetBookInfoAPI",
            deployOptions: { stageName: "dev" },
        });
        // /get-book-info resource
        const newGetBookInfoResource = newGetBookInfoApi.root.addResource("get-book-info");
        // POST method with Lambda integration
        newGetBookInfoResource.addMethod("POST", new apigateway.LambdaIntegration(lambdaStack.getBookInfoLambda), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // OPTIONS method for CORS preflight
        newGetBookInfoResource.addMethod("OPTIONS", new apigateway.MockIntegration({
            integrationResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                        "method.response.header.Access-Control-Allow-Origin": "'*'",
                        "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,POST'",
                    },
                    responseTemplates: {
                        "application/json": "",
                    },
                },
            ],
            passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
            requestTemplates: {
                "application/json": '{"statusCode": 200}',
            },
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": true,
                        "method.response.header.Access-Control-Allow-Methods": true,
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // Output the new API endpoint
        new cdk.CfnOutput(this, "NewGetBookInfoAPIURL", {
            value: `${newGetBookInfoApi.url}get-book-info`,
        });
        ////////////////////////////////////
        //  New HTTP API for Uploading Books
        const newBookUploadPresignApi = new apigatewayv2.HttpApi(this, "NewBookUploadPresignApi", {
            apiName: "NewBookUploadPresignAPI",
            corsPreflight: {
                allowMethods: [apigatewayv2.CorsHttpMethod.POST],
                allowHeaders: ["*"],
                allowOrigins: ["*"],
            },
        });
        // POST /get-upload-urls → getUploadUrlsLambda
        newBookUploadPresignApi.addRoutes({
            path: "/get-upload-urls",
            methods: [apigatewayv2.HttpMethod.POST],
            integration: new integrations.HttpLambdaIntegration("NewGetUploadUrlsIntegration", lambdaStack.getUploadUrlsLambda),
        });
        // POST /save-book → bookHandlerLambda
        newBookUploadPresignApi.addRoutes({
            path: "/save-book",
            methods: [apigatewayv2.HttpMethod.POST],
            integration: new integrations.HttpLambdaIntegration("NewSaveBookIntegration", lambdaStack.bookHandlerLambda),
        });
        // Output the new endpoint URL
        new cdk.CfnOutput(this, "NewBookUploadPresignAPIURL", {
            value: newBookUploadPresignApi.apiEndpoint,
        });
        ////////////////////////////////////
        //new HTTP API only for save-book
        const newBookSaveApi = new apigatewayv2.HttpApi(this, "NewBookSaveApi", {
            apiName: "NewBookSaveAPI",
            corsPreflight: {
                allowMethods: [apigatewayv2.CorsHttpMethod.POST],
                allowHeaders: ["*"],
                allowOrigins: ["*"],
            },
        });
        // POST /save-book → bookHandlerLambda
        newBookSaveApi.addRoutes({
            path: "/save-book",
            methods: [apigatewayv2.HttpMethod.POST],
            integration: new integrations.HttpLambdaIntegration("NewBookSaveIntegration", lambdaStack.bookHandlerLambda),
        });
        // Output API endpoint
        new cdk.CfnOutput(this, "NewBookSaveAPIURL", {
            value: newBookSaveApi.apiEndpoint,
        });
        ////////////////////////////////////
        //  New Standalone GetBook API
        const newGetBookApi = new apigatewayv2.HttpApi(this, "NewGetBookApi", {
            apiName: "NewGetBookApi",
            corsPreflight: {
                allowMethods: [apigatewayv2.CorsHttpMethod.GET],
                allowOrigins: ["*"],
                allowHeaders: ["*"],
            },
        });
        newGetBookApi.addRoutes({
            path: "/get-book/{bookId}",
            methods: [apigatewayv2.HttpMethod.GET],
            integration: new integrations.HttpLambdaIntegration("NewGetBookIntegration", lambdaStack.getBookLambda),
        });
        new cdk.CfnOutput(this, "NewGetBookApiURL", {
            value: `${newGetBookApi.apiEndpoint}/get-book/{bookId}`,
        });
        ////////////////////////////////////
        //  New Standalone UpdateBook API
        const newUpdateBookApi = new apigatewayv2.HttpApi(this, "NewUpdateBookApi", {
            apiName: "NewUpdateBookApi",
            corsPreflight: {
                allowMethods: [apigatewayv2.CorsHttpMethod.PUT],
                allowOrigins: ["*"],
                allowHeaders: ["*"],
            },
        });
        newUpdateBookApi.addRoutes({
            path: "/update-book",
            methods: [apigatewayv2.HttpMethod.PUT],
            integration: new integrations.HttpLambdaIntegration("NewUpdateBookIntegration", lambdaStack.updateBookLambda),
        });
        new cdk.CfnOutput(this, "NewUpdateBookApiURL", {
            value: `${newUpdateBookApi.apiEndpoint}/update-book`,
        });
        ////////////////////////////////////
        //new HTTP API only for delete-book
        const newDeleteBookApi = new apigatewayv2.HttpApi(this, "NewDeleteBookApi", {
            apiName: "NewDeleteBookAPI",
            corsPreflight: {
                allowMethods: [apigatewayv2.CorsHttpMethod.POST],
                allowHeaders: ["*"],
                allowOrigins: ["*"],
            },
        });
        // POST /delete-book → deleteBookLambda
        newDeleteBookApi.addRoutes({
            path: "/delete-book",
            methods: [apigatewayv2.HttpMethod.POST],
            integration: new integrations.HttpLambdaIntegration("NewDeleteBookIntegration", lambdaStack.deleteBookLambda),
        });
        // Output API endpoint
        new cdk.CfnOutput(this, "NewDeleteBookAPIURL", {
            value: newDeleteBookApi.apiEndpoint,
        });
        ////////////////////////////////////
        //New HTTP API to Get All Books
        const newGetAllBooksApi = new apigatewayv2.HttpApi(this, "NewGetAllBooksApi", {
            apiName: "NewGetAllBooksApi",
            corsPreflight: {
                allowMethods: [apigatewayv2.CorsHttpMethod.GET],
                allowOrigins: ["*"],
                allowHeaders: ["*"],
            },
        });
        newGetAllBooksApi.addRoutes({
            path: "/books",
            methods: [apigatewayv2.HttpMethod.GET],
            integration: new integrations.HttpLambdaIntegration("NewGetAllBooksIntegration", lambdaStack.getAllBooksLambda),
        });
        new cdk.CfnOutput(this, "NewGetAllBooksApiURL", {
            value: `${newGetAllBooksApi.apiEndpoint}/books`,
        });
        ////////////////////////////////////
        // Access environment variables from .env
        const readerApiUrl = process.env.READER_API_URL || '';
        const librarianApiUrl = process.env.LIBRARIAN_API_URL || '';
        const getBookInfoApiUrl = process.env.GET_BOOK_INFO_API_URL || '';
        const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN || '';
        const corsAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS
            ? process.env.CORS_ALLOWED_ORIGINS.split(',')
            : ['*'];
        const allowCredentials = corsAllowedOrigins.includes('*') ? false : true;
        const httpApi = new apigatewayv2.HttpApi(this, "HttpApi", {
            apiName: "WebAppHttpApi",
            corsPreflight: {
                allowHeaders: ["Content-Type", "Authorization"],
                allowMethods: [
                    apigatewayv2.CorsHttpMethod.GET,
                    apigatewayv2.CorsHttpMethod.POST,
                    apigatewayv2.CorsHttpMethod.DELETE,
                ],
                allowCredentials: allowCredentials,
                allowOrigins: corsAllowedOrigins,
            },
        });
        httpApi.addRoutes({
            path: "/upload",
            methods: [apigatewayv2.HttpMethod.POST],
            integration: new integrations.HttpLambdaIntegration("PostIntegration", lambdaStack.postUploadLambda),
        });
        httpApi.addRoutes({
            path: "/upload",
            methods: [apigatewayv2.HttpMethod.GET],
            integration: new integrations.HttpLambdaIntegration("GetIntegration", lambdaStack.getFilesLambda),
        });
        httpApi.addRoutes({
            path: "/upload",
            methods: [apigatewayv2.HttpMethod.DELETE],
            integration: new integrations.HttpLambdaIntegration("DeleteIntegration", lambdaStack.deleteFilesLambda),
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
        // Create /get-upload-urls resource
        const getUploadUrlsResource = librarianApi.root.addResource("get-upload-urls");
        // POST method for generating pre-signed S3 URLs
        getUploadUrlsResource.addMethod("POST", new apigateway.LambdaIntegration(lambdaStack.getUploadUrlsLambda), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // OPTIONAL: Add OPTIONS method to support CORS preflight
        getUploadUrlsResource.addMethod("OPTIONS", new apigateway.MockIntegration({
            integrationResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                        "method.response.header.Access-Control-Allow-Origin": "'*'",
                        "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,POST'",
                    },
                    responseTemplates: {
                        "application/json": "",
                    },
                },
            ],
            passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
            requestTemplates: {
                "application/json": '{"statusCode": 200}',
            },
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": true,
                        "method.response.header.Access-Control-Allow-Methods": true,
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
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
        // Create /upload-book resource
        const uploadBookResource = librarianApi.root.addResource("upload-book");
        // POST method for uploading the book
        uploadBookResource.addMethod("POST", new apigateway.LambdaIntegration(lambdaStack.bookHandlerLambda, {
            proxy: true, // <-- make sure this is set
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // OPTIONS method to support CORS preflight
        uploadBookResource.addMethod("OPTIONS", new apigateway.MockIntegration({
            integrationResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                        "method.response.header.Access-Control-Allow-Origin": "'*'",
                        "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,POST'",
                    },
                    responseTemplates: {
                        "application/json": "",
                    },
                },
            ],
            passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
            requestTemplates: {
                "application/json": '{"statusCode": 200}',
            },
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": true,
                        "method.response.header.Access-Control-Allow-Methods": true,
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // Create /get-book/{bookId} resource
        const getBookResource = librarianApi.root.addResource("get-book");
        const getBookByIdResource = getBookResource.addResource("{bookId}");
        // GET method to fetch book by ID
        getBookByIdResource.addMethod("GET", new apigateway.LambdaIntegration(lambdaStack.getBookLambda), {
            requestParameters: {
                "method.request.path.bookId": true,
            },
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
                {
                    statusCode: "400",
                },
                {
                    statusCode: "404",
                },
                {
                    statusCode: "500",
                },
            ],
        });
        // OPTIONS method for CORS
        getBookByIdResource.addMethod("OPTIONS", new apigateway.MockIntegration({
            integrationResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                        "method.response.header.Access-Control-Allow-Origin": "'*'",
                        "method.response.header.Access-Control-Allow-Methods": "'GET,OPTIONS'",
                    },
                    responseTemplates: {
                        "application/json": "",
                    },
                },
            ],
            passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
            requestTemplates: {
                "application/json": '{"statusCode": 200}',
            },
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": true,
                        "method.response.header.Access-Control-Allow-Origin": true,
                        "method.response.header.Access-Control-Allow-Methods": true,
                    },
                },
            ],
        });
        const getAllBooksResource = librarianApi.root.addResource("books");
        getAllBooksResource.addMethod("GET", new apigateway.LambdaIntegration(lambdaStack.getAllBooksLambda), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // OPTIONS method for CORS preflight
        getAllBooksResource.addMethod("OPTIONS", new apigateway.MockIntegration({
            integrationResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                        "method.response.header.Access-Control-Allow-Origin": "'*'",
                        "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,GET'",
                    },
                    responseTemplates: {
                        "application/json": "",
                    },
                },
            ],
            passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
            requestTemplates: {
                "application/json": '{"statusCode": 200}',
            },
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": true,
                        "method.response.header.Access-Control-Allow-Methods": true,
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // Create a resource for managing individual books by ID
        const bookByIdResource = getAllBooksResource.addResource("{bookId}");
        // Add DELETE method for deleting a book
        bookByIdResource.addMethod("DELETE", new apigateway.LambdaIntegration(lambdaStack.deleteBookLambdav2, {
            requestTemplates: {
                'application/json': JSON.stringify({
                    bookId: "$input.params('bookId')",
                    userId: "admin" // Default admin ID
                })
            }
        }), {
            requestParameters: {
                "method.request.path.bookId": true,
            },
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
                {
                    statusCode: "400",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                }
            ],
        });
        // Add PUT method for updating a book
        bookByIdResource.addMethod("PUT", new apigateway.LambdaIntegration(lambdaStack.updateBookLambdav2), {
            requestParameters: {
                "method.request.path.bookId": true,
            },
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
                {
                    statusCode: "400",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                }
            ],
        });
        // Add OPTIONS method for CORS
        bookByIdResource.addMethod("OPTIONS", new apigateway.MockIntegration({
            integrationResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                        "method.response.header.Access-Control-Allow-Origin": "'*'",
                        "method.response.header.Access-Control-Allow-Methods": "'DELETE,PUT,GET,OPTIONS'",
                    },
                    responseTemplates: {
                        "application/json": "",
                    },
                },
            ],
            passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
            requestTemplates: {
                "application/json": '{"statusCode": 200}',
            },
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": true,
                        "method.response.header.Access-Control-Allow-Methods": true,
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        new cdk.CfnOutput(this, "BooksAPIEndpoint", {
            value: `${librarianApi.url}books`,
        });
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
        new cdk.CfnOutput(this, "GetBookByIdAPIURL", {
            value: `${librarianApi.url}get-book/{bookId}`,
        });
        // Create API resources for notifications and classroom management
        // These endpoints are accessible to both readers and librarians
        // Notifications API
        const notificationsResource = readerApi.root.addResource("notifications");
        // GET method to list notifications
        notificationsResource.addMethod("GET", new apigateway.LambdaIntegration(eventNotificationsStack.notificationManagerLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // POST method to create notifications
        notificationsResource.addMethod("POST", new apigateway.LambdaIntegration(eventNotificationsStack.notificationManagerLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // PUT method to update notifications (mark as read)
        notificationsResource.addMethod("PUT", new apigateway.LambdaIntegration(eventNotificationsStack.notificationManagerLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // DELETE method to delete notifications
        notificationsResource.addMethod("DELETE", new apigateway.LambdaIntegration(eventNotificationsStack.notificationManagerLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // OPTIONS method for CORS
        notificationsResource.addMethod("OPTIONS", new apigateway.MockIntegration({
            integrationResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                        "method.response.header.Access-Control-Allow-Origin": "'*'",
                        "method.response.header.Access-Control-Allow-Methods": "'GET,POST,PUT,DELETE,OPTIONS'",
                    },
                    responseTemplates: {
                        "application/json": "",
                    },
                },
            ],
            passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
            requestTemplates: {
                "application/json": '{"statusCode": 200}',
            },
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": true,
                        "method.response.header.Access-Control-Allow-Methods": true,
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // Classroom API
        const classroomsResource = readerApi.root.addResource("classrooms");
        // GET method to list classrooms
        classroomsResource.addMethod("GET", new apigateway.LambdaIntegration(eventNotificationsStack.classroomManagerLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // POST method to create classrooms
        classroomsResource.addMethod("POST", new apigateway.LambdaIntegration(eventNotificationsStack.classroomManagerLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // PUT method to update classrooms
        classroomsResource.addMethod("PUT", new apigateway.LambdaIntegration(eventNotificationsStack.classroomManagerLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // DELETE method to delete classrooms
        classroomsResource.addMethod("DELETE", new apigateway.LambdaIntegration(eventNotificationsStack.classroomManagerLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        new cdk.CfnOutput(this, "ClassroomsAPIURL", {
            value: `${readerApi.url}classrooms`,
        });
        // Create API resources for book recommendations
        const recommendationsResource = readerApi.root.addResource("recommendations");
        // GET method to get personalized recommendations
        recommendationsResource.addMethod("GET", new apigateway.LambdaIntegration(lambdaStack.bookRecommendationLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // POST method to update user preferences for recommendations
        recommendationsResource.addMethod("POST", new apigateway.LambdaIntegration(lambdaStack.bookRecommendationLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // OPTIONS method for CORS
        recommendationsResource.addMethod("OPTIONS", new apigateway.MockIntegration({
            integrationResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                        "method.response.header.Access-Control-Allow-Origin": "'*'",
                        "method.response.header.Access-Control-Allow-Methods": "'GET,POST,OPTIONS'",
                    },
                    responseTemplates: {
                        "application/json": "",
                    },
                },
            ],
            passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
            requestTemplates: {
                "application/json": '{"statusCode": 200}',
            },
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": true,
                        "method.response.header.Access-Control-Allow-Methods": true,
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // Create API resources for reading progress tracking
        const progressResource = readerApi.root.addResource("progress");
        // GET method to list reading progress
        progressResource.addMethod("GET", new apigateway.LambdaIntegration(lambdaStack.readingProgressTrackerLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // POST method to create/update reading progress
        progressResource.addMethod("POST", new apigateway.LambdaIntegration(lambdaStack.readingProgressTrackerLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // OPTIONS method for CORS
        progressResource.addMethod("OPTIONS", new apigateway.MockIntegration({
            integrationResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                        "method.response.header.Access-Control-Allow-Origin": "'*'",
                        "method.response.header.Access-Control-Allow-Methods": "'GET,POST,OPTIONS'",
                    },
                    responseTemplates: {
                        "application/json": "",
                    },
                },
            ],
            passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
            requestTemplates: {
                "application/json": '{"statusCode": 200}',
            },
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": true,
                        "method.response.header.Access-Control-Allow-Methods": true,
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // Create API resources for user highlights
        const highlightsResource = readerApi.root.addResource("highlights");
        // GET method to list highlights
        highlightsResource.addMethod("GET", new apigateway.LambdaIntegration(lambdaStack.userHighlightsLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // POST method to create highlights
        highlightsResource.addMethod("POST", new apigateway.LambdaIntegration(lambdaStack.userHighlightsLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // PUT method to update highlights
        highlightsResource.addMethod("PUT", new apigateway.LambdaIntegration(lambdaStack.userHighlightsLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // DELETE method to delete highlights
        highlightsResource.addMethod("DELETE", new apigateway.LambdaIntegration(lambdaStack.userHighlightsLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // OPTIONS method for CORS
        highlightsResource.addMethod("OPTIONS", new apigateway.MockIntegration({
            integrationResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                        "method.response.header.Access-Control-Allow-Origin": "'*'",
                        "method.response.header.Access-Control-Allow-Methods": "'GET,POST,PUT,DELETE,OPTIONS'",
                    },
                    responseTemplates: {
                        "application/json": "",
                    },
                },
            ],
            passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
            requestTemplates: {
                "application/json": '{"statusCode": 200}',
            },
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": true,
                        "method.response.header.Access-Control-Allow-Methods": true,
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // Create API resources for vocabulary management
        const vocabularyResource = readerApi.root.addResource("vocabulary");
        // GET method to list vocabulary items
        vocabularyResource.addMethod("GET", new apigateway.LambdaIntegration(lambdaStack.vocabularyManagerLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // POST method to add vocabulary items
        vocabularyResource.addMethod("POST", new apigateway.LambdaIntegration(lambdaStack.vocabularyManagerLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // PUT method to update vocabulary items
        vocabularyResource.addMethod("PUT", new apigateway.LambdaIntegration(lambdaStack.vocabularyManagerLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // DELETE method to delete vocabulary items
        vocabularyResource.addMethod("DELETE", new apigateway.LambdaIntegration(lambdaStack.vocabularyManagerLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // OPTIONS method for CORS
        vocabularyResource.addMethod("OPTIONS", new apigateway.MockIntegration({
            integrationResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                        "method.response.header.Access-Control-Allow-Origin": "'*'",
                        "method.response.header.Access-Control-Allow-Methods": "'GET,POST,PUT,DELETE,OPTIONS'",
                    },
                    responseTemplates: {
                        "application/json": "",
                    },
                },
            ],
            passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
            requestTemplates: {
                "application/json": '{"statusCode": 200}',
            },
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": true,
                        "method.response.header.Access-Control-Allow-Methods": true,
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // Create API resources for quiz assessments
        const quizResource = readerApi.root.addResource("quizzes");
        // GET method to list quizzes
        quizResource.addMethod("GET", new apigateway.LambdaIntegration(lambdaStack.quizAssessmentLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // POST method to create/submit quizzes
        quizResource.addMethod("POST", new apigateway.LambdaIntegration(lambdaStack.quizAssessmentLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // OPTIONS method for CORS
        quizResource.addMethod("OPTIONS", new apigateway.MockIntegration({
            integrationResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                        "method.response.header.Access-Control-Allow-Origin": "'*'",
                        "method.response.header.Access-Control-Allow-Methods": "'GET,POST,OPTIONS'",
                    },
                    responseTemplates: {
                        "application/json": "",
                    },
                },
            ],
            passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
            requestTemplates: {
                "application/json": '{"statusCode": 200}',
            },
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": true,
                        "method.response.header.Access-Control-Allow-Methods": true,
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // Create API resources for student analytics
        const analyticsResource = readerApi.root.addResource("analytics");
        // GET method to get student analytics
        analyticsResource.addMethod("GET", new apigateway.LambdaIntegration(lambdaStack.studentAnalyticsLambda, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // OPTIONS method for CORS
        analyticsResource.addMethod("OPTIONS", new apigateway.MockIntegration({
            integrationResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                        "method.response.header.Access-Control-Allow-Origin": "'*'",
                        "method.response.header.Access-Control-Allow-Methods": "'GET,OPTIONS'",
                    },
                    responseTemplates: {
                        "application/json": "",
                    },
                },
            ],
            passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
            requestTemplates: {
                "application/json": '{"statusCode": 200}',
            },
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseParameters: {
                        "method.response.header.Access-Control-Allow-Headers": true,
                        "method.response.header.Access-Control-Allow-Methods": true,
                        "method.response.header.Access-Control-Allow-Origin": true,
                    },
                },
            ],
        });
        // Add API Gateway outputs for new endpoints
        new cdk.CfnOutput(this, "NotificationsAPIURL", {
            value: `${readerApi.url}notifications`,
        });
        new cdk.CfnOutput(this, "RecommendationsAPIURL", {
            value: `${readerApi.url}recommendations`,
        });
        new cdk.CfnOutput(this, "ReadingProgressAPIURL", {
            value: `${readerApi.url}progress`,
        });
        new cdk.CfnOutput(this, "UserHighlightsAPIURL", {
            value: `${readerApi.url}highlights`,
        });
        new cdk.CfnOutput(this, "VocabularyAPIURL", {
            value: `${readerApi.url}vocabulary`,
        });
        new cdk.CfnOutput(this, "QuizzesAPIURL", {
            value: `${readerApi.url}quizzes`,
        });
        new cdk.CfnOutput(this, "AnalyticsAPIURL", {
            value: `${readerApi.url}analytics`,
        });
    }
}
exports.APIStack = APIStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLXN0YWNrcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwaS1zdGFja3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsMkVBQTZEO0FBQzdELHVFQUF5RDtBQUN6RCx3RkFBMEU7QUFNMUUsOENBQThDO0FBQzlDLCtDQUFpQztBQUNqQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxpQkFBaUI7QUFFbEMsb0RBQW9EO0FBQ3BELE1BQWEsUUFBUyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3JDLFlBQ0UsS0FBYyxFQUNkLEVBQVUsRUFDVixPQUFnQixFQUNoQixXQUF3QixFQUN4QixZQUEwQixFQUMxQix1QkFBaUQsRUFDakQsS0FBc0I7UUFFdEIsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFNUIsMkJBQTJCO1FBQ3ZCLDBDQUEwQztRQUMxQyxNQUFNLGlCQUFpQixHQUFHLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDMUUsV0FBVyxFQUFFLG1CQUFtQjtZQUNoQyxhQUFhLEVBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFO1NBQ3BDLENBQUMsQ0FBQztRQUVILDBCQUEwQjtRQUMxQixNQUFNLHNCQUFzQixHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFbkYsc0NBQXNDO1FBQ3RDLHNCQUFzQixDQUFDLFNBQVMsQ0FDOUIsTUFBTSxFQUNOLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxFQUMvRDtZQUNFLGVBQWUsRUFBRTtnQkFDZjtvQkFDRSxVQUFVLEVBQUUsS0FBSztvQkFDakIsa0JBQWtCLEVBQUU7d0JBQ2xCLG9EQUFvRCxFQUFFLElBQUk7cUJBQzNEO2lCQUNGO2FB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RUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBRTtZQUMvQyxLQUFLLEVBQUUsR0FBRyxTQUFTLENBQUMsR0FBRyxpQkFBaUI7U0FDekMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBRTtZQUMvQyxLQUFLLEVBQUUsR0FBRyxTQUFTLENBQUMsR0FBRyxVQUFVO1NBQ2xDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUU7WUFDOUMsS0FBSyxFQUFFLEdBQUcsU0FBUyxDQUFDLEdBQUcsWUFBWTtTQUNwQyxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQzFDLEtBQUssRUFBRSxHQUFHLFNBQVMsQ0FBQyxHQUFHLFlBQVk7U0FDcEMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdkMsS0FBSyxFQUFFLEdBQUcsU0FBUyxDQUFDLEdBQUcsU0FBUztTQUNqQyxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQ3pDLEtBQUssRUFBRSxHQUFHLFNBQVMsQ0FBQyxHQUFHLFdBQVc7U0FDbkMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBcjRDRCw0QkFxNENDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheXYyIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheXYyXCI7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheVwiO1xuaW1wb3J0ICogYXMgaW50ZWdyYXRpb25zIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheXYyLWludGVncmF0aW9uc1wiO1xuaW1wb3J0IHsgREJTdGFjayB9IGZyb20gXCIuLi9EQi9kYi1zdGFja1wiO1xuaW1wb3J0IHsgbGFtYmRhc3RhY2sgfSBmcm9tIFwiLi9sYW1iZGEtc3RhY2tzXCI7XG5pbXBvcnQgeyBTdG9yYWdlU3RhY2sgfSBmcm9tIFwiLi4vU3RvcmFnZS9zdG9yYWdlLXN0YWNrXCI7XG5pbXBvcnQgeyBFdmVudE5vdGlmaWNhdGlvbnNTdGFjayB9IGZyb20gXCIuLi9zaGFyZWRyZXNvdXJjZXMvRXZlbnROb3RpZmljYXRpb25zU3RhY2tcIjtcblxuLy8gSW1wb3J0IGRvdGVudiB0byBsb2FkIGVudmlyb25tZW50IHZhcmlhYmxlc1xuaW1wb3J0ICogYXMgZG90ZW52IGZyb20gXCJkb3RlbnZcIjtcbmRvdGVudi5jb25maWcoKTsgLy8gTG9hZCAuZW52IGZpbGVcblxuLy8gRGVmaW5lIEFQSVN0YWNrIHdpdGhvdXQgY2xvdWRmcm9udERvbWFpbiBpbiBwcm9wc1xuZXhwb3J0IGNsYXNzIEFQSVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3IoXG4gICAgc2NvcGU6IGNkay5BcHAsXG4gICAgaWQ6IHN0cmluZyxcbiAgICBkYlN0YWNrOiBEQlN0YWNrLFxuICAgIGxhbWJkYVN0YWNrOiBsYW1iZGFzdGFjayxcbiAgICBzdG9yYWdlU3RhY2s6IFN0b3JhZ2VTdGFjayxcbiAgICBldmVudE5vdGlmaWNhdGlvbnNTdGFjaz86IEV2ZW50Tm90aWZpY2F0aW9uc1N0YWNrLFxuICAgIHByb3BzPzogY2RrLlN0YWNrUHJvcHNcbiAgKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIE5ldyBzdGFuZGFsb25lIFJFU1QgQVBJIGZvciBHZXRCb29rSW5mb1xuICAgIGNvbnN0IG5ld0dldEJvb2tJbmZvQXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCBcIk5ld0dldEJvb2tJbmZvQXBpXCIsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiBcIk5ld0dldEJvb2tJbmZvQVBJXCIsXG4gICAgICBkZXBsb3lPcHRpb25zOiB7IHN0YWdlTmFtZTogXCJkZXZcIiB9LFxuICAgIH0pO1xuXG4gICAgLy8gL2dldC1ib29rLWluZm8gcmVzb3VyY2VcbiAgICBjb25zdCBuZXdHZXRCb29rSW5mb1Jlc291cmNlID0gbmV3R2V0Qm9va0luZm9BcGkucm9vdC5hZGRSZXNvdXJjZShcImdldC1ib29rLWluZm9cIik7XG5cbiAgICAvLyBQT1NUIG1ldGhvZCB3aXRoIExhbWJkYSBpbnRlZ3JhdGlvblxuICAgIG5ld0dldEJvb2tJbmZvUmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgICAgXCJQT1NUXCIsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFTdGFjay5nZXRCb29rSW5mb0xhbWJkYSksXG4gICAgICB7XG4gICAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXG4gICAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBPUFRJT05TIG1ldGhvZCBmb3IgQ09SUyBwcmVmbGlnaHRcbiAgICBuZXdHZXRCb29rSW5mb1Jlc291cmNlLmFkZE1ldGhvZChcbiAgICAgIFwiT1BUSU9OU1wiLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTW9ja0ludGVncmF0aW9uKHtcbiAgICAgICAgaW50ZWdyYXRpb25SZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6XG4gICAgICAgICAgICAgICAgXCInQ29udGVudC1UeXBlLFgtQW16LURhdGUsQXV0aG9yaXphdGlvbixYLUFwaS1LZXksWC1BbXotU2VjdXJpdHktVG9rZW4nXCIsXG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCInKidcIixcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogXCInT1BUSU9OUyxQT1NUJ1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3BvbnNlVGVtcGxhdGVzOiB7XG4gICAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiBcIlwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBwYXNzdGhyb3VnaEJlaGF2aW9yOiBhcGlnYXRld2F5LlBhc3N0aHJvdWdoQmVoYXZpb3IuTkVWRVIsXG4gICAgICAgIHJlcXVlc3RUZW1wbGF0ZXM6IHtcbiAgICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjogJ3tcInN0YXR1c0NvZGVcIjogMjAwfScsXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOiB0cnVlLFxuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiOiB0cnVlLFxuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIE91dHB1dCB0aGUgbmV3IEFQSSBlbmRwb2ludFxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiTmV3R2V0Qm9va0luZm9BUElVUkxcIiwge1xuICAgICAgdmFsdWU6IGAke25ld0dldEJvb2tJbmZvQXBpLnVybH1nZXQtYm9vay1pbmZvYCxcbiAgICB9KTtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgLy8gIE5ldyBIVFRQIEFQSSBmb3IgVXBsb2FkaW5nIEJvb2tzXG4gICAgY29uc3QgbmV3Qm9va1VwbG9hZFByZXNpZ25BcGkgPSBuZXcgYXBpZ2F0ZXdheXYyLkh0dHBBcGkodGhpcywgXCJOZXdCb29rVXBsb2FkUHJlc2lnbkFwaVwiLCB7XG4gICAgICBhcGlOYW1lOiBcIk5ld0Jvb2tVcGxvYWRQcmVzaWduQVBJXCIsXG4gICAgICBjb3JzUHJlZmxpZ2h0OiB7XG4gICAgICAgIGFsbG93TWV0aG9kczogW2FwaWdhdGV3YXl2Mi5Db3JzSHR0cE1ldGhvZC5QT1NUXSxcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbXCIqXCJdLFxuICAgICAgICBhbGxvd09yaWdpbnM6IFtcIipcIl0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gUE9TVCAvZ2V0LXVwbG9hZC11cmxzIOKGkiBnZXRVcGxvYWRVcmxzTGFtYmRhXG4gICAgbmV3Qm9va1VwbG9hZFByZXNpZ25BcGkuYWRkUm91dGVzKHtcbiAgICAgIHBhdGg6IFwiL2dldC11cGxvYWQtdXJsc1wiLFxuICAgICAgbWV0aG9kczogW2FwaWdhdGV3YXl2Mi5IdHRwTWV0aG9kLlBPU1RdLFxuICAgICAgaW50ZWdyYXRpb246IG5ldyBpbnRlZ3JhdGlvbnMuSHR0cExhbWJkYUludGVncmF0aW9uKFxuICAgICAgICBcIk5ld0dldFVwbG9hZFVybHNJbnRlZ3JhdGlvblwiLFxuICAgICAgICBsYW1iZGFTdGFjay5nZXRVcGxvYWRVcmxzTGFtYmRhXG4gICAgICApLFxuICAgIH0pO1xuXG4gICAgLy8gUE9TVCAvc2F2ZS1ib29rIOKGkiBib29rSGFuZGxlckxhbWJkYVxuICAgIG5ld0Jvb2tVcGxvYWRQcmVzaWduQXBpLmFkZFJvdXRlcyh7XG4gICAgICBwYXRoOiBcIi9zYXZlLWJvb2tcIixcbiAgICAgIG1ldGhvZHM6IFthcGlnYXRld2F5djIuSHR0cE1ldGhvZC5QT1NUXSxcbiAgICAgIGludGVncmF0aW9uOiBuZXcgaW50ZWdyYXRpb25zLkh0dHBMYW1iZGFJbnRlZ3JhdGlvbihcbiAgICAgICAgXCJOZXdTYXZlQm9va0ludGVncmF0aW9uXCIsXG4gICAgICAgIGxhbWJkYVN0YWNrLmJvb2tIYW5kbGVyTGFtYmRhXG4gICAgICApLFxuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0IHRoZSBuZXcgZW5kcG9pbnQgVVJMXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJOZXdCb29rVXBsb2FkUHJlc2lnbkFQSVVSTFwiLCB7XG4gICAgICB2YWx1ZTogbmV3Qm9va1VwbG9hZFByZXNpZ25BcGkuYXBpRW5kcG9pbnQsXG4gICAgfSk7XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIC8vbmV3IEhUVFAgQVBJIG9ubHkgZm9yIHNhdmUtYm9va1xuICAgIGNvbnN0IG5ld0Jvb2tTYXZlQXBpID0gbmV3IGFwaWdhdGV3YXl2Mi5IdHRwQXBpKHRoaXMsIFwiTmV3Qm9va1NhdmVBcGlcIiwge1xuICAgICAgYXBpTmFtZTogXCJOZXdCb29rU2F2ZUFQSVwiLFxuICAgICAgY29yc1ByZWZsaWdodDoge1xuICAgICAgICBhbGxvd01ldGhvZHM6IFthcGlnYXRld2F5djIuQ29yc0h0dHBNZXRob2QuUE9TVF0sXG4gICAgICAgIGFsbG93SGVhZGVyczogW1wiKlwiXSxcbiAgICAgICAgYWxsb3dPcmlnaW5zOiBbXCIqXCJdLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIFBPU1QgL3NhdmUtYm9vayDihpIgYm9va0hhbmRsZXJMYW1iZGFcbiAgICBuZXdCb29rU2F2ZUFwaS5hZGRSb3V0ZXMoe1xuICAgICAgcGF0aDogXCIvc2F2ZS1ib29rXCIsXG4gICAgICBtZXRob2RzOiBbYXBpZ2F0ZXdheXYyLkh0dHBNZXRob2QuUE9TVF0sXG4gICAgICBpbnRlZ3JhdGlvbjogbmV3IGludGVncmF0aW9ucy5IdHRwTGFtYmRhSW50ZWdyYXRpb24oXG4gICAgICAgIFwiTmV3Qm9va1NhdmVJbnRlZ3JhdGlvblwiLFxuICAgICAgICBsYW1iZGFTdGFjay5ib29rSGFuZGxlckxhbWJkYVxuICAgICAgKSxcbiAgICB9KTtcblxuICAgIC8vIE91dHB1dCBBUEkgZW5kcG9pbnRcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIk5ld0Jvb2tTYXZlQVBJVVJMXCIsIHtcbiAgICAgIHZhbHVlOiBuZXdCb29rU2F2ZUFwaS5hcGlFbmRwb2ludCxcbiAgICB9KTtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgLy8gIE5ldyBTdGFuZGFsb25lIEdldEJvb2sgQVBJXG4gICAgY29uc3QgbmV3R2V0Qm9va0FwaSA9IG5ldyBhcGlnYXRld2F5djIuSHR0cEFwaSh0aGlzLCBcIk5ld0dldEJvb2tBcGlcIiwge1xuICAgICAgYXBpTmFtZTogXCJOZXdHZXRCb29rQXBpXCIsXG4gICAgICBjb3JzUHJlZmxpZ2h0OiB7XG4gICAgICAgIGFsbG93TWV0aG9kczogW2FwaWdhdGV3YXl2Mi5Db3JzSHR0cE1ldGhvZC5HRVRdLFxuICAgICAgICBhbGxvd09yaWdpbnM6IFtcIipcIl0sXG4gICAgICAgIGFsbG93SGVhZGVyczogW1wiKlwiXSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBuZXdHZXRCb29rQXBpLmFkZFJvdXRlcyh7XG4gICAgICBwYXRoOiBcIi9nZXQtYm9vay97Ym9va0lkfVwiLFxuICAgICAgbWV0aG9kczogW2FwaWdhdGV3YXl2Mi5IdHRwTWV0aG9kLkdFVF0sXG4gICAgICBpbnRlZ3JhdGlvbjogbmV3IGludGVncmF0aW9ucy5IdHRwTGFtYmRhSW50ZWdyYXRpb24oXG4gICAgICAgIFwiTmV3R2V0Qm9va0ludGVncmF0aW9uXCIsXG4gICAgICAgIGxhbWJkYVN0YWNrLmdldEJvb2tMYW1iZGFcbiAgICAgICksXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIk5ld0dldEJvb2tBcGlVUkxcIiwge1xuICAgICAgdmFsdWU6IGAke25ld0dldEJvb2tBcGkuYXBpRW5kcG9pbnR9L2dldC1ib29rL3tib29rSWR9YCxcbiAgICB9KTtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIFxuICAgIC8vICBOZXcgU3RhbmRhbG9uZSBVcGRhdGVCb29rIEFQSVxuICAgIGNvbnN0IG5ld1VwZGF0ZUJvb2tBcGkgPSBuZXcgYXBpZ2F0ZXdheXYyLkh0dHBBcGkodGhpcywgXCJOZXdVcGRhdGVCb29rQXBpXCIsIHtcbiAgICAgIGFwaU5hbWU6IFwiTmV3VXBkYXRlQm9va0FwaVwiLFxuICAgICAgY29yc1ByZWZsaWdodDoge1xuICAgICAgICBhbGxvd01ldGhvZHM6IFthcGlnYXRld2F5djIuQ29yc0h0dHBNZXRob2QuUFVUXSxcbiAgICAgICAgYWxsb3dPcmlnaW5zOiBbXCIqXCJdLFxuICAgICAgICBhbGxvd0hlYWRlcnM6IFtcIipcIl0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgbmV3VXBkYXRlQm9va0FwaS5hZGRSb3V0ZXMoe1xuICAgICAgcGF0aDogXCIvdXBkYXRlLWJvb2tcIixcbiAgICAgIG1ldGhvZHM6IFthcGlnYXRld2F5djIuSHR0cE1ldGhvZC5QVVRdLFxuICAgICAgaW50ZWdyYXRpb246IG5ldyBpbnRlZ3JhdGlvbnMuSHR0cExhbWJkYUludGVncmF0aW9uKFxuICAgICAgICBcIk5ld1VwZGF0ZUJvb2tJbnRlZ3JhdGlvblwiLFxuICAgICAgICBsYW1iZGFTdGFjay51cGRhdGVCb29rTGFtYmRhXG4gICAgICApLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJOZXdVcGRhdGVCb29rQXBpVVJMXCIsIHtcbiAgICAgIHZhbHVlOiBgJHtuZXdVcGRhdGVCb29rQXBpLmFwaUVuZHBvaW50fS91cGRhdGUtYm9va2AsXG4gICAgfSk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgLy9uZXcgSFRUUCBBUEkgb25seSBmb3IgZGVsZXRlLWJvb2tcbiAgICBjb25zdCBuZXdEZWxldGVCb29rQXBpID0gbmV3IGFwaWdhdGV3YXl2Mi5IdHRwQXBpKHRoaXMsIFwiTmV3RGVsZXRlQm9va0FwaVwiLCB7XG4gICAgICBhcGlOYW1lOiBcIk5ld0RlbGV0ZUJvb2tBUElcIixcbiAgICAgIGNvcnNQcmVmbGlnaHQ6IHtcbiAgICAgICAgYWxsb3dNZXRob2RzOiBbYXBpZ2F0ZXdheXYyLkNvcnNIdHRwTWV0aG9kLlBPU1RdLFxuICAgICAgICBhbGxvd0hlYWRlcnM6IFtcIipcIl0sXG4gICAgICAgIGFsbG93T3JpZ2luczogW1wiKlwiXSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBQT1NUIC9kZWxldGUtYm9vayDihpIgZGVsZXRlQm9va0xhbWJkYVxuICAgIG5ld0RlbGV0ZUJvb2tBcGkuYWRkUm91dGVzKHtcbiAgICAgIHBhdGg6IFwiL2RlbGV0ZS1ib29rXCIsXG4gICAgICBtZXRob2RzOiBbYXBpZ2F0ZXdheXYyLkh0dHBNZXRob2QuUE9TVF0sXG4gICAgICBpbnRlZ3JhdGlvbjogbmV3IGludGVncmF0aW9ucy5IdHRwTGFtYmRhSW50ZWdyYXRpb24oXG4gICAgICAgIFwiTmV3RGVsZXRlQm9va0ludGVncmF0aW9uXCIsXG4gICAgICAgIGxhbWJkYVN0YWNrLmRlbGV0ZUJvb2tMYW1iZGEgXG4gICAgICApLFxuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0IEFQSSBlbmRwb2ludFxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiTmV3RGVsZXRlQm9va0FQSVVSTFwiLCB7XG4gICAgICB2YWx1ZTogbmV3RGVsZXRlQm9va0FwaS5hcGlFbmRwb2ludCxcbiAgICB9KTtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgLy9OZXcgSFRUUCBBUEkgdG8gR2V0IEFsbCBCb29rc1xuICAgIGNvbnN0IG5ld0dldEFsbEJvb2tzQXBpID0gbmV3IGFwaWdhdGV3YXl2Mi5IdHRwQXBpKHRoaXMsIFwiTmV3R2V0QWxsQm9va3NBcGlcIiwge1xuICAgICAgYXBpTmFtZTogXCJOZXdHZXRBbGxCb29rc0FwaVwiLFxuICAgICAgY29yc1ByZWZsaWdodDoge1xuICAgICAgICBhbGxvd01ldGhvZHM6IFthcGlnYXRld2F5djIuQ29yc0h0dHBNZXRob2QuR0VUXSxcbiAgICAgICAgYWxsb3dPcmlnaW5zOiBbXCIqXCJdLFxuICAgICAgICBhbGxvd0hlYWRlcnM6IFtcIipcIl0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgbmV3R2V0QWxsQm9va3NBcGkuYWRkUm91dGVzKHtcbiAgICAgIHBhdGg6IFwiL2Jvb2tzXCIsXG4gICAgICBtZXRob2RzOiBbYXBpZ2F0ZXdheXYyLkh0dHBNZXRob2QuR0VUXSxcbiAgICAgIGludGVncmF0aW9uOiBuZXcgaW50ZWdyYXRpb25zLkh0dHBMYW1iZGFJbnRlZ3JhdGlvbihcbiAgICAgICAgXCJOZXdHZXRBbGxCb29rc0ludGVncmF0aW9uXCIsXG4gICAgICAgIGxhbWJkYVN0YWNrLmdldEFsbEJvb2tzTGFtYmRhIFxuICAgICAgKSxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiTmV3R2V0QWxsQm9va3NBcGlVUkxcIiwge1xuICAgICAgdmFsdWU6IGAke25ld0dldEFsbEJvb2tzQXBpLmFwaUVuZHBvaW50fS9ib29rc2AsXG4gICAgfSk7XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIC8vIEFjY2VzcyBlbnZpcm9ubWVudCB2YXJpYWJsZXMgZnJvbSAuZW52XG4gICAgY29uc3QgcmVhZGVyQXBpVXJsID0gcHJvY2Vzcy5lbnYuUkVBREVSX0FQSV9VUkx8fCAnJztcbiAgICBjb25zdCBsaWJyYXJpYW5BcGlVcmwgPSBwcm9jZXNzLmVudi5MSUJSQVJJQU5fQVBJX1VSTHx8ICcnO1xuICAgIGNvbnN0IGdldEJvb2tJbmZvQXBpVXJsID0gcHJvY2Vzcy5lbnYuR0VUX0JPT0tfSU5GT19BUElfVVJMfHwgJyc7XG4gICAgY29uc3QgY2xvdWRmcm9udERvbWFpbiA9IHByb2Nlc3MuZW52LkNMT1VERlJPTlRfRE9NQUlOfHwgJyc7XG4gICAgY29uc3QgY29yc0FsbG93ZWRPcmlnaW5zID0gcHJvY2Vzcy5lbnYuQ09SU19BTExPV0VEX09SSUdJTlNcbiAgICA/IHByb2Nlc3MuZW52LkNPUlNfQUxMT1dFRF9PUklHSU5TLnNwbGl0KCcsJylcbiAgICA6IFsnKiddO1xuXG4gICAgY29uc3QgYWxsb3dDcmVkZW50aWFscyA9IGNvcnNBbGxvd2VkT3JpZ2lucy5pbmNsdWRlcygnKicpID8gZmFsc2UgOiB0cnVlO1xuXG4gICAgY29uc3QgaHR0cEFwaSA9IG5ldyBhcGlnYXRld2F5djIuSHR0cEFwaSh0aGlzLCBcIkh0dHBBcGlcIiwge1xuICAgICAgYXBpTmFtZTogXCJXZWJBcHBIdHRwQXBpXCIsXG4gICAgICBjb3JzUHJlZmxpZ2h0OiB7XG4gICAgICAgIGFsbG93SGVhZGVyczogW1wiQ29udGVudC1UeXBlXCIsIFwiQXV0aG9yaXphdGlvblwiXSxcbiAgICAgICAgYWxsb3dNZXRob2RzOiBbXG4gICAgICAgICAgYXBpZ2F0ZXdheXYyLkNvcnNIdHRwTWV0aG9kLkdFVCxcbiAgICAgICAgICBhcGlnYXRld2F5djIuQ29yc0h0dHBNZXRob2QuUE9TVCxcbiAgICAgICAgICBhcGlnYXRld2F5djIuQ29yc0h0dHBNZXRob2QuREVMRVRFLFxuICAgICAgICBdLFxuICAgICAgICBhbGxvd0NyZWRlbnRpYWxzOiBhbGxvd0NyZWRlbnRpYWxzLFxuICAgICAgICBhbGxvd09yaWdpbnM6IGNvcnNBbGxvd2VkT3JpZ2lucyxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBodHRwQXBpLmFkZFJvdXRlcyh7XG4gICAgICBwYXRoOiBcIi91cGxvYWRcIixcbiAgICAgIG1ldGhvZHM6IFthcGlnYXRld2F5djIuSHR0cE1ldGhvZC5QT1NUXSxcbiAgICAgIGludGVncmF0aW9uOiBuZXcgaW50ZWdyYXRpb25zLkh0dHBMYW1iZGFJbnRlZ3JhdGlvbihcbiAgICAgICAgXCJQb3N0SW50ZWdyYXRpb25cIixcbiAgICAgICAgbGFtYmRhU3RhY2sucG9zdFVwbG9hZExhbWJkYVxuICAgICAgKSxcbiAgICB9KTtcblxuICAgIGh0dHBBcGkuYWRkUm91dGVzKHtcbiAgICAgIHBhdGg6IFwiL3VwbG9hZFwiLFxuICAgICAgbWV0aG9kczogW2FwaWdhdGV3YXl2Mi5IdHRwTWV0aG9kLkdFVF0sXG4gICAgICBpbnRlZ3JhdGlvbjogbmV3IGludGVncmF0aW9ucy5IdHRwTGFtYmRhSW50ZWdyYXRpb24oXG4gICAgICAgIFwiR2V0SW50ZWdyYXRpb25cIixcbiAgICAgICAgbGFtYmRhU3RhY2suZ2V0RmlsZXNMYW1iZGFcbiAgICAgICksXG4gICAgfSk7XG5cbiAgICBodHRwQXBpLmFkZFJvdXRlcyh7XG4gICAgICBwYXRoOiBcIi91cGxvYWRcIixcbiAgICAgIG1ldGhvZHM6IFthcGlnYXRld2F5djIuSHR0cE1ldGhvZC5ERUxFVEVdLFxuICAgICAgaW50ZWdyYXRpb246IG5ldyBpbnRlZ3JhdGlvbnMuSHR0cExhbWJkYUludGVncmF0aW9uKFxuICAgICAgICBcIkRlbGV0ZUludGVncmF0aW9uXCIsXG4gICAgICAgIGxhbWJkYVN0YWNrLmRlbGV0ZUZpbGVzTGFtYmRhXG4gICAgICApLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJIdHRwQXBpRW5kcG9pbnRcIiwge1xuICAgICAgdmFsdWU6IGh0dHBBcGkuYXBpRW5kcG9pbnQsXG4gICAgfSk7XG5cbiAgICAvLyBSZWFkZXIgYW5kIExpYnJhcmlhbiBBUElzXG4gICAgY29uc3QgcmVhZGVyQXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCBcIlJlYWRlckFwaVwiLCB7XG4gICAgICByZXN0QXBpTmFtZTogXCJSZWFkZXIgQVBJXCIsXG4gICAgICBkZXBsb3lPcHRpb25zOiB7IHN0YWdlTmFtZTogXCJkZXZcIiB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgbGlicmFyaWFuQXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCBcIkxpYnJhcmlhbkFwaVwiLCB7XG4gICAgICByZXN0QXBpTmFtZTogXCJMaWJyYXJpYW4gQVBJXCIsXG4gICAgICBkZXBsb3lPcHRpb25zOiB7IHN0YWdlTmFtZTogXCJkZXZcIiB9LFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIC9nZXQtdXBsb2FkLXVybHMgcmVzb3VyY2VcbmNvbnN0IGdldFVwbG9hZFVybHNSZXNvdXJjZSA9IGxpYnJhcmlhbkFwaS5yb290LmFkZFJlc291cmNlKFwiZ2V0LXVwbG9hZC11cmxzXCIpO1xuXG4vLyBQT1NUIG1ldGhvZCBmb3IgZ2VuZXJhdGluZyBwcmUtc2lnbmVkIFMzIFVSTHNcbmdldFVwbG9hZFVybHNSZXNvdXJjZS5hZGRNZXRob2QoXG4gIFwiUE9TVFwiLFxuICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFTdGFjay5nZXRVcGxvYWRVcmxzTGFtYmRhKSxcbiAge1xuICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAge1xuICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0sXG4gIH1cbik7XG5cbi8vIE9QVElPTkFMOiBBZGQgT1BUSU9OUyBtZXRob2QgdG8gc3VwcG9ydCBDT1JTIHByZWZsaWdodFxuZ2V0VXBsb2FkVXJsc1Jlc291cmNlLmFkZE1ldGhvZChcbiAgXCJPUFRJT05TXCIsXG4gIG5ldyBhcGlnYXRld2F5Lk1vY2tJbnRlZ3JhdGlvbih7XG4gICAgaW50ZWdyYXRpb25SZXNwb25zZXM6IFtcbiAgICAgIHtcbiAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIjpcbiAgICAgICAgICAgIFwiJ0NvbnRlbnQtVHlwZSxYLUFtei1EYXRlLEF1dGhvcml6YXRpb24sWC1BcGktS2V5LFgtQW16LVNlY3VyaXR5LVRva2VuJ1wiLFxuICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCInKidcIixcbiAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiOiBcIidPUFRJT05TLFBPU1QnXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3BvbnNlVGVtcGxhdGVzOiB7XG4gICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IFwiXCIsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0sXG4gICAgcGFzc3Rocm91Z2hCZWhhdmlvcjogYXBpZ2F0ZXdheS5QYXNzdGhyb3VnaEJlaGF2aW9yLk5FVkVSLFxuICAgIHJlcXVlc3RUZW1wbGF0ZXM6IHtcbiAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiAne1wic3RhdHVzQ29kZVwiOiAyMDB9JyxcbiAgICB9LFxuICB9KSxcbiAge1xuICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAge1xuICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOiB0cnVlLFxuICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCI6IHRydWUsXG4gICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICB9XG4pO1xuXG4gICAgcmVhZGVyQXBpLnJvb3RcbiAgICAgIC5hZGRSZXNvdXJjZShcImF1ZGlvXCIpXG4gICAgICAuYWRkTWV0aG9kKFwiUE9TVFwiLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFTdGFjay5tZXNzYWdlUHJvY2Vzc2luZykpO1xuXG4gICAgbGlicmFyaWFuQXBpLnJvb3RcbiAgICAgIC5hZGRSZXNvdXJjZShcImdlbmVyYXRlXCIpXG4gICAgICAuYWRkTWV0aG9kKFwiUE9TVFwiLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFTdGFjay5pbnZva2VCZWRyb2NrTGliKSk7XG5cbiAgICBsaWJyYXJpYW5BcGkucm9vdFxuICAgICAgLmFkZFJlc291cmNlKFwiZ2V0LWJvb2staW5mb1wiKVxuICAgICAgLmFkZE1ldGhvZChcIlBPU1RcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24obGFtYmRhU3RhY2suZ2V0Qm9va0luZm9MYW1iZGEpKTtcblxuICAgICAgXG4gICAgICAvLyBDcmVhdGUgL3VwbG9hZC1ib29rIHJlc291cmNlXG5jb25zdCB1cGxvYWRCb29rUmVzb3VyY2UgPSBsaWJyYXJpYW5BcGkucm9vdC5hZGRSZXNvdXJjZShcInVwbG9hZC1ib29rXCIpO1xuXG4vLyBQT1NUIG1ldGhvZCBmb3IgdXBsb2FkaW5nIHRoZSBib29rXG51cGxvYWRCb29rUmVzb3VyY2UuYWRkTWV0aG9kKFxuICBcIlBPU1RcIixcbiAgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24obGFtYmRhU3RhY2suYm9va0hhbmRsZXJMYW1iZGEsIHtcbiAgICBwcm94eTogdHJ1ZSwgLy8gPC0tIG1ha2Ugc3VyZSB0aGlzIGlzIHNldFxuICB9KSxcbiAge1xuICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAge1xuICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0sXG4gIH1cbik7XG5cblxuLy8gT1BUSU9OUyBtZXRob2QgdG8gc3VwcG9ydCBDT1JTIHByZWZsaWdodFxudXBsb2FkQm9va1Jlc291cmNlLmFkZE1ldGhvZChcbiAgXCJPUFRJT05TXCIsXG4gIG5ldyBhcGlnYXRld2F5Lk1vY2tJbnRlZ3JhdGlvbih7XG4gICAgaW50ZWdyYXRpb25SZXNwb25zZXM6IFtcbiAgICAgIHtcbiAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIjpcbiAgICAgICAgICAgIFwiJ0NvbnRlbnQtVHlwZSxYLUFtei1EYXRlLEF1dGhvcml6YXRpb24sWC1BcGktS2V5LFgtQW16LVNlY3VyaXR5LVRva2VuJ1wiLFxuICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCInKidcIixcbiAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiOiBcIidPUFRJT05TLFBPU1QnXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3BvbnNlVGVtcGxhdGVzOiB7XG4gICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IFwiXCIsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0sXG4gICAgcGFzc3Rocm91Z2hCZWhhdmlvcjogYXBpZ2F0ZXdheS5QYXNzdGhyb3VnaEJlaGF2aW9yLk5FVkVSLFxuICAgIHJlcXVlc3RUZW1wbGF0ZXM6IHtcbiAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiAne1wic3RhdHVzQ29kZVwiOiAyMDB9JyxcbiAgICB9LFxuICB9KSxcbiAge1xuICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAge1xuICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOiB0cnVlLFxuICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCI6IHRydWUsXG4gICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICB9XG4pO1xuXG4vLyBDcmVhdGUgL2dldC1ib29rL3tib29rSWR9IHJlc291cmNlXG5jb25zdCBnZXRCb29rUmVzb3VyY2UgPSBsaWJyYXJpYW5BcGkucm9vdC5hZGRSZXNvdXJjZShcImdldC1ib29rXCIpO1xuY29uc3QgZ2V0Qm9va0J5SWRSZXNvdXJjZSA9IGdldEJvb2tSZXNvdXJjZS5hZGRSZXNvdXJjZShcIntib29rSWR9XCIpO1xuXG4vLyBHRVQgbWV0aG9kIHRvIGZldGNoIGJvb2sgYnkgSURcbmdldEJvb2tCeUlkUmVzb3VyY2UuYWRkTWV0aG9kKFxuICBcIkdFVFwiLFxuICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFTdGFjay5nZXRCb29rTGFtYmRhKSxcbiAge1xuICAgIHJlcXVlc3RQYXJhbWV0ZXJzOiB7XG4gICAgICBcIm1ldGhvZC5yZXF1ZXN0LnBhdGguYm9va0lkXCI6IHRydWUsXG4gICAgfSxcbiAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgIHtcbiAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgc3RhdHVzQ29kZTogXCI0MDBcIixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHN0YXR1c0NvZGU6IFwiNDA0XCIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBzdGF0dXNDb2RlOiBcIjUwMFwiLFxuICAgICAgfSxcbiAgICBdLFxuICB9XG4pO1xuXG4vLyBPUFRJT05TIG1ldGhvZCBmb3IgQ09SU1xuZ2V0Qm9va0J5SWRSZXNvdXJjZS5hZGRNZXRob2QoXG4gIFwiT1BUSU9OU1wiLFxuICBuZXcgYXBpZ2F0ZXdheS5Nb2NrSW50ZWdyYXRpb24oe1xuICAgIGludGVncmF0aW9uUmVzcG9uc2VzOiBbXG4gICAgICB7XG4gICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXG4gICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6XG4gICAgICAgICAgICBcIidDb250ZW50LVR5cGUsWC1BbXotRGF0ZSxBdXRob3JpemF0aW9uLFgtQXBpLUtleSxYLUFtei1TZWN1cml0eS1Ub2tlbidcIixcbiAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiJyonXCIsXG4gICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogXCInR0VULE9QVElPTlMnXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3BvbnNlVGVtcGxhdGVzOiB7XG4gICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IFwiXCIsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0sXG4gICAgcGFzc3Rocm91Z2hCZWhhdmlvcjogYXBpZ2F0ZXdheS5QYXNzdGhyb3VnaEJlaGF2aW9yLk5FVkVSLFxuICAgIHJlcXVlc3RUZW1wbGF0ZXM6IHtcbiAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiAne1wic3RhdHVzQ29kZVwiOiAyMDB9JyxcbiAgICB9LFxuICB9KSxcbiAge1xuICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAge1xuICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOiB0cnVlLFxuICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICB9XG4pO1xuY29uc3QgZ2V0QWxsQm9va3NSZXNvdXJjZSA9IGxpYnJhcmlhbkFwaS5yb290LmFkZFJlc291cmNlKFwiYm9va3NcIik7XG5cbmdldEFsbEJvb2tzUmVzb3VyY2UuYWRkTWV0aG9kKFxuICBcIkdFVFwiLFxuICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFTdGFjay5nZXRBbGxCb29rc0xhbWJkYSksXG4gIHtcbiAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgIHtcbiAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICB9XG4pO1xuXG4vLyBPUFRJT05TIG1ldGhvZCBmb3IgQ09SUyBwcmVmbGlnaHRcbmdldEFsbEJvb2tzUmVzb3VyY2UuYWRkTWV0aG9kKFxuICBcIk9QVElPTlNcIixcbiAgbmV3IGFwaWdhdGV3YXkuTW9ja0ludGVncmF0aW9uKHtcbiAgICBpbnRlZ3JhdGlvblJlc3BvbnNlczogW1xuICAgICAge1xuICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOlxuICAgICAgICAgICAgXCInQ29udGVudC1UeXBlLFgtQW16LURhdGUsQXV0aG9yaXphdGlvbixYLUFwaS1LZXksWC1BbXotU2VjdXJpdHktVG9rZW4nXCIsXG4gICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiBcIicqJ1wiLFxuICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCI6IFwiJ09QVElPTlMsR0VUJ1wiLFxuICAgICAgICB9LFxuICAgICAgICByZXNwb25zZVRlbXBsYXRlczoge1xuICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiBcIlwiLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICAgIHBhc3N0aHJvdWdoQmVoYXZpb3I6IGFwaWdhdGV3YXkuUGFzc3Rocm91Z2hCZWhhdmlvci5ORVZFUixcbiAgICByZXF1ZXN0VGVtcGxhdGVzOiB7XG4gICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjogJ3tcInN0YXR1c0NvZGVcIjogMjAwfScsXG4gICAgfSxcbiAgfSksXG4gIHtcbiAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgIHtcbiAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIjogdHJ1ZSxcbiAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiOiB0cnVlLFxuICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgXSxcbiAgfVxuKTtcblxuLy8gQ3JlYXRlIGEgcmVzb3VyY2UgZm9yIG1hbmFnaW5nIGluZGl2aWR1YWwgYm9va3MgYnkgSURcbmNvbnN0IGJvb2tCeUlkUmVzb3VyY2UgPSBnZXRBbGxCb29rc1Jlc291cmNlLmFkZFJlc291cmNlKFwie2Jvb2tJZH1cIik7XG5cbi8vIEFkZCBERUxFVEUgbWV0aG9kIGZvciBkZWxldGluZyBhIGJvb2tcbmJvb2tCeUlkUmVzb3VyY2UuYWRkTWV0aG9kKFxuICBcIkRFTEVURVwiLFxuICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFTdGFjay5kZWxldGVCb29rTGFtYmRhdjIsIHtcbnJlcXVlc3RUZW1wbGF0ZXM6IHtcbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnN0cmluZ2lmeSh7XG4gICAgYm9va0lkOiBcIiRpbnB1dC5wYXJhbXMoJ2Jvb2tJZCcpXCIsXG4gICAgdXNlcklkOiBcImFkbWluXCIgLy8gRGVmYXVsdCBhZG1pbiBJRFxuICB9KVxufVxuXG4gIH0pLFxuICB7XG4gICAgcmVxdWVzdFBhcmFtZXRlcnM6IHtcbiAgICAgIFwibWV0aG9kLnJlcXVlc3QucGF0aC5ib29rSWRcIjogdHJ1ZSxcbiAgICB9LFxuICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAge1xuICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBzdGF0dXNDb2RlOiBcIjQwMFwiLFxuICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgXSxcbiAgfVxuKTtcblxuLy8gQWRkIFBVVCBtZXRob2QgZm9yIHVwZGF0aW5nIGEgYm9va1xuYm9va0J5SWRSZXNvdXJjZS5hZGRNZXRob2QoXG4gIFwiUFVUXCIsXG4gIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGxhbWJkYVN0YWNrLnVwZGF0ZUJvb2tMYW1iZGF2MiksXG4gIHtcbiAgICByZXF1ZXN0UGFyYW1ldGVyczoge1xuICAgICAgXCJtZXRob2QucmVxdWVzdC5wYXRoLmJvb2tJZFwiOiB0cnVlLFxuICAgIH0sXG4gICAgbWV0aG9kUmVzcG9uc2VzOiBbXG4gICAgICB7XG4gICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXG4gICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHN0YXR1c0NvZGU6IFwiNDAwXCIsXG4gICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICBdLFxuICB9XG4pO1xuXG4vLyBBZGQgT1BUSU9OUyBtZXRob2QgZm9yIENPUlNcbmJvb2tCeUlkUmVzb3VyY2UuYWRkTWV0aG9kKFxuICBcIk9QVElPTlNcIixcbiAgbmV3IGFwaWdhdGV3YXkuTW9ja0ludGVncmF0aW9uKHtcbiAgICBpbnRlZ3JhdGlvblJlc3BvbnNlczogW1xuICAgICAge1xuICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOlxuICAgICAgICAgICAgXCInQ29udGVudC1UeXBlLFgtQW16LURhdGUsQXV0aG9yaXphdGlvbixYLUFwaS1LZXksWC1BbXotU2VjdXJpdHktVG9rZW4nXCIsXG4gICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiBcIicqJ1wiLFxuICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCI6IFwiJ0RFTEVURSxQVVQsR0VULE9QVElPTlMnXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3BvbnNlVGVtcGxhdGVzOiB7XG4gICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IFwiXCIsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0sXG4gICAgcGFzc3Rocm91Z2hCZWhhdmlvcjogYXBpZ2F0ZXdheS5QYXNzdGhyb3VnaEJlaGF2aW9yLk5FVkVSLFxuICAgIHJlcXVlc3RUZW1wbGF0ZXM6IHtcbiAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiAne1wic3RhdHVzQ29kZVwiOiAyMDB9JyxcbiAgICB9LFxuICB9KSxcbiAge1xuICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAge1xuICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOiB0cnVlLFxuICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCI6IHRydWUsXG4gICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICB9XG4pO1xuXG5uZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIkJvb2tzQVBJRW5kcG9pbnRcIiwge1xuICB2YWx1ZTogYCR7bGlicmFyaWFuQXBpLnVybH1ib29rc2AsXG59KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiUmVhZGVyQVBJVVJMXCIsIHsgdmFsdWU6IHJlYWRlckFwaVVybCB9KTtcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIkxpYnJhcmlhbkFQSVVSTFwiLCB7IHZhbHVlOiBsaWJyYXJpYW5BcGlVcmwgfSk7XG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJRQVRhYmxlTmFtZVwiLCB7IHZhbHVlOiBkYlN0YWNrLnFhVGFibGUudGFibGVOYW1lIH0pO1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiRXh0cmFjdGVkVGV4dFRhYmxlTmFtZVwiLCB7XG4gICAgICB2YWx1ZTogZGJTdGFjay5leHRyYWN0ZWRUZXh0VGFibGUudGFibGVOYW1lLFxuICAgIH0pO1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiQXVkaW9GaWxlc0J1Y2tldE91dHB1dFwiLCB7XG4gICAgICB2YWx1ZTogc3RvcmFnZVN0YWNrLmF1ZGlvRmlsZXNCdWNrZXQuYnVja2V0TmFtZSxcbiAgICB9KTtcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIk5vdmFHZW5lcmF0ZWRDb250ZW50QnVja2V0XCIsIHtcbiAgICAgIHZhbHVlOiBzdG9yYWdlU3RhY2subm92YUNvbnRlbnRCdWNrZXQuYnVja2V0TmFtZSxcbiAgICB9KTtcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIkdldEJvb2tJbmZvQVBJVVJMXCIsIHtcbiAgICAgIHZhbHVlOiBgJHtsaWJyYXJpYW5BcGkudXJsfWdldC1ib29rLWluZm9gLFxuICAgIH0pO1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiR2V0Qm9va0J5SWRBUElVUkxcIiwge1xuICAgICAgdmFsdWU6IGAke2xpYnJhcmlhbkFwaS51cmx9Z2V0LWJvb2sve2Jvb2tJZH1gLFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIEFQSSByZXNvdXJjZXMgZm9yIG5vdGlmaWNhdGlvbnMgYW5kIGNsYXNzcm9vbSBtYW5hZ2VtZW50XG4gICAgLy8gVGhlc2UgZW5kcG9pbnRzIGFyZSBhY2Nlc3NpYmxlIHRvIGJvdGggcmVhZGVycyBhbmQgbGlicmFyaWFuc1xuXG4gICAgLy8gTm90aWZpY2F0aW9ucyBBUElcbiAgICBjb25zdCBub3RpZmljYXRpb25zUmVzb3VyY2UgPSByZWFkZXJBcGkucm9vdC5hZGRSZXNvdXJjZShcIm5vdGlmaWNhdGlvbnNcIik7XG5cbiAgICAvLyBHRVQgbWV0aG9kIHRvIGxpc3Qgbm90aWZpY2F0aW9uc1xuICAgIG5vdGlmaWNhdGlvbnNSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICBcIkdFVFwiLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZXZlbnROb3RpZmljYXRpb25zU3RhY2shLm5vdGlmaWNhdGlvbk1hbmFnZXJMYW1iZGEsIHtcbiAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIFBPU1QgbWV0aG9kIHRvIGNyZWF0ZSBub3RpZmljYXRpb25zXG4gICAgbm90aWZpY2F0aW9uc1Jlc291cmNlLmFkZE1ldGhvZChcbiAgICAgIFwiUE9TVFwiLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZXZlbnROb3RpZmljYXRpb25zU3RhY2shLm5vdGlmaWNhdGlvbk1hbmFnZXJMYW1iZGEsIHtcbiAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIFBVVCBtZXRob2QgdG8gdXBkYXRlIG5vdGlmaWNhdGlvbnMgKG1hcmsgYXMgcmVhZClcbiAgICBub3RpZmljYXRpb25zUmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgICAgXCJQVVRcIixcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGV2ZW50Tm90aWZpY2F0aW9uc1N0YWNrIS5ub3RpZmljYXRpb25NYW5hZ2VyTGFtYmRhLCB7XG4gICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXG4gICAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBERUxFVEUgbWV0aG9kIHRvIGRlbGV0ZSBub3RpZmljYXRpb25zXG4gICAgbm90aWZpY2F0aW9uc1Jlc291cmNlLmFkZE1ldGhvZChcbiAgICAgIFwiREVMRVRFXCIsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihldmVudE5vdGlmaWNhdGlvbnNTdGFjayEubm90aWZpY2F0aW9uTWFuYWdlckxhbWJkYSwge1xuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gT1BUSU9OUyBtZXRob2QgZm9yIENPUlNcbiAgICBub3RpZmljYXRpb25zUmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgICAgXCJPUFRJT05TXCIsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5Nb2NrSW50ZWdyYXRpb24oe1xuICAgICAgICBpbnRlZ3JhdGlvblJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXG4gICAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIjpcbiAgICAgICAgICAgICAgICBcIidDb250ZW50LVR5cGUsWC1BbXotRGF0ZSxBdXRob3JpemF0aW9uLFgtQXBpLUtleSxYLUFtei1TZWN1cml0eS1Ub2tlbidcIixcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiBcIicqJ1wiLFxuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiOiBcIidHRVQsUE9TVCxQVVQsREVMRVRFLE9QVElPTlMnXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzcG9uc2VUZW1wbGF0ZXM6IHtcbiAgICAgICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IFwiXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIHBhc3N0aHJvdWdoQmVoYXZpb3I6IGFwaWdhdGV3YXkuUGFzc3Rocm91Z2hCZWhhdmlvci5ORVZFUixcbiAgICAgICAgcmVxdWVzdFRlbXBsYXRlczoge1xuICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiAne1wic3RhdHVzQ29kZVwiOiAyMDB9JyxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6IHRydWUsXG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCI6IHRydWUsXG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gQ2xhc3Nyb29tIEFQSVxuICAgIGNvbnN0IGNsYXNzcm9vbXNSZXNvdXJjZSA9IHJlYWRlckFwaS5yb290LmFkZFJlc291cmNlKFwiY2xhc3Nyb29tc1wiKTtcblxuICAgIC8vIEdFVCBtZXRob2QgdG8gbGlzdCBjbGFzc3Jvb21zXG4gICAgY2xhc3Nyb29tc1Jlc291cmNlLmFkZE1ldGhvZChcbiAgICAgIFwiR0VUXCIsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihldmVudE5vdGlmaWNhdGlvbnNTdGFjayEuY2xhc3Nyb29tTWFuYWdlckxhbWJkYSwge1xuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gUE9TVCBtZXRob2QgdG8gY3JlYXRlIGNsYXNzcm9vbXNcbiAgICBjbGFzc3Jvb21zUmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgICAgXCJQT1NUXCIsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihldmVudE5vdGlmaWNhdGlvbnNTdGFjayEuY2xhc3Nyb29tTWFuYWdlckxhbWJkYSwge1xuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gUFVUIG1ldGhvZCB0byB1cGRhdGUgY2xhc3Nyb29tc1xuICAgIGNsYXNzcm9vbXNSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICBcIlBVVFwiLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZXZlbnROb3RpZmljYXRpb25zU3RhY2shLmNsYXNzcm9vbU1hbmFnZXJMYW1iZGEsIHtcbiAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIERFTEVURSBtZXRob2QgdG8gZGVsZXRlIGNsYXNzcm9vbXNcbiAgICBjbGFzc3Jvb21zUmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgICAgXCJERUxFVEVcIixcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGV2ZW50Tm90aWZpY2F0aW9uc1N0YWNrIS5jbGFzc3Jvb21NYW5hZ2VyTGFtYmRhLCB7XG4gICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXG4gICAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfVxuICAgICk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIkNsYXNzcm9vbXNBUElVUkxcIiwge1xuICAgICAgdmFsdWU6IGAke3JlYWRlckFwaS51cmx9Y2xhc3Nyb29tc2AsXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgQVBJIHJlc291cmNlcyBmb3IgYm9vayByZWNvbW1lbmRhdGlvbnNcbiAgICBjb25zdCByZWNvbW1lbmRhdGlvbnNSZXNvdXJjZSA9IHJlYWRlckFwaS5yb290LmFkZFJlc291cmNlKFwicmVjb21tZW5kYXRpb25zXCIpO1xuXG4gICAgLy8gR0VUIG1ldGhvZCB0byBnZXQgcGVyc29uYWxpemVkIHJlY29tbWVuZGF0aW9uc1xuICAgIHJlY29tbWVuZGF0aW9uc1Jlc291cmNlLmFkZE1ldGhvZChcbiAgICAgIFwiR0VUXCIsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFTdGFjay5ib29rUmVjb21tZW5kYXRpb25MYW1iZGEsIHtcbiAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIFBPU1QgbWV0aG9kIHRvIHVwZGF0ZSB1c2VyIHByZWZlcmVuY2VzIGZvciByZWNvbW1lbmRhdGlvbnNcbiAgICByZWNvbW1lbmRhdGlvbnNSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICBcIlBPU1RcIixcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGxhbWJkYVN0YWNrLmJvb2tSZWNvbW1lbmRhdGlvbkxhbWJkYSwge1xuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gT1BUSU9OUyBtZXRob2QgZm9yIENPUlNcbiAgICByZWNvbW1lbmRhdGlvbnNSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICBcIk9QVElPTlNcIixcbiAgICAgIG5ldyBhcGlnYXRld2F5Lk1vY2tJbnRlZ3JhdGlvbih7XG4gICAgICAgIGludGVncmF0aW9uUmVzcG9uc2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOlxuICAgICAgICAgICAgICAgIFwiJ0NvbnRlbnQtVHlwZSxYLUFtei1EYXRlLEF1dGhvcml6YXRpb24sWC1BcGktS2V5LFgtQW16LVNlY3VyaXR5LVRva2VuJ1wiLFxuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiJyonXCIsXG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCI6IFwiJ0dFVCxQT1NULE9QVElPTlMnXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzcG9uc2VUZW1wbGF0ZXM6IHtcbiAgICAgICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IFwiXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIHBhc3N0aHJvdWdoQmVoYXZpb3I6IGFwaWdhdGV3YXkuUGFzc3Rocm91Z2hCZWhhdmlvci5ORVZFUixcbiAgICAgICAgcmVxdWVzdFRlbXBsYXRlczoge1xuICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiAne1wic3RhdHVzQ29kZVwiOiAyMDB9JyxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6IHRydWUsXG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCI6IHRydWUsXG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gQ3JlYXRlIEFQSSByZXNvdXJjZXMgZm9yIHJlYWRpbmcgcHJvZ3Jlc3MgdHJhY2tpbmdcbiAgICBjb25zdCBwcm9ncmVzc1Jlc291cmNlID0gcmVhZGVyQXBpLnJvb3QuYWRkUmVzb3VyY2UoXCJwcm9ncmVzc1wiKTtcblxuICAgIC8vIEdFVCBtZXRob2QgdG8gbGlzdCByZWFkaW5nIHByb2dyZXNzXG4gICAgcHJvZ3Jlc3NSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICBcIkdFVFwiLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24obGFtYmRhU3RhY2sucmVhZGluZ1Byb2dyZXNzVHJhY2tlckxhbWJkYSwge1xuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gUE9TVCBtZXRob2QgdG8gY3JlYXRlL3VwZGF0ZSByZWFkaW5nIHByb2dyZXNzXG4gICAgcHJvZ3Jlc3NSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICBcIlBPU1RcIixcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGxhbWJkYVN0YWNrLnJlYWRpbmdQcm9ncmVzc1RyYWNrZXJMYW1iZGEsIHtcbiAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIE9QVElPTlMgbWV0aG9kIGZvciBDT1JTXG4gICAgcHJvZ3Jlc3NSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICBcIk9QVElPTlNcIixcbiAgICAgIG5ldyBhcGlnYXRld2F5Lk1vY2tJbnRlZ3JhdGlvbih7XG4gICAgICAgIGludGVncmF0aW9uUmVzcG9uc2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOlxuICAgICAgICAgICAgICAgIFwiJ0NvbnRlbnQtVHlwZSxYLUFtei1EYXRlLEF1dGhvcml6YXRpb24sWC1BcGktS2V5LFgtQW16LVNlY3VyaXR5LVRva2VuJ1wiLFxuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiJyonXCIsXG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCI6IFwiJ0dFVCxQT1NULE9QVElPTlMnXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzcG9uc2VUZW1wbGF0ZXM6IHtcbiAgICAgICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IFwiXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIHBhc3N0aHJvdWdoQmVoYXZpb3I6IGFwaWdhdGV3YXkuUGFzc3Rocm91Z2hCZWhhdmlvci5ORVZFUixcbiAgICAgICAgcmVxdWVzdFRlbXBsYXRlczoge1xuICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiAne1wic3RhdHVzQ29kZVwiOiAyMDB9JyxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6IHRydWUsXG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCI6IHRydWUsXG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gQ3JlYXRlIEFQSSByZXNvdXJjZXMgZm9yIHVzZXIgaGlnaGxpZ2h0c1xuICAgIGNvbnN0IGhpZ2hsaWdodHNSZXNvdXJjZSA9IHJlYWRlckFwaS5yb290LmFkZFJlc291cmNlKFwiaGlnaGxpZ2h0c1wiKTtcblxuICAgIC8vIEdFVCBtZXRob2QgdG8gbGlzdCBoaWdobGlnaHRzXG4gICAgaGlnaGxpZ2h0c1Jlc291cmNlLmFkZE1ldGhvZChcbiAgICAgIFwiR0VUXCIsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFTdGFjay51c2VySGlnaGxpZ2h0c0xhbWJkYSwge1xuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gUE9TVCBtZXRob2QgdG8gY3JlYXRlIGhpZ2hsaWdodHNcbiAgICBoaWdobGlnaHRzUmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgICAgXCJQT1NUXCIsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFTdGFjay51c2VySGlnaGxpZ2h0c0xhbWJkYSwge1xuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gUFVUIG1ldGhvZCB0byB1cGRhdGUgaGlnaGxpZ2h0c1xuICAgIGhpZ2hsaWdodHNSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICBcIlBVVFwiLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24obGFtYmRhU3RhY2sudXNlckhpZ2hsaWdodHNMYW1iZGEsIHtcbiAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIERFTEVURSBtZXRob2QgdG8gZGVsZXRlIGhpZ2hsaWdodHNcbiAgICBoaWdobGlnaHRzUmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgICAgXCJERUxFVEVcIixcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGxhbWJkYVN0YWNrLnVzZXJIaWdobGlnaHRzTGFtYmRhLCB7XG4gICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXG4gICAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBPUFRJT05TIG1ldGhvZCBmb3IgQ09SU1xuICAgIGhpZ2hsaWdodHNSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICBcIk9QVElPTlNcIixcbiAgICAgIG5ldyBhcGlnYXRld2F5Lk1vY2tJbnRlZ3JhdGlvbih7XG4gICAgICAgIGludGVncmF0aW9uUmVzcG9uc2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOlxuICAgICAgICAgICAgICAgIFwiJ0NvbnRlbnQtVHlwZSxYLUFtei1EYXRlLEF1dGhvcml6YXRpb24sWC1BcGktS2V5LFgtQW16LVNlY3VyaXR5LVRva2VuJ1wiLFxuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiJyonXCIsXG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCI6IFwiJ0dFVCxQT1NULFBVVCxERUxFVEUsT1BUSU9OUydcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXNwb25zZVRlbXBsYXRlczoge1xuICAgICAgICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjogXCJcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgcGFzc3Rocm91Z2hCZWhhdmlvcjogYXBpZ2F0ZXdheS5QYXNzdGhyb3VnaEJlaGF2aW9yLk5FVkVSLFxuICAgICAgICByZXF1ZXN0VGVtcGxhdGVzOiB7XG4gICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6ICd7XCJzdGF0dXNDb2RlXCI6IDIwMH0nLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXG4gICAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBDcmVhdGUgQVBJIHJlc291cmNlcyBmb3Igdm9jYWJ1bGFyeSBtYW5hZ2VtZW50XG4gICAgY29uc3Qgdm9jYWJ1bGFyeVJlc291cmNlID0gcmVhZGVyQXBpLnJvb3QuYWRkUmVzb3VyY2UoXCJ2b2NhYnVsYXJ5XCIpO1xuXG4gICAgLy8gR0VUIG1ldGhvZCB0byBsaXN0IHZvY2FidWxhcnkgaXRlbXNcbiAgICB2b2NhYnVsYXJ5UmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgICAgXCJHRVRcIixcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGxhbWJkYVN0YWNrLnZvY2FidWxhcnlNYW5hZ2VyTGFtYmRhLCB7XG4gICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXG4gICAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBQT1NUIG1ldGhvZCB0byBhZGQgdm9jYWJ1bGFyeSBpdGVtc1xuICAgIHZvY2FidWxhcnlSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICBcIlBPU1RcIixcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGxhbWJkYVN0YWNrLnZvY2FidWxhcnlNYW5hZ2VyTGFtYmRhLCB7XG4gICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXG4gICAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBQVVQgbWV0aG9kIHRvIHVwZGF0ZSB2b2NhYnVsYXJ5IGl0ZW1zXG4gICAgdm9jYWJ1bGFyeVJlc291cmNlLmFkZE1ldGhvZChcbiAgICAgIFwiUFVUXCIsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFTdGFjay52b2NhYnVsYXJ5TWFuYWdlckxhbWJkYSwge1xuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gREVMRVRFIG1ldGhvZCB0byBkZWxldGUgdm9jYWJ1bGFyeSBpdGVtc1xuICAgIHZvY2FidWxhcnlSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICBcIkRFTEVURVwiLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24obGFtYmRhU3RhY2sudm9jYWJ1bGFyeU1hbmFnZXJMYW1iZGEsIHtcbiAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIE9QVElPTlMgbWV0aG9kIGZvciBDT1JTXG4gICAgdm9jYWJ1bGFyeVJlc291cmNlLmFkZE1ldGhvZChcbiAgICAgIFwiT1BUSU9OU1wiLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTW9ja0ludGVncmF0aW9uKHtcbiAgICAgICAgaW50ZWdyYXRpb25SZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6XG4gICAgICAgICAgICAgICAgXCInQ29udGVudC1UeXBlLFgtQW16LURhdGUsQXV0aG9yaXphdGlvbixYLUFwaS1LZXksWC1BbXotU2VjdXJpdHktVG9rZW4nXCIsXG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCInKidcIixcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogXCInR0VULFBPU1QsUFVULERFTEVURSxPUFRJT05TJ1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3BvbnNlVGVtcGxhdGVzOiB7XG4gICAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiBcIlwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBwYXNzdGhyb3VnaEJlaGF2aW9yOiBhcGlnYXRld2F5LlBhc3N0aHJvdWdoQmVoYXZpb3IuTkVWRVIsXG4gICAgICAgIHJlcXVlc3RUZW1wbGF0ZXM6IHtcbiAgICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjogJ3tcInN0YXR1c0NvZGVcIjogMjAwfScsXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOiB0cnVlLFxuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiOiB0cnVlLFxuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIENyZWF0ZSBBUEkgcmVzb3VyY2VzIGZvciBxdWl6IGFzc2Vzc21lbnRzXG4gICAgY29uc3QgcXVpelJlc291cmNlID0gcmVhZGVyQXBpLnJvb3QuYWRkUmVzb3VyY2UoXCJxdWl6emVzXCIpO1xuXG4gICAgLy8gR0VUIG1ldGhvZCB0byBsaXN0IHF1aXp6ZXNcbiAgICBxdWl6UmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgICAgXCJHRVRcIixcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGxhbWJkYVN0YWNrLnF1aXpBc3Nlc3NtZW50TGFtYmRhLCB7XG4gICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXG4gICAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBQT1NUIG1ldGhvZCB0byBjcmVhdGUvc3VibWl0IHF1aXp6ZXNcbiAgICBxdWl6UmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgICAgXCJQT1NUXCIsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFTdGFjay5xdWl6QXNzZXNzbWVudExhbWJkYSwge1xuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gT1BUSU9OUyBtZXRob2QgZm9yIENPUlNcbiAgICBxdWl6UmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgICAgXCJPUFRJT05TXCIsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5Nb2NrSW50ZWdyYXRpb24oe1xuICAgICAgICBpbnRlZ3JhdGlvblJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXG4gICAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIjpcbiAgICAgICAgICAgICAgICBcIidDb250ZW50LVR5cGUsWC1BbXotRGF0ZSxBdXRob3JpemF0aW9uLFgtQXBpLUtleSxYLUFtei1TZWN1cml0eS1Ub2tlbidcIixcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiBcIicqJ1wiLFxuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiOiBcIidHRVQsUE9TVCxPUFRJT05TJ1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3BvbnNlVGVtcGxhdGVzOiB7XG4gICAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiBcIlwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBwYXNzdGhyb3VnaEJlaGF2aW9yOiBhcGlnYXRld2F5LlBhc3N0aHJvdWdoQmVoYXZpb3IuTkVWRVIsXG4gICAgICAgIHJlcXVlc3RUZW1wbGF0ZXM6IHtcbiAgICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjogJ3tcInN0YXR1c0NvZGVcIjogMjAwfScsXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOiB0cnVlLFxuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiOiB0cnVlLFxuICAgICAgICAgICAgICBcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIENyZWF0ZSBBUEkgcmVzb3VyY2VzIGZvciBzdHVkZW50IGFuYWx5dGljc1xuICAgIGNvbnN0IGFuYWx5dGljc1Jlc291cmNlID0gcmVhZGVyQXBpLnJvb3QuYWRkUmVzb3VyY2UoXCJhbmFseXRpY3NcIik7XG5cbiAgICAvLyBHRVQgbWV0aG9kIHRvIGdldCBzdHVkZW50IGFuYWx5dGljc1xuICAgIGFuYWx5dGljc1Jlc291cmNlLmFkZE1ldGhvZChcbiAgICAgIFwiR0VUXCIsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFTdGFjay5zdHVkZW50QW5hbHl0aWNzTGFtYmRhLCB7XG4gICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXG4gICAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBPUFRJT05TIG1ldGhvZCBmb3IgQ09SU1xuICAgIGFuYWx5dGljc1Jlc291cmNlLmFkZE1ldGhvZChcbiAgICAgIFwiT1BUSU9OU1wiLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTW9ja0ludGVncmF0aW9uKHtcbiAgICAgICAgaW50ZWdyYXRpb25SZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6XG4gICAgICAgICAgICAgICAgXCInQ29udGVudC1UeXBlLFgtQW16LURhdGUsQXV0aG9yaXphdGlvbixYLUFwaS1LZXksWC1BbXotU2VjdXJpdHktVG9rZW4nXCIsXG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCInKidcIixcbiAgICAgICAgICAgICAgXCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogXCInR0VULE9QVElPTlMnXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzcG9uc2VUZW1wbGF0ZXM6IHtcbiAgICAgICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IFwiXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIHBhc3N0aHJvdWdoQmVoYXZpb3I6IGFwaWdhdGV3YXkuUGFzc3Rocm91Z2hCZWhhdmlvci5ORVZFUixcbiAgICAgICAgcmVxdWVzdFRlbXBsYXRlczoge1xuICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiAne1wic3RhdHVzQ29kZVwiOiAyMDB9JyxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6IHRydWUsXG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCI6IHRydWUsXG4gICAgICAgICAgICAgIFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gQWRkIEFQSSBHYXRld2F5IG91dHB1dHMgZm9yIG5ldyBlbmRwb2ludHNcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIk5vdGlmaWNhdGlvbnNBUElVUkxcIiwge1xuICAgICAgdmFsdWU6IGAke3JlYWRlckFwaS51cmx9bm90aWZpY2F0aW9uc2AsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIlJlY29tbWVuZGF0aW9uc0FQSVVSTFwiLCB7XG4gICAgICB2YWx1ZTogYCR7cmVhZGVyQXBpLnVybH1yZWNvbW1lbmRhdGlvbnNgLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJSZWFkaW5nUHJvZ3Jlc3NBUElVUkxcIiwge1xuICAgICAgdmFsdWU6IGAke3JlYWRlckFwaS51cmx9cHJvZ3Jlc3NgLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJVc2VySGlnaGxpZ2h0c0FQSVVSTFwiLCB7XG4gICAgICB2YWx1ZTogYCR7cmVhZGVyQXBpLnVybH1oaWdobGlnaHRzYCxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiVm9jYWJ1bGFyeUFQSVVSTFwiLCB7XG4gICAgICB2YWx1ZTogYCR7cmVhZGVyQXBpLnVybH12b2NhYnVsYXJ5YCxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiUXVpenplc0FQSVVSTFwiLCB7XG4gICAgICB2YWx1ZTogYCR7cmVhZGVyQXBpLnVybH1xdWl6emVzYCxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiQW5hbHl0aWNzQVBJVVJMXCIsIHtcbiAgICAgIHZhbHVlOiBgJHtyZWFkZXJBcGkudXJsfWFuYWx5dGljc2AsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==