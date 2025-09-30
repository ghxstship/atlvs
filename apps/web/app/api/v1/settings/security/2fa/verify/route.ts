import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { authenticator } from 'otplib';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VerifySchema = z.object({
  code: z.string().min(6).max(8)
});

async function getAuthenticatedUser() {
  const cookieStore = cookies();
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

function generateBackupCodes(count = 10) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const codes: string[] = [];
  for (let i = 0; i < count; i += 1) {
    let code = '';
    for (let j = 0; j < 8; j += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    codes.push(code);
  }
  return codes;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = VerifySchema.parse(body);
    const { user, orgId, supabase } = await getAuthenticatedUser();

    const { data: userRecord, error } = await supabase
      .from('users')
      .select('mfa_secret, mfa_enabled')
      .eq('id', user.id)
      .single();

    if (error || !userRecord?.mfa_secret) {
      return NextResponse.json({ error: 'Two-factor setup not initialized' }, { status: 400 });
    }

    const isValid = authenticator.check(code, userRecord.mfa_secret);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    const backupCodes = generateBackupCodes();

    const { error: updateError } = await supabase
      .from('users')
      .update({
        mfa_enabled: true,
        backup_codes: backupCodes,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: getErrorMessage(updateError) }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.security.2fa.enabled',
      resource_type: 'user',
      resource_id: user.id,
      details: { method: 'totp' },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      backupCodes
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    const message = getErrorMessage(error);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}
