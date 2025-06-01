// Reading progress interfaces for tracking user reading activity

// Main reading progress interface
export interface ReadingProgress {
  // Core identifiers
  progressId?: string;           // New field
  progress_id?: string;          // Legacy field
  userId?: string;               // New field
  user_id?: string;              // Legacy field
  bookId?: string;               // New field
  book_id?: string;              // Legacy field
  
  // Progress tracking
  currentPage?: number;          // New field: current page number
  current_page_id?: string;      // Legacy field: reference to page ID
  totalPages?: number;           // New field: total pages in book
  percentage?: number;           // New field: completion percentage
  
  // Timestamps
  lastReadAt?: string;           // New field: ISO date string
  last_position_timestamp?: Date; // Legacy field
  last_updated?: Date;           // Legacy field
  
  // Additional tracking
  completedChapters?: string[];  // New field: IDs of completed chapters
  totalTimeSpent?: number;       // New field: total time in minutes
}

// Reading session interface for tracking individual reading sessions
export interface ReadingSession {
  // Core identifiers
  sessionId?: string;            // New field
  reading_session_id?: string;   // Legacy field
  userId?: string;               // New field
  user_id?: string;              // Legacy field
  bookId?: string;               // New field
  book_id?: string;              // Legacy field
  chapterId?: string;            // New field: specific chapter being read
  
  // Page tracking
  startPage?: number;            // New field: starting page number
  endPage?: number;              // New field: ending page number
  
  // Time tracking
  startTime?: string;            // New field: ISO date string
  start_date?: Date;             // Legacy field
  endTime?: string;              // New field: ISO date string
  end_date?: Date;               // Legacy field
  duration?: number;             // New field: session duration in minutes
}

export interface ReadingPage {
  page_id: string;
  book_id: string;
  page_number: number;
  content?: string;
  target_words?: string[];
  target_pages?: string[];
}

export interface PageReport {
  report_id: string;
  page_id: string;
  user_id: string;
  issue_id?: string;
  // score_speed/OCR_range?: number;
  // score_words/read_rate/version?: number;
  // time/ENUM/with_grey?: string;
  score_speed_ocr_range?: number;
  score_words_read_rate_version?: number;
  time_enum_with_grey?: string;
}

export interface Highlights {
  highlight_id: string;
  user_id: string;
  page_id: string;
  chapter_id?: string;
  color?: string;
  text_segment?: string;
  start_position?: number;
  end_position?: number;
  created_at?: Date;
}
