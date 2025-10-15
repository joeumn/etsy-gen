import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * The Forge - Middleware for Authentication & Route Protection
 * 
 * Handles authentication checks and redirects for protected routes
 */

// Check if user is authenticated
function isAuthenticated(request: NextRequest): boolean {
  // Check for auth token in cookies
  const authToken = request.cookies.get('auth_token');
  
  if (authToken && authToken.value) {
    return true;
  }
  
  // Fallback: check for authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return true;
  }
  
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes (everything except public pages)
  const publicPaths = ['/', '/auth/login', '/auth/signup', '/auth/signin', '/beta-request'];
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith('/api/'));

  // If accessing a protected route
  if (!isPublicPath) {
    const isAuth = isAuthenticated(request);

    if (!isAuth) {
      // Redirect to login with return URL
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If authenticated user tries to access login page, redirect to dashboard
  if (pathname === '/auth/login' && isAuthenticated(request)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png).*)',
  ],
};
