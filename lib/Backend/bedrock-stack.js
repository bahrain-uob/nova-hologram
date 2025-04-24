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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkcm9jay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJlZHJvY2stc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFFbkMseURBQTJDO0FBSTNDLE1BQWEsWUFBYSxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3pDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsV0FBd0IsRUFBRSxZQUEwQixFQUFHLEtBQXNCO1FBQ3JILEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLHVDQUF1QztRQUN2QyxXQUFXLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDbEUsT0FBTyxFQUFFO2dCQUNQLFdBQVcsRUFBRyxnQ0FBZ0M7Z0JBQzlDLGNBQWM7Z0JBQ2QsY0FBYztnQkFDZCxlQUFlO2FBQ2hCO1lBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUUsd0NBQXdDO1NBQzNELENBQUMsQ0FBQyxDQUFDO1FBS0EsWUFBWSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRW5FLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDOUMsS0FBSyxFQUFFLFFBQVEsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLFVBQVU7WUFDMUQsV0FBVyxFQUFFLHNFQUFzRTtTQUNsRixDQUFDLENBQUM7SUFDVCxDQUFDO0NBQ0Y7QUF6QkQsb0NBeUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCAqIGFzIGlhbSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuaW1wb3J0IHsgU3RvcmFnZVN0YWNrIH0gZnJvbSBcIi4uL1N0b3JhZ2Uvc3RvcmFnZS1zdGFja1wiO1xuaW1wb3J0IHsgbGFtYmRhc3RhY2sgfSBmcm9tIFwiLi9sYW1iZGEtc3RhY2tzXCI7XG5cbmV4cG9ydCBjbGFzcyBCZWRyb2NrU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBsYW1iZGFzdGFjazogbGFtYmRhc3RhY2ssIHN0b3JhZ2VzdGFjazogU3RvcmFnZVN0YWNrLCAgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBhZGRUb1JvbGVQb2xpY3kgc3RhdGVtZW50XG4gICAgbGFtYmRhc3RhY2suQmVkUm9ja0Z1bmN0aW9uLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdiZWRyb2NrOionLCAgLy8gRnVsbCBhY2Nlc3MgdG8gQW1hem9uIEJlZHJvY2tcbiAgICAgICAgJ3MzOlB1dE9iamVjdCcsXG4gICAgICAgICdzMzpHZXRPYmplY3QnLFxuICAgICAgICAnczM6TGlzdEJ1Y2tldCdcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFsnKiddICAvLyBVc2Ugc3BlY2lmaWMgQVJOcyBmb3IgdGlnaHRlciBjb250cm9sXG4gICAgfSkpO1xuICAgIFxuICAgIFxuXG4gICAgICAgIFxuICAgICAgICBzdG9yYWdlc3RhY2suZ2VuVmlkZW9zLmdyYW50UmVhZFdyaXRlKGxhbWJkYXN0YWNrLkJlZFJvY2tGdW5jdGlvbik7XG4gICAgICAgIFxuICAgICAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIkdlblZpZGVvc0J1Y2tldFVSSVwiLCB7XG4gICAgICAgIHZhbHVlOiBgczM6Ly8ke3N0b3JhZ2VzdGFjay5nZW5WaWRlb3MuYnVja2V0TmFtZX0vdXBsb2FkL2AsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlMzIFVSSSB3aGVyZSBnZW5lcmF0ZWQgdmlkZW9zIHdpbGwgYmUgc3RvcmVkIGJ5IHRoZSBOb3ZhIFJlZWwgTGFtYmRhXCJcbiAgICAgICAgfSk7XG4gIH1cbn1cbiJdfQ==