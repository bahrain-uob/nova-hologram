"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { ChatBubble, ChatBubbleMessage } from "@/components/ui/chat/chat-bubble";
import { useRouter } from "next/navigation";
import "./guest-page.css";

// Define message type
type Message = {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: Date;
};

// Library-specific responses mapped to topics
const libraryResponses = {
    signup: [
        "You can sign up by clicking the sign up button on the up right corner",
        "Click the 'Sign up' button in the top right to create an account"
    ],
    reading_list: [
        "As a guest, you can browse books but need to sign up to create a reading list",
        "Create an account to make and save your personal reading lists"
    ],
    guest: [
        "As a guest, you can browse books and get recommendations",
        "You can search for books and view descriptions, but some features require an account"
    ],
    books: [
        "I might recommend several books that might interest you based on your preference.",
        "Would you like me to recommend books similar to 'The Red Pathways'?",
        "I can help you find books in specific genres. What are you interested in?",
        "Based on your preferences, You can search for any book description.",
        "Have you tried the latest release by James Patterson?"
    ]
};

// Predefined quick action buttons
const quickActions = [
    "How do I sign up?",
    "Can I create a reading list?",
    "What can I do as a guest?",
];

// Sends message to Nova or returns a library response
async function sendMessageToNova(message: string) {
  try {
    const lowerMessage = message.toLowerCase();

    // Only intercept extremely basic questions with canned replies
    if (lowerMessage.includes('sign up') || lowerMessage.includes('signup')) {
      return libraryResponses.signup[Math.floor(Math.random() * libraryResponses.signup.length)];
    }

    if (lowerMessage.includes('reading list')) {
      return libraryResponses.reading_list[Math.floor(Math.random() * libraryResponses.reading_list.length)];
    }

    if (lowerMessage.includes('guest') || lowerMessage.includes('as guest')) {
      return libraryResponses.guest[Math.floor(Math.random() * libraryResponses.guest.length)];
    }

    // For all other questions, send to Nova
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: [{ 
              text: `You are a helpful library assistant. Please answer: ${message}` 
            }]
          }
        ],
        inferenceConfig: {
          max_new_tokens: 1000,
          temperature: 0.2,
          top_p: 0.9
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Nova');
    }

    const data = await response.json();
    return data.output.message.content[0].text;

  } catch (error) {
    console.error('Error calling Nova:', error);
    // Fallback if Nova fails
    return libraryResponses.books[Math.floor(Math.random() * libraryResponses.books.length)];
  }
}

export default function GuestPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            content: "Hello! Ask me about any book, features or how to sign up?",
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Focus input when chat opens
    useEffect(() => {
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Handle sending a message
    const handleSendMessage = async (content: string = inputValue) => {
        if (!content.trim()) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            content: content.trim(),
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Get response from Nova or library responses
            const response = await sendMessageToNova(content);

            // Add bot response
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: response,
                sender: 'bot',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Error in chat:', error);
            // Add fallback message
            const fallbackMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: libraryResponses.books[Math.floor(Math.random() * libraryResponses.books.length)],
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, fallbackMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
    };

    // Handle pressing Enter to send
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-card">
                {/* Header */}
                <header className="chat-header">
                    <div className="chat-header-title">📚 LibraryAI </div><span className="text-sm text-muted-foreground">Guest Mode</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/signup")}
                        className="text-sm hover:text-[#2563eb] hover:border-[#2563eb]"
                    >
                        Sign up
                    </Button>
                </header>

                {/* Chat bubbles stay the same */}
                <div className="flex-1 overflow-hidden mt-12">
                    <ChatMessageList>
                        {messages.map((message) => (
                            <ChatBubble
                                key={message.id}
                                variant={message.sender === 'user' ? 'sent' : 'received'}
                                className={message.sender === 'user' ? 'bg-[#2563eb] text-white' : 'bg-white border border-gray-200 text-gray-800'}
                            >
                                <ChatBubbleMessage>{message.content}</ChatBubbleMessage>
                            </ChatBubble>
                        ))}
                        {isLoading && (
                            <ChatBubble variant="received" className="bg-white border border-gray-200 text-gray-800">
                                <ChatBubbleMessage>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                                        <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </ChatBubbleMessage>
                            </ChatBubble>
                        )}
                    </ChatMessageList>
                </div>

                {/* Quick Actions and Input */}
                <div className="quick-actions">
                    {quickActions.map((action) => (
                        <button key={action} onClick={() => handleSendMessage(action)}>
                            {action}
                        </button>
                    ))}
                </div>

                <div className="input-area">
                    <ChatInput
                        ref={inputRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button
                        onClick={() => handleSendMessage()}
                        disabled={!inputValue.trim() || isLoading}
                        size="icon"
                        className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>


    );
} 