import * as cdk from "aws-cdk-lib";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { DBStack } from "../DB/db-stack";
import { LambdaStack } from "./lambda-stacks";
import { StorageStack } from "../Storage/storage-stack";
import { EventNotificationsStack } from "../sharedresources/EventNotificationsStack";

// Import dotenv to load environment variables
import * as dotenv from "dotenv";
dotenv.config(); // Load .env file

// Define APIStack without cloudfrontDomain in props
export class APIStack extends cdk.Stack {
  constructor(
    scope: cdk.App,
    id: string,
    dbStack: DBStack,
    lambdaStack: LambdaStack,
    storageStack: StorageStack,
    eventNotificationsStack?: EventNotificationsStack,
    props?: cdk.StackProps
  ) {
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
    newGetBookInfoResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaStack.getBookInfoLambda),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // OPTIONS method for CORS preflight
    newGetBookInfoResource.addMethod(
      "OPTIONS",
      new apigateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
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
      }),
      {
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
      }
    );

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
      integration: new integrations.HttpLambdaIntegration(
        "NewGetUploadUrlsIntegration",
        lambdaStack.getUploadUrlsLambda
      ),
    });

    // POST /save-book → bookHandlerLambda
    newBookUploadPresignApi.addRoutes({
      path: "/save-book",
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration(
        "NewSaveBookIntegration",
        lambdaStack.bookHandlerLambda
      ),
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
      integration: new integrations.HttpLambdaIntegration(
        "NewBookSaveIntegration",
        lambdaStack.bookHandlerLambda
      ),
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
      integration: new integrations.HttpLambdaIntegration(
        "NewGetBookIntegration",
        lambdaStack.getBookLambda
      ),
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
      integration: new integrations.HttpLambdaIntegration(
        "NewUpdateBookIntegration",
        lambdaStack.updateBookLambda
      ),
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
      integration: new integrations.HttpLambdaIntegration(
        "NewDeleteBookIntegration",
        lambdaStack.deleteBookLambda 
      ),
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
      integration: new integrations.HttpLambdaIntegration(
        "NewGetAllBooksIntegration",
        lambdaStack.getAllBooksLambda 
      ),
    });

    new cdk.CfnOutput(this, "NewGetAllBooksApiURL", {
      value: `${newGetAllBooksApi.apiEndpoint}/books`,
    });
////////////////////////////////////

    // Access environment variables from .env
    const readerApiUrl = process.env.READER_API_URL|| '';
    const librarianApiUrl = process.env.LIBRARIAN_API_URL|| '';
    const getBookInfoApiUrl = process.env.GET_BOOK_INFO_API_URL|| '';
    const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN|| '';
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

    // Create /get-upload-urls resource
const getUploadUrlsResource = librarianApi.root.addResource("get-upload-urls");

// POST method for generating pre-signed S3 URLs
getUploadUrlsResource.addMethod(
  "POST",
  new apigateway.LambdaIntegration(lambdaStack.getUploadUrlsLambda),
  {
    methodResponses: [
      {
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": true,
        },
      },
    ],
  }
);

