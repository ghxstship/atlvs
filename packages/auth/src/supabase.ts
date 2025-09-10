import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient as createSSRClient, type CookieOptions } from '@supabase/ssr';

export const createBrowserClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase URL and Anon Key must be set in env');
    }
  return createSupabaseClient(url, key);
};

export type CookieAdapter = {
  get: (name: string) => { name: string; value: string } | undefined;
  set?: (name: string, value: string, options: CookieOptions) => void;
  remove?: (name: string, options: CookieOptions) => void;
};

export const createServerClient = (cookies: CookieAdapter) => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase URL and Anon Key must be set in env');
  }
  return createSSRClient(url, key, {
    cookies: {
      get: (name: string) => cookies.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => cookies.set?.(name, value, options),
      remove: (name: string, options: CookieOptions) => cookies.remove?.(name, options)
    }
  });
};

export const createServiceRoleClient = () => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in env');
  }
  return createSupabaseClient(url, serviceKey, { auth: { persistSession: false } });
};

// Export createClient as an alias for createBrowserClient for backward compatibility
export const createClient = createBrowserClient;
