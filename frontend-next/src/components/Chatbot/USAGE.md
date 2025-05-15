# Using the Chatbot Component

This document explains how to use the chatbot component in your application.

## Basic Usage

To add the chatbot to any page in your application, import and use the `ChatbotComponent`:

```tsx
import ChatbotComponent from '@/components/Chatbot/ChatbotComponent';

// Inside your component
return (
  <div>
    <h1>My Page</h1>
    <ChatbotComponent 
      botId={process.env.NEXT_PUBLIC_LEX_BOT_ID || ''}
      botAliasId={process.env.NEXT_PUBLIC_LEX_BOT_ALIAS_ID || ''}
      region={process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}
    />
  </div>
);
```

## Required Environment Variables

Make sure your `.env` file includes:

```
NEXT_PUBLIC_LEX_BOT_ID=<your-lex-bot-id>
NEXT_PUBLIC_LEX_BOT_ALIAS_ID=<your-lex-bot-alias-id>
NEXT_PUBLIC_AWS_REGION=us-east-1
```

## Authentication Integration

The chatbot component integrates with the AuthContext to get the current user's information. This allows the chatbot to provide personalized responses based on the user's identity.

If a user is logged in, their username will be used as the session ID for the Lex conversation. If no user is logged in, a random guest session ID will be generated.

## Customization

### Styling

The chatbot uses the UI components from your design system. You can customize its appearance by modifying the Card, Button, Input, and ScrollArea components.

### Behavior

To customize the chatbot's behavior:

1. Modify the `ChatbotComponent.tsx` file to change how messages are displayed or how user input is handled.
2. Update the Lex bot configuration in the AWS Console to change the intents, slots, and responses.
3. Modify the Lambda fulfillment function to change how the chatbot processes user input and generates responses.

## Lex Utilities

The chatbot component uses utility functions from `@/utils/lexUtils.ts` to interact with Amazon Lex. These utilities handle:

- Initializing the Lex client
- Sending messages to Lex
- Formatting Lex responses
- Managing session IDs
- Extracting slot values and intent information

You can use these utilities directly in other components if you need to integrate Lex functionality elsewhere in your application.

## Example Interactions

Users can interact with the chatbot using natural language. Some example interactions:

1. **Help**: "Help", "What can you do?", "How do I use this?"
2. **Search for books**: "Find a book", "Search for Harry Potter", "I want to read books by J.K. Rowling"
3. **Generate holograms**: "Generate a hologram", "Create a hologram for The Hobbit", "Visualize chapter 3"

## Troubleshooting

If you encounter issues with the chatbot:

1. Check the browser console for errors
2. Verify that the environment variables are correctly set
3. Ensure the user has permissions to access Lex
4. Check the Lambda logs in CloudWatch for backend errors
