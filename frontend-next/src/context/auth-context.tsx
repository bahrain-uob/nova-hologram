"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signIn, signUp, verifyAccount, signOut, getCurrentUser } from '../lib/auth';

// Define the shape of the user object
interface User {
  email: string;
  attributes: Record<string, string>;
  tokens: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
  };
}

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email: string, name: string, userType: 'reader' | 'librarian') => Promise<void>;
  verify: (username: string, code: string) => Promise<void>;
  logout: () => void;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  verify: async () => {},
  logout: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check for existing user session on mount
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        // No user is signed in, that's okay
        console.log('No user currently signed in');
      } finally {
        setIsLoading(false);
      }
    };

    checkCurrentUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signIn({ email, password });
      setUser({
        email,
        attributes: result.user.attributes || {},
        tokens: {
          accessToken: result.accessToken,
          idToken: result.idToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string, userType: 'reader' | 'librarian') => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signUp({ email, password, name, userType });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify function
  const verify = async (username: string, code: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await verifyAccount({ username, code });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    signOut();
    setUser(null);
  };

  // Provide the auth context to children
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        verify,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
