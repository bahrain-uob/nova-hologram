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
export interface Book {
  book_id: string;
  user_id: string;
  book_title: string;
  type: string;
  genre: JSON;
  collection_id?: string[];
  isbn: string;
  authors?: JSON;
  language: string;
  publisher: JSON;
  publication_year: string;
  reading_level: string;
  book_cover?: string;
  book_summary?: string;
  book_trailer?: string;
  created_at?: Date;
  updated_at?: Date;
}
export interface BookMark {
  book_mark_id: string;
  book_mark_test: string;
  user_id: string;
  book_id: string;
  mark_id?: string;
  page_id?: string; //ask abt it.
}
export interface BookChapter {
  chapter_id: string;
  book_id: string;
  chapter_no: number;
  chapter_title: string;
  start_page: number;
  end_page: number;
}
export interface BookTrailer {
  trailer_id: string;
  book_id: string;
  prompt_text?: string;
  video_path?: string;
  duration?: number;
  created_at?: Date;
}
export interface BookListeners {
  listener_id: string;
  book_id: string;
  prompt_text?: string;
  audio_path?: string;
  duration?: number;
  created_at?: Date;
}
export interface BookFileDescription {
  book_file_id: string;
  book_id?: string;
  file_version?: string;
  file_size?: number;
  file_pages?: number;
  file_words?: number;
  uploaded_at?: Date;
}

