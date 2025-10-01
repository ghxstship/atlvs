import { z } from 'zod';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const APP_NAME = 'GHXSTSHIP';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: membership, error } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (error || !membership) {
    throw new Error('No active organization membership');
  }

  return { user, orgId: membership.organization_id, role: membership.role, supabase };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function POST() {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();

    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('mfa_enabled')
      .eq('id', user.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: getErrorMessage(userError) }, { status: 400 });
    }

    if (userRecord?.mfa_enabled) {
      return NextResponse.json({ error: 'Two-factor authentication is already enabled' }, { status: 400 });
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email ?? user.id, APP_NAME, secret);
    const qrCode = await QRCode.toDataURL(otpauth);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        mfa_secret: secret,
        mfa_enabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: getErrorMessage(updateError) }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.security.2fa.setup_requested',
      resource_type: 'user',
      resource_id: user.id,
      details: { method: 'totp' },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({
      qrCode,
      otpauth
    });
  } catch (error) {
    const message = getErrorMessage(error);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}
