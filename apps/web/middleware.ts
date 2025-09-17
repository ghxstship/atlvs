import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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

  // Allow API paths and public paths
  if (pathname.startsWith('/api') || isPublic) {
    return NextResponse.next();
  }

  // For protected routes, check for auth token in cookies
  const authToken = req.cookies.get('sb-access-token') || req.cookies.get('supabase-auth-token');
  
  if (!authToken) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/signin';
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
};
