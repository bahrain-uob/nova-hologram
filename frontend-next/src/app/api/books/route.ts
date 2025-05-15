import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("API route called, fetching books from AWS API");
    
    // Make request to your AWS API
    const response = await fetch('https://e96357rata.execute-api.us-east-1.amazonaws.com/dev/books', {
      method: 'GET', // Your curl command worked with GET
      headers: {
        'Content-Type': 'application/json',
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
    console.log("Successfully fetched books from AWS API");
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books from AWS API' }, 
      { status: 500 }
    );
  }
}