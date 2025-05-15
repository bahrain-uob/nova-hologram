"use client";

import React from "react";
import { ChatbotButton } from "@/components/chatbot/ChatbotButton";

export default function ChatbotTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-6">Chatbot Test Page</h1>
      <p className="mb-4">
        This page demonstrates the chatbot functionality. Click the chat button in the bottom right corner to open the chat interface.
      </p>
      <div className="p-4 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-2">How to use:</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Click the chat button in the bottom right corner</li>
          <li>Type a message and press Enter or click the send button</li>
          <li>The chatbot will respond with a random dummy response</li>
          <li>You can continue the conversation with multiple messages</li>
        </ul>
      </div>
      
      {/* Add the chatbot button to the page */}
      <ChatbotButton />
    </div>
  );
}
