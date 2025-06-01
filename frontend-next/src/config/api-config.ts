/**
 * Global API Configuration
 * This file centralizes all API endpoints and configuration
 */

import { awsConfig } from './aws-config';

// Base API URL - can be AWS API Gateway or local development server
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || awsConfig.apiUrl;

// AWS API Gateway endpoint
export const API_GATEWAY_ENDPOINT = process.env.NEXT_PUBLIC_API_GATEWAY_ENDPOINT || awsConfig.apiGateway.endpoint;

// Define all API endpoints
export const API_ENDPOINTS = {
  // Books and Library
  books: `${API_GATEWAY_ENDPOINT}/books`,
  book: (id: string) => `${API_GATEWAY_ENDPOINT}/books/${id}`,
  bookChapters: (id: string) => `${API_GATEWAY_ENDPOINT}/books/${id}/chapters`,
  bookChapter: (bookId: string, chapterId: string) => `${API_GATEWAY_ENDPOINT}/books/${bookId}/chapters/${chapterId}`,
  
  // Library Management
  library: `${API_GATEWAY_ENDPOINT}/library`,
  userLibrary: (userId: string) => `${API_GATEWAY_ENDPOINT}/library/user/${userId}`,
  bookDetails: (bookId: string) => `${API_GATEWAY_ENDPOINT}/library/book/${bookId}`,
  
  // Authentication - Using direct Cognito SDK calls
  // No longer using API endpoints for authentication
  
  // Reading Progress
  readingProgress: `${API_GATEWAY_ENDPOINT}/reading-progress`,
  userProgress: (userId: string) => `${API_GATEWAY_ENDPOINT}/reading-progress/user/${userId}`,
  bookProgress: (bookId: string) => `${API_GATEWAY_ENDPOINT}/reading-progress/book/${bookId}`,
  
  // Recommendations
  recommendations: `${API_GATEWAY_ENDPOINT}/recommendations`,
  userRecommendations: (userId: string) => `${API_GATEWAY_ENDPOINT}/recommendations/user/${userId}`,
  similarBooks: (bookId: string) => `${API_GATEWAY_ENDPOINT}/recommendations/similar/${bookId}`,
  
  // Highlights
  highlights: `${API_GATEWAY_ENDPOINT}/highlights`,
  bookHighlights: (bookId: string) => `${API_GATEWAY_ENDPOINT}/highlights/book/${bookId}`,
  
  // Vocabulary
  vocabulary: `${API_GATEWAY_ENDPOINT}/vocabulary`,
  userVocabulary: (userId: string) => `${API_GATEWAY_ENDPOINT}/vocabulary/user/${userId}`,
  bookVocabulary: (bookId: string) => `${API_GATEWAY_ENDPOINT}/vocabulary/book/${bookId}`,
  
  // Quizzes
  quizzes: `${API_GATEWAY_ENDPOINT}/quizzes`,
  bookQuizzes: (bookId: string) => `${API_GATEWAY_ENDPOINT}/quizzes/book/${bookId}`,
  
  // Analytics
  analytics: `${API_GATEWAY_ENDPOINT}/analytics`,
  userAnalytics: (userId: string) => `${API_GATEWAY_ENDPOINT}/analytics/user/${userId}`,
  bookAnalytics: (bookId: string) => `${API_GATEWAY_ENDPOINT}/analytics/book/${bookId}`,
  
  // Lex Chatbot
  lex: `${API_GATEWAY_ENDPOINT}/lex`,
  lexConversation: `${API_GATEWAY_ENDPOINT}/lex/conversation`,
  
  // Video Generation
  video: `${API_GATEWAY_ENDPOINT}/video`,
  bookVideo: (bookId: string) => `${API_GATEWAY_ENDPOINT}/video/book/${bookId}`,
  chapterVideo: (bookId: string, chapterId: string) => `${API_GATEWAY_ENDPOINT}/video/book/${bookId}/chapter/${chapterId}`,
  
  // Reading Lists
  readingLists: `${API_GATEWAY_ENDPOINT}/reading-lists`,
  readingList: (id: string) => `${API_GATEWAY_ENDPOINT}/reading-lists/${id}`,
  
  // User Management
  users: `${API_GATEWAY_ENDPOINT}/users`,
  user: (id: string) => `${API_GATEWAY_ENDPOINT}/users/${id}`,
  userSettings: (id: string) => `${API_GATEWAY_ENDPOINT}/users/${id}/settings`,
};

// API request headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// API request timeout (in milliseconds)
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// API response status codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An error occurred on the server. Please try again later.',
  TIMEOUT: 'The request timed out. Please try again.',
};
