# Setting Up Amazon Lex for Nova Hologram Frontend

This guide explains how to configure the frontend application to connect to Amazon Lex.

## Environment Variables

Add the following environment variables to your `.env` file:

```
# AWS Region
NEXT_PUBLIC_AWS_REGION=us-east-1

# Amazon Cognito Configuration
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_U0iB4Rowp
NEXT_PUBLIC_COGNITO_CLIENT_ID=509b3p7mb73l7rfi2h16mef65v

# Amazon Lex Configuration
NEXT_PUBLIC_LEX_BOT_ID=<your-lex-bot-id>
NEXT_PUBLIC_LEX_BOT_ALIAS_ID=<your-lex-bot-alias-id>
```

## Getting Lex Bot ID and Alias ID

After creating your Lex bot in the AWS Console:

1. Navigate to the Amazon Lex console
2. Select your bot (NovaHologramBot)
3. The Bot ID will be displayed in the bot details or in the URL:
   - Example URL: `https://console.aws.amazon.com/lexv2/home?region=us-east-1#bot/BOTID/`
   - The Bot ID is the alphanumeric string in place of BOTID

4. For the Alias ID, go to Aliases in the left navigation
5. Select your alias (Production)
6. The Alias ID will be displayed in the alias details or in the URL:
   - Example URL: `https://console.aws.amazon.com/lexv2/home?region=us-east-1#bot/BOTID/alias/ALIASID/`
   - The Alias ID is the alphanumeric string in place of ALIASID

## Testing the Configuration

Once you've added these environment variables, you can test the Lex integration by:

1. Starting the frontend application:
   ```
   npm run dev
   ```

2. Navigating to the chatbot page:
   ```
   http://localhost:3000/chatbot
   ```

3. Trying some test queries:
   - "Help"
   - "Find a book"
   - "Generate a hologram"

## Troubleshooting

If you encounter issues:

1. Check that your environment variables are correctly set
2. Ensure your AWS credentials have permission to access Lex
3. Verify that the Lex bot and alias IDs are correct
4. Check the browser console for any errors
5. Ensure the Cognito user has permissions to access Lex
