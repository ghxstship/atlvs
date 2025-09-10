import { NextResponse, type NextRequest } from 'next/server';
import { normalizeRole } from './lib/auth/roles';
import { createServerClient } from '@ghxstship/auth';

export async function middleware(req: NextRequest) {
  // Temporarily disable i18n middleware to fix root page 404
  let res = NextResponse.next();

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

  // Allow API paths without auth by default; you may restrict later per-route
  if (pathname.startsWith('/api')) {
    return res;
  }

  if (isPublic) {
    return res;
  }

  // Auth guard using Supabase session in middleware with cookie adapter
  const supabase = createServerClient({
    get: (name: string) => req.cookies.get(name) ? { name, value: req.cookies.get(name)!.value } : undefined,
    set: (name: string, value: string, options) => { res.cookies.set(name, value, options); },
    remove: (name: string, options) => { res.cookies.set(name, '', { ...options, maxAge: 0 }); }
  });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Project deep pages guard for limited roles without assignments
  if (pathname.startsWith('/projects') && pathname !== '/projects/overview') {
    // Get role from active membership (first active)
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .maybeSingle();
    const role = normalizeRole(membership?.role || 'viewer');
    const limitedRoles = new Set(['team_member','viewer','client','vendor','partner']);
    if (limitedRoles.has(role)) {
      const { count } = await supabase
        .from('projects_members')
        .select('project_id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('status', 'active');
      if ((count ?? 0) === 0) {
        const url = req.nextUrl.clone();
        url.pathname = '/projects/overview';
        url.searchParams.delete('next');
        return NextResponse.redirect(url);
      }
    }
  }

  return res;
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
};
