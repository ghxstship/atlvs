import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

type CookieStore = ReturnType<typeof cookies> | undefined;

export async function createClient(providedCookies?: CookieStore) {
  let cookieStore: CookieStore = providedCookies;

  if (!cookieStore) {
    try {
      cookieStore = await cookies();
    } catch {
      cookieStore = undefined;
    }
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore?.getAll?.() ?? [];
        },
        setAll(cookiesToSet) {
          if (!cookieStore) {
            return;
          }
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              const set = (cookieStore as any)?.set;
              if (typeof set === 'function') {
                set.call(cookieStore, name, value, options);
              }
            });
          } catch {
            // The `setAll` method was called outside of a request context.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

export async function createServiceClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // Service role client doesn't need cookies
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Export db as an alias for createClient for backward compatibility
export const db = createClient;
