import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/config/api-config';

export async function POST(request: NextRequest) {
  try {
    console.log("API route called: user signup");
    
    // Get request body with signup information
    const body = await request.json();
    const { email, password, name, userType = 'reader' } = body;
    
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' }, 
        { status: 400 }
      );
    }
    
    // Make request to AWS Cognito (via our backend API)
    const response = await fetch(API_ENDPOINTS.auth.signup, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email, 
        password, 
        name,
        userType,
        // Add any additional attributes needed for Cognito
      }),
    });
    
    console.log("Auth API response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Auth API error (${response.status}):`, errorData);
      
      // Handle specific signup errors
      if (response.status === 409) {
        return NextResponse.json(
          { error: 'An account with this email already exists' }, 
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: errorData.message || 'Signup failed' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log("Successfully registered user");
    
    return NextResponse.json({
      success: true,
      message: 'User registered successfully. Please check your email for verification code.',
      email: data.email,
      userSub: data.userSub
    });
  } catch (error) {
    console.error('Signup API proxy error:', error);
    return NextResponse.json(
      { error: 'Signup failed. Please try again later.' }, 
      { status: 500 }
    );
  }
}
