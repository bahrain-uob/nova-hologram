export interface Genre {
  genre_id: string;
  name?: string;
}

export interface Collection {
  collection_id: string;
  collection_name?: string;
  created_at?: Date;
}

export interface Typography {
  typo_id: string;
  user_id: string;
  text_size?: number;
  font_weight?: string;
  text_color?: string;
  text_family?: string;
}

export interface Character {
  character_id: string;
  book_id: string;
  name?: string;
  growing_message?: string;
  status_detail_id?: string;
  movement_url?: string;
  character_type?: string;
}

export interface CharacterChatbot {
  char_chat_id: string;
  user_id: string;
  book_id: string;
  question?: string;
  response?: string;
  timestamp?: Date;
}

export interface AIContentImage {
  image_id: string;
  book_id: string;
  prompt_text?: string;
  cover_path?: string;
  ai_model?: string;
  resolution?: string;
  created_at?: Date;
}
