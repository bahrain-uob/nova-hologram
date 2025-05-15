import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    const bookId = params.bookId;

    const response = await fetch(`https://e96357rata.execute-api.us-east-1.amazonaws.com/dev/books/${bookId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: "c4180458-f091-70b8-58bd-9fc233dcf8bb"
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: `AWS API returned ${response.status}: ${responseText}` },
        { status: response.status }
      );
    }

    try {
      return NextResponse.json(JSON.parse(responseText));
    } catch {
      return NextResponse.json({ message: responseText });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}




