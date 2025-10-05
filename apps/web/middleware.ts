import { NextRequest, NextResponse } from 'next/server';

// Middleware with robust guards to prevent runtime errors on undefined pathname
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fallback to default handling if pathname is unavailable for any reason
  if (!pathname) {
    return NextResponse.next();
  }

  // Skip framework/static assets explicitly to avoid hitting auth logic
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/assets/') ||
    pathname.match(/\.([a-zA-Z0-9]+)$/)
  ) {
    return NextResponse.next();
  }

  // Skip API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/home',
    '/pricing',
    '/demo',
    '/opendeck',
    '/ghxstship',
    '/partnerships',
    '/privacy',
    '/terms',
    '/cookies',
    '/security',
    '/accessibility',
    '/contact',
    '/products',
    '/solutions',
    '/resources',
    '/community',
    '/company'
  ];

  const publicPrefixes = [
    '/auth/',
    '/opendeck/',
    '/products/',
    '/solutions/',
    '/resources/',
    '/company/',
    '/careers/',
    '/community/',
  ];

  // Check if route is public
  if (publicRoutes.includes(pathname) || publicPrefixes.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const hasAuthToken = request.cookies.has('sb-access-token');

  if (!hasAuthToken) {
    // Redirect to signin with next parameter
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(signinUrl, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
