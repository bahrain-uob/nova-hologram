import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/config/api-config';
import { getAuthToken } from '@/utils/apiUtils';

export async function GET(request: NextRequest) {
  try {
    console.log("API route called: fetching highlights");
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const bookId = searchParams.get('bookId');
    const pageNumber = searchParams.get('pageNumber');
    
    // Construct the API URL based on parameters
    let apiUrl = API_ENDPOINTS.highlights;
    if (bookId) {
      apiUrl = API_ENDPOINTS.bookHighlights(bookId);
      
      // Add page number filter if provided
      if (pageNumber) {
        apiUrl += `?pageNumber=${pageNumber}`;
      }
    }
    
    // Get auth token
    const token = await getAuthToken();
    
    // Make request to AWS API
    const response = await fetch(apiUrl, {
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
    console.log("Successfully fetched highlights from AWS API");
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch highlights from AWS API' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("API route called: creating highlight");
    
    // Get request body
    const body = await request.json();
    
    // Get auth token
    const token = await getAuthToken();
    
    // Make request to AWS API
    const response = await fetch(API_ENDPOINTS.highlights, {
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
    console.log("Successfully created highlight in AWS API");
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to create highlight in AWS API' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("API route called: updating highlight");
    
    // Get request body
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Highlight ID is required' }, 
        { status: 400 }
      );
    }
    
    // Get auth token
    const token = await getAuthToken();
    
    // Make request to AWS API
    const response = await fetch(`${API_ENDPOINTS.highlights}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates),
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
    console.log("Successfully updated highlight in AWS API");
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to update highlight in AWS API' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("API route called: deleting highlight");
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Highlight ID is required' }, 
        { status: 400 }
      );
    }
    
    // Get auth token
    const token = await getAuthToken();
    
    // Make request to AWS API
    const response = await fetch(`${API_ENDPOINTS.highlights}/${id}`, {
      method: 'DELETE',
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
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to delete highlight from AWS API' }, 
      { status: 500 }
    );
  }
}
