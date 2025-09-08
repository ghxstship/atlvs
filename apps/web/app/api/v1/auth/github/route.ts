import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const sb = createServerClient({
    get: (name: string) => cookieStore.get(name),
    set: (name: string, value: string, options: any) => cookieStore.set(name, value, options),
    remove: (name: string, options: any) => cookieStore.set(name, '', { ...options, maxAge: 0 })
  });

  const url = new URL(request.url);
  const origin = url.origin;
  const redirectTo = `${origin}/auth/callback`;

  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo
    }
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data?.url) return NextResponse.json({ error: 'No redirect URL from provider' }, { status: 400 });
  return NextResponse.redirect(data.url);
}
