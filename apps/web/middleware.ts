import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// Middleware with robust guards to prevent runtime errors on undefined pathname
export async function middleware(request: NextRequest) {
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

  const isAuthRoute = pathname.startsWith('/auth/');
  const isPublicRoute =
    publicRoutes.includes(pathname) || publicPrefixes.some(prefix => pathname.startsWith(prefix));

  if (!isAuthRoute && isPublicRoute) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in middleware');
    // Allow access without authentication if env vars are not configured
    return response;
  }

  let session = null;
  
  try {
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          }
        }
      }
    );

    const {
      data: { session: authSession }
    } = await supabase.auth.getSession();
    
    session = authSession;
  } catch (error) {
    console.error('Error in middleware auth check:', error);
    // Allow access without authentication if Supabase client fails
    return response;
  }

  if (!session && !isAuthRoute) {
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(signinUrl, 307);
  }

  if (session && isAuthRoute) {
    const nextUrl = request.nextUrl.searchParams.get('next') ?? '/dashboard';
    return NextResponse.redirect(new URL(nextUrl, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ]
};
