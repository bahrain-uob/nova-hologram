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
const cdk = __importStar(require("aws-cdk-lib"));
const db_stack_1 = require("../lib/DB/db-stack");
const storage_stack_1 = require("../lib/Storage/storage-stack");
const bedrock_stack_1 = require("../lib/Backend/bedrock-stack");
const lambda_stacks_1 = require("../lib/Backend/lambda-stacks");
const SharedResourcesStack_1 = require("../lib/sharedresources/SharedResourcesStack");
const api_stacks_1 = require("../lib/Backend/api-stacks");
const website_stack_1 = require("../lib/Frontend/website-stack");
const app = new cdk.App();
const dbStack = new db_stack_1.DBStack(app, "DBStack");
const sharedResourcesStack = new SharedResourcesStack_1.SharedResourcesStack(app, "SharedResourcesStack");
const storageStack = new storage_stack_1.StorageStack(app, "StorageStack", sharedResourcesStack);
const lambdaStack = new lambda_stacks_1.lambdastack(app, "LambdaStack", dbStack, storageStack, sharedResourcesStack);
const Bedrock = new bedrock_stack_1.BedrockStack(app, "BedrockStack", lambdaStack, storageStack);
const apiStack = new api_stacks_1.APIStack(app, "APIStack", dbStack, lambdaStack, storageStack);
const frontendStack = new website_stack_1.FrontendStack(app, "FrontendStack");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktY2RrLWFwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm15LWNkay1hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUNuQyxpREFBNkM7QUFDN0MsZ0VBQTREO0FBQzVELGdFQUE0RDtBQUM1RCxnRUFBMkQ7QUFDM0Qsc0ZBQW1GO0FBQ25GLDBEQUFxRDtBQUNyRCxpRUFBOEQ7QUFFOUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFMUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxrQkFBTyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUM1QyxNQUFNLG9CQUFvQixHQUFHLElBQUksMkNBQW9CLENBQUMsR0FBRyxFQUFFLHNCQUFzQixDQUFDLENBQUM7QUFDbkYsTUFBTSxZQUFZLEdBQUcsSUFBSSw0QkFBWSxDQUFDLEdBQUcsRUFBRSxjQUFjLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztBQUNqRixNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFXLENBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLG9CQUFvQixDQUFDLENBQUM7QUFDckcsTUFBTSxPQUFPLEdBQUcsSUFBSSw0QkFBWSxDQUFDLEdBQUcsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ2pGLE1BQU0sUUFBUSxHQUFHLElBQUkscUJBQVEsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDbkYsTUFBTSxhQUFhLEdBQUcsSUFBSSw2QkFBYSxDQUFDLEdBQUcsRUFBRSxlQUFlLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcclxuaW1wb3J0IHsgREJTdGFjayB9IGZyb20gXCIuLi9saWIvREIvZGItc3RhY2tcIjtcclxuaW1wb3J0IHsgU3RvcmFnZVN0YWNrIH0gZnJvbSBcIi4uL2xpYi9TdG9yYWdlL3N0b3JhZ2Utc3RhY2tcIjtcclxuaW1wb3J0IHsgQmVkcm9ja1N0YWNrIH0gZnJvbSBcIi4uL2xpYi9CYWNrZW5kL2JlZHJvY2stc3RhY2tcIjtcclxuaW1wb3J0IHsgbGFtYmRhc3RhY2sgfSBmcm9tIFwiLi4vbGliL0JhY2tlbmQvbGFtYmRhLXN0YWNrc1wiO1xyXG5pbXBvcnQgeyBTaGFyZWRSZXNvdXJjZXNTdGFjayB9IGZyb20gXCIuLi9saWIvc2hhcmVkcmVzb3VyY2VzL1NoYXJlZFJlc291cmNlc1N0YWNrXCI7XHJcbmltcG9ydCB7IEFQSVN0YWNrIH0gZnJvbSBcIi4uL2xpYi9CYWNrZW5kL2FwaS1zdGFja3NcIjtcclxuaW1wb3J0IHsgRnJvbnRlbmRTdGFjayB9IGZyb20gXCIuLi9saWIvRnJvbnRlbmQvd2Vic2l0ZS1zdGFja1wiO1xyXG5cclxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcclxuXHJcbmNvbnN0IGRiU3RhY2sgPSBuZXcgREJTdGFjayhhcHAsIFwiREJTdGFja1wiKTtcclxuY29uc3Qgc2hhcmVkUmVzb3VyY2VzU3RhY2sgPSBuZXcgU2hhcmVkUmVzb3VyY2VzU3RhY2soYXBwLCBcIlNoYXJlZFJlc291cmNlc1N0YWNrXCIpO1xyXG5jb25zdCBzdG9yYWdlU3RhY2sgPSBuZXcgU3RvcmFnZVN0YWNrKGFwcCwgXCJTdG9yYWdlU3RhY2tcIiwgc2hhcmVkUmVzb3VyY2VzU3RhY2spO1xyXG5jb25zdCBsYW1iZGFTdGFjayA9IG5ldyBsYW1iZGFzdGFjayhhcHAsIFwiTGFtYmRhU3RhY2tcIiwgZGJTdGFjaywgc3RvcmFnZVN0YWNrLCBzaGFyZWRSZXNvdXJjZXNTdGFjayk7XHJcbmNvbnN0IEJlZHJvY2sgPSBuZXcgQmVkcm9ja1N0YWNrKGFwcCwgXCJCZWRyb2NrU3RhY2tcIiwgbGFtYmRhU3RhY2ssIHN0b3JhZ2VTdGFjayk7XHJcbmNvbnN0IGFwaVN0YWNrID0gbmV3IEFQSVN0YWNrKGFwcCwgXCJBUElTdGFja1wiLCBkYlN0YWNrLCBsYW1iZGFTdGFjaywgc3RvcmFnZVN0YWNrKTtcclxuY29uc3QgZnJvbnRlbmRTdGFjayA9IG5ldyBGcm9udGVuZFN0YWNrKGFwcCwgXCJGcm9udGVuZFN0YWNrXCIpO1xyXG4iXX0=