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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLXN0YWNrcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwaS1zdGFja3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsMkVBQTZEO0FBQzdELHVFQUF5RDtBQUV6RCx3RkFBMEUsQ0FBQyxzQkFBc0I7QUFLakcsTUFBYSxRQUFTLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDckMsWUFBWSxLQUFjLEVBQUUsRUFBVSxFQUFFLE9BQWdCLEVBQUUsV0FBd0IsRUFBRSxZQUF5QixFQUFFLEtBQXNCO1FBQ25JLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sYUFBYSxHQUFHLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQzVELE9BQU8sRUFBRSxlQUFlO1lBQ3hCLGFBQWEsRUFBRTtnQkFDYixZQUFZLEVBQUUsQ0FBQyxjQUFjLEVBQUUsZUFBZSxDQUFDO2dCQUMvQyxZQUFZLEVBQUUsQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQztnQkFDckgsZ0JBQWdCLEVBQUUsSUFBSTtnQkFDdEIsWUFBWSxFQUFFLENBQUMsdUNBQXVDLENBQUMsQ0FBQyxVQUFVOzthQUVuRTtTQUNGLENBQUMsQ0FBQztRQUVMLHdCQUF3QjtRQUN4QixhQUFhLENBQUMsU0FBUyxDQUFDO1lBQ3BCLElBQUksRUFBRSxTQUFTLEVBQUUsZ0dBQWdHO1lBQ2pILE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1lBQ3ZDLFdBQVcsRUFBRSxJQUFJLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxpQkFBaUIsRUFBRSxXQUFXLENBQUMsZ0JBQWdCLENBQUM7U0FDckcsQ0FBQyxDQUFDO1FBQ0gsb0JBQW9CO1FBQ3BCLGFBQWEsQ0FBQyxTQUFTLENBQUM7WUFDdEIsSUFBSSxFQUFFLFNBQVM7WUFDZixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztZQUN0QyxXQUFXLEVBQUUsSUFBSSxZQUFZLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDLGNBQWMsQ0FBQztTQUNsRyxDQUFDLENBQUM7UUFDSCx1QkFBdUI7UUFDdkIsYUFBYSxDQUFDLFNBQVMsQ0FBQztZQUN0QixJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO1lBQ3pDLFdBQVcsRUFBRSxJQUFJLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsRUFBRSxXQUFXLENBQUMsaUJBQWlCLENBQUM7U0FDeEcsQ0FBQyxDQUFDO1FBR0wsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUN2QyxLQUFLLEVBQUUsYUFBYSxDQUFDLFdBQVc7U0FDakMsQ0FBQyxDQUFDO1FBRUgsU0FBUztRQUVYLDZCQUE2QjtRQUM3QixNQUFNLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRTtZQUMxRCxXQUFXLEVBQUUsWUFBWTtZQUN6QixhQUFhLEVBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFO1NBQ3BDLENBQUMsQ0FBQztRQUVILDRCQUE0QjtRQUM1QixNQUFNLFlBQVksR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUNoRSxXQUFXLEVBQUUsZUFBZTtZQUM1QixhQUFhLEVBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFO1NBQ3BDLENBQUMsQ0FBQztRQUVILG1CQUFtQjtRQUNuQiw0RUFBNEU7UUFDNUUsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDO2FBQ2hDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUN0RixtREFBbUQ7UUFDbkQsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDO2FBQ3RDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUVyRix5QkFBeUI7UUFDekIsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLEdBQUksRUFBRSxDQUFDLENBQUM7UUFDbkUsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRSxFQUFFLEtBQUssRUFBRSxZQUFZLENBQUMsR0FBSSxFQUFFLENBQUMsQ0FBQztRQUN6RSxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDN0UsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUNuRyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFLEVBQUUsS0FBSyxFQUFFLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZHLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsNEJBQTRCLEVBQUUsRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDOUcsQ0FBQztDQUNGO0FBckVELDRCQXFFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcclxuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheXYyIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheXYyXCI7XHJcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSBcImF3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5XCI7XHJcbmltcG9ydCB7IERCU3RhY2sgfSBmcm9tIFwiLi4vREIvZGItc3RhY2tcIjsgLy8gSW1wb3J0IERCU3RhY2tcclxuaW1wb3J0ICogYXMgaW50ZWdyYXRpb25zIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheXYyLWludGVncmF0aW9uc1wiOyAvLyBJbXBvcnQgaW50ZWdyYXRpb25zXHJcbmltcG9ydCB7IGxhbWJkYXN0YWNrIH0gZnJvbSBcIi4vbGFtYmRhLXN0YWNrc1wiO1xyXG5pbXBvcnQgeyBTdG9yYWdlU3RhY2sgfSBmcm9tIFwiLi4vU3RvcmFnZS9zdG9yYWdlLXN0YWNrXCI7IC8vIEltcG9ydCBTdG9yYWdlU3RhY2tcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgQVBJU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQXBwLCBpZDogc3RyaW5nLCBkYlN0YWNrOiBEQlN0YWNrLCBsYW1iZGFzdGFjazogbGFtYmRhc3RhY2ssIFN0b3JhZ2VTdGFjazpTdG9yYWdlU3RhY2ssIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcclxuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG5cclxuICAgIGNvbnN0IFBvc3RHZXREZWxldGUgPSBuZXcgYXBpZ2F0ZXdheXYyLkh0dHBBcGkodGhpcywgJ0h0dHBBcGknLCB7XHJcbiAgICAgICAgYXBpTmFtZTogJ1dlYkFwcEh0dHBBcGknLFxyXG4gICAgICAgIGNvcnNQcmVmbGlnaHQ6IHtcclxuICAgICAgICAgIGFsbG93SGVhZGVyczogWydDb250ZW50LVR5cGUnLCAnQXV0aG9yaXphdGlvbiddLFxyXG4gICAgICAgICAgYWxsb3dNZXRob2RzOiBbYXBpZ2F0ZXdheXYyLkNvcnNIdHRwTWV0aG9kLkdFVCwgYXBpZ2F0ZXdheXYyLkNvcnNIdHRwTWV0aG9kLlBPU1QsIGFwaWdhdGV3YXl2Mi5Db3JzSHR0cE1ldGhvZC5ERUxFVEVdLFxyXG4gICAgICAgICAgYWxsb3dDcmVkZW50aWFsczogdHJ1ZSxcclxuICAgICAgICAgIGFsbG93T3JpZ2luczogWydodHRwczovL2QzYjVjaDd3amdrM2h0LmNsb3VkZnJvbnQubmV0J10gLy8g4pyFIHZhbGlkXHJcbixcclxuICAgICAgICB9XHJcbiAgICAgIH0pOyAgIFxyXG5cclxuICAgIC8vIEFkZCByb3V0ZSBmb3IgdXBsb2FkIFxyXG4gICAgUG9zdEdldERlbGV0ZS5hZGRSb3V0ZXMoe1xyXG4gICAgICAgIHBhdGg6ICcvdXBsb2FkJywgLy9wYXRoIG9mIHRoZSBhcGkgZ2F0ZXdheSB1cmwgZm9yIGV4YW1wbGUgaHR0cHM6Ly9hcGktaWQuZXhlY3V0ZS1hcGkucmVnaW9uLmFtYXpvbmF3cy5jb20vdXBsb2FkXHJcbiAgICAgICAgbWV0aG9kczogW2FwaWdhdGV3YXl2Mi5IdHRwTWV0aG9kLlBPU1RdLFxyXG4gICAgICAgIGludGVncmF0aW9uOiBuZXcgaW50ZWdyYXRpb25zLkh0dHBMYW1iZGFJbnRlZ3JhdGlvbignUG9zdEludGVncmF0aW9uJywgbGFtYmRhc3RhY2sucG9zdFVwbG9hZExhbWJkYSksXHJcbiAgICAgIH0pO1xyXG4gICAgICAvL0FkZCByb3V0ZSBmb3IgZ2V0IFxyXG4gICAgICBQb3N0R2V0RGVsZXRlLmFkZFJvdXRlcyh7XHJcbiAgICAgICAgcGF0aDogJy91cGxvYWQnLFxyXG4gICAgICAgIG1ldGhvZHM6IFthcGlnYXRld2F5djIuSHR0cE1ldGhvZC5HRVRdLFxyXG4gICAgICAgIGludGVncmF0aW9uOiBuZXcgaW50ZWdyYXRpb25zLkh0dHBMYW1iZGFJbnRlZ3JhdGlvbignR2V0SW50ZWdyYXRpb24nLCBsYW1iZGFzdGFjay5nZXRGaWxlc0xhbWJkYSksXHJcbiAgICAgIH0pO1xyXG4gICAgICAvLyBBZGQgcm91dGUgZm9yIGRlbGV0ZVxyXG4gICAgICBQb3N0R2V0RGVsZXRlLmFkZFJvdXRlcyh7XHJcbiAgICAgICAgcGF0aDogJy91cGxvYWQnLFxyXG4gICAgICAgIG1ldGhvZHM6IFthcGlnYXRld2F5djIuSHR0cE1ldGhvZC5ERUxFVEVdLFxyXG4gICAgICAgIGludGVncmF0aW9uOiBuZXcgaW50ZWdyYXRpb25zLkh0dHBMYW1iZGFJbnRlZ3JhdGlvbignRGVsZXRlSW50ZWdyYXRpb24nLCBsYW1iZGFzdGFjay5kZWxldGVGaWxlc0xhbWJkYSksXHJcbiAgICAgIH0pO1xyXG5cclxuXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnSHR0cEFwaUVuZHBvaW50Jywge1xyXG4gICAgICAgIHZhbHVlOiBQb3N0R2V0RGVsZXRlLmFwaUVuZHBvaW50LFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vU3R1ZGVudFxyXG5cclxuICAgIC8vIFJlYWRlciBBUEkgZm9yIGF1ZGlvIGZpbGVzXHJcbiAgICBjb25zdCByZWFkZXJBcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdSZWFkZXJBcGknLCB7XHJcbiAgICAgIHJlc3RBcGlOYW1lOiAnUmVhZGVyIEFQSScsXHJcbiAgICAgIGRlcGxveU9wdGlvbnM6IHsgc3RhZ2VOYW1lOiAnZGV2JyB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTGlicmFyaWFuIEFQSSBmb3IgQmVkcm9ja1xyXG4gICAgY29uc3QgbGlicmFyaWFuQXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnTGlicmFyaWFuQXBpJywge1xyXG4gICAgICByZXN0QXBpTmFtZTogJ0xpYnJhcmlhbiBBUEknLFxyXG4gICAgICBkZXBsb3lPcHRpb25zOiB7IHN0YWdlTmFtZTogJ2RldicgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFQSSBJbnRlZ3JhdGlvbnNcclxuICAgIC8vIFJlYWRlciBBUEk6IFBPU1QgcmVxdWVzdCB0cmlnZ2VycyBtZXNzYWdlUHJvY2Vzc2luZyBMYW1iZGEgKHN0dWRlbnQgc2lkZSlcclxuICAgIHJlYWRlckFwaS5yb290LmFkZFJlc291cmNlKCdhdWRpbycpXHJcbiAgICAgIC5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFzdGFjay5tZXNzYWdlUHJvY2Vzc2luZykpO1xyXG4gICAgLy9MaWJyYXJpYW46IFBPU1QgcmVxdWVzdCB0cmlnZ2VycyBsaWJyYXJpYW4gTGFtYmRhXHJcbiAgICBsaWJyYXJpYW5BcGkucm9vdC5hZGRSZXNvdXJjZSgnZ2VuZXJhdGUnKVxyXG4gICAgICAuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24obGFtYmRhc3RhY2suaW52b2tlQmVkcm9ja0xpYikpO1xyXG5cclxuICAgIC8vIENsb3VkRm9ybWF0aW9uIE91dHB1dHNcclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdSZWFkZXJBUElVUkwnLCB7IHZhbHVlOiByZWFkZXJBcGkudXJsISB9KTtcclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdMaWJyYXJpYW5BUElVUkwnLCB7IHZhbHVlOiBsaWJyYXJpYW5BcGkudXJsISB9KTtcclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdRQVRhYmxlTmFtZScsIHsgdmFsdWU6IGRiU3RhY2sucWFUYWJsZS50YWJsZU5hbWUgfSk7XHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRXh0cmFjdGVkVGV4dFRhYmxlTmFtZScsIHsgdmFsdWU6IGRiU3RhY2suZXh0cmFjdGVkVGV4dFRhYmxlLnRhYmxlTmFtZSB9KTtcclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdBdWRpb0ZpbGVzQnVja2V0T3V0cHV0JywgeyB2YWx1ZTogU3RvcmFnZVN0YWNrLmF1ZGlvRmlsZXNCdWNrZXQuYnVja2V0TmFtZSB9KTtcclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdOb3ZhR2VuZXJhdGVkQ29udGVudEJ1Y2tldCcsIHsgdmFsdWU6IFN0b3JhZ2VTdGFjay5ub3ZhQ29udGVudEJ1Y2tldC5idWNrZXROYW1lIH0pO1xyXG4gIH1cclxufSJdfQ==