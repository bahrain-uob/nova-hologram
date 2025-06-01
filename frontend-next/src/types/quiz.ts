// Quiz-related interfaces

// Quiz question interface
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  
  // Additional fields for enhanced functionality
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: 'multiple-choice' | 'true-false' | 'fill-in-blank';
  points?: number;
  category?: string;
}

// Quiz interface
export interface Quiz {
  id: string;
  bookId: string;
  chapterId?: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  createdAt: string;
  timeLimit?: number; // in minutes
  
  // Additional fields
  difficultyLevel?: string;
  passingScore?: number;
  tags?: string[];
  authorId?: string;
  isPublic?: boolean;
}

// Quiz submission interface
export interface QuizSubmission {
  quizId: string;
  userId: string;
  answers: { questionId: string; selectedOption: number }[];
  score: number;
  completedAt: string;
  timeSpent: number; // in seconds
  
  // Additional fields
  passed?: boolean;
  feedback?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// Quiz result interface for detailed feedback
export interface QuizResult {
  submission: QuizSubmission;
  quiz: Quiz;
  questionResults: {
    questionId: string;
    correct: boolean;
    selectedOption: number;
    correctOption: number;
    explanation?: string;
  }[];
  overallScore: number;
  percentageScore: number;
  timeTaken: number; // in seconds
  feedback?: string;
}
