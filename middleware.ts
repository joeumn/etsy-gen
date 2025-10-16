import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * The Forge - Middleware
 * 
 * Currently configured for open access - no authentication required
 */

export function middleware(request: NextRequest) {
  // Allow all requests to proceed without authentication
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
