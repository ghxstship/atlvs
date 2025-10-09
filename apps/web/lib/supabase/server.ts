import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

type CookieStore = ReadonlyRequestCookies | undefined;

export async function createClient(providedCookies?: CookieStore) {
  let cookieStore: CookieStore = providedCookies;

  if (!cookieStore) {
    try {
      cookieStore = await cookies();
    } catch {
      cookieStore = undefined;
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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
        }
      }
    }
  );
}

export async function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase service role environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createServerClient<Database>(
    supabaseUrl,
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // Service role client doesn't need cookies
        }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Export db as an alias for createClient for backward compatibility
export const db = createClient;
