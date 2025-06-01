// Book-related interfaces for the entire application

// Main Book interface used across the application
export interface Book {
  // Core properties
  id: string;  // Unified ID field
  book_id?: string; // Legacy ID field
  user_id?: string;
  title: string;
  book_title?: string; // Legacy title field
  author: string;
  authors?: string[];
  type?: string;
  genre: string[];
  collection_id?: string[];
  isbn?: string;
  language?: string;
  publisher?: { name: string };
  publication_year?: string | number;
  publicationYear?: number;
  reading_level?: string;
  readingLevel?: 'Easy' | 'Medium' | 'Hard';
  
  // Media and content
  coverImage?: string;
  book_cover?: string; // Legacy cover field
  summary?: string;
  book_summary?: string; // Legacy summary field
  description?: string;
  script?: string;
  trailer?: string;
  trailer_status?: 'pending' | 'processing' | 'completed' | 'failed';
  
  // Metadata
  created_at?: string | Date;
  updated_at?: string | Date;
  objectives?: { id: number; text: string }[];
  learningObjectives?: string[];
  prompt?: string;
  
  // Media URLs
  audio_url?: string;
  ssml?: string;
  finalvideo?: string;
  book_file?: string;
  
  // Stats
  rating?: number;
  reviewCount?: number;
}

// Book data from external API
export interface BookData {
  title?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  maturityRating?: string;
  imageLinks?: {
    thumbnail?: string;
  };
}

// Book preview for listings
export interface BookPreview {
  id: number;
  title: string;
  author: string;
  cover: string;
  genres: string[];
  language: string;
}

// Library Book interface for API responses
export interface LibraryBook extends Book {
  chapters?: BookChapter[];
}

// Book chapter interface
export interface BookChapter {
  chapter_id: string;
  book_id: string;
  chapter_no: number;
  title?: string;
  chapter_title?: string;
  content?: string;
  summary?: string;
  script?: string;
  trailer?: string;
  trailer_status?: 'pending' | 'processing' | 'completed' | 'failed';
  audio_url?: string;
  ssml?: string;
  finalvideo?: string;
}

// Book API response interface
export interface BooksResponse {
  books?: Book[];
  error?: string;
}

// Book mark interface for bookmarks
export interface BookMark {
  book_mark_id: string;
  book_mark_test: string;
  user_id: string;
  book_id: string;
  mark_id?: string;
  page_id?: string;
}

// Book trailer interface
export interface BookTrailer {
  trailer_id: string;
  book_id: string;
  prompt_text?: string;
  video_path?: string;
  duration?: number;
  created_at?: Date;
}

// Book review interface
export interface BookReview {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  text: string;
  createdAt: string;
}

// Book recommendation interface has been moved to recommendation.ts

// Book progress interface for analytics
export interface BookProgress {
  bookId: string;
  title: string;
  coverImage?: string;
  progress: number; // percentage
  lastReadAt: string;
  pagesRead: number;
  totalPages: number;
}

// In-progress book interface
export interface InProgressBook {
  id: string;
  title: string;
  coverImage: string;
  progress: number; // percentage
}

// Book listeners interface
export interface BookListeners {
  book_id: string;
  listener_count: number;
  unique_listeners: number;
  average_listen_time: number;
}

// Book file description interface
export interface BookFileDescription {
  file_id?: string;
  book_file_id?: string;
  book_id?: string;
  file_name?: string;
  file_type?: string;
  file_path?: string;
  file_size?: number;
  file_version?: string;
  file_pages?: number;
  file_words?: number;
  uploaded_at?: Date;
  created_at?: Date;
}

// Book video status interface
export interface BookVideoStatus {
  book_id?: string;
  video_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error_message?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Book chatbot interface
export interface BookChatbot {
  id?: string;
  bookId?: string;
  name: string;
  avatar?: string;
  description?: string;
  personality?: string;
  knowledge?: string[];
}