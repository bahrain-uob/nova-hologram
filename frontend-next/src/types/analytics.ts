// Analytics-related interfaces

// Reading statistics interface
export interface ReadingStats {
  totalBooksStarted: number;
  totalBooksCompleted: number;
  totalReadingTime: number; // in minutes
  averageReadingSpeed: number; // pages per hour
  totalPages: number;
  lastReadDate: string;
  readingStreak: number; // consecutive days
}

// Quiz statistics interface
export interface QuizStats {
  totalQuizzesTaken: number;
  averageScore: number;
  highestScore: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
}

// Vocabulary statistics interface
export interface VocabularyStats {
  totalWordsLearned: number;
  lastAddedDate: string;
  mostCommonCategories: { category: string; count: number }[];
}

// Book progress interface for analytics
// Note: This is different from the BookProgress in book.ts
export interface AnalyticsBookProgress {
  bookId: string;
  title: string;
  coverImage: string;
  progress: number; // percentage
  lastReadDate?: string;
  estimatedTimeToComplete?: number; // in minutes
}

// Student analytics interface
export interface StudentAnalytics {
  userId: string;
  readingStats: ReadingStats;
  quizStats: QuizStats;
  vocabularyStats: VocabularyStats;
  inProgressBooks: AnalyticsBookProgress[];
  completedBooks: AnalyticsBookProgress[];
  recommendedNextSteps: string[];
}

// Reading progress history for charts/graphs
export interface ReadingProgressHistoryItem {
  date: string;
  pagesRead: number;
  timeSpent: number;
}

// Quiz performance history for charts/graphs
export interface QuizPerformanceHistoryItem {
  date: string;
  score: number;
  quizId: string;
  quizTitle: string;
}

// Book-specific analytics
export interface BookAnalytics {
  progress: number;
  timeSpent: number;
  pagesRead: number;
  readingSessions: number;
  quizScores: {quizId: string; title: string; score: number}[];
  vocabulary: {count: number; lastAdded: string};
}
