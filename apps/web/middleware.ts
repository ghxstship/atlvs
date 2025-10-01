/**
 * Main Middleware
 * Orchestrates all middleware functions in the correct order
 */

import { NextResponse, type NextRequest } from 'next/server';
import { loggingMiddleware } from './middleware/logging';
import { rateLimitingMiddleware } from './middleware/rate-limiting';
import { errorHandlingMiddleware } from './middleware/error-handling';
import { securityMiddleware } from './middleware/security';
import { brandDetectionMiddleware } from './middleware/brand-detection';

export async function middleware(req: NextRequest) {
  // Wrap in error handling
  return errorHandlingMiddleware(async (request: NextRequest) => {
    const { pathname } = request.nextUrl;

    // 1. Rate limiting (check first to prevent abuse)
    const rateLimitResponse = rateLimitingMiddleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 2. Brand detection (set brand cookie based on domain)
    const brandResponse = await brandDetectionMiddleware(request);
    if (brandResponse) {
      return brandResponse;
    }

    // 3. Logging
    loggingMiddleware(request);

    // Public paths - marketing pages should be accessible without auth
    const isPublic =
      pathname === '/' ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/products') ||
      pathname.startsWith('/solutions') ||
      pathname.startsWith('/pricing') ||
      pathname.startsWith('/resources') ||
      pathname.startsWith('/company') ||
      pathname.startsWith('/careers') ||
      pathname.startsWith('/community') ||
      pathname.startsWith('/privacy') ||
      pathname.startsWith('/terms') ||
      pathname.startsWith('/accessibility') ||
      pathname.startsWith('/home') ||
      pathname.startsWith('/marketing') ||
      pathname.startsWith('/contact') ||
      pathname.startsWith('/cookies') ||
      pathname.startsWith('/security') ||
      pathname.startsWith('/_next') ||
      /\.(?:.*)$/.test(pathname);

    // 4. Authentication check for protected routes
    if (!pathname.startsWith('/api') && !isPublic) {
      const authToken = request.cookies.get('sb-access-token') || request.cookies.get('supabase-auth-token');
      
      if (!authToken) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth/signin';
        url.searchParams.set('next', request.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
    }

    // 5. Create response and add security headers
    const response = NextResponse.next();
    return securityMiddleware(request, response);
  })(req);
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
};
