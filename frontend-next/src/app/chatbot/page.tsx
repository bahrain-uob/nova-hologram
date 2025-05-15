'use client';

import React from 'react';
import ChatbotComponent from '@/components/Chatbot/ChatbotComponent';
import { useAuth } from '@/context/auth-context';

const ChatbotPage: React.FC = () => {
  // Get user information from auth context
  const { user } = useAuth();
  
  // Lex bot configuration
  // These values should be stored in environment variables
  const botId = process.env.NEXT_PUBLIC_LEX_BOT_ID || '';
  const botAliasId = process.env.NEXT_PUBLIC_LEX_BOT_ALIAS_ID || '';
  const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Nova Hologram Assistant</h1>
      
      <div className="max-w-md mx-auto">
        <ChatbotComponent 
          botId={botId}
          botAliasId={botAliasId}
          region={region}
        />
      </div>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          You can ask the assistant to search for books, generate holograms, or get help with using the platform.
        </p>
      </div>
    </div>
  );
};

export default ChatbotPage;
