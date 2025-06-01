import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/config/api-config';

export async function POST(request: NextRequest) {
  try {
    console.log("API route called: refresh token");
    
    // Get refresh token from cookies
    const refreshToken = request.cookies.get('refresh_token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token found' }, 
        { status: 401 }
      );
    }
    
    // Make request to AWS Cognito (via our backend API)
    const response = await fetch(API_ENDPOINTS.auth.refresh, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken }),
    });
    
    console.log("Auth API response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Auth API error (${response.status}):`, errorData);
      
      // Handle token expired or invalid
      if (response.status === 401) {
        // Clear all auth cookies
        const logout_response = NextResponse.json(
          { error: 'Session expired. Please log in again.' }, 
          { status: 401 }
        );
        
        logout_response.cookies.delete('id_token');
        logout_response.cookies.delete('access_token');
        logout_response.cookies.delete('refresh_token');
        
        return logout_response;
      }
      
      return NextResponse.json(
        { error: errorData.message || 'Token refresh failed' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log("Successfully refreshed tokens");
    
    // Set cookies for new authentication tokens
    const response_with_cookies = NextResponse.json({
      success: true
    });
    
    // Set secure HTTP-only cookies for tokens
    response_with_cookies.cookies.set({
      name: 'id_token',
      value: data.tokens.idToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    
    response_with_cookies.cookies.set({
      name: 'access_token',
      value: data.tokens.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    
    // Only set a new refresh token if one was returned
    if (data.tokens.refreshToken) {
      response_with_cookies.cookies.set({
        name: 'refresh_token',
        value: data.tokens.refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }
    
    return response_with_cookies;
  } catch (error) {
    console.error('Token refresh API proxy error:', error);
    return NextResponse.json(
      { error: 'Token refresh failed. Please try again later.' }, 
      { status: 500 }
    );
  }
}
