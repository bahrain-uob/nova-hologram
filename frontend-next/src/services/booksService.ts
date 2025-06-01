import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete, API_URLS } from '@/utils/apiUtils';
import { Book, BookReview, ReadingList } from '@/types';

// Define the API URL for books service
// Add this to apiUtils.ts API_URLS if not already there
const API_URL = API_URLS.books || process.env.NEXT_PUBLIC_BOOKS_API_URL || '/api/books';

// ReadingList interface is now imported from @/types

/**
 * Fetch a book by its ID
 */
export async function fetchBookById(bookId: string): Promise<Book | null> {
  try {
    return await authenticatedGet<Book>(`${API_URL}/${bookId}`);
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
    
    return await authenticatedGet<Book[]>(url);
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
    return await authenticatedGet<Book[]>(`${API_URL}/top-rated?limit=${limit}`);
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
    return await authenticatedGet<Book[]>(`${API_URL}/recommended?limit=${limit}`);
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
    return await authenticatedGet<Book[]>(`${API_URL}/${bookId}/similar?limit=${limit}`);
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
    await authenticatedPost(`${API_URL}/${bookId}/rate`, { rating });
    return true;
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
    return await authenticatedGet<BookReview[]>(`${API_URL}/${bookId}/reviews`);
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
    return await authenticatedPost<BookReview>(`${API_URL}/${bookId}/reviews`, review);
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
    return await authenticatedGet<ReadingList[]>(`${API_URL}/reading-lists`);
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
    return await authenticatedPost<ReadingList>(`${API_URL}/reading-lists`, { name });
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
    await authenticatedPost(`${API_URL}/reading-lists/${listId}/books`, { bookId });
    return true;
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
    await authenticatedDelete(`${API_URL}/reading-lists/${listId}/books/${bookId}`);
    return true;
  } catch (error) {
    console.error('Failed to remove book from reading list:', error);
    return false;
  }
}
