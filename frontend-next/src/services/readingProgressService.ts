import { authenticatedGet, authenticatedPost, authenticatedPut, API_URLS } from '@/utils/apiUtils';

export interface ReadingSession {
  sessionId: string;
  userId: string;
  bookId: string;
  chapterId?: string;
  startPage: number;
  endPage?: number;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
}

export interface ReadingProgress {
  progressId: string;
  userId: string;
  bookId: string;
  currentPage: number;
  totalPages: number;
  percentage: number;
  lastReadAt: string;
  completedChapters: string[];
  totalTimeSpent: number; // in minutes
}

// Base API URL from apiUtils
const API_URL = API_URLS.progress;

/**
 * Start a new reading session
 */
export async function startReadingSession(bookId: string, startPage: number, chapterId?: string): Promise<ReadingSession | null> {
  try {
    return await authenticatedPost<ReadingSession>(`${API_URL}`, {
      action: 'startSession',
      bookId,
      startPage,
      chapterId,
    });
  } catch (error) {
    console.error('Failed to start reading session:', error);
    return null;
  }
}

/**
 * End an active reading session
 */
export async function endReadingSession(sessionId: string, endPage: number): Promise<ReadingSession | null> {
  try {
    return await authenticatedPost<ReadingSession>(`${API_URL}`, {
      action: 'endSession',
      sessionId,
      endPage,
    });
  } catch (error) {
    console.error('Failed to end reading session:', error);
    return null;
  }
}

/**
 * Update reading progress directly (without session)
 */
export async function updateReadingProgress(
  bookId: string, 
  currentPage: number, 
  percentage: number,
  chapterId?: string
): Promise<ReadingProgress | null> {
  try {
    return await authenticatedPost<ReadingProgress>(`${API_URL}`, {
      action: 'updateProgress',
      bookId,
      currentPage,
      percentage,
      chapterId,
    });
  } catch (error) {
    console.error('Failed to update reading progress:', error);
    return null;
  }
}

/**
 * Get reading progress for a specific book
 */
export async function getBookProgress(bookId: string): Promise<ReadingProgress | null> {
  try {
    const results = await authenticatedGet<ReadingProgress[]>(`${API_URL}?bookId=${encodeURIComponent(bookId)}`);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Failed to fetch book progress:', error);
    return null;
  }
}

/**
 * Get all books in progress for the current user
 */
export async function getAllBooksInProgress(): Promise<ReadingProgress[]> {
  try {
    return await authenticatedGet<ReadingProgress[]>(`${API_URL}`);
  } catch (error) {
    console.error('Failed to fetch books in progress:', error);
    return [];
  }
}

/**
 * Get recent reading sessions for a book
 */
export async function getRecentSessions(bookId: string, limit: number = 5): Promise<ReadingSession[]> {
  try {
    return await authenticatedGet<ReadingSession[]>(`${API_URL}/sessions?bookId=${encodeURIComponent(bookId)}&limit=${limit}`);
  } catch (error) {
    console.error('Failed to fetch reading sessions:', error);
    return [];
  }
}
