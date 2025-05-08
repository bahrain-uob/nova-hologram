export interface ReadingProgress {
  progress_id: string;
  user_id: string;
  book_id: string;
  current_page_id: string;
  last_position_timestamp?: Date;
  last_updated?: Date;
}

export interface ReadingSession {
  reading_session_id: string;
  user_id: string;
  book_id: string;
  start_date?: Date;
  end_date?: Date;
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
