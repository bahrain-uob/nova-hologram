import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/config/api-config';

export async function POST(request: NextRequest) {
  try {
    console.log("API route called: verify user");
    
    // Get request body with verification information
    const body = await request.json();
    const { email, code } = body;
    
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' }, 
        { status: 400 }
      );
    }
    
    // Make request to AWS Cognito (via our backend API)
    const response = await fetch(API_ENDPOINTS.auth.verify, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, code }),
    });
    
    console.log("Auth API response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Auth API error (${response.status}):`, errorData);
      
      // Handle specific verification errors
      if (response.status === 400) {
        return NextResponse.json(
          { error: 'Invalid verification code' }, 
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: errorData.message || 'Verification failed' }, 
        { status: response.status }
      );
    }
    
    console.log("Successfully verified user");
    
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
    console.error('Verification API proxy error:', error);
    return NextResponse.json(
      { error: 'Verification failed. Please try again later.' }, 
      { status: 500 }
    );
  }
}
