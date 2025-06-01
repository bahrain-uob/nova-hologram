import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/config/api-config';
import { getAuthToken } from '@/utils/apiUtils';

export async function GET(request: NextRequest) {
  try {
    console.log("API route called: fetching vocabulary items");
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const bookId = searchParams.get('bookId');
    
    // Construct the API URL based on parameters
    let apiUrl = API_ENDPOINTS.vocabulary;
    if (userId) {
      apiUrl = API_ENDPOINTS.userVocabulary(userId);
    } else if (bookId) {
      apiUrl = API_ENDPOINTS.bookVocabulary(bookId);
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
    console.log("Successfully fetched vocabulary items from AWS API");
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary items from AWS API' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("API route called: creating vocabulary item");
    
    // Get request body
    const body = await request.json();
    
    // Get auth token
    const token = await getAuthToken();
    
    // Make request to AWS API
    const response = await fetch(API_ENDPOINTS.vocabulary, {
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
    console.log("Successfully created vocabulary item in AWS API");
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to create vocabulary item in AWS API' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("API route called: updating vocabulary item");
    
    // Get request body
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Vocabulary item ID is required' }, 
        { status: 400 }
      );
    }
    
    // Get auth token
    const token = await getAuthToken();
    
    // Make request to AWS API
    const response = await fetch(`${API_ENDPOINTS.vocabulary}/${id}`, {
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
    console.log("Successfully updated vocabulary item in AWS API");
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to update vocabulary item in AWS API' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("API route called: deleting vocabulary item");
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Vocabulary item ID is required' }, 
        { status: 400 }
      );
    }
    
    // Get auth token
    const token = await getAuthToken();
    
    // Make request to AWS API
    const response = await fetch(`${API_ENDPOINTS.vocabulary}/${id}`, {
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
      { error: 'Failed to delete vocabulary item from AWS API' }, 
      { status: 500 }
    );
  }
}
