// Vocabulary-related interfaces

// Vocabulary item interface
export interface VocabularyItem {
  id: string;
  userId: string;
  bookId: string;
  word: string;
  definition: string;
  context: string;
  createdAt: string;
  notes?: string;
  
  // Additional fields for enhanced functionality
  partOfSpeech?: string;
  pronunciation?: string;
  examples?: string[];
  synonyms?: string[];
  antonyms?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  mastered?: boolean;
  lastReviewed?: string;
}

// Vocabulary list interface
export interface VocabularyList {
  id: string;
  userId: string;
  title: string;
  description?: string;
  items: VocabularyItem[];
  createdAt: string;
  updatedAt?: string;
  isPublic?: boolean;
}

// Vocabulary study session
export interface VocabularyStudySession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  itemsStudied: string[]; // IDs of vocabulary items
  correctAnswers: number;
  incorrectAnswers: number;
}

// Vocabulary flashcard
export interface VocabularyFlashcard {
  id: string;
  vocabularyItemId: string;
  front: string; // Usually the word
  back: string;  // Usually the definition
  lastReviewed?: string;
  reviewCount?: number;
  confidenceLevel?: 1 | 2 | 3 | 4 | 5; // 1 = low, 5 = high
}
