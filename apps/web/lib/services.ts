import { cookies } from 'next/headers';
import { createServerClient, type CookieAdapter } from '@ghxstship/auth';
import { composeSupabaseServices } from '@ghxstship/infrastructure';

export function getSupabaseAndServices() {
  const cookieStore = cookies();
  const adapter: CookieAdapter = {
    get: (name: string) => cookieStore.get(name),
    set: () => {},
    remove: () => {}
  };
  const sb = createServerClient(adapter);
  const composed = composeSupabaseServices(sb);
  return { sb, ...composed };
}
