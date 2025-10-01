/**
 * Main Middleware
 * Simplified for Edge Runtime compatibility
 */

import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    // Skip middleware for static files and API routes
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.includes('.') // Files with extensions
    ) {
      return NextResponse.next();
    }

    // Public paths - marketing pages accessible without auth
    const isPublic =
      pathname === '/' ||
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
      pathname.startsWith('/contact') ||
      pathname.startsWith('/cookies') ||
      pathname.startsWith('/security') ||
      pathname.startsWith('/demo');

    // Authentication check for protected routes
    if (!isPublic) {
      const authToken = req.cookies.get('sb-access-token') || req.cookies.get('supabase-auth-token');
      
      if (!authToken) {
        const url = req.nextUrl.clone();
        url.pathname = '/auth/signin';
        url.searchParams.set('next', req.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
    }

    // Add basic security headers
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
  } catch (error) {
    // Log error and allow request to proceed
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  // Apply middleware to all routes except static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ]
};
