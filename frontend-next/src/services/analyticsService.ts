import { authenticatedGet, API_URLS } from '@/utils/apiUtils';

export interface ReadingStats {
  totalBooksStarted: number;
  totalBooksCompleted: number;
  totalReadingTime: number; // in minutes
  averageReadingSpeed: number; // pages per hour
  totalPages: number;
  lastReadDate: string;
  readingStreak: number; // consecutive days
}

export interface QuizStats {
  totalQuizzesTaken: number;
  averageScore: number;
  highestScore: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
}

export interface VocabularyStats {
  totalWordsLearned: number;
  lastAddedDate: string;
  mostCommonCategories: { category: string; count: number }[];
}

export interface BookProgress {
  bookId: string;
  title: string;
  coverImage: string;
  progress: number; // percentage
  lastReadDate: string;
  timeSpent: number; // in minutes
  pagesRead: number;
}

export interface StudentAnalytics {
  userId: string;
  readingStats: ReadingStats;
  quizStats: QuizStats;
  vocabularyStats: VocabularyStats;
  inProgressBooks: BookProgress[];
  completedBooks: BookProgress[];
  recommendedNextSteps: string[];
}

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
export async function fetchReadingProgressHistory(timeframe: 'week' | 'month' | 'year' | 'all' = 'month'): Promise<{date: string; pagesRead: number; timeSpent: number}[]> {
  try {
    return await authenticatedGet<{date: string; pagesRead: number; timeSpent: number}[]>(
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
export async function fetchQuizPerformanceHistory(timeframe: 'week' | 'month' | 'year' | 'all' = 'month'): Promise<{date: string; score: number; quizId: string; quizTitle: string}[]> {
  try {
    return await authenticatedGet<{date: string; score: number; quizId: string; quizTitle: string}[]>(
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
export async function fetchBookAnalytics(bookId: string): Promise<{
  progress: number;
  timeSpent: number;
  pagesRead: number;
  readingSessions: number;
  quizScores: {quizId: string; title: string; score: number}[];
  vocabulary: {count: number; lastAdded: string};
}> {
  try {
    return await authenticatedGet<{
      progress: number;
      timeSpent: number;
      pagesRead: number;
      readingSessions: number;
      quizScores: {quizId: string; title: string; score: number}[];
      vocabulary: {count: number; lastAdded: string};
    }>(`${API_URL}/book/${bookId}`);
  } catch (error) {
    console.error('Failed to fetch book analytics:', error);
    return {
      progress: 0,
      timeSpent: 0,
      pagesRead: 0,
      readingSessions: 0,
      quizScores: [],
      vocabulary: {count: 0, lastAdded: new Date().toISOString()}
    };
  }
}
