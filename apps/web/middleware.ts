// Edge Runtime compatible middleware using native Web APIs
// Avoiding NextRequest/NextResponse which were causing MIDDLEWARE_INVOCATION_FAILED

export function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Skip API routes
  if (pathname.startsWith('/api/')) {
    return;
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
    return;
  }
  
  // Check for auth cookie
  const cookies = request.headers.get('cookie') || '';
  const hasAuthToken = cookies.includes('sb-access-token=');
  
  if (!hasAuthToken) {
    // Redirect to signin with next parameter
    const signinUrl = new URL('/auth/signin', url.origin);
    signinUrl.searchParams.set('next', pathname);
    return Response.redirect(signinUrl.toString(), 307);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
