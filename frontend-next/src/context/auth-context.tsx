"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signIn, signUp, verifyAccount, signOut, getCurrentUser } from '@/lib/auth';

// Define the shape of the user object
interface User {
  email: string;
  name?: string;
  userType: string;
  sub?: string;
  emailVerified?: boolean;
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
        const currentUser = await getCurrentUser();
        if (currentUser && currentUser.user) {
          // Extract user attributes
          const userAttributes = currentUser.user.attributes || {};
          
          setUser({
            email: userAttributes.email || '',
            name: userAttributes.name || '',
            userType: userAttributes['custom:userType'] || 'reader',
            sub: currentUser.user.sub,
            emailVerified: userAttributes.email_verified === 'true'
          });
        } else {
          // No user is signed in, that's okay
          console.log('No user currently signed in');
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
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
      
      if (result && result.user) {
        // Extract user attributes
        const userAttributes = result.user.attributes || {};
        
        setUser({
          email: email,
          name: userAttributes.name || '',
          userType: userAttributes['custom:userType'] || 'reader',
          sub: result.user.sub,
          emailVerified: userAttributes.email_verified === 'true'
        });
      } else {
        throw new Error('Login failed');
      }
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
      const result = await signUp({
        email,
        password,
        name,
        userType
      });
      
      if (!result) {
        throw new Error('Registration failed');
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify function
  const verify = async (email: string, code: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await verifyAccount({
        username: email,
        code
      });
      
      if (!result) {
        throw new Error('Verification failed');
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      signOut();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
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
