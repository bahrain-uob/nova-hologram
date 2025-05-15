'use client';

// This file provides the authentication context for the application

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CognitoUser, CognitoUserPool, AuthenticationDetails, CognitoUserSession, CognitoUserAttribute } from 'amazon-cognito-identity-js';

// Define the user type
interface User {
  username: string;
  email: string;
  userType?: 'reader' | 'librarian';
  name?: string;
  attributes?: Record<string, string>;
  session?: CognitoUserSession;
}

// Define the auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  signup: (email: string, password: string, name: string, userType: 'reader' | 'librarian') => Promise<void>;
  confirmSignup: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the Cognito pool data from environment variables
// Using the values from the memory
const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'us-east-1_U0iB4Rowp',
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '509b3p7mb73l7rfi2h16mef65v',
};

// Create the user pool
const userPool = new CognitoUserPool(poolData);

// Create the auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = userPool.getCurrentUser();
        
        if (currentUser) {
          // Get the current session
          currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
            if (err) {
              console.error('Error getting session:', err);
              setIsLoading(false);
              return;
            }
            
            if (session && session.isValid()) {
              // Get user attributes
              currentUser.getUserAttributes((err, attributes) => {
                if (err) {
                  console.error('Error getting user attributes:', err);
                  setIsLoading(false);
                  return;
                }
                
                // Create user object from attributes
                const userObj: User = {
                  username: currentUser.getUsername(),
                  email: '',
                  attributes: {},
                  session,
                };
                
                // Add attributes to user object
                if (attributes) {
                  attributes.forEach(attr => {
                    if (attr.Name === 'email') {
                      userObj.email = attr.Value;
                    } else if (attr.Name === 'name') {
                      userObj.name = attr.Value;
                    } else if (attr.Name === 'custom:userType') {
                      userObj.userType = attr.Value as 'reader' | 'librarian';
                    }
                    
                    if (userObj.attributes) {
                      userObj.attributes[attr.Name] = attr.Value;
                    }
                  });
                }
                
                setUser(userObj);
                setIsLoading(false);
              });
            } else {
              setIsLoading(false);
            }
          });
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      // Create authentication details
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });
      
      // Create cognito user
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });
      
      // Authenticate user
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session) => {
          // Get user attributes
          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              console.error('Error getting user attributes:', err);
              reject(err);
              return;
            }
            
            // Create user object from attributes
            const userObj: User = {
              username: cognitoUser.getUsername(),
              email,
              attributes: {},
              session,
            };
            
            // Add attributes to user object
            if (attributes) {
              attributes.forEach(attr => {
                if (attr.Name === 'name') {
                  userObj.name = attr.Value;
                } else if (attr.Name === 'custom:userType') {
                  userObj.userType = attr.Value as 'reader' | 'librarian';
                }
                
                if (userObj.attributes) {
                  userObj.attributes[attr.Name] = attr.Value;
                }
              });
            }
            
            setUser(userObj);
            resolve(userObj);
          });
        },
        onFailure: (err) => {
          console.error('Error authenticating user:', err);
          reject(err);
        },
      });
    });
  };

  // Logout function
  const logout = () => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
      setUser(null);
    }
  };

  // Signup function
  const signup = (email: string, password: string, name: string, userType: 'reader' | 'librarian'): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Define user attributes
      const attributeList = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email,
        }),
        new CognitoUserAttribute({
          Name: 'name',
          Value: name,
        }),
        new CognitoUserAttribute({
          Name: 'custom:userType',
          Value: userType,
        }),
      ];
      
      // Sign up user
      userPool.signUp(email, password, attributeList, [], (err, result) => {
        if (err) {
          console.error('Error signing up user:', err);
          reject(err);
          return;
        }
        
        resolve();
      });
    });
  };

  // Confirm signup function
  const confirmSignup = (email: string, code: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Create cognito user
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });
      
      // Confirm registration
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          console.error('Error confirming registration:', err);
          reject(err);
          return;
        }
        
        resolve();
      });
    });
  };

  // Forgot password function
  const forgotPassword = (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Create cognito user
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });
      
      // Forgot password
      cognitoUser.forgotPassword({
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          console.error('Error requesting password reset:', err);
          reject(err);
        },
      });
    });
  };

  // Reset password function
  const resetPassword = (email: string, code: string, newPassword: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Create cognito user
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });
      
      // Confirm password reset
      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          console.error('Error resetting password:', err);
          reject(err);
        },
      });
    });
  };

  // Create the auth context value
  const authContextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
    confirmSignup,
    forgotPassword,
    resetPassword,
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
