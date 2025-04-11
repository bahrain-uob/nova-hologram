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
        // Create the API Gateway
        const api = new apigateway.RestApi(this, "[ChallengeName]Api", {
            restApiName: "[ChallengeName] Service",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW1DO0FBQ25DLCtEQUFpRDtBQUNqRCx1RUFBeUQ7QUFHekQsTUFBYSxRQUFTLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDckMsWUFBWSxLQUFjLEVBQUUsRUFBVSxFQUFFLE9BQWdCLEVBQUUsS0FBc0I7UUFDOUUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsdURBQXVEO1FBQ3ZELE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRTtZQUNqRixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSwwQkFBMEIsRUFBRyw0Q0FBNEM7WUFDbEYsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUNyQyxXQUFXLEVBQUU7Z0JBQ1gsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsMENBQTBDO2FBQzNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsbURBQW1EO1FBQ25ELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUNyRSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSxvQkFBb0I7WUFDN0IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUNyQyxXQUFXLEVBQUU7Z0JBQ1gsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTO2FBQy9DO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsaURBQWlEO1FBQ2pELE1BQU0sY0FBYyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDakUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsa0JBQWtCO1lBQzNCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDckMsV0FBVyxFQUFFO2dCQUNYLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUzthQUMvQztTQUNGLENBQUMsQ0FBQztRQUVILGtDQUFrQztRQUNsQyxNQUFNLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUMzRCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7U0FDdEMsQ0FBQyxDQUFDO1FBRUgsbUVBQW1FO1FBQ25FLE9BQU8sQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN4RCxPQUFPLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNqRCxPQUFPLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFFOUQseUJBQXlCO1FBQ3pCLE1BQU0sR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDN0QsV0FBVyxFQUFFLHlCQUF5QjtTQUN2QyxDQUFDLENBQUM7UUFFSCwyQ0FBMkM7UUFDM0MsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYztRQUMzRixLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUcsYUFBYTtRQUV6RixzREFBc0Q7UUFDdEQsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoRCxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBRSxxQkFBcUI7UUFFL0csd0JBQXdCO1FBQ3hCLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBRSxhQUFhO1FBRXJGLHdCQUF3QjtRQUN4QixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNyQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRyxtQkFBbUI7U0FDckMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBckVELDRCQXFFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxhbWJkYVwiO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXlcIjtcbmltcG9ydCB7IERCU3RhY2sgfSBmcm9tIFwiLi9EQnN0YWNrXCI7IC8vIEltcG9ydCBEQlN0YWNrXG5cbmV4cG9ydCBjbGFzcyBBUElTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQXBwLCBpZDogc3RyaW5nLCBkYlN0YWNrOiBEQlN0YWNrLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBMYW1iZGEgZnVuY3Rpb24gdG8gaW5zZXJ0IHNhbXBsZSBjYXNlcyBpbnRvIER5bmFtb0RCXG4gICAgY29uc3QgaW5zZXJ0U2FtcGxlQ2FzZUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJJbnNlcnRTYW1wbGVDYXNlTGFtYmRhXCIsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogXCJpbnNlcnRTYW1wbGVDYXNlLmhhbmRsZXJcIiwgIC8vIEVuc3VyZSB0aGlzIHBvaW50cyB0byB0aGUgY29ycmVjdCBoYW5kbGVyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGFcIiksXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBDQVNFU19UQUJMRV9OQU1FOiBkYlN0YWNrLmNhc2VzVGFibGUudGFibGVOYW1lLCAvLyBQYXNzIHRhYmxlIG5hbWUgYXMgZW52aXJvbm1lbnQgdmFyaWFibGVcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBMYW1iZGEgZnVuY3Rpb24gdG8gaW5zZXJ0IG5ldyBjYXNlIGludG8gRHluYW1vREJcbiAgICBjb25zdCBpbnNlcnRDYXNlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIkluc2VydENhc2VMYW1iZGFcIiwge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiBcImluc2VydENhc2UuaGFuZGxlclwiLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhXCIpLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgQ0FTRVNfVEFCTEVfTkFNRTogZGJTdGFjay5jYXNlc1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBMYW1iZGEgZnVuY3Rpb24gdG8gZ2V0IGFsbCBjYXNlcyBmcm9tIER5bmFtb0RCXG4gICAgY29uc3QgZ2V0Q2FzZXNMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwiR2V0Q2FzZXNMYW1iZGFcIiwge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiBcImdldENhc2VzLmhhbmRsZXJcIixcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChcImxhbWJkYVwiKSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIENBU0VTX1RBQkxFX05BTUU6IGRiU3RhY2suY2FzZXNUYWJsZS50YWJsZU5hbWUsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gTGFtYmRhIGZ1bmN0aW9uIGZvciBIZWxsbyBXb3JsZFxuICAgIGNvbnN0IGhlbGxvTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIkhlbGxvTGFtYmRhXCIsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogXCJpbmRleC5oYW5kbGVyXCIsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGFcIiksXG4gICAgfSk7XG5cbiAgICAvLyBHcmFudCBwZXJtaXNzaW9ucyBmb3IgTGFtYmRhIGZ1bmN0aW9ucyB0byBpbnRlcmFjdCB3aXRoIER5bmFtb0RCXG4gICAgZGJTdGFjay5jYXNlc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShpbnNlcnRDYXNlTGFtYmRhKTtcbiAgICBkYlN0YWNrLmNhc2VzVGFibGUuZ3JhbnRSZWFkRGF0YShnZXRDYXNlc0xhbWJkYSk7XG4gICAgZGJTdGFjay5jYXNlc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShpbnNlcnRTYW1wbGVDYXNlTGFtYmRhKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgQVBJIEdhdGV3YXlcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsIFwiW0NoYWxsZW5nZU5hbWVdQXBpXCIsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiBcIltDaGFsbGVuZ2VOYW1lXSBTZXJ2aWNlXCIsXG4gICAgfSk7XG5cbiAgICAvLyBSZXNvdXJjZSBmb3IgJy9jYXNlcycgdG8gaW5zZXJ0IG5ldyBjYXNlXG4gICAgY29uc3QgY2FzZXMgPSBhcGkucm9vdC5hZGRSZXNvdXJjZShcImNhc2VzXCIpO1xuICAgIGNhc2VzLmFkZE1ldGhvZChcIlBPU1RcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaW5zZXJ0Q2FzZUxhbWJkYSkpOyAvLyBQT1NUIC9jYXNlc1xuICAgIGNhc2VzLmFkZE1ldGhvZChcIkdFVFwiLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihnZXRDYXNlc0xhbWJkYSkpOyAgIC8vIEdFVCAvY2FzZXNcblxuICAgIC8vIFJlc291cmNlIGZvciAnL2Nhc2VzL3NhbXBsZScgdG8gaW5zZXJ0IHNhbXBsZSBjYXNlc1xuICAgIGNvbnN0IHNhbXBsZUNhc2VzID0gY2FzZXMuYWRkUmVzb3VyY2UoXCJzYW1wbGVcIik7XG4gICAgc2FtcGxlQ2FzZXMuYWRkTWV0aG9kKFwiUE9TVFwiLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihpbnNlcnRTYW1wbGVDYXNlTGFtYmRhKSk7ICAvLyBQT1NUIC9jYXNlcy9zYW1wbGVcblxuICAgIC8vIFJlc291cmNlIGZvciAnL2hlbGxvJ1xuICAgIGNvbnN0IGhlbGxvID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoXCJoZWxsb1wiKTtcbiAgICBoZWxsby5hZGRNZXRob2QoXCJHRVRcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGVsbG9MYW1iZGEpKTsgIC8vIEdFVCAvaGVsbG9cblxuICAgIC8vIE91dHB1dHMgZm9yIGJvdGggQVBJc1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiQXBpRW5kcG9pbnRcIiwge1xuICAgICAgdmFsdWU6IGFwaS51cmwsICAvLyBDb21iaW5lZCBBUEkgVVJMXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==