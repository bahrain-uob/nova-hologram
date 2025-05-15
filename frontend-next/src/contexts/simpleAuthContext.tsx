'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define a simple user type
interface User {
  username: string;
  email: string;
  userType?: 'reader' | 'librarian';
  name?: string;
}

// Define a simple auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a simple auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simple login function
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    
    try {
      // Simulate login - in a real app, this would call Cognito
      const mockUser: User = {
        username: email,
        email: email,
        name: 'Test User',
        userType: 'reader',
      };
      
      setUser(mockUser);
      return mockUser;
    } finally {
      setIsLoading(false);
    }
  };

  // Simple logout function
  const logout = () => {
    setUser(null);
  };

  // Create the auth context value
  const authContextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  // Return the auth provider
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Create the auth hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
