import { getCurrentUser } from '@/lib/auth';
import { awsConfig } from '@/config/aws-config';

/**
 * Base API URLs for different services
 * These would typically come from environment variables in production
 */
export const API_URLS = {
  recommendations: process.env.NEXT_PUBLIC_RECOMMENDATIONS_API_URL || '/api/recommendations',
  progress: process.env.NEXT_PUBLIC_READING_PROGRESS_API_URL || '/api/progress',
  highlights: process.env.NEXT_PUBLIC_HIGHLIGHTS_API_URL || '/api/highlights',
  vocabulary: process.env.NEXT_PUBLIC_VOCABULARY_API_URL || '/api/vocabulary',
  quizzes: process.env.NEXT_PUBLIC_QUIZZES_API_URL || '/api/quizzes',
  analytics: process.env.NEXT_PUBLIC_ANALYTICS_API_URL || '/api/analytics',
  books: process.env.NEXT_PUBLIC_BOOKS_API_URL || '/api/books',
  lex: process.env.NEXT_PUBLIC_LEX_API_URL || '/api/lex',
  library: process.env.NEXT_PUBLIC_LIBRARY_API_URL || '/api/library',
  video: process.env.NEXT_PUBLIC_VIDEO_API_URL || '/api/video',
};

/**
 * Get the authentication token for API requests
 * @returns Promise that resolves to the JWT token
 */
export async function getAuthToken(): Promise<string> {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser && currentUser.signInUserSession) {
      return currentUser.signInUserSession.idToken.jwtToken;
    }
    throw new Error('No authentication token found');
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw new Error('Authentication required');
  }
}

/**
 * Make an authenticated API request
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns Promise that resolves to the response
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    const token = await getAuthToken();
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    return fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error('Error making authenticated request:', error);
    throw error;
  }
}

/**
 * Make an authenticated GET request
 * @param url The URL to fetch
 * @returns Promise that resolves to the parsed JSON response
 */
export async function authenticatedGet<T>(url: string): Promise<T> {
  const response = await authenticatedFetch(url);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Make an authenticated POST request
 * @param url The URL to fetch
 * @param data The data to send
 * @returns Promise that resolves to the parsed JSON response
 */
export async function authenticatedPost<T, U = any>(url: string, data: U): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Make an authenticated PUT request
 * @param url The URL to fetch
 * @param data The data to send
 * @returns Promise that resolves to the parsed JSON response
 */
export async function authenticatedPut<T, U = any>(url: string, data: U): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Make an authenticated DELETE request
 * @param url The URL to fetch
 * @returns Promise that resolves to true if successful
 */
export async function authenticatedDelete(url: string): Promise<boolean> {
  const response = await authenticatedFetch(url, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return true;
}
