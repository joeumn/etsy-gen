import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * The Forge - Middleware
 * 
 * Protects API routes with NextAuth authentication
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public API routes that don't require authentication
  const publicApiRoutes = [
    '/api/auth',
    '/api/health',
    '/api/db-test',
    '/api/onboarding',
  ];

  // Check if this is an API route
  if (pathname.startsWith('/api')) {
    // Allow public routes
    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Check for valid session
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Add user ID to headers for API routes to access
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', token.id as string);
    requestHeaders.set('x-user-email', token.email as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // For non-API routes, allow through (UI can handle auth state)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match API routes and protected pages
     */
    '/api/:path*',
  ],
};
