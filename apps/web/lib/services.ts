import { cookies } from 'next/headers';
import { createServerClient, type CookieAdapter } from '@ghxstship/auth';
// import { composeSupabaseServices } from '@ghxstship/infrastructure';

export async function getSupabaseAndServices() {
  const cookieStore = await cookies();
  const adapter: CookieAdapter = {
    get: (name: string) => cookieStore.get(name),
    set: (name: string, value: string, options?: any) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  };
  const sb = createServerClient(adapter);
  // const composed = composeSupabaseServices(sb);
  const composed = { 
    repos: {}, 
    services: { 
      webhooks: { redrive: async (limit: number) => {} },
      projects: { findById: async () => null }
    }, 
    audit: { record: async (entry: any) => {} } 
  }; // Placeholder
  return { sb, ...composed };
}
