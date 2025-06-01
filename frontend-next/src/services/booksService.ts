import { authenticatedFetch, API_URLS } from '@/utils/apiUtils';
import { Book, BookReview } from '@/types/book';
import { ReadingList } from '@/types/readingList';
import { API_ENDPOINTS } from '@/config/api-config';

// Use API_URLS from apiUtils for local API endpoints
// and API_ENDPOINTS from api-config for AWS API endpoints
const API_URL = API_URLS.books;

// ReadingList interface is now imported from @/types

/**
 * Fetch a book by its ID
 */
export async function fetchBookById(bookId: string): Promise<Book | null> {
  try {
    const response = await authenticatedFetch(`${API_URL}/${bookId}`, {
      method: 'GET'
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch book:', error);
    return null;
  }
}

/**
 * Fetch books with optional filtering
 */
export async function fetchBooks(
  filter?: {
    genre?: string;
    author?: string;
    readingLevel?: 'Easy' | 'Medium' | 'Hard';
    query?: string;
  }
): Promise<Book[]> {
  try {
    let url = API_URL;
    
    // Add query parameters if filters are provided
    if (filter) {
      const params = new URLSearchParams();
      if (filter.genre) params.append('genre', filter.genre);
      if (filter.author) params.append('author', filter.author);
      if (filter.readingLevel) params.append('readingLevel', filter.readingLevel);
      if (filter.query) params.append('query', filter.query);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await authenticatedFetch(url, {
      method: 'GET'
    });
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch books:', error);
    return [];
  }
}

/**
 * Fetch top-rated books
 */
export async function fetchTopRatedBooks(limit: number = 10): Promise<Book[]> {
  try {
    const response = await authenticatedFetch(`${API_URL}/top-rated?limit=${limit}`, {
      method: 'GET'
    });
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch top-rated books:', error);
    return [];
  }
}

/**
 * Fetch recommended books for the current user
 */
export async function fetchRecommendedBooks(limit: number = 10): Promise<Book[]> {
  try {
    const response = await authenticatedFetch(`${API_URL}/recommended?limit=${limit}`, {
      method: 'GET'
    });
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch recommended books:', error);
    return [];
  }
}

/**
 * Fetch similar books to a given book
 */
export async function fetchSimilarBooks(bookId: string, limit: number = 5): Promise<Book[]> {
  try {
    const response = await authenticatedFetch(`${API_URL}/${bookId}/similar?limit=${limit}`, {
      method: 'GET'
    });
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch similar books:', error);
    return [];
  }
}

/**
 * Rate a book
 */
export async function rateBook(bookId: string, rating: number): Promise<boolean> {
  try {
    const response = await authenticatedFetch(`${API_URL}/${bookId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to rate book:', error);
    return false;
  }
}

/**
 * Fetch reviews for a book
 */
export async function fetchBookReviews(bookId: string): Promise<BookReview[]> {
  try {
    const response = await authenticatedFetch(`${API_URL}/${bookId}/reviews`, {
      method: 'GET'
    });
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch book reviews:', error);
    return [];
  }
}

/**
 * Add a review for a book
 */
export async function addBookReview(
  bookId: string, 
  review: { rating: number; text: string }
): Promise<BookReview | null> {
  try {
    const response = await authenticatedFetch(`${API_URL}/${bookId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review)
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to add book review:', error);
    return null;
  }
}

/**
 * Fetch user's reading lists
 */
export async function fetchReadingLists(): Promise<ReadingList[]> {
  try {
    const response = await authenticatedFetch(`${API_URL}/reading-lists`, {
      method: 'GET'
    });
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch reading lists:', error);
    return [];
  }
}

/**
 * Create a new reading list
 */
export async function createReadingList(name: string): Promise<ReadingList | null> {
  try {
    const response = await authenticatedFetch(`${API_URL}/reading-lists`, {
      method: 'POST',
      body: JSON.stringify({ name })
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to create reading list:', error);
    return null;
  }
}

/**
 * Add a book to a reading list
 */
export async function addBookToReadingList(
  listId: string, 
  bookId: string
): Promise<boolean> {
  try {
    const response = await authenticatedFetch(`${API_URL}/reading-lists/${listId}/books`, {
      method: 'POST',
      body: JSON.stringify({ bookId })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to add book to reading list:', error);
    return false;
  }
}

/**
 * Remove a book from a reading list
 */
export async function removeBookFromReadingList(
  listId: string, 
  bookId: string
): Promise<boolean> {
  try {
    const response = await authenticatedFetch(`${API_URL}/reading-lists/${listId}/books/${bookId}`, {
      method: 'DELETE'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to remove book from reading list:', error);
    return false;
  }
}
