# Amazon Lex Integration for Nova Hologram

This directory contains the infrastructure code for integrating Amazon Lex with the Nova Hologram application. The integration allows users to interact with a chatbot to search for books, generate holograms, and get help with using the platform.

## Components

1. **Lex Stack**: CDK infrastructure for creating the necessary AWS resources
2. **Lambda Fulfillment**: Lambda function for handling Lex intent fulfillment
3. **Frontend Integration**: React components for integrating the chatbot into the frontend

## Setup Instructions

### 1. Deploy the Infrastructure

Deploy the Lex stack using CDK:

```bash
npm run cdk deploy LexStack
```

This will create:
- A Lambda function for Lex fulfillment
- An IAM role for Lex to invoke the Lambda function

### 2. Create the Lex Bot Manually

Due to type compatibility issues with the CDK Lex V2 API, you'll need to create the Lex bot manually in the AWS Console:

1. Go to the AWS Console and navigate to Amazon Lex
2. Create a new bot with the following configuration:
   - Name: NovaHologramBot
   - IAM Role: Use the role ARN from the CDK output (`LexServiceRoleArn`)
   - COPPA: No
   - Idle session timeout: 5 minutes
   - Language: English (US)

3. Add the following intents:
   - **HelpIntent**: For providing help to the user
     - Sample utterances: "help", "I need help", "how do I use this", "what can you do", "show me how to use this"
   
   - **SearchBookIntent**: For searching books
     - Sample utterances: "find a book", "search for {BookTitle}", "I want to read {BookTitle}", "find books by {AuthorName}", "show me books about {Genre}"
     - Slots:
       - BookTitle (AMAZON.AlphaNumeric)
       - AuthorName (AMAZON.AlphaNumeric)
       - Genre (AMAZON.AlphaNumeric)
   
   - **GenerateHologramIntent**: For generating holograms
     - Sample utterances: "generate a hologram", "create a hologram for {BookTitle}", "visualize {BookTitle}", "show me a hologram of {ChapterTitle}", "create a visual for chapter {ChapterNumber}"
     - Slots:
       - BookTitle (AMAZON.AlphaNumeric)
       - ChapterTitle (AMAZON.AlphaNumeric)
       - ChapterNumber (AMAZON.Number)
   
   - **FallbackIntent**: Default intent when no other intent matches

4. For each intent, enable the fulfillment Lambda function using the ARN from the CDK output (`LexFulfillmentLambdaArn`)

5. Build and publish the bot with an alias named "Production"

6. Note the Bot ID and Alias ID for configuration in the frontend

### 3. Configure the Frontend

Add the following environment variables to your frontend `.env` file:

```
NEXT_PUBLIC_LEX_BOT_ID=<your-lex-bot-id>
NEXT_PUBLIC_LEX_BOT_ALIAS_ID=<your-lex-bot-alias-id>
NEXT_PUBLIC_AWS_REGION=us-east-1
```

### 4. Test the Chatbot

Navigate to the chatbot page in your application:

```
http://localhost:3000/chatbot
```

Try the following interactions:
- "Help" - Should provide general help information
- "Find a book" - Should prompt for book details and search
- "Generate a hologram for Harry Potter" - Should start the hologram generation process

## Customization

You can customize the chatbot by:

1. Adding more intents in the Lex console
2. Enhancing the Lambda fulfillment function to handle more complex scenarios
3. Improving the frontend UI components

## Troubleshooting

If you encounter issues:

1. Check the Lambda logs in CloudWatch
2. Verify the IAM permissions for the Lex service role
3. Ensure the frontend has the correct environment variables
4. Check the browser console for any frontend errors
