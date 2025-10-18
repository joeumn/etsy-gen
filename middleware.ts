import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * The Forge - Middleware
 * 
 * Protects API routes with NextAuth authentication
 * Falls back to mock authentication in development when NextAuth is not configured
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

    // Check if running in development/test mode without proper NextAuth setup
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
    const forceMockAuth = process.env.FORCE_MOCK_AUTH === 'true';

    // Check for valid session
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      // In development mode without NextAuth configured, use mock user
      if ((isDevelopment && !hasNextAuthSecret) || forceMockAuth) {
        console.log('⚠️ Using mock authentication for development');
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', 'mock-user-1');
        requestHeaders.set('x-user-email', 'joeinduluth@gmail.com');
        
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }

      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Add user ID to headers for API routes to access
    // NextAuth v5 uses 'sub' for user ID by default, but we also set 'id' in JWT callback
    const userId = (token.id as string) || (token.sub as string);
    const userEmail = (token.email as string);

    if (!userId) {
      console.error('Token missing user ID:', token);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userId);
    if (userEmail) {
      requestHeaders.set('x-user-email', userEmail);
    }

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
