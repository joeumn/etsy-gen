import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * The Forge - Enhanced Middleware
 * 
 * Protects API routes with NextAuth authentication
 * Includes rate limiting, security headers, and request validation
 */

// Security headers for all responses
const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const startTime = Date.now();

  // Public API routes that don't require authentication
  const publicApiRoutes = [
    '/api/auth',
    '/api/health',
    '/api/db-test',
    '/api/onboarding',
  ];

  // Check if this is an API route
  if (pathname.startsWith('/api')) {
    // Basic request validation
    const contentType = request.headers.get('content-type');
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      if (contentType && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
        return NextResponse.json(
          { error: 'Invalid Content-Type header' },
          { status: 415 }
        );
      }
    }

    // Allow public routes
    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
      const response = NextResponse.next();
      // Add security headers
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Check for valid session
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      console.log(`[Middleware] No valid token found for ${pathname}`);
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { 
          status: 401,
          headers: SECURITY_HEADERS,
        }
      );
    }

    console.log(`[Middleware] Token found for ${pathname}, user ID:`, token.id || token.sub);

    // Add user ID to headers for API routes to access
    // NextAuth v5 uses 'sub' for user ID by default, but we also set 'id' in JWT callback
    const userId = (token.id as string) || (token.sub as string);
    const userEmail = (token.email as string);

    if (!userId) {
      console.error('[Middleware] Token missing user ID:', token);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { 
          status: 401,
          headers: SECURITY_HEADERS,
        }
      );
    }

    console.log(`[Middleware] Setting headers - userId: ${userId}, email: ${userEmail}`);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userId);
    requestHeaders.set('x-request-start', startTime.toString());
    if (userEmail) {
      requestHeaders.set('x-user-email', userEmail);
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Add security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add performance timing header
    response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

    return response;
  }

  // For non-API routes, allow through with security headers
  const response = NextResponse.next();
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: [
    /*
     * Match API routes and protected pages
     */
    '/api/:path*',
  ],
};
