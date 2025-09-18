import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';

export interface CookieAdapter {
  get: (name: string) => { name: string; value: string } | undefined;
  set: (name: string, value: string, options?: any) => void;
  remove: (name: string) => void;
}

export function createServerClient(cookieAdapter: CookieAdapter) {
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieAdapter.get(name);
          return cookie?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieAdapter.set(name, value, options);
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieAdapter.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export function createServiceRoleClient() {
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No-op for service role client
        },
      },
    }
  );
}
