'use client';

import AWS from 'aws-sdk';
import { LexRuntimeV2 } from 'aws-sdk';

// Configure AWS SDK
const configureAWS = () => {
  AWS.config.update({
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    // Credentials will be handled by the Cognito Identity Pool
  });
};

// Initialize Lex client
export const initLexClient = (): LexRuntimeV2 => {
  configureAWS();
  return new LexRuntimeV2({ region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1' });
};

// Send message to Lex
export const sendMessageToLex = async (
  text: string,
  sessionId: string,
  lexClient?: LexRuntimeV2
): Promise<AWS.LexRuntimeV2.RecognizeTextResponse> => {
  if (!lexClient) {
    lexClient = initLexClient();
  }

  const botId = process.env.NEXT_PUBLIC_LEX_BOT_ID;
  const botAliasId = process.env.NEXT_PUBLIC_LEX_BOT_ALIAS_ID;

  if (!botId || !botAliasId) {
    throw new Error('Lex bot configuration is missing. Please set NEXT_PUBLIC_LEX_BOT_ID and NEXT_PUBLIC_LEX_BOT_ALIAS_ID environment variables.');
  }

  try {
    const response = await lexClient.recognizeText({
      botId,
      botAliasId,
      localeId: 'en_US',
      sessionId,
      text,
    }).promise();

    return response;
  } catch (error) {
    console.error('Error sending message to Lex:', error);
    throw error;
  }
};

// Format Lex response messages
export const formatLexMessages = (
  response: AWS.LexRuntimeV2.RecognizeTextResponse
): { content: string; contentType: string }[] => {
  if (!response.messages || response.messages.length === 0) {
    return [{ content: 'Sorry, I didn\'t understand that.', contentType: 'PlainText' }];
  }

  return response.messages.map((message) => ({
    content: message.content || 'No content',
    contentType: message.contentType || 'PlainText',
  }));
};

// Generate a unique session ID
export const generateSessionId = (userId?: string): string => {
  return userId || `guest-${Math.random().toString(36).substring(2, 15)}`;
};

// Check if a slot is filled
export const isSlotFilled = (
  response: AWS.LexRuntimeV2.RecognizeTextResponse,
  slotName: string
): boolean => {
  if (
    !response.sessionState ||
    !response.sessionState.intent ||
    !response.sessionState.intent.slots
  ) {
    return false;
  }

  const slot = response.sessionState.intent.slots[slotName];
  return !!slot && !!slot.value;
};

// Get slot value
export const getSlotValue = (
  response: AWS.LexRuntimeV2.RecognizeTextResponse,
  slotName: string
): string | null => {
  if (
    !response.sessionState ||
    !response.sessionState.intent ||
    !response.sessionState.intent.slots
  ) {
    return null;
  }

  const slot = response.sessionState.intent.slots[slotName];
  return slot?.value?.interpretedValue || null;
};

// Get all filled slots
export const getFilledSlots = (
  response: AWS.LexRuntimeV2.RecognizeTextResponse
): Record<string, string> => {
  if (
    !response.sessionState ||
    !response.sessionState.intent ||
    !response.sessionState.intent.slots
  ) {
    return {};
  }

  const filledSlots: Record<string, string> = {};
  const slots = response.sessionState.intent.slots;

  Object.keys(slots).forEach((slotName) => {
    const slot = slots[slotName];
    if (slot && slot.value && slot.value.interpretedValue) {
      filledSlots[slotName] = slot.value.interpretedValue;
    }
  });

  return filledSlots;
};

// Get the current intent name
export const getIntentName = (
  response: AWS.LexRuntimeV2.RecognizeTextResponse
): string | null => {
  if (
    !response.sessionState ||
    !response.sessionState.intent
  ) {
    return null;
  }

  return response.sessionState.intent.name || null;
};

// Get the dialog state
export const getDialogState = (
  response: AWS.LexRuntimeV2.RecognizeTextResponse
): string | null => {
  if (!response.sessionState || !response.sessionState.dialogAction) {
    return null;
  }

  return response.sessionState.dialogAction.type || null;
};

// Check if the conversation is complete
export const isConversationComplete = (
  response: AWS.LexRuntimeV2.RecognizeTextResponse
): boolean => {
  return getDialogState(response) === 'Close';
};

// Get session attributes
export const getSessionAttributes = (
  response: AWS.LexRuntimeV2.RecognizeTextResponse
): Record<string, string> => {
  if (!response.sessionState || !response.sessionState.sessionAttributes) {
    return {};
  }

  return response.sessionState.sessionAttributes;
};
