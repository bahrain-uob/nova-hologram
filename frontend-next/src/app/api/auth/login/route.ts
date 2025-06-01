import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/config/api-config';

export async function POST(request: NextRequest) {
  try {
    console.log("API route called: user login");
    
    // Get request body with login credentials
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' }, 
        { status: 400 }
      );
    }
    
    // Make request to AWS Cognito (via our backend API)
    const response = await fetch(API_ENDPOINTS.auth.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
    });
    
    console.log("Auth API response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Auth API error (${response.status}):`, errorData);
      
      // Handle specific authentication errors
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid email or password' }, 
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: errorData.message || 'Authentication failed' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log("Successfully authenticated user");
    
    // Set cookies for authentication tokens
    const response_with_cookies = NextResponse.json({
      success: true,
      user: data.user
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
    
    response_with_cookies.cookies.set({
      name: 'refresh_token',
      value: data.tokens.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
    
    return response_with_cookies;
  } catch (error) {
    console.error('Login API proxy error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again later.' }, 
      { status: 500 }
    );
  }
}
