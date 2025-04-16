"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIStack = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQyxpREFBaUQ7QUFDakQseURBQXlEO0FBR3pELE1BQWEsUUFBUyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3JDLFlBQVksS0FBYyxFQUFFLEVBQVUsRUFBRSxPQUFnQixFQUFFLEtBQXNCO1FBQzlFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLHVEQUF1RDtRQUN2RCxNQUFNLHNCQUFzQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUU7WUFDakYsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsMEJBQTBCLEVBQUcsNENBQTRDO1lBQ2xGLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDckMsV0FBVyxFQUFFO2dCQUNYLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLDBDQUEwQzthQUMzRjtTQUNGLENBQUMsQ0FBQztRQUVILG1EQUFtRDtRQUNuRCxNQUFNLGdCQUFnQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDckUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsb0JBQW9CO1lBQzdCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDckMsV0FBVyxFQUFFO2dCQUNYLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUzthQUMvQztTQUNGLENBQUMsQ0FBQztRQUVILGlEQUFpRDtRQUNqRCxNQUFNLGNBQWMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ2pFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLGtCQUFrQjtZQUMzQixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQ3JDLFdBQVcsRUFBRTtnQkFDWCxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVM7YUFDL0M7U0FDRixDQUFDLENBQUM7UUFFSCxrQ0FBa0M7UUFDbEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDM0QsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsZUFBZTtZQUN4QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1NBQ3RDLENBQUMsQ0FBQztRQUVILG1FQUFtRTtRQUNuRSxPQUFPLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDeEQsT0FBTyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDakQsT0FBTyxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBRTlELHlCQUF5QjtRQUN6QixNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQzdELFdBQVcsRUFBRSx5QkFBeUI7U0FDdkMsQ0FBQyxDQUFDO1FBRUgsMkNBQTJDO1FBQzNDLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWM7UUFDM0YsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFHLGFBQWE7UUFFekYsc0RBQXNEO1FBQ3RELE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEQsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUUscUJBQXFCO1FBRS9HLHdCQUF3QjtRQUN4QixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUUsYUFBYTtRQUVyRix3QkFBd0I7UUFDeEIsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDckMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUcsbUJBQW1CO1NBQ3JDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXJFRCw0QkFxRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcImF3cy1jZGstbGliXCI7XHJcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxhbWJkYVwiO1xyXG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheVwiO1xyXG5pbXBvcnQgeyBEQlN0YWNrIH0gZnJvbSBcIi4vREJzdGFja1wiOyAvLyBJbXBvcnQgREJTdGFja1xyXG5cclxuZXhwb3J0IGNsYXNzIEFQSVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcclxuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkFwcCwgaWQ6IHN0cmluZywgZGJTdGFjazogREJTdGFjaywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgLy8gTGFtYmRhIGZ1bmN0aW9uIHRvIGluc2VydCBzYW1wbGUgY2FzZXMgaW50byBEeW5hbW9EQlxyXG4gICAgY29uc3QgaW5zZXJ0U2FtcGxlQ2FzZUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJJbnNlcnRTYW1wbGVDYXNlTGFtYmRhXCIsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6IFwiaW5zZXJ0U2FtcGxlQ2FzZS5oYW5kbGVyXCIsICAvLyBFbnN1cmUgdGhpcyBwb2ludHMgdG8gdGhlIGNvcnJlY3QgaGFuZGxlclxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGFcIiksXHJcbiAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgQ0FTRVNfVEFCTEVfTkFNRTogZGJTdGFjay5jYXNlc1RhYmxlLnRhYmxlTmFtZSwgLy8gUGFzcyB0YWJsZSBuYW1lIGFzIGVudmlyb25tZW50IHZhcmlhYmxlXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBMYW1iZGEgZnVuY3Rpb24gdG8gaW5zZXJ0IG5ldyBjYXNlIGludG8gRHluYW1vREJcclxuICAgIGNvbnN0IGluc2VydENhc2VMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIFwiSW5zZXJ0Q2FzZUxhbWJkYVwiLCB7XHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICBoYW5kbGVyOiBcImluc2VydENhc2UuaGFuZGxlclwiLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGFcIiksXHJcbiAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgQ0FTRVNfVEFCTEVfTkFNRTogZGJTdGFjay5jYXNlc1RhYmxlLnRhYmxlTmFtZSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIExhbWJkYSBmdW5jdGlvbiB0byBnZXQgYWxsIGNhc2VzIGZyb20gRHluYW1vREJcclxuICAgIGNvbnN0IGdldENhc2VzTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIkdldENhc2VzTGFtYmRhXCIsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6IFwiZ2V0Q2FzZXMuaGFuZGxlclwiLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGFcIiksXHJcbiAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgQ0FTRVNfVEFCTEVfTkFNRTogZGJTdGFjay5jYXNlc1RhYmxlLnRhYmxlTmFtZSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIExhbWJkYSBmdW5jdGlvbiBmb3IgSGVsbG8gV29ybGRcclxuICAgIGNvbnN0IGhlbGxvTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIkhlbGxvTGFtYmRhXCIsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6IFwiaW5kZXguaGFuZGxlclwiLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJsYW1iZGFcIiksXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHcmFudCBwZXJtaXNzaW9ucyBmb3IgTGFtYmRhIGZ1bmN0aW9ucyB0byBpbnRlcmFjdCB3aXRoIER5bmFtb0RCXHJcbiAgICBkYlN0YWNrLmNhc2VzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGluc2VydENhc2VMYW1iZGEpO1xyXG4gICAgZGJTdGFjay5jYXNlc1RhYmxlLmdyYW50UmVhZERhdGEoZ2V0Q2FzZXNMYW1iZGEpO1xyXG4gICAgZGJTdGFjay5jYXNlc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShpbnNlcnRTYW1wbGVDYXNlTGFtYmRhKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIEFQSSBHYXRld2F5XHJcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsIFwiW0NoYWxsZW5nZU5hbWVdQXBpXCIsIHtcclxuICAgICAgcmVzdEFwaU5hbWU6IFwiW0NoYWxsZW5nZU5hbWVdIFNlcnZpY2VcIixcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFJlc291cmNlIGZvciAnL2Nhc2VzJyB0byBpbnNlcnQgbmV3IGNhc2VcclxuICAgIGNvbnN0IGNhc2VzID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoXCJjYXNlc1wiKTtcclxuICAgIGNhc2VzLmFkZE1ldGhvZChcIlBPU1RcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaW5zZXJ0Q2FzZUxhbWJkYSkpOyAvLyBQT1NUIC9jYXNlc1xyXG4gICAgY2FzZXMuYWRkTWV0aG9kKFwiR0VUXCIsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGdldENhc2VzTGFtYmRhKSk7ICAgLy8gR0VUIC9jYXNlc1xyXG5cclxuICAgIC8vIFJlc291cmNlIGZvciAnL2Nhc2VzL3NhbXBsZScgdG8gaW5zZXJ0IHNhbXBsZSBjYXNlc1xyXG4gICAgY29uc3Qgc2FtcGxlQ2FzZXMgPSBjYXNlcy5hZGRSZXNvdXJjZShcInNhbXBsZVwiKTtcclxuICAgIHNhbXBsZUNhc2VzLmFkZE1ldGhvZChcIlBPU1RcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaW5zZXJ0U2FtcGxlQ2FzZUxhbWJkYSkpOyAgLy8gUE9TVCAvY2FzZXMvc2FtcGxlXHJcblxyXG4gICAgLy8gUmVzb3VyY2UgZm9yICcvaGVsbG8nXHJcbiAgICBjb25zdCBoZWxsbyA9IGFwaS5yb290LmFkZFJlc291cmNlKFwiaGVsbG9cIik7XHJcbiAgICBoZWxsby5hZGRNZXRob2QoXCJHRVRcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaGVsbG9MYW1iZGEpKTsgIC8vIEdFVCAvaGVsbG9cclxuXHJcbiAgICAvLyBPdXRwdXRzIGZvciBib3RoIEFQSXNcclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiQXBpRW5kcG9pbnRcIiwge1xyXG4gICAgICB2YWx1ZTogYXBpLnVybCwgIC8vIENvbWJpbmVkIEFQSSBVUkxcclxuICAgIH0pO1xyXG4gIH1cclxufSJdfQ==