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
const my_cdk_app_stack_1 = require("../lib/my-cdk-app-stack");
const DBstack_1 = require("../lib/DBstack"); // Import your DBStack
const api_stack_1 = require("../lib/api-stack"); // Import your APIStack
const app = new cdk.App();
// Create the DBStack
const dbStack = new DBstack_1.DBStack(app, "DBStack", {
// Any custom stack props you may have for DBStack
});
// Create the APIStack, passing in the DBStack as a dependency
new api_stack_1.APIStack(app, "APIStack", dbStack); // Pass the DBStack as the second argument
// Optionally, you can create your other stacks here if needed
new my_cdk_app_stack_1.MyCdkStack(app, "MyCdkAppStack");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktY2RrLWFwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm15LWNkay1hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUNuQyw4REFBcUQ7QUFDckQsNENBQXlDLENBQUMsc0JBQXNCO0FBQ2hFLGdEQUE0QyxDQUFDLHVCQUF1QjtBQUVwRSxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUUxQixxQkFBcUI7QUFDckIsTUFBTSxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUU7QUFDMUMsa0RBQWtEO0NBQ25ELENBQUMsQ0FBQztBQUVILDhEQUE4RDtBQUM5RCxJQUFJLG9CQUFRLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLDBDQUEwQztBQUVsRiw4REFBOEQ7QUFDOUQsSUFBSSw2QkFBVSxDQUFDLEdBQUcsRUFBRSxlQUFlLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IE15Q2RrU3RhY2sgfSBmcm9tIFwiLi4vbGliL215LWNkay1hcHAtc3RhY2tcIjtcbmltcG9ydCB7IERCU3RhY2sgfSBmcm9tIFwiLi4vbGliL0RCc3RhY2tcIjsgLy8gSW1wb3J0IHlvdXIgREJTdGFja1xuaW1wb3J0IHsgQVBJU3RhY2sgfSBmcm9tIFwiLi4vbGliL2FwaS1zdGFja1wiOyAvLyBJbXBvcnQgeW91ciBBUElTdGFja1xuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuXG4vLyBDcmVhdGUgdGhlIERCU3RhY2tcbmNvbnN0IGRiU3RhY2sgPSBuZXcgREJTdGFjayhhcHAsIFwiREJTdGFja1wiLCB7XG4gIC8vIEFueSBjdXN0b20gc3RhY2sgcHJvcHMgeW91IG1heSBoYXZlIGZvciBEQlN0YWNrXG59KTtcblxuLy8gQ3JlYXRlIHRoZSBBUElTdGFjaywgcGFzc2luZyBpbiB0aGUgREJTdGFjayBhcyBhIGRlcGVuZGVuY3lcbm5ldyBBUElTdGFjayhhcHAsIFwiQVBJU3RhY2tcIiwgZGJTdGFjayk7IC8vIFBhc3MgdGhlIERCU3RhY2sgYXMgdGhlIHNlY29uZCBhcmd1bWVudFxuXG4vLyBPcHRpb25hbGx5LCB5b3UgY2FuIGNyZWF0ZSB5b3VyIG90aGVyIHN0YWNrcyBoZXJlIGlmIG5lZWRlZFxubmV3IE15Q2RrU3RhY2soYXBwLCBcIk15Q2RrQXBwU3RhY2tcIik7XG4iXX0=