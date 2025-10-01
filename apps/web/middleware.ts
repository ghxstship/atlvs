/**
 * Main Middleware
 * Full-featured with proper Edge Runtime compatibility
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Explicitly declare Edge Runtime
export const runtime = 'edge';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth',
    '/products',
    '/solutions', 
    '/pricing',
    '/resources',
    '/company',
    '/careers',
    '/community',
    '/privacy',
    '/terms',
    '/accessibility',
    '/home',
    '/contact',
    '/cookies',
    '/security',
    '/demo',
    '/opendeck',
    '/ghxstship',
    '/partnerships'
  ];

  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Skip auth check for public paths and API routes
  if (isPublicPath || pathname.startsWith('/api')) {
    const response = NextResponse.next();
    
    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;
  }

  // Check authentication for protected routes
  const authToken = request.cookies.get('sb-access-token') || 
                   request.cookies.get('supabase-auth-token');

  if (!authToken) {
    // Redirect to signin with return URL
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // User is authenticated, proceed with security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
