// Recommendation-related interfaces

// Book recommendation interface
export interface BookRecommendation {
  // Core identifiers
  id: string;
  bookId?: string;
  
  // Book details
  title: string;
  author: string;
  coverImage: string;
  genre: string | string[];
  
  // Recommendation metadata
  confidence?: number;
  rationale?: string;
  rating?: number;
  description?: string;
  similarityScore?: number;  // From book.ts version
  matchReason?: string;      // From book.ts version
  
  // Additional fields
  source?: 'ai' | 'librarian' | 'trending' | 'similar';
  createdAt?: string;
}

// User preferences for recommendations
export interface UserPreferences {
  favoriteGenres: string[];
  readingLevel: string;
  topics: string[];
  authors: string[];
  
  // Additional preference fields
  language?: string;
  ageGroup?: string;
  readingSpeed?: 'slow' | 'medium' | 'fast';
}

// Recommendation feedback
export interface RecommendationFeedback {
  id: string;
  userId: string;
  recommendationId: string;
  rating: number;
  feedback?: string;
  timestamp: string;
}
