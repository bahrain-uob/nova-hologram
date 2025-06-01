import { authenticatedPost, API_URLS } from '@/utils/apiUtils';
import { getCurrentUser } from '@/lib/auth';
import { LexMessage, LexConversation, LexConfig, LexResponse, HologramGenerationRequest } from '@/types';

// Define the API URL for Lex service
const API_URL = API_URLS.lex;

// Lex bot configuration from environment variables
const LEX_CONFIG: LexConfig = {
  botId: process.env.NEXT_PUBLIC_LEX_BOT_ID || '',
  botAliasId: process.env.NEXT_PUBLIC_LEX_BOT_ALIAS_ID || '',
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'me-south-1',
};

/**
 * Send a message to the Lex chatbot
 * @param message The user's message to send to the chatbot
 * @param sessionId Optional session ID for continuing a conversation
 * @returns The bot's response and a session ID for continuing the conversation
 */
export async function sendMessageToLex(
  message: string,
  sessionId?: string
): Promise<{ response: string; sessionId: string }> {
  try {
    // Get the current user to include in the request
    const user = await getCurrentUser();
    const userId = user?.username || 'anonymous';

    // Send the message to the Lex bot
    const response = await authenticatedPost<{
      response: string;
      sessionId: string;
    }>(`${API_URL}/message`, {
      message,
      sessionId,
      userId,
      botId: LEX_CONFIG.botId,
      botAliasId: LEX_CONFIG.botAliasId,
    });

    return response;
  } catch (error) {
    console.error('Failed to send message to Lex:', error);
    return {
      response: 'Sorry, I encountered an error processing your request. Please try again later.',
      sessionId: sessionId || '',
    };
  }
}

/**
 * Start a new conversation with the Lex chatbot
 * @returns A new conversation with a welcome message and session ID
 */
export async function startLexConversation(): Promise<LexConversation> {
  try {
    const { response, sessionId } = await sendMessageToLex('Hello');
    
    return {
      messages: [
        {
          type: 'bot',
          content: response,
          timestamp: new Date().toISOString(),
        },
      ],
      sessionId,
    };
  } catch (error) {
    console.error('Failed to start Lex conversation:', error);
    return {
      messages: [
        {
          type: 'bot',
          content: 'Welcome! How can I help you today?',
          timestamp: new Date().toISOString(),
        },
      ],
      sessionId: '',
    };
  }
}

/**
 * Generate a hologram for a book or chapter using Lex and Bedrock
 * @param bookId The ID of the book
 * @param chapterId Optional chapter ID
 * @returns URL to the generated hologram
 */
export async function generateHologram(
  bookId: string,
  chapterId?: string
): Promise<string | null> {
  try {
    // Construct a message for the Lex bot to generate a hologram
    const message = chapterId
      ? `Generate hologram for book ${bookId} chapter ${chapterId}`
      : `Generate hologram for book ${bookId}`;

    // Send the message to Lex
    const { response } = await sendMessageToLex(message);

    // Extract the hologram URL from the response
    // This assumes the Lex bot returns a URL in a specific format
    const match = response.match(/https?:\/\/[^\s]+/);
    return match ? match[0] : null;
  } catch (error) {
    console.error('Failed to generate hologram:', error);
    return null;
  }
}

/**
 * Search for books using the Lex chatbot
 * @param query The search query (can include title, author, or genre)
 * @returns The search results from Lex
 */
export async function searchBooksWithLex(query: string): Promise<any> {
  try {
    // Send the search query to Lex
    const { response } = await sendMessageToLex(`Search for books: ${query}`);
    
    // In a real implementation, we would parse the response to extract book data
    // For now, we'll return the raw response
    return { response };
  } catch (error) {
    console.error('Failed to search books with Lex:', error);
    return { response: 'Sorry, I encountered an error searching for books.' };
  }
}
