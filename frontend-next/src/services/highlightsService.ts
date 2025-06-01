import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete, API_URLS } from '@/utils/apiUtils';

export interface Highlight {
  id: string;
  userId: string;
  bookId: string;
  chapterId?: string;
  pageNumber: number;
  text: string;
  color: string;
  note?: string;
  createdAt: string;
}

// Base API URL from apiUtils
const API_URL = API_URLS.highlights;

/**
 * Fetch highlights for the current user
 * @param bookId Optional book ID to filter highlights by book
 */
export async function fetchHighlights(bookId?: string): Promise<Highlight[]> {
  try {
    let url = API_URL;
    
    if (bookId) {
      url += `?bookId=${encodeURIComponent(bookId)}`;
    }
    
    return await authenticatedGet<Highlight[]>(url);
  } catch (error) {
    console.error('Failed to fetch highlights:', error);
    return [];
  }
}

/**
 * Create a new highlight
 */
export async function createHighlight(highlight: Omit<Highlight, 'id' | 'userId' | 'createdAt'>): Promise<Highlight | null> {
  try {
    return await authenticatedPost<Highlight>(API_URL, highlight);
  } catch (error) {
    console.error('Failed to create highlight:', error);
    return null;
  }
}

/**
 * Update an existing highlight
 */
export async function updateHighlight(id: string, updates: Partial<Highlight>): Promise<Highlight | null> {
  try {
    return await authenticatedPut<Highlight>(`${API_URL}/${id}`, updates);
  } catch (error) {
    console.error('Failed to update highlight:', error);
    return null;
  }
}

/**
 * Delete a highlight
 */
export async function deleteHighlight(id: string): Promise<boolean> {
  try {
    return await authenticatedDelete(`${API_URL}/${id}`);
  } catch (error) {
    console.error('Failed to delete highlight:', error);
    return false;
  }
}

/**
 * Get all highlights for a specific page in a book
 */
export async function getPageHighlights(bookId: string, pageNumber: number): Promise<Highlight[]> {
  try {
    return await authenticatedGet<Highlight[]>(`${API_URL}?bookId=${encodeURIComponent(bookId)}&pageNumber=${pageNumber}`);
  } catch (error) {
    console.error('Failed to fetch page highlights:', error);
    return [];
  }
}
