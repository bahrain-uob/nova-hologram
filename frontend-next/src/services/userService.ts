import { authenticatedGet, authenticatedDelete } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/config/api-config';
import { User } from '@/types/user';

// Centralized API URL for user management (AWS Gateway)
const API_URL = API_ENDPOINTS.users;

/**
 * Fetch all readers (users with role 'reader')
 */
export async function getAllReaders(): Promise<User[]> {
  try {
    // You may want to filter by role=reader at the backend or here
    const users = await authenticatedGet<User[]>(`${API_URL}?role=reader`);
    return users;
  } catch (error) {
    console.error('Failed to fetch readers:', error);
    return [];
  }
}

/**
 * Delete a reader by user ID
 */
export async function deleteReader(userId: string): Promise<boolean> {
  try {
    return await authenticatedDelete(`${API_URL}/${userId}`);
  } catch (error) {
    console.error('Failed to delete reader:', error);
    return false;
  }
}
