// Video-related interfaces for the entire application

// Video status types
export type VideoStatusType = 'pending' | 'processing' | 'completed' | 'failed';

// Video status interface
export interface VideoStatus {
  status: VideoStatusType;
  url?: string;
  error?: string;
  progress?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Book video trailer status interface
export interface BookVideoTrailerStatus {
  book: {
    trailer_status: VideoStatusType;
    trailer?: string;
  };
  chapters: {
    chapter_id: string;
    title: string;
    trailer_status: VideoStatusType;
    trailer?: string;
  }[];
}

// Video generation response
export interface VideoGenerationResponse {
  success: boolean;
  message?: string;
  error?: string;
}
