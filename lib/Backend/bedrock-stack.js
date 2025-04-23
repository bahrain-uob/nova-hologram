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
exports.BedrockStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
class BedrockStack extends cdk.Stack {
    constructor(scope, id, lambdastack, storagestack, props) {
        super(scope, id, props);
        // Update the addToRolePolicy statement
        lambdastack.BedRockFunction.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                'bedrock:*', // Full access to Amazon Bedrock
                's3:PutObject',
                's3:GetObject',
                's3:ListBucket'
            ],
            resources: ['*'] // Use specific ARNs for tighter control
        }));
        storagestack.genVideos.grantReadWrite(lambdastack.BedRockFunction);
        new cdk.CfnOutput(this, "GenVideosBucketURI", {
            value: `s3://${storagestack.genVideos.bucketName}/upload/`,
            description: "S3 URI where generated videos will be stored by the Nova Reel Lambda"
        });
    }
}
exports.BedrockStack = BedrockStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkcm9jay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJlZHJvY2stc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFFbkMseURBQTJDO0FBSTNDLE1BQWEsWUFBYSxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3pDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsV0FBd0IsRUFBRSxZQUEwQixFQUFHLEtBQXNCO1FBQ3JILEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLHVDQUF1QztRQUN2QyxXQUFXLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDbEUsT0FBTyxFQUFFO2dCQUNQLFdBQVcsRUFBRyxnQ0FBZ0M7Z0JBQzlDLGNBQWM7Z0JBQ2QsY0FBYztnQkFDZCxlQUFlO2FBQ2hCO1lBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUUsd0NBQXdDO1NBQzNELENBQUMsQ0FBQyxDQUFDO1FBS0EsWUFBWSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRW5FLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDOUMsS0FBSyxFQUFFLFFBQVEsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLFVBQVU7WUFDMUQsV0FBVyxFQUFFLHNFQUFzRTtTQUNsRixDQUFDLENBQUM7SUFDVCxDQUFDO0NBQ0Y7QUF6QkQsb0NBeUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xyXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xyXG5pbXBvcnQgKiBhcyBpYW0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcclxuaW1wb3J0IHsgU3RvcmFnZVN0YWNrIH0gZnJvbSBcIi4uL1N0b3JhZ2Uvc3RvcmFnZS1zdGFja1wiO1xyXG5pbXBvcnQgeyBsYW1iZGFzdGFjayB9IGZyb20gXCIuL2xhbWJkYS1zdGFja3NcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBCZWRyb2NrU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIGxhbWJkYXN0YWNrOiBsYW1iZGFzdGFjaywgc3RvcmFnZXN0YWNrOiBTdG9yYWdlU3RhY2ssICBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XHJcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIGFkZFRvUm9sZVBvbGljeSBzdGF0ZW1lbnRcclxuICAgIGxhbWJkYXN0YWNrLkJlZFJvY2tGdW5jdGlvbi5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICBhY3Rpb25zOiBbXHJcbiAgICAgICAgJ2JlZHJvY2s6KicsICAvLyBGdWxsIGFjY2VzcyB0byBBbWF6b24gQmVkcm9ja1xyXG4gICAgICAgICdzMzpQdXRPYmplY3QnLFxyXG4gICAgICAgICdzMzpHZXRPYmplY3QnLFxyXG4gICAgICAgICdzMzpMaXN0QnVja2V0J1xyXG4gICAgICBdLFxyXG4gICAgICByZXNvdXJjZXM6IFsnKiddICAvLyBVc2Ugc3BlY2lmaWMgQVJOcyBmb3IgdGlnaHRlciBjb250cm9sXHJcbiAgICB9KSk7XHJcbiAgICBcclxuICAgIFxyXG5cclxuICAgICAgICBcclxuICAgICAgICBzdG9yYWdlc3RhY2suZ2VuVmlkZW9zLmdyYW50UmVhZFdyaXRlKGxhbWJkYXN0YWNrLkJlZFJvY2tGdW5jdGlvbik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJHZW5WaWRlb3NCdWNrZXRVUklcIiwge1xyXG4gICAgICAgIHZhbHVlOiBgczM6Ly8ke3N0b3JhZ2VzdGFjay5nZW5WaWRlb3MuYnVja2V0TmFtZX0vdXBsb2FkL2AsXHJcbiAgICAgICAgZGVzY3JpcHRpb246IFwiUzMgVVJJIHdoZXJlIGdlbmVyYXRlZCB2aWRlb3Mgd2lsbCBiZSBzdG9yZWQgYnkgdGhlIE5vdmEgUmVlbCBMYW1iZGFcIlxyXG4gICAgICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXX0=