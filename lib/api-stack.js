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
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
class APIStack extends cdk.Stack {
    constructor(scope, id, dbStack, props) {
        super(scope, id, props);
        // Lambda function to insert sample cases into DynamoDB
        const insertSampleCaseLambda = new lambda.Function(this, "InsertSampleCaseLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "insertSampleCase.handler", // Ensure this points to the correct handler
            code: lambda.Code.fromAsset("lambda"),
            environment: {
                CASES_TABLE_NAME: dbStack.casesTable.tableName, // Pass table name as environment variable
            },
        });
        // Lambda function to insert new case into DynamoDB
        const insertCaseLambda = new lambda.Function(this, "InsertCaseLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "insertCase.handler",
            code: lambda.Code.fromAsset("lambda"),
            environment: {
                CASES_TABLE_NAME: dbStack.casesTable.tableName,
            },
        });
        // Lambda function to get all cases from DynamoDB
        const getCasesLambda = new lambda.Function(this, "GetCasesLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "getCases.handler",
            code: lambda.Code.fromAsset("lambda"),
            environment: {
                CASES_TABLE_NAME: dbStack.casesTable.tableName,
            },
        });
        // Lambda function for Hello World
        const helloLambda = new lambda.Function(this, "HelloLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda"),
        });
        // Grant permissions for Lambda functions to interact with DynamoDB
        dbStack.casesTable.grantReadWriteData(insertCaseLambda);
        dbStack.casesTable.grantReadData(getCasesLambda);
        dbStack.casesTable.grantReadWriteData(insertSampleCaseLambda);
        // Create the API Gateway with CORS enabled
        const api = new apigateway.RestApi(this, "[ChallengeName]Api", {
            restApiName: "[ChallengeName] Service",
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
                allowCredentials: true,
            },
        });
        // Resource for '/cases' to insert new case
        const cases = api.root.addResource("cases");
        cases.addMethod("POST", new apigateway.LambdaIntegration(insertCaseLambda)); // POST /cases
        cases.addMethod("GET", new apigateway.LambdaIntegration(getCasesLambda)); // GET /cases
        // Resource for '/cases/sample' to insert sample cases
        const sampleCases = cases.addResource("sample");
        sampleCases.addMethod("POST", new apigateway.LambdaIntegration(insertSampleCaseLambda)); // POST /cases/sample
        // Resource for '/hello'
        const hello = api.root.addResource("hello");
        hello.addMethod("GET", new apigateway.LambdaIntegration(helloLambda)); // GET /hello
        // Outputs for both APIs
        new cdk.CfnOutput(this, "ApiEndpoint", {
            value: api.url, // Combined API URL
        });
    }
}
exports.APIStack = APIStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW1DO0FBQ25DLCtEQUFpRDtBQUNqRCx1RUFBeUQ7QUFHekQsTUFBYSxRQUFTLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDckMsWUFBWSxLQUFjLEVBQUUsRUFBVSxFQUFFLE9BQWdCLEVBQUUsS0FBc0I7UUFDOUUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsdURBQXVEO1FBQ3ZELE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRTtZQUNqRixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSwwQkFBMEIsRUFBRyw0Q0FBNEM7WUFDbEYsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUNyQyxXQUFXLEVBQUU7Z0JBQ1gsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsMENBQTBDO2FBQzNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsbURBQW1EO1FBQ25ELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUNyRSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSxvQkFBb0I7WUFDN0IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUNyQyxXQUFXLEVBQUU7Z0JBQ1gsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTO2FBQy9DO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsaURBQWlEO1FBQ2pELE1BQU0sY0FBYyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDakUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsa0JBQWtCO1lBQzNCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDckMsV0FBVyxFQUFFO2dCQUNYLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUzthQUMvQztTQUNGLENBQUMsQ0FBQztRQUVILGtDQUFrQztRQUNsQyxNQUFNLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUMzRCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7U0FDdEMsQ0FBQyxDQUFDO1FBRUgsbUVBQW1FO1FBQ25FLE9BQU8sQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN4RCxPQUFPLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNqRCxPQUFPLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFFOUQsMkNBQTJDO1FBQzNDLE1BQU0sR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDN0QsV0FBVyxFQUFFLHlCQUF5QjtZQUN0QywyQkFBMkIsRUFBRTtnQkFDM0IsWUFBWSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVztnQkFDekMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVztnQkFDekMsWUFBWSxFQUFFLENBQUMsY0FBYyxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsV0FBVyxDQUFDO2dCQUMxRSxnQkFBZ0IsRUFBRSxJQUFJO2FBQ3ZCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsMkNBQTJDO1FBQzNDLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWM7UUFDM0YsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFHLGFBQWE7UUFFekYsc0RBQXNEO1FBQ3RELE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEQsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUUscUJBQXFCO1FBRS9HLHdCQUF3QjtRQUN4QixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUUsYUFBYTtRQUVyRix3QkFBd0I7UUFDeEIsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDckMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUcsbUJBQW1CO1NBQ3JDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQTNFRCw0QkEyRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSBcImF3cy1jZGstbGliL2F3cy1sYW1iZGFcIjtcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSBcImF3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5XCI7XG5pbXBvcnQgeyBEQlN0YWNrIH0gZnJvbSBcIi4vREJzdGFja1wiOyAvLyBJbXBvcnQgREJTdGFja1xuXG5leHBvcnQgY2xhc3MgQVBJU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkFwcCwgaWQ6IHN0cmluZywgZGJTdGFjazogREJTdGFjaywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gTGFtYmRhIGZ1bmN0aW9uIHRvIGluc2VydCBzYW1wbGUgY2FzZXMgaW50byBEeW5hbW9EQlxuICAgIGNvbnN0IGluc2VydFNhbXBsZUNhc2VMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwiSW5zZXJ0U2FtcGxlQ2FzZUxhbWJkYVwiLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6IFwiaW5zZXJ0U2FtcGxlQ2FzZS5oYW5kbGVyXCIsICAvLyBFbnN1cmUgdGhpcyBwb2ludHMgdG8gdGhlIGNvcnJlY3QgaGFuZGxlclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhXCIpLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgQ0FTRVNfVEFCTEVfTkFNRTogZGJTdGFjay5jYXNlc1RhYmxlLnRhYmxlTmFtZSwgLy8gUGFzcyB0YWJsZSBuYW1lIGFzIGVudmlyb25tZW50IHZhcmlhYmxlXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gTGFtYmRhIGZ1bmN0aW9uIHRvIGluc2VydCBuZXcgY2FzZSBpbnRvIER5bmFtb0RCXG4gICAgY29uc3QgaW5zZXJ0Q2FzZUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJJbnNlcnRDYXNlTGFtYmRhXCIsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogXCJpbnNlcnRDYXNlLmhhbmRsZXJcIixcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChcImxhbWJkYVwiKSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIENBU0VTX1RBQkxFX05BTUU6IGRiU3RhY2suY2FzZXNUYWJsZS50YWJsZU5hbWUsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gTGFtYmRhIGZ1bmN0aW9uIHRvIGdldCBhbGwgY2FzZXMgZnJvbSBEeW5hbW9EQlxuICAgIGNvbnN0IGdldENhc2VzTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIkdldENhc2VzTGFtYmRhXCIsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogXCJnZXRDYXNlcy5oYW5kbGVyXCIsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGFcIiksXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBDQVNFU19UQUJMRV9OQU1FOiBkYlN0YWNrLmNhc2VzVGFibGUudGFibGVOYW1lLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIExhbWJkYSBmdW5jdGlvbiBmb3IgSGVsbG8gV29ybGRcbiAgICBjb25zdCBoZWxsb0xhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJIZWxsb0xhbWJkYVwiLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhXCIpLFxuICAgIH0pO1xuXG4gICAgLy8gR3JhbnQgcGVybWlzc2lvbnMgZm9yIExhbWJkYSBmdW5jdGlvbnMgdG8gaW50ZXJhY3Qgd2l0aCBEeW5hbW9EQlxuICAgIGRiU3RhY2suY2FzZXNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoaW5zZXJ0Q2FzZUxhbWJkYSk7XG4gICAgZGJTdGFjay5jYXNlc1RhYmxlLmdyYW50UmVhZERhdGEoZ2V0Q2FzZXNMYW1iZGEpO1xuICAgIGRiU3RhY2suY2FzZXNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoaW5zZXJ0U2FtcGxlQ2FzZUxhbWJkYSk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIEFQSSBHYXRld2F5IHdpdGggQ09SUyBlbmFibGVkXG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCBcIltDaGFsbGVuZ2VOYW1lXUFwaVwiLCB7XG4gICAgICByZXN0QXBpTmFtZTogXCJbQ2hhbGxlbmdlTmFtZV0gU2VydmljZVwiLFxuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XG4gICAgICAgIGFsbG93T3JpZ2luczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9PUklHSU5TLFxuICAgICAgICBhbGxvd01ldGhvZHM6IGFwaWdhdGV3YXkuQ29ycy5BTExfTUVUSE9EUyxcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbJ0NvbnRlbnQtVHlwZScsICdYLUFtei1EYXRlJywgJ0F1dGhvcml6YXRpb24nLCAnWC1BcGktS2V5J10sXG4gICAgICAgIGFsbG93Q3JlZGVudGlhbHM6IHRydWUsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gUmVzb3VyY2UgZm9yICcvY2FzZXMnIHRvIGluc2VydCBuZXcgY2FzZVxuICAgIGNvbnN0IGNhc2VzID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoXCJjYXNlc1wiKTtcbiAgICBjYXNlcy5hZGRNZXRob2QoXCJQT1NUXCIsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGluc2VydENhc2VMYW1iZGEpKTsgLy8gUE9TVCAvY2FzZXNcbiAgICBjYXNlcy5hZGRNZXRob2QoXCJHRVRcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZ2V0Q2FzZXNMYW1iZGEpKTsgICAvLyBHRVQgL2Nhc2VzXG5cbiAgICAvLyBSZXNvdXJjZSBmb3IgJy9jYXNlcy9zYW1wbGUnIHRvIGluc2VydCBzYW1wbGUgY2FzZXNcbiAgICBjb25zdCBzYW1wbGVDYXNlcyA9IGNhc2VzLmFkZFJlc291cmNlKFwic2FtcGxlXCIpO1xuICAgIHNhbXBsZUNhc2VzLmFkZE1ldGhvZChcIlBPU1RcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaW5zZXJ0U2FtcGxlQ2FzZUxhbWJkYSkpOyAgLy8gUE9TVCAvY2FzZXMvc2FtcGxlXG5cbiAgICAvLyBSZXNvdXJjZSBmb3IgJy9oZWxsbydcbiAgICBjb25zdCBoZWxsbyA9IGFwaS5yb290LmFkZFJlc291cmNlKFwiaGVsbG9cIik7XG4gICAgaGVsbG8uYWRkTWV0aG9kKFwiR0VUXCIsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGhlbGxvTGFtYmRhKSk7ICAvLyBHRVQgL2hlbGxvXG5cbiAgICAvLyBPdXRwdXRzIGZvciBib3RoIEFQSXNcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIkFwaUVuZHBvaW50XCIsIHtcbiAgICAgIHZhbHVlOiBhcGkudXJsLCAgLy8gQ29tYmluZWQgQVBJIFVSTFxuICAgIH0pO1xuICB9XG59XG5cbiJdfQ==