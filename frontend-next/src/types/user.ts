export interface User {
  user_id: string;
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserSettings {
  user_settings_id: string;
  user_id: string;
  font_size?: number;
  font_family?: string;
  theme?: string;
  narrator_id?: string;
  highlight_text?: boolean;
}

export interface Narrator {
  narrator_id: string;
  name?: string;
  gender?: string;
  voice_sample_path?: string;
  voice_accent?: string;
  speed_id?: string | null;
  language_id?: string | null;
}
