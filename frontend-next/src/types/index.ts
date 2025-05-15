// Export all types from their respective files
export * from './book';
export * from './user';
export * from './reading';
export * from './review';
export * from './content';
export * from './language';

// Define any additional shared types here
export interface BaseEntity {
  created_at?: Date;
  updated_at?: Date;
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
