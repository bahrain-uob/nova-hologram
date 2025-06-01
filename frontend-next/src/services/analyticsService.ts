import { authenticatedFetch, API_URLS } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/config/api-config';
import {
  ReadingStats,
  QuizStats,
  VocabularyStats,
  AnalyticsBookProgress,
  StudentAnalytics,
  ReadingProgressHistoryItem,
  QuizPerformanceHistoryItem,
  BookAnalytics
} from '@/types/analytics';

// Use API_URLS from apiUtils for local API endpoints
// and API_ENDPOINTS from api-config for AWS API endpoints
const API_URL = API_URLS.analytics;

/**
 * Fetch analytics data for the current user
 */
export async function fetchUserAnalytics(): Promise<StudentAnalytics | null> {
  try {
    const response = await authenticatedFetch(API_URL, {
      method: 'GET'
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return null;
  }
}

/**
 * Fetch reading progress history (for charts/graphs)
 * @param timeframe 'week', 'month', 'year', or 'all'
 */
export async function fetchReadingProgressHistory(timeframe: 'week' | 'month' | 'year' | 'all' = 'month'): Promise<ReadingProgressHistoryItem[]> {
  try {
    const response = await authenticatedFetch(
      `${API_URL}/reading-history?timeframe=${timeframe}`,
      { method: 'GET' }
    );
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch reading history:', error);
    return [];
  }
}

/**
 * Fetch quiz performance history (for charts/graphs)
 * @param timeframe 'week', 'month', 'year', or 'all'
 */
export async function fetchQuizPerformanceHistory(timeframe: 'week' | 'month' | 'year' | 'all' = 'month'): Promise<QuizPerformanceHistoryItem[]> {
  try {
    const response = await authenticatedFetch(
      `${API_URL}/quiz-history?timeframe=${timeframe}`,
      { method: 'GET' }
    );
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch quiz performance history:', error);
    return [];
  }
}

/**
 * Fetch book-specific analytics
 * @param bookId The ID of the book to get analytics for
 */
export async function fetchBookAnalytics(bookId: string): Promise<BookAnalytics> {
  try {
    const response = await authenticatedFetch(
      `${API_URL}/book/${bookId}`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch book analytics: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch book analytics:', error);
    return {
      progress: 0,
      timeSpent: 0,
      pagesRead: 0,
      readingSessions: 0,
      quizScores: [],
      vocabulary: {count: 0, lastAdded: new Date().toISOString()}
    } as BookAnalytics;
  }
}
