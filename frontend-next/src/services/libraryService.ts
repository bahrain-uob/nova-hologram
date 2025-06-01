import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete, API_URLS } from '@/utils/apiUtils';
import s3Service from '@/lib/s3-service';
import { getCurrentUser } from '@/lib/auth';

// Define the API URL for library management
const API_URL = API_URLS.library;

export interface LibraryBook {
  book_id: string;
  user_id: string;
  book_title: string;
  authors: string[];
  publisher: { name: string };
  publication_year: number;
  reading_level: string;
  type: string;
  genre: string[];
  collection: string;
  objectives: { id: number; text: string }[];
  language: string;
  isbn: string;
  book_cover: string;
  book_file: string;
  trailer?: string;
  trailer_status?: 'pending' | 'processing' | 'completed' | 'failed';
  chapters?: BookChapter[];
  created_at?: string;
  updated_at?: string;
}

export interface BookChapter {
  chapter_id: string;
  book_id: string;
  title: string;
  content?: string;
  trailer?: string;
  trailer_status?: 'pending' | 'processing' | 'completed' | 'failed';
}

/**
 * Get all books in the library
 */
export async function getAllBooks(filters?: {
  genre?: string;
  readingLevel?: string;
  type?: string;
  query?: string;
}): Promise<LibraryBook[]> {
  try {
    let url = API_URL;
    
    // Add query parameters if filters are provided
    if (filters) {
      const params = new URLSearchParams();
      if (filters.genre) params.append('genre', filters.genre);
      if (filters.readingLevel) params.append('readingLevel', filters.readingLevel);
      if (filters.type) params.append('type', filters.type);
      if (filters.query) params.append('query', filters.query);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    return await authenticatedGet<LibraryBook[]>(url);
  } catch (error) {
    console.error('Failed to fetch books:', error);
    return [];
  }
}

/**
 * Get a book by its ID
 */
export async function getBookById(bookId: string): Promise<LibraryBook | null> {
  try {
    return await authenticatedGet<LibraryBook>(`${API_URL}/${bookId}`);
  } catch (error) {
    console.error(`Failed to fetch book with ID ${bookId}:`, error);
    return null;
  }
}

/**
 * Add a new book to the library
 */
export async function addBook(bookData: {
  title: string;
  authors: string[];
  publisher: string;
  publicationYear: number;
  readingLevel: string;
  type: string;
  genre: string[];
  collection: string;
  objectives: { id: number; text: string }[];
  language: string;
  isbn: string;
  bookFile: File;
  coverImage?: File;
  prompt?: string;
}): Promise<{ bookId: string } | null> {
  try {
    // 1. Generate a unique book ID
    const bookId = crypto.randomUUID();
    
    // 2. Get the current user's token
    const user = await getCurrentUser();
    const token = user?.signInUserSession?.idToken?.jwtToken || '';
    
    if (!token) {
      throw new Error('User is not authenticated');
    }
    
    // 3. Upload files to S3
    const bookFileKey = `books/${bookId}/${bookData.bookFile.name}`;
    await s3Service.uploadFile(bookData.bookFile, bookFileKey, token);
    
    let coverImageKey = null;
    
    if (bookData.coverImage) {
      coverImageKey = `covers/${bookId}/${bookData.coverImage.name}`;
      await s3Service.uploadFile(bookData.coverImage, coverImageKey, token);
    }
    
    // 3. Create the book metadata
    const metadata = {
      book_id: bookId,
      book_title: bookData.title,
      authors: bookData.authors,
      publisher: { name: bookData.publisher },
      publication_year: bookData.publicationYear,
      reading_level: bookData.readingLevel,
      type: bookData.type,
      genre: bookData.genre,
      collection: bookData.collection,
      objectives: bookData.objectives,
      language: bookData.language,
      isbn: bookData.isbn,
      book_file: bookFileKey,
      book_cover: coverImageKey,
      prompt: bookData.prompt
    };
    
    // 4. Save the book metadata
    const response = await authenticatedPost<{ bookId: string }>(`${API_URL}`, metadata);
    return response;
  } catch (error) {
    console.error('Failed to add book:', error);
    return null;
  }
}

/**
 * Update an existing book
 */
export async function updateBook(
  bookId: string,
  bookData: Partial<LibraryBook>
): Promise<boolean> {
  try {
    await authenticatedPut(`${API_URL}/${bookId}`, bookData);
    return true;
  } catch (error) {
    console.error(`Failed to update book with ID ${bookId}:`, error);
    return false;
  }
}

/**
 * Delete a book from the library
 */
export async function deleteBook(bookId: string): Promise<boolean> {
  try {
    await authenticatedDelete(`${API_URL}/${bookId}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete book with ID ${bookId}:`, error);
    return false;
  }
}

/**
 * Get the status of a book's video generation
 */
export async function getBookVideoStatus(bookId: string): Promise<{
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
} | null> {
  try {
    return await authenticatedGet(`${API_URL}/${bookId}/video-status`);
  } catch (error) {
    console.error(`Failed to get video status for book with ID ${bookId}:`, error);
    return null;
  }
}

/**
 * Generate video for a book
 */
export async function generateBookVideo(bookId: string): Promise<boolean> {
  try {
    await authenticatedPost(`${API_URL}/${bookId}/generate-video`, {});
    return true;
  } catch (error) {
    console.error(`Failed to generate video for book with ID ${bookId}:`, error);
    return false;
  }
}

/**
 * Get chapters for a book
 */
export async function getBookChapters(bookId: string): Promise<BookChapter[]> {
  try {
    return await authenticatedGet<BookChapter[]>(`${API_URL}/${bookId}/chapters`);
  } catch (error) {
    console.error(`Failed to get chapters for book with ID ${bookId}:`, error);
    return [];
  }
}

/**
 * Get a specific chapter
 */
export async function getChapter(bookId: string, chapterId: string): Promise<BookChapter | null> {
  try {
    return await authenticatedGet<BookChapter>(`${API_URL}/${bookId}/chapters/${chapterId}`);
  } catch (error) {
    console.error(`Failed to get chapter ${chapterId} for book ${bookId}:`, error);
    return null;
  }
}
