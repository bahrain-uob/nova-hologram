// Amazon Lex chatbot integration types

// Lex message interface for individual messages in the conversation
export interface LexMessage {
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  messageId?: string;
  metadata?: {
    intentName?: string;
    slots?: Record<string, string>;
    confidence?: number;
  };
}

// Lex conversation interface for tracking conversation state
export interface LexConversation {
  messages: LexMessage[];
  sessionId: string;
  bookContext?: {
    bookId?: string;
    chapterId?: string;
    title?: string;
  };
}

// Lex bot configuration
export interface LexConfig {
  botId: string;
  botAliasId: string;
  region: string;
}

// Lex intent types based on the supported intents from memory
export type LexIntentType = 
  | 'HelpIntent' 
  | 'SearchBookIntent' 
  | 'GenerateHologramIntent' 
  | 'FallbackIntent';

// Lex intent slots for different intents
export interface LexIntentSlots {
  bookTitle?: string;
  authorName?: string;
  genre?: string;
  chapter?: string;
  topic?: string;
}

// Lex response from the backend
export interface LexResponse {
  message: string;
  sessionId: string;
  intentName?: LexIntentType;
  slots?: LexIntentSlots;
  dialogState?: 'ElicitIntent' | 'ElicitSlot' | 'Fulfilled' | 'Failed';
  sessionAttributes?: Record<string, string>;
}

// Hologram generation request
export interface HologramGenerationRequest {
  bookId: string;
  chapterId?: string;
  prompt?: string;
  userId?: string;
}

// Hologram generation response
export interface HologramGenerationResponse {
  url: string;
  status: 'completed' | 'processing' | 'failed';
  message?: string;
  estimatedTime?: number; // in seconds
}
