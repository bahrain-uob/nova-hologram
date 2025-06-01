import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/config/api-config';

export async function POST(request: NextRequest) {
  try {
    console.log("API route called: user logout");
    
    // Get tokens from cookies
    const accessToken = request.cookies.get('access_token')?.value;
    
    // Make request to AWS Cognito (via our backend API) if we have a token
    // This is optional as we'll clear cookies regardless
    if (accessToken) {
      try {
        await fetch(API_ENDPOINTS.auth.logout, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });
        console.log("Successfully called logout endpoint");
      } catch (error) {
        // We don't need to handle errors here as we'll clear cookies anyway
        console.warn("Error calling logout endpoint:", error);
      }
    }
    
    // Clear all auth cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
    response.cookies.delete('id_token');
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    
    return response;
  } catch (error) {
    console.error('Logout API proxy error:', error);
    
    // Even if there's an error, try to clear cookies
    const response = NextResponse.json(
      { error: 'Logout encountered an error, but cookies have been cleared.' }, 
      { status: 500 }
    );
    
    response.cookies.delete('id_token');
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    
    return response;
  }
}
