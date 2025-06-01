import { authenticatedGet, authenticatedPost, API_URLS } from '@/utils/apiUtils';
import { BookRecommendation, UserPreferences } from '@/types';

// Base API URL from apiUtils
const API_URL = API_URLS.recommendations;

/**
 * Fetch personalized book recommendations for the current user
 * @param limit Number of recommendations to fetch
 * @param includeRationale Whether to include rationale for recommendations
 */
export async function fetchPersonalizedRecommendations(
  limit: number = 10,
  includeRationale: boolean = false
): Promise<BookRecommendation[]> {
  try {
    return await authenticatedGet<BookRecommendation[]>(
      `${API_URL}?limit=${limit}&includeRationale=${includeRationale}`
    );
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    return [];
  }
}

/**
 * Fetch similar books based on a specific book
 * @param bookId ID of the book to find similar books for
 * @param limit Number of recommendations to fetch
 * @param includeRationale Whether to include rationale for recommendations
 */
export async function fetchSimilarBooks(
  bookId: string,
  limit: number = 5,
  includeRationale: boolean = false
): Promise<BookRecommendation[]> {
  try {
    return await authenticatedGet<BookRecommendation[]>(
      `${API_URL}?bookId=${encodeURIComponent(bookId)}&limit=${limit}&includeRationale=${includeRationale}`
    );
  } catch (error) {
    console.error('Failed to fetch similar books:', error);
    return [];
  }
}

/**
 * Fetch trending or popular books
 * @param limit Number of books to fetch
 */
export async function fetchTrendingBooks(
  limit: number = 10
): Promise<BookRecommendation[]> {
  try {
    return await authenticatedGet<BookRecommendation[]>(
      `${API_URL}/trending?limit=${limit}`
    );
  } catch (error) {
    console.error('Failed to fetch trending books:', error);
    return [];
  }
}

/**
 * Fetch curated recommendations from librarians
 * @param limit Number of recommendations to fetch
 */
export async function fetchCuratedRecommendations(
  limit: number = 10
): Promise<BookRecommendation[]> {
  try {
    return await authenticatedGet<BookRecommendation[]>(
      `${API_URL}/curated?limit=${limit}`
    );
  } catch (error) {
    console.error('Failed to fetch curated recommendations:', error);
    return [];
  }
}

/**
 * Update user preferences for recommendations
 */
export async function updateUserPreferences(preferences: UserPreferences): Promise<boolean> {
  try {
    await authenticatedPost(API_URL, {
      action: 'updatePreferences',
      preferences
    });
    return true;
  } catch (error) {
    console.error('Failed to update preferences:', error);
    return false;
  }
}

/**
 * Rate a book (used for improving recommendations)
 */
export async function rateBook(bookId: string, rating: number, feedback?: string): Promise<boolean> {
  try {
    await authenticatedPost(API_URL, {
      action: 'rateBook',
      bookId,
      rating,
      feedback
    });
    return true;
  } catch (error) {
    console.error('Failed to rate book:', error);
    return false;
  }
}
