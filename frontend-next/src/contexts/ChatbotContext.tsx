'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AWS from 'aws-sdk';
import { LexRuntimeV2 } from 'aws-sdk';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotContextType {
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  clearMessages: () => void;
}

interface ChatbotProviderProps {
  children: ReactNode;
  botId: string;
  botAliasId: string;
  region: string;
  userId: string;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({
  children,
  botId,
  botAliasId,
  region,
  userId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lexClient, setLexClient] = useState<LexRuntimeV2 | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize AWS SDK and Lex client
  useEffect(() => {
    AWS.config.update({
      region: region,
      // Credentials will be handled by the Cognito Identity Pool
    });

    const client = new LexRuntimeV2({ region });
    setLexClient(client);

    // Generate a session ID for the user
    setSessionId(userId || `guest-${Math.random().toString(36).substring(2, 15)}`);

    // Add welcome message
    setMessages([
      {
        id: '0',
        text: 'Hello! I\'m your Nova Hologram assistant. How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  }, [region, userId]);

  // Send message to Lex
  const sendMessage = async (text: string) => {
    if (!text.trim() || !lexClient || !botId || !botAliasId) return;

    // Add user message to the conversation
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send the message to Lex
      const response = await lexClient.recognizeText({
        botId,
        botAliasId,
        localeId: 'en_US',
        sessionId,
        text,
      }).promise();

      // Process the response
      if (response.messages && response.messages.length > 0) {
        const botResponses = response.messages.map((message, index) => ({
          id: `bot-${Date.now()}-${index}`,
          text: message.content || 'Sorry, I didn\'t understand that.',
          sender: 'bot' as const,
          timestamp: new Date(),
        }));

        setMessages(prev => [...prev, ...botResponses]);
      } else {
        // If no messages in response, add a default message
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            text: 'Sorry, I didn\'t understand that.',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error sending message to Lex:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          text: 'Sorry, I encountered an error. Please try again later.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all messages except the welcome message
  const clearMessages = () => {
    setMessages([
      {
        id: '0',
        text: 'Hello! I\'m your Nova Hologram assistant. How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <ChatbotContext.Provider
      value={{
        messages,
        sendMessage,
        isLoading,
        clearMessages,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = (): ChatbotContextType => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};
