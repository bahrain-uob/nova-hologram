import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/config/api-config';
import { getAuthToken } from '@/utils/apiUtils';

export async function POST(request: NextRequest) {
  try {
    console.log("API route called: sending message to Lex chatbot");
    
    // Get request body
    const body = await request.json();
    
    // Get auth token
    const token = await getAuthToken();
    
    // Make request to AWS API
    const response = await fetch(API_ENDPOINTS.lex, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });
    
    console.log("AWS API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AWS API error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: `AWS API error: ${response.status}` }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log("Successfully sent message to Lex chatbot via AWS API");
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to send message to Lex chatbot via AWS API' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("API route called: getting Lex chatbot session");
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' }, 
        { status: 400 }
      );
    }
    
    // Get auth token
    const token = await getAuthToken();
    
    // Make request to AWS API
    const response = await fetch(`${API_ENDPOINTS.lex}/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    console.log("AWS API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AWS API error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: `AWS API error: ${response.status}` }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log("Successfully retrieved Lex chatbot session from AWS API");
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Lex chatbot session from AWS API' }, 
      { status: 500 }
    );
  }
}