// OPTIONAL: Add OPTIONS method to support CORS preflight
getUploadUrlsResource.addMethod(
  "OPTIONS",
  new apigateway.MockIntegration({
    integrationResponses: [
      {
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Headers":
            "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
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
  }),
  {
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
  }
);

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
uploadBookResource.addMethod(
  "POST",
  new apigateway.LambdaIntegration(lambdaStack.bookHandlerLambda, {
    proxy: true, // <-- make sure this is set
  }),
  {
    methodResponses: [
      {
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": true,
        },
      },
    ],
  }
);


// OPTIONS method to support CORS preflight
uploadBookResource.addMethod(
  "OPTIONS",
  new apigateway.MockIntegration({
    integrationResponses: [
      {
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Headers":
            "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
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
  }),
  {
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
  }
);

// Create /get-book/{bookId} resource
const getBookResource = librarianApi.root.addResource("get-book");
const getBookByIdResource = getBookResource.addResource("{bookId}");

// GET method to fetch book by ID
getBookByIdResource.addMethod(
  "GET",
  new apigateway.LambdaIntegration(lambdaStack.getBookLambda),
  {
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
  }
);

// OPTIONS method for CORS
getBookByIdResource.addMethod(
  "OPTIONS",
  new apigateway.MockIntegration({
    integrationResponses: [
      {
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Headers":
            "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
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
  }),
  {
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
  }
);
const getAllBooksResource = librarianApi.root.addResource("books");

getAllBooksResource.addMethod(
  "GET",
  new apigateway.LambdaIntegration(lambdaStack.getAllBooksLambda),
  {
    methodResponses: [
      {
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": true,
        },
      },
    ],
  }
);

// OPTIONS method for CORS preflight
getAllBooksResource.addMethod(
  "OPTIONS",
  new apigateway.MockIntegration({
    integrationResponses: [
      {
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Headers":
            "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
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
  }),
  {
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
  }
);

// Create a resource for managing individual books by ID
const bookByIdResource = getAllBooksResource.addResource("{bookId}");

// Add DELETE method for deleting a book
bookByIdResource.addMethod(
  "DELETE",
  new apigateway.LambdaIntegration(lambdaStack.deleteBookLambdav2, {
requestTemplates: {
  'application/json': JSON.stringify({
    bookId: "$input.params('bookId')",
    userId: "admin" // Default admin ID
  })
}

  }),
  {
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
  }
);

// Add PUT method for updating a book
bookByIdResource.addMethod(
  "PUT",
  new apigateway.LambdaIntegration(lambdaStack.updateBookLambdav2),
  {
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
  }
);

// Add OPTIONS method for CORS
bookByIdResource.addMethod(
  "OPTIONS",
  new apigateway.MockIntegration({
    integrationResponses: [
      {
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Headers":
            "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
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
  }),
  {
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
  }
);

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
    notificationsResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(eventNotificationsStack!.notificationManagerLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // POST method to create notifications
    notificationsResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(eventNotificationsStack!.notificationManagerLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // PUT method to update notifications (mark as read)
    notificationsResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(eventNotificationsStack!.notificationManagerLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // DELETE method to delete notifications
    notificationsResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(eventNotificationsStack!.notificationManagerLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // OPTIONS method for CORS
    notificationsResource.addMethod(
      "OPTIONS",
      new apigateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
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
      }),
      {
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
      }
    );

    // Classroom API
    const classroomsResource = readerApi.root.addResource("classrooms");

    // GET method to list classrooms
    classroomsResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(eventNotificationsStack!.classroomManagerLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // POST method to create classrooms
    classroomsResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(eventNotificationsStack!.classroomManagerLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // PUT method to update classrooms
    classroomsResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(eventNotificationsStack!.classroomManagerLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // DELETE method to delete classrooms
    classroomsResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(eventNotificationsStack!.classroomManagerLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    new cdk.CfnOutput(this, "ClassroomsAPIURL", {
      value: `${readerApi.url}classrooms`,
    });

    // Create API resources for book recommendations
    const recommendationsResource = readerApi.root.addResource("recommendations");

    // GET method to get personalized recommendations
    recommendationsResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(lambdaStack.bookRecommendationLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // POST method to update user preferences for recommendations
    recommendationsResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaStack.bookRecommendationLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // OPTIONS method for CORS
    recommendationsResource.addMethod(
      "OPTIONS",
      new apigateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
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
      }),
      {
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
      }
    );

    // Create API resources for reading progress tracking
    const progressResource = readerApi.root.addResource("progress");

    // GET method to list reading progress
    progressResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(lambdaStack.readingProgressTrackerLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // POST method to create/update reading progress
    progressResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaStack.readingProgressTrackerLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // OPTIONS method for CORS
    progressResource.addMethod(
      "OPTIONS",
      new apigateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
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
      }),
      {
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
      }
    );

    // Create API resources for user highlights
    const highlightsResource = readerApi.root.addResource("highlights");

    // GET method to list highlights
    highlightsResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(lambdaStack.userHighlightsLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // POST method to create highlights
    highlightsResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaStack.userHighlightsLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // PUT method to update highlights
    highlightsResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(lambdaStack.userHighlightsLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // DELETE method to delete highlights
    highlightsResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(lambdaStack.userHighlightsLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // OPTIONS method for CORS
    highlightsResource.addMethod(
      "OPTIONS",
      new apigateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
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
      }),
      {
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
      }
    );

    // Create API resources for vocabulary management
    const vocabularyResource = readerApi.root.addResource("vocabulary");

    // GET method to list vocabulary items
    vocabularyResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(lambdaStack.vocabularyManagerLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // POST method to add vocabulary items
    vocabularyResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaStack.vocabularyManagerLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // PUT method to update vocabulary items
    vocabularyResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(lambdaStack.vocabularyManagerLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // DELETE method to delete vocabulary items
    vocabularyResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(lambdaStack.vocabularyManagerLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // OPTIONS method for CORS
    vocabularyResource.addMethod(
      "OPTIONS",
      new apigateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
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
      }),
      {
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
      }
    );

    // Create API resources for quiz assessments
    const quizResource = readerApi.root.addResource("quizzes");

    // GET method to list quizzes
    quizResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(lambdaStack.quizAssessmentLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // POST method to create/submit quizzes
    quizResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaStack.quizAssessmentLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // OPTIONS method for CORS
    quizResource.addMethod(
      "OPTIONS",
      new apigateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
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
      }),
      {
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
      }
    );

    // Create API resources for student analytics
    const analyticsResource = readerApi.root.addResource("analytics");

    // GET method to get student analytics
    analyticsResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(lambdaStack.studentAnalyticsLambda, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // OPTIONS method for CORS
    analyticsResource.addMethod(
      "OPTIONS",
      new apigateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers":
                "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
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
      }),
      {
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
      }
    );

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
