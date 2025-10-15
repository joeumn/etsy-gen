import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple auth check for private routes
function isAuthenticated(request: NextRequest): boolean {
  // Check for auth token in cookies or headers
  // For this private app, we'll check localStorage via a simple approach
  // In production, use proper JWT tokens or session cookies

  // For now, we'll use a simple header check that can be set by the client
  const authHeader = request.headers.get('x-auth-token');
  return authHeader === 'authenticated';
}

export function middleware(request: NextRequest) {
  // Define protected routes
  const protectedPaths = ['/dashboard', '/settings', '/studio', '/automation', '/pricing'];

  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // For this simple implementation, we'll redirect to login
    // In a real app, you'd verify the session/token properly
    const isAuth = isAuthenticated(request);

    if (!isAuth) {
      // Redirect to login with return URL
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
