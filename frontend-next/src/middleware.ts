import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected path patterns
const READER_PATHS = ['/reader-dashboard', '/reader-'];
const LIBRARIAN_PATHS = ['/dashboard', '/manage-'];
const AUTH_PATHS = ['/login', '/signup', '/fPassword'];
const PUBLIC_PATHS = ['/', '/api/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths and authentication paths
  if (
    PUBLIC_PATHS.some(path => pathname.startsWith(path)) ||
    AUTH_PATHS.some(path => pathname === path)
  ) {
    return NextResponse.next();
  }

  // Get the user session from cookies
  const userSessionCookie = request.cookies.get('userSession')?.value;
  
  // If no session, redirect to login
  if (!userSessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    // Parse user session
    const userSession = JSON.parse(userSessionCookie);
    const userType = userSession.userType;
    
    // Check if reader is trying to access librarian paths
    if (
      userType === 'reader' && 
      LIBRARIAN_PATHS.some(path => pathname.startsWith(path))
    ) {
      return NextResponse.redirect(new URL('/reader-dashboard', request.url));
    }
    
    // Check if librarian is trying to access reader paths
    if (
      userType === 'librarian' && 
      READER_PATHS.some(path => pathname.startsWith(path))
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Allow access to appropriate paths
    return NextResponse.next();
  } catch (error) {
    // If there's an error parsing the session, redirect to login
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure which paths should trigger this middleware
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes (API routes)
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /logo.svg (static files)
     */
    '/((?!api|_next|_static|_vercel|favicon.ico|logo.svg).*)',
  ],
};
