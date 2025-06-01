import { authenticatedGet, API_URLS } from '@/utils/apiUtils';
import {
  ReadingStats,
  QuizStats,
  VocabularyStats,
  AnalyticsBookProgress,
  StudentAnalytics,
  ReadingProgressHistoryItem,
  QuizPerformanceHistoryItem,
  BookAnalytics
} from '@/types';

// Base API URL from apiUtils
const API_URL = API_URLS.analytics;

/**
 * Fetch analytics data for the current user
 */
export async function fetchUserAnalytics(): Promise<StudentAnalytics | null> {
  try {
    return await authenticatedGet<StudentAnalytics>(API_URL);
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
    return await authenticatedGet<ReadingProgressHistoryItem[]>(
      `${API_URL}/reading-history?timeframe=${timeframe}`
    );
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
    return await authenticatedGet<QuizPerformanceHistoryItem[]>(
      `${API_URL}/quiz-history?timeframe=${timeframe}`
    );
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
    return await authenticatedGet<BookAnalytics>(`${API_URL}/book/${bookId}`);
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
