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




