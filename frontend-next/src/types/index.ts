// Export all types from their respective files
export * from './book';
export * from './user';
export * from './reading';
export * from './review';
export * from './content';
export * from './language';
export * from './video';
export * from './readingList';
export * from './recommendation';
export * from './lex';
export * from './analytics';
export * from './quiz';
export * from './vocabulary';
export * from './highlight';
export * from './legacy';
export * from './notification';

// Define any additional shared types here
export interface BaseEntity {
  created_at?: Date;
  updated_at?: Date;
}

// General API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Authentication types based on AWS Cognito configuration
export interface AuthUser {
  email: string;
  name?: string;
  userType?: 'reader' | 'librarian';
  token?: string;
  refreshToken?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}
