import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/config/api-config';
import { getAuthToken } from '@/utils/apiUtils';

export async function GET(request: NextRequest) {
  try {
    console.log("API route called: fetching recommendations");
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit');
    
    // Construct the API URL
    let apiUrl = API_ENDPOINTS.recommendations;
    if (userId) {
      apiUrl = API_ENDPOINTS.userRecommendations(userId);
    }
    
    // Add query parameters if needed
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (params.toString()) {
      apiUrl += `?${params.toString()}`;
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
    console.log("Successfully fetched recommendations from AWS API");
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations from AWS API' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("API route called: creating recommendation feedback");
    
    // Get request body
    const body = await request.json();
    
    // Get auth token
    const token = await getAuthToken();
    
    // Make request to AWS API
    const response = await fetch(API_ENDPOINTS.recommendations, {
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
    console.log("Successfully submitted recommendation feedback to AWS API");
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to submit recommendation feedback to AWS API' }, 
      { status: 500 }
    );
  }
}
