import { authenticatedGet, authenticatedPost, API_URLS } from '@/utils/apiUtils';
import { Quiz, QuizQuestion, QuizSubmission } from '@/types';

// Base API URL from apiUtils
const API_URL = API_URLS.quizzes;

/**
 * Fetch available quizzes for the current user
 * @param bookId Optional book ID to filter quizzes by book
 */
export async function fetchQuizzes(bookId?: string): Promise<Quiz[]> {
  try {
    let url = API_URL;
    
    if (bookId) {
      url += `?bookId=${encodeURIComponent(bookId)}`;
    }
    
    return await authenticatedGet<Quiz[]>(url);
  } catch (error) {
    console.error('Failed to fetch quizzes:', error);
    return [];
  }
}

/**
 * Fetch a specific quiz by ID
 */
export async function fetchQuizById(quizId: string): Promise<Quiz | null> {
  try {
    return await authenticatedGet<Quiz>(`${API_URL}/${quizId}`);
  } catch (error) {
    console.error('Failed to fetch quiz:', error);
    return null;
  }
}

/**
 * Submit a completed quiz
 */
export async function submitQuiz(
  quizId: string, 
  answers: { questionId: string; selectedOption: number }[]
): Promise<QuizSubmission | null> {
  try {
    return await authenticatedPost<QuizSubmission>(`${API_URL}/${quizId}/submit`, { answers });
  } catch (error) {
    console.error('Failed to submit quiz:', error);
    return null;
  }
}

/**
 * Fetch quiz history/results for the current user
 */
export async function fetchQuizHistory(): Promise<QuizSubmission[]> {
  try {
    return await authenticatedGet<QuizSubmission[]>(`${API_URL}/history`);
  } catch (error) {
    console.error('Failed to fetch quiz history:', error);
    return [];
  }
}
