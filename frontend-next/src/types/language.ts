export interface Language {
  language: string;
  language_code?: string;
}

export interface ReadingLevel {
  reading_level_id: string;
  level?: string;
  description?: string;
}

export interface Mark {
  mark_id: string;
  user_id: string;
  book_id: string;
  page_id?: string;
  mark_type?: string;
  position?: number;
}

export interface Pronunciation {
  pronunciation_practice_id: string;
  user_id: string;
  language_id?: string;
  practice_text?: string;
  audio_reference?: string;
  accuracy_score?: number;
  feedback?: string;
  timestamp?: Date;
}
