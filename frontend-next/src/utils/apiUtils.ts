import { getCurrentUser } from '@/lib/auth';
import { API_ENDPOINTS, DEFAULT_HEADERS, ERROR_MESSAGES, REQUEST_TIMEOUT } from '@/config/api-config';

/**
 * Base API URLs for different services
 * Using the centralized API configuration
 */
export const API_URLS = {
  recommendations: '/api/recommendations',
  progress: '/api/progress',
  highlights: '/api/highlights',
  vocabulary: '/api/vocabulary',
  quizzes: '/api/quizzes',
  analytics: '/api/analytics',
  books: '/api/books',
  lex: '/api/lex',
  library: '/api/library',
  video: '/api/video',
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
      ...DEFAULT_HEADERS,
      ...options.headers,
    };
    
    // Create an AbortController to handle request timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Handle common error responses
      if (!response.ok) {
        console.error(`API error: ${response.status} - ${response.statusText}`);
        
        // Log detailed error information in development
        if (process.env.NODE_ENV === 'development') {
          const errorText = await response.text();
          console.error('Error details:', errorText);
        }
      }
      
      return response;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES.TIMEOUT);
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error in authenticatedFetch:', error);
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
