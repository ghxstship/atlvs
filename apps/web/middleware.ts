import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    
    // Skip API routes entirely
    if (pathname.startsWith('/api/')) {
      return NextResponse.next();
    }
    
    // Public routes
    if (
      pathname === '/' ||
      pathname === '/home' ||
      pathname === '/pricing' ||
      pathname === '/demo' ||
      pathname === '/opendeck' ||
      pathname === '/ghxstship' ||
      pathname === '/partnerships' ||
      pathname === '/privacy' ||
      pathname === '/terms' ||
      pathname === '/cookies' ||
      pathname === '/security' ||
      pathname === '/accessibility' ||
      pathname === '/contact' ||
      pathname.startsWith('/auth/') ||
      pathname.startsWith('/products/') ||
      pathname.startsWith('/solutions/') ||
      pathname.startsWith('/resources/') ||
      pathname.startsWith('/company/') ||
      pathname.startsWith('/careers/') ||
      pathname.startsWith('/community/')
    ) {
      return NextResponse.next();
    }
    
    // Check for auth token
    const authCookie = request.cookies.get('sb-access-token');
    
    if (!authCookie?.value) {
      return NextResponse.redirect(new URL(`/auth/signin?next=${pathname}`, request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    // If anything fails, allow request through to avoid blocking entire site
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
