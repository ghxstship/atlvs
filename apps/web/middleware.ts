import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Define public paths (no auth required)
  const isPublicPath = 
    path === '/' ||
    path === '/home' ||
    path === '/pricing' ||
    path === '/demo' ||
    path === '/opendeck' ||
    path === '/ghxstship' ||
    path === '/partnerships' ||
    path === '/privacy' ||
    path === '/terms' ||
    path === '/cookies' ||
    path === '/security' ||
    path === '/accessibility' ||
    path === '/contact' ||
    path.startsWith('/auth/') ||
    path.startsWith('/products/') ||
    path.startsWith('/solutions/') ||
    path.startsWith('/resources/') ||
    path.startsWith('/company/') ||
    path.startsWith('/careers/') ||
    path.startsWith('/community/') ||
    path.startsWith('/api/');

  // Public paths - add headers and continue
  if (isPublicPath) {
    const res = NextResponse.next();
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return res;
  }

  // Protected paths - check auth
  const token = req.cookies.get('sb-access-token');
  
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/signin';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  // Authenticated - add headers and continue
  const res = NextResponse.next();
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
