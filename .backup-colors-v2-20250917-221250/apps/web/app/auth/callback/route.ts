import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, createServiceRoleClient } from '@ghxstship/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

  // Complete Auth flow (magic link / OAuth)
  const { data: sessionRes, error: exchErr } = await supabase.auth.exchangeCodeForSession(req.url);
  if (exchErr) {
    // Even if exchange fails, attempt to redirect to login
    const url = req.nextUrl.clone();
    url.pathname = '/auth/signin';
    url.searchParams.set('error', exchErr.message);
    return NextResponse.redirect(url);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/signin';
    return NextResponse.redirect(url);
  }

  const admin = createServiceRoleClient();

  // Provision profile if missing. Use auth user id as both id and auth_id for simplicity
  await admin.from('users')
    .upsert({
      id: user.id as unknown as string,
      auth_id: user.id as unknown as string,
      full_name: (user.user_metadata as any)?.full_name || user.email || null
    }, { onConflict: 'id' });

  // Accept pending invites for this email
  const email = (user.email || '').toLowerCase();
  if (email) {
    const { data: invites } = await admin
      .from('organization_invites')
      .select('id, organization_id, role, status')
      .eq('email', email)
      .eq('status', 'pending');

    if (invites && invites.length > 0) {
      for (const inv of invites) {
        // Create/activate membership
        await admin
          .from('memberships')
          .upsert({ user_id: user.id as unknown as string, organization_id: inv.organization_id, role: inv.role, status: 'active' }, { onConflict: 'user_id,organization_id' });
        // Mark invite accepted
        await admin
          .from('organization_invites')
          .update({ status: 'accepted' })
          .eq('id', inv.id);
      }
    }
  }

  const next = req.nextUrl.searchParams.get('next') || '/dashboard/overview';
  const dest = req.nextUrl.clone();
  dest.pathname = next;
  dest.search = '';
  return NextResponse.redirect(dest);
}
