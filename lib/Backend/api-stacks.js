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
const integrations = __importStar(require("aws-cdk-lib/aws-apigatewayv2-integrations")); // Import integrations
class APIStack extends cdk.Stack {
    constructor(scope, id, dbStack, lambdastack, StorageStack, props) {
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
        // CloudFormation Outputs
        new cdk.CfnOutput(this, 'ReaderAPIURL', { value: readerApi.url });
        new cdk.CfnOutput(this, 'LibrarianAPIURL', { value: librarianApi.url });
        new cdk.CfnOutput(this, 'QATableName', { value: dbStack.qaTable.tableName });
        new cdk.CfnOutput(this, 'ExtractedTextTableName', { value: dbStack.extractedTextTable.tableName });
        new cdk.CfnOutput(this, 'AudioFilesBucketOutput', { value: StorageStack.audioFilesBucket.bucketName });
        new cdk.CfnOutput(this, 'NovaGeneratedContentBucket', { value: StorageStack.novaContentBucket.bucketName });
    }
}
exports.APIStack = APIStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLXN0YWNrcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwaS1zdGFja3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsMkVBQTZEO0FBQzdELHVFQUF5RDtBQUV6RCx3RkFBMEUsQ0FBQyxzQkFBc0I7QUFLakcsTUFBYSxRQUFTLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDckMsWUFBWSxLQUFjLEVBQUUsRUFBVSxFQUFFLE9BQWdCLEVBQUUsV0FBd0IsRUFBRSxZQUF5QixFQUFFLEtBQXNCO1FBQ25JLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sYUFBYSxHQUFHLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQzVELE9BQU8sRUFBRSxlQUFlO1lBQ3hCLGFBQWEsRUFBRTtnQkFDYixZQUFZLEVBQUUsQ0FBQyxjQUFjLEVBQUUsZUFBZSxDQUFDO2dCQUMvQyxZQUFZLEVBQUUsQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQztnQkFDckgsZ0JBQWdCLEVBQUUsSUFBSTtnQkFDdEIsWUFBWSxFQUFFLENBQUMsdUNBQXVDLENBQUMsQ0FBQyxVQUFVOzthQUVuRTtTQUNGLENBQUMsQ0FBQztRQUVMLHdCQUF3QjtRQUN4QixhQUFhLENBQUMsU0FBUyxDQUFDO1lBQ3BCLElBQUksRUFBRSxTQUFTLEVBQUUsZ0dBQWdHO1lBQ2pILE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1lBQ3ZDLFdBQVcsRUFBRSxJQUFJLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxpQkFBaUIsRUFBRSxXQUFXLENBQUMsZ0JBQWdCLENBQUM7U0FDckcs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QXFFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXl2MiBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXl2MlwiO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXlcIjtcbmltcG9ydCB7IERCU3RhY2sgfSBmcm9tIFwiLi4vREIvZGItc3RhY2tcIjsgLy8gSW1wb3J0IERCU3RhY2tcbmltcG9ydCAqIGFzIGludGVncmF0aW9ucyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXl2Mi1pbnRlZ3JhdGlvbnNcIjsgLy8gSW1wb3J0IGludGVncmF0aW9uc1xuaW1wb3J0IHsgbGFtYmRhc3RhY2sgfSBmcm9tIFwiLi9sYW1iZGEtc3RhY2tzXCI7XG5pbXBvcnQgeyBTdG9yYWdlU3RhY2sgfSBmcm9tIFwiLi4vU3RvcmFnZS9zdG9yYWdlLXN0YWNrXCI7IC8vIEltcG9ydCBTdG9yYWdlU3RhY2tcblxuXG5leHBvcnQgY2xhc3MgQVBJU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkFwcCwgaWQ6IHN0cmluZywgZGJTdGFjazogREJTdGFjaywgbGFtYmRhc3RhY2s6IGxhbWJkYXN0YWNrLCBTdG9yYWdlU3RhY2s6U3RvcmFnZVN0YWNrLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCBQb3N0R2V0RGVsZXRlID0gbmV3IGFwaWdhdGV3YXl2Mi5IdHRwQXBpKHRoaXMsICdIdHRwQXBpJywge1xuICAgICAgICBhcGlOYW1lOiAnV2ViQXBwSHR0cEFwaScsXG4gICAgICAgIGNvcnNQcmVmbGlnaHQ6IHtcbiAgICAgICAgICBhbGxvd0hlYWRlcnM6IFsnQ29udGVudC1UeXBlJywgJ0F1dGhvcml6YXRpb24nXSxcbiAgICAgICAgICBhbGxvd01ldGhvZHM6IFthcGlnYXRld2F5djIuQ29yc0h0dHBNZXRob2QuR0VULCBhcGlnYXRld2F5djIuQ29yc0h0dHBNZXRob2QuUE9TVCwgYXBpZ2F0ZXdheXYyLkNvcnNIdHRwTWV0aG9kLkRFTEVURV0sXG4gICAgICAgICAgYWxsb3dDcmVkZW50aWFsczogdHJ1ZSxcbiAgICAgICAgICBhbGxvd09yaWdpbnM6IFsnaHR0cHM6Ly9kM2I1Y2g3d2pnazNodC5jbG91ZGZyb250Lm5ldCddIC8vIOKchSB2YWxpZFxuLFxuICAgICAgICB9XG4gICAgICB9KTsgICBcblxuICAgIC8vIEFkZCByb3V0ZSBmb3IgdXBsb2FkIFxuICAgIFBvc3RHZXREZWxldGUuYWRkUm91dGVzKHtcbiAgICAgICAgcGF0aDogJy91cGxvYWQnLCAvL3BhdGggb2YgdGhlIGFwaSBnYXRld2F5IHVybCBmb3IgZXhhbXBsZSBodHRwczovL2FwaS1pZC5leGVjdXRlLWFwaS5yZWdpb24uYW1hem9uYXdzLmNvbS91cGxvYWRcbiAgICAgICAgbWV0aG9kczogW2FwaWdhdGV3YXl2Mi5IdHRwTWV0aG9kLlBPU1RdLFxuICAgICAgICBpbnRlZ3JhdGlvbjogbmV3IGludGVncmF0aW9ucy5IdHRwTGFtYmRhSW50ZWdyYXRpb24oJ1Bvc3RJbnRlZ3JhdGlvbicsIGxhbWJkYXN0YWNrLnBvc3RVcGxvYWRMYW1iZGEpLFxuICAgICAgfSk7XG4gICAgICAvL0FkZCByb3V0ZSBmb3IgZ2V0IFxuICAgICAgUG9zdEdldERlbGV0ZS5hZGRSb3V0ZXMoe1xuICAgICAgICBwYXRoOiAnL3VwbG9hZCcsXG4gICAgICAgIG1ldGhvZHM6IFthcGlnYXRld2F5djIuSHR0cE1ldGhvZC5HRVRdLFxuICAgICAgICBpbnRlZ3JhdGlvbjogbmV3IGludGVncmF0aW9ucy5IdHRwTGFtYmRhSW50ZWdyYXRpb24oJ0dldEludGVncmF0aW9uJywgbGFtYmRhc3RhY2suZ2V0RmlsZXNMYW1iZGEpLFxuICAgICAgfSk7XG4gICAgICAvLyBBZGQgcm91dGUgZm9yIGRlbGV0ZVxuICAgICAgUG9zdEdldERlbGV0ZS5hZGRSb3V0ZXMoe1xuICAgICAgICBwYXRoOiAnL3VwbG9hZCcsXG4gICAgICAgIG1ldGhvZHM6IFthcGlnYXRld2F5djIuSHR0cE1ldGhvZC5ERUxFVEVdLFxuICAgICAgICBpbnRlZ3JhdGlvbjogbmV3IGludGVncmF0aW9ucy5IdHRwTGFtYmRhSW50ZWdyYXRpb24oJ0RlbGV0ZUludGVncmF0aW9uJywgbGFtYmRhc3RhY2suZGVsZXRlRmlsZXNMYW1iZGEpLFxuICAgICAgfSk7XG5cblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdIdHRwQXBpRW5kcG9pbnQnLCB7XG4gICAgICAgIHZhbHVlOiBQb3N0R2V0RGVsZXRlLmFwaUVuZHBvaW50LFxuICAgICAgfSk7XG5cbiAgICAgIC8vU3R1ZGVudFxuXG4gICAgLy8gUmVhZGVyIEFQSSBmb3IgYXVkaW8gZmlsZXNcbiAgICBjb25zdCByZWFkZXJBcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdSZWFkZXJBcGknLCB7XG4gICAgICByZXN0QXBpTmFtZTogJ1JlYWRlciBBUEknLFxuICAgICAgZGVwbG95T3B0aW9uczogeyBzdGFnZU5hbWU6ICdkZXYnIH0sXG4gICAgfSk7XG5cbiAgICAvLyBMaWJyYXJpYW4gQVBJIGZvciBCZWRyb2NrXG4gICAgY29uc3QgbGlicmFyaWFuQXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnTGlicmFyaWFuQXBpJywge1xuICAgICAgcmVzdEFwaU5hbWU6ICdMaWJyYXJpYW4gQVBJJyxcbiAgICAgIGRlcGxveU9wdGlvbnM6IHsgc3RhZ2VOYW1lOiAnZGV2JyB9LFxuICAgIH0pO1xuXG4gICAgLy8gQVBJIEludGVncmF0aW9uc1xuICAgIC8vIFJlYWRlciBBUEk6IFBPU1QgcmVxdWVzdCB0cmlnZ2VycyBtZXNzYWdlUHJvY2Vzc2luZyBMYW1iZGEgKHN0dWRlbnQgc2lkZSlcbiAgICByZWFkZXJBcGkucm9vdC5hZGRSZXNvdXJjZSgnYXVkaW8nKVxuICAgICAgLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGxhbWJkYXN0YWNrLm1lc3NhZ2VQcm9jZXNzaW5nKSk7XG4gICAgLy9MaWJyYXJpYW46IFBPU1QgcmVxdWVzdCB0cmlnZ2VycyBsaWJyYXJpYW4gTGFtYmRhXG4gICAgbGlicmFyaWFuQXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2dlbmVyYXRlJylcbiAgICAgIC5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFzdGFjay5pbnZva2VCZWRyb2NrTGliKSk7XG5cbiAgICAvLyBDbG91ZEZvcm1hdGlvbiBPdXRwdXRzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1JlYWRlckFQSVVSTCcsIHsgdmFsdWU6IHJlYWRlckFwaS51cmwhIH0pO1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdMaWJyYXJpYW5BUElVUkwnLCB7IHZhbHVlOiBsaWJyYXJpYW5BcGkudXJsISB9KTtcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnUUFUYWJsZU5hbWUnLCB7IHZhbHVlOiBkYlN0YWNrLnFhVGFibGUudGFibGVOYW1lIH0pO1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdFeHRyYWN0ZWRUZXh0VGFibGVOYW1lJywgeyB2YWx1ZTogZGJTdGFjay5leHRyYWN0ZWRUZXh0VGFibGUudGFibGVOYW1lIH0pO1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdBdWRpb0ZpbGVzQnVja2V0T3V0cHV0JywgeyB2YWx1ZTogU3RvcmFnZVN0YWNrLmF1ZGlvRmlsZXNCdWNrZXQuYnVja2V0TmFtZSB9KTtcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnTm92YUdlbmVyYXRlZENvbnRlbnRCdWNrZXQnLCB7IHZhbHVlOiBTdG9yYWdlU3RhY2subm92YUNvbnRlbnRCdWNrZXQuYnVja2V0TmFtZSB9KTtcbiAgfVxufSJdfQ==