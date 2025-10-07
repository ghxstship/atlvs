import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// Re-export for use in other modules
export { createBrowserClient };
export type { Database };

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
