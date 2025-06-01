import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete, API_URLS } from '@/utils/apiUtils';
import { VocabularyItem } from '@/types';

// Base API URL from apiUtils
const API_URL = API_URLS.vocabulary;

/**
 * Fetch vocabulary items for the current user
 * @param bookId Optional book ID to filter vocabulary by book
 */
export async function fetchVocabularyItems(bookId?: string): Promise<VocabularyItem[]> {
  try {
    let url = API_URL;
    
    if (bookId) {
      url += `?bookId=${encodeURIComponent(bookId)}`;
    }
    
    return await authenticatedGet<VocabularyItem[]>(url);
  } catch (error) {
    console.error('Failed to fetch vocabulary items:', error);
    return [];
  }
}

/**
 * Add a new vocabulary item
 */
export async function addVocabularyItem(item: Omit<VocabularyItem, 'id' | 'userId' | 'createdAt'>): Promise<VocabularyItem | null> {
  try {
    return await authenticatedPost<VocabularyItem>(API_URL, item);
  } catch (error) {
    console.error('Failed to add vocabulary item:', error);
    return null;
  }
}

/**
 * Update an existing vocabulary item
 */
export async function updateVocabularyItem(id: string, updates: Partial<VocabularyItem>): Promise<VocabularyItem | null> {
  try {
    return await authenticatedPut<VocabularyItem>(`${API_URL}/${id}`, updates);
  } catch (error) {
    console.error('Failed to update vocabulary item:', error);
    return null;
  }
}

/**
 * Delete a vocabulary item
 */
export async function deleteVocabularyItem(id: string): Promise<boolean> {
  try {
    return await authenticatedDelete(`${API_URL}/${id}`);
  } catch (error) {
    console.error('Failed to delete vocabulary item:', error);
    return false;
  }
}
