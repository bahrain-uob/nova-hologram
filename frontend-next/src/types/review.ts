export interface Review {
  review_id: string;
  book_id: string;
  user_id: string;
  rating?: number;
  review?: string;
  created_at?: Date;
}

export interface BookChatbot {
  book_chat_id: string;
  user_id: string;
  book_id: string;
  question?: string;
  response?: string;
  timestamp?: Date;
}

export interface ChapterSummary {
  summary_id: string;
  chapter_id: string;
  prompt_text?: string;
  generated_summary?: string;
  created_at?: Date;
}

export interface AIChapterSummary {
  ai_chapter_id: string;
  chapter_id: string;
  prompt_text?: string;
  generated_summary?: string;
  created_at?: Date;
}
