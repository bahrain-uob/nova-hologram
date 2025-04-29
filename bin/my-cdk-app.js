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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktY2RrLWFwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm15LWNkay1hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUNuQyxpREFBNkM7QUFDN0MsZ0VBQTREO0FBQzVELGdFQUE0RDtBQUM1RCxnRUFBMkQ7QUFDM0Qsc0ZBQW1GO0FBQ25GLDBEQUFxRDtBQUNyRCxpRUFBOEQ7QUFFOUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFMUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxrQkFBTyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUM1QyxNQUFNLG9CQUFvQixHQUFHLElBQUksMkNBQW9CLENBQUMsR0FBRyxFQUFFLHNCQUFzQixDQUFDLENBQUM7QUFDbkYsTUFBTSxZQUFZLEdBQUcsSUFBSSw0QkFBWSxDQUFDLEdBQUcsRUFBRSxjQUFjLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztBQUNqRixNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFXLENBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLG9CQUFvQixDQUFDLENBQUM7QUFDckcsTUFBTSxPQUFPLEdBQUcsSUFBSSw0QkFBWSxDQUFDLEdBQUcsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ2pGLE1BQU0sUUFBUSxHQUFHLElBQUkscUJBQVEsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDbkYsTUFBTSxhQUFhLEdBQUcsSUFBSSw2QkFBYSxDQUFDLEdBQUcsRUFBRSxlQUFlLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IERCU3RhY2sgfSBmcm9tIFwiLi4vbGliL0RCL2RiLXN0YWNrXCI7XG5pbXBvcnQgeyBTdG9yYWdlU3RhY2sgfSBmcm9tIFwiLi4vbGliL1N0b3JhZ2Uvc3RvcmFnZS1zdGFja1wiO1xuaW1wb3J0IHsgQmVkcm9ja1N0YWNrIH0gZnJvbSBcIi4uL2xpYi9CYWNrZW5kL2JlZHJvY2stc3RhY2tcIjtcbmltcG9ydCB7IGxhbWJkYXN0YWNrIH0gZnJvbSBcIi4uL2xpYi9CYWNrZW5kL2xhbWJkYS1zdGFja3NcIjtcbmltcG9ydCB7IFNoYXJlZFJlc291cmNlc1N0YWNrIH0gZnJvbSBcIi4uL2xpYi9zaGFyZWRyZXNvdXJjZXMvU2hhcmVkUmVzb3VyY2VzU3RhY2tcIjtcbmltcG9ydCB7IEFQSVN0YWNrIH0gZnJvbSBcIi4uL2xpYi9CYWNrZW5kL2FwaS1zdGFja3NcIjtcbmltcG9ydCB7IEZyb250ZW5kU3RhY2sgfSBmcm9tIFwiLi4vbGliL0Zyb250ZW5kL3dlYnNpdGUtc3RhY2tcIjtcblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcblxuY29uc3QgZGJTdGFjayA9IG5ldyBEQlN0YWNrKGFwcCwgXCJEQlN0YWNrXCIpO1xuY29uc3Qgc2hhcmVkUmVzb3VyY2VzU3RhY2sgPSBuZXcgU2hhcmVkUmVzb3VyY2VzU3RhY2soYXBwLCBcIlNoYXJlZFJlc291cmNlc1N0YWNrXCIpO1xuY29uc3Qgc3RvcmFnZVN0YWNrID0gbmV3IFN0b3JhZ2VTdGFjayhhcHAsIFwiU3RvcmFnZVN0YWNrXCIsIHNoYXJlZFJlc291cmNlc1N0YWNrKTtcbmNvbnN0IGxhbWJkYVN0YWNrID0gbmV3IGxhbWJkYXN0YWNrKGFwcCwgXCJMYW1iZGFTdGFja1wiLCBkYlN0YWNrLCBzdG9yYWdlU3RhY2ssIHNoYXJlZFJlc291cmNlc1N0YWNrKTtcbmNvbnN0IEJlZHJvY2sgPSBuZXcgQmVkcm9ja1N0YWNrKGFwcCwgXCJCZWRyb2NrU3RhY2tcIiwgbGFtYmRhU3RhY2ssIHN0b3JhZ2VTdGFjayk7XG5jb25zdCBhcGlTdGFjayA9IG5ldyBBUElTdGFjayhhcHAsIFwiQVBJU3RhY2tcIiwgZGJTdGFjaywgbGFtYmRhU3RhY2ssIHN0b3JhZ2VTdGFjayk7XG5jb25zdCBmcm9udGVuZFN0YWNrID0gbmV3IEZyb250ZW5kU3RhY2soYXBwLCBcIkZyb250ZW5kU3RhY2tcIik7XG4iXX0=