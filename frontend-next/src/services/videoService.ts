import { authenticatedGet, authenticatedPost, API_URLS } from '@/utils/apiUtils';

// Define the API URL for video generation
const API_URL = API_URLS.video;

export interface VideoStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  error?: string;
  progress?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookVideoStatus {
  book: {
    trailer_status: 'pending' | 'processing' | 'completed' | 'failed';
    trailer?: string;
  };
  chapters: {
    chapter_id: string;
    title: string;
    trailer_status: 'pending' | 'processing' | 'completed' | 'failed';
    trailer?: string;
  }[];
}

/**
 * Generate a video for a book
 */
export async function generateBookVideo(bookId: string): Promise<boolean> {
  try {
    await authenticatedPost(`${API_URL}/books/${bookId}/generate`, {});
    return true;
  } catch (error) {
    console.error(`Failed to generate video for book with ID ${bookId}:`, error);
    return false;
  }
}

/**
 * Generate a video for a specific chapter
 */
export async function generateChapterVideo(bookId: string, chapterId: string): Promise<boolean> {
  try {
    await authenticatedPost(`${API_URL}/books/${bookId}/chapters/${chapterId}/generate`, {});
    return true;
  } catch (error) {
    console.error(`Failed to generate video for chapter ${chapterId} in book ${bookId}:`, error);
    return false;
  }
}

/**
 * Get the status of a book's video generation
 */
export async function getBookVideoStatus(bookId: string): Promise<BookVideoStatus | null> {
  try {
    return await authenticatedGet<BookVideoStatus>(`${API_URL}/books/${bookId}/status`);
  } catch (error) {
    console.error(`Failed to get video status for book with ID ${bookId}:`, error);
    return null;
  }
}

/**
 * Get the status of a chapter's video generation
 */
export async function getChapterVideoStatus(bookId: string, chapterId: string): Promise<VideoStatus | null> {
  try {
    return await authenticatedGet<VideoStatus>(`${API_URL}/books/${bookId}/chapters/${chapterId}/status`);
  } catch (error) {
    console.error(`Failed to get video status for chapter ${chapterId} in book ${bookId}:`, error);
    return null;
  }
}

/**
 * Generate a hologram video from text
 */
export async function generateHologramFromText(text: string, options?: {
  style?: string;
  duration?: number;
  voice?: string;
}): Promise<{ requestId: string } | null> {
  try {
    const response = await authenticatedPost<{ requestId: string }>(`${API_URL}/hologram/generate`, {
      text,
      ...options
    });
    return response;
  } catch (error) {
    console.error('Failed to generate hologram from text:', error);
    return null;
  }
}

/**
 * Get the status of a hologram generation
 */
export async function getHologramStatus(requestId: string): Promise<VideoStatus | null> {
  try {
    return await authenticatedGet<VideoStatus>(`${API_URL}/hologram/${requestId}/status`);
  } catch (error) {
    console.error(`Failed to get hologram status for request ${requestId}:`, error);
    return null;
  }
}
