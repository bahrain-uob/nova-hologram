# Lex Fulfillment Lambda Function

This Lambda function handles the fulfillment of intents for the Nova Hologram chatbot. It processes user requests and integrates with Amazon Bedrock for hologram generation.

## Overview

The Lambda function processes the following intents:

1. **HelpIntent**: Provides help information to users
2. **SearchBookIntent**: Searches for books based on title, author, or genre
3. **GenerateHologramIntent**: Generates holograms for books or chapters using Amazon Bedrock
4. **FallbackIntent**: Handles cases where no other intent matches

## Integration with Amazon Bedrock

The function integrates with Amazon Bedrock to generate holograms using the Nova Reel model. When a user requests a hologram, the function:

1. Retrieves the book or chapter content from DynamoDB
2. Constructs a prompt for the Nova Reel model
3. Submits an asynchronous job to Bedrock
4. Returns the job ID to the user for tracking

## Integration with DynamoDB

The function queries DynamoDB to:

1. Search for books based on title, author, or genre
2. Retrieve book and chapter content for hologram generation
3. Store and retrieve Q&A data

## Configuration

The Lambda function uses environment variables for configuration:

- `AWS_REGION`: The AWS region for DynamoDB and Bedrock (default: 'us-east-1')
- `OUTPUT_S3_URI`: The S3 URI where generated videos will be stored

## Deployment

The function is deployed as part of the Lex stack in CDK. It can also be deployed manually:

1. Install dependencies:
   ```
   npm install
   ```

2. Create a deployment package:
   ```
   zip -r function.zip index.js node_modules
   ```

3. Deploy to Lambda:
   ```
   aws lambda update-function-code --function-name LexFulfillmentLambda --zip-file fileb://function.zip
   ```

## Testing

You can test the function using the AWS Lambda console or by invoking it with a test event that simulates a Lex request.

Example test event for the HelpIntent:

```json
{
  "sessionState": {
    "sessionAttributes": {},
    "intent": {
      "name": "HelpIntent",
      "slots": {}
    }
  },
  "inputTranscript": "help"
}
```

## Error Handling

The function includes comprehensive error handling to ensure a smooth user experience:

1. If a book or chapter is not found, it provides a helpful message
2. If there's an error generating a hologram, it explains the issue
3. If there's a system error, it provides a generic error message

## Integration with Cognito User Pools

The function is designed to work with the Cognito User Pools configured in the project:

- US East (N. Virginia) User Pool ID: us-east-1_U0iB4Rowp
- Bahrain User Pool ID: me-south-1_X7adr285t

This allows the function to access user-specific information when needed.
