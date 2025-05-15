'use client';

import React, { useState, useEffect, useRef } from 'react';
import { initLexClient, sendMessageToLex, formatLexMessages, generateSessionId } from '@/utils/lexUtils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/context/auth-context';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  botId: string;
  botAliasId: string;
  region: string;
}

const ChatbotComponent: React.FC<ChatbotProps> = ({ botId, botAliasId, region }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Initialize the Lex client
  const lexClient = useRef(initLexClient());

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: '0',
        text: 'Hello! I\'m your Nova Hologram assistant. How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to Lex
  const handleLexMessage = async (text: string) => {
    try {
      setIsLoading(true);

      // Create a unique session ID for the user
      const sessionId = generateSessionId(user?.email);

      // Send the message to Lex using our utility function
      const response = await sendMessageToLex(text, sessionId, lexClient.current);

      // Format the messages using our utility function
      const formattedMessages = formatLexMessages(response);
      
      // Add the formatted messages to our chat
      const botResponses = formattedMessages.map((message, index) => ({
        id: `bot-${Date.now()}-${index}`,
        text: message.content,
        sender: 'bot' as const,
        timestamp: new Date(),
      }));

      setMessages(prev => [...prev, ...botResponses]);
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

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    await handleLexMessage(inputText);
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto h-[500px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Nova Hologram Assistant</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[380px] p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.text}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="flex w-full gap-2">
          <Input
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            className="flex-grow"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatbotComponent;
