import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    const bookId = params.bookId;
    console.log("Next.js API route: DELETE request for book:", bookId);
    
    // Make the request to AWS API
    const response = await fetch(`https://e96357rata.execute-api.us-east-1.amazonaws.com/dev/books/${bookId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log("AWS response status:", response.status);
    const responseText = await response.text();
    console.log("AWS response:", responseText);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `AWS API returned ${response.status}: ${responseText}` }, 
        { status: response.status }
      );
    }
    
    // Return success response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { message: "Book deleted successfully" };
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in DELETE route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

// This file defines the Next.js API route for fetching a specific book by its ID.
export async function GET(
  request: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    // Extract the bookId from the request parameters
    const bookId = params.bookId;

    const response = await fetch(
      `https://9b8264bvl5.execute-api.us-east-1.amazonaws.com/get-book/${bookId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    // Log the response status for debugging
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch book: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
