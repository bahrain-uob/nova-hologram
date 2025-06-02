"use client";

import React, { useEffect, useState, ComponentType } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Higher-order component to protect routes based on user role
 * @param Component - The component to protect
 * @param allowedRoles - Array of roles allowed to access this component
 * @returns Protected component
 */
export default function withRoleProtection<P extends Record<string, unknown> = Record<string, unknown>>(
  Component: ComponentType<P>, 
  allowedRoles: string[]
): React.FC<P> {
  const ProtectedRoute: React.FC<P> = (props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
      // Check if user is authenticated and has the right role
      const checkAuth = async () => {
        try {
          // Import getCurrentUser dynamically to avoid circular dependencies
          const { getCurrentUser } = await import('@/lib/auth');
          
          // Get current user from Cognito
          const currentUser = await getCurrentUser();
          
          if (!currentUser || !currentUser.user) {
            // No authenticated user found, redirect to login
            router.push('/login');
            return;
          }
          
          // Extract user attributes
          const userAttributes = currentUser.user.attributes || {};
          const userType = userAttributes['custom:userType'] || '';
          
          // Check if user has one of the allowed roles
          if (userType && allowedRoles.includes(userType)) {
            setAuthorized(true);
            setLoading(false);
          } else {
            // User doesn't have the right role, redirect to appropriate dashboard
            if (userType === 'reader') {
              router.push('/reader-dashboard');
            } else if (userType === 'librarian') {
              router.push('/dashboard');
            } else {
              // If we can't determine the role, send to login
              router.push('/login');
            }
          }
        } catch (error) {
          console.error('Auth check error:', error);
          router.push('/login');
        }
      };

      checkAuth();
    }, [router]);

    // Show loading state while checking authorization
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Render the protected component if authorized
    return authorized ? <Component {...props} /> : null;
  };
  
  return ProtectedRoute;
}
