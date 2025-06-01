// Legacy API interfaces for backward compatibility

// Legacy Book interface
export interface LegacyBook {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  genre: string;
  rating?: number;
  description?: string;
}

// Legacy InProgressBook interface
export interface LegacyInProgressBook {
  id: string;
  title: string;
  coverImage: string;
  progress: number; // percentage
}

// Legacy Favorite interface
export interface LegacyFavorite {
  id: string;
  title: string;
  author?: string;
  coverImage?: string;
  addedDate?: string;
  notes?: string;
  quote?: string;
  bookId?: string;
}

// Legacy ReadingList interface
export interface LegacyReadingList {
  id: string;
  name: string;
  books: LegacyBook[];
  createdAt: string;
  updatedAt?: string;
}

// Legacy API response interfaces
export interface LegacyApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
