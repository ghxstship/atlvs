import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/typescript-types';
import { z } from 'zod';

const VerifyMFASchema = z.object({
  userId: z.string().uuid(),
  factorId: z.string().uuid(),
  code: z.string().optional(),
  credentialData: z.custom<AuthenticationResponseJSON>(value => {
    if (!value || typeof value !== 'object') return false;
    return 'id' in value && 'rawId' in value && 'response' in value && 'type' in value;
  }).optional(),
});

const VerifyBackupCodeSchema = z.object({
  userId: z.string().uuid(),
  backupCode: z.string().length(8).regex(/^[a-f0-9]{8}$/),
});

// POST /api/auth/mfa/verify - Verify MFA for authentication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = VerifyMFASchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { userId, factorId, code, credentialData } = validation.data;

    const supabase = createServerClient({
      get: (name: string) => request.cookies.get(name)?.value,
      set: () => {},
      remove: () => {},
    });

    const { data: factor, error: factorError } = await supabase
      .from('mfa_factors')
      .select('id, factor_type, secret, credential_id, public_key, counter, organization_id')
      .eq('id', factorId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (factorError || !factor) {
      return NextResponse.json(
        { error: 'MFA factor not found' },
        { status: 404 }
      );
    }

    let isValid = false;
    if (factor.factor_type === 'totp') {
      const { data: totpValid, error: totpError } = await supabase.rpc(
        'verify_mfa_factor',
        {
          p_user_id: userId,
          p_factor_id: factorId,
          p_code: code,
        }
      );
      if (totpError) throw totpError;
      isValid = Boolean(totpValid);
    } else if (factor.factor_type === 'webauthn' && credentialData) {
      const publicKeyBuffer = Buffer.from(factor.public_key ?? '', 'base64');
      const credentialIDBuffer = Buffer.from(factor.credential_id ?? '', 'base64url');

      const verification = await verifyAuthenticationResponse({
        response: credentialData,
        expectedChallenge: credentialData.response.clientDataJSON,
        expectedOrigin: process.env.NEXT_PUBLIC_APP_URL!,
        expectedRPID: process.env.NEXT_PUBLIC_AUTH_RP_ID || process.env.NEXT_PUBLIC_APP_DOMAIN!,
        authenticator: {
          credentialPublicKey: publicKeyBuffer,
          credentialID: credentialIDBuffer,
          counter: factor.counter ?? 0,
          transports: credentialData.transports,
        },
        requireUserVerification: true,
      });

      if (!verification.verified || !verification.authenticationInfo) {
        return NextResponse.json(
          { error: 'Invalid WebAuthn assertion' },
          { status: 401 }
        );
      }

      const { newCounter } = verification.authenticationInfo;
      isValid = true;

      await supabase
        .from('mfa_factors')
        .update({ counter: newCounter, last_used_at: new Date().toISOString() })
        .eq('id', factorId);
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid MFA code or credentials' },
        { status: 401 }
      );
    }

    // Get user organization for session creation
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, role')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'User membership not found' },
        { status: 400 }
      );
    }

    // Create session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   request.ip,
        user_agent: request.headers.get('user-agent'),
      });

    if (sessionError) throw sessionError;

    return NextResponse.json({
      success: true,
      sessionToken,
      expiresAt: expiresAt.toISOString(),
      user: { id: userId },
      membership,
    });

  } catch (error) {
    console.error('MFA verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify MFA' },
      { status: 500 }
    );
  }
}

// POST /api/auth/mfa/backup - Verify backup code
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = VerifyBackupCodeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { userId, backupCode } = validation.data;

    const supabase = createServerClient({
      get: (name: string) => request.cookies.get(name)?.value,
      set: () => {},
      remove: () => {},
    });

    const { data: matched, error: matchError } = await supabase.rpc('use_mfa_backup_code', {
      p_user_id: userId,
      p_backup_code: backupCode,
    });

    if (matchError) throw matchError;
    if (!matched?.factor_id) {
      return NextResponse.json(
        { error: 'Invalid or already used backup code' },
        { status: 401 }
      );
    }

    // Get user organization for session creation
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, role')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'User membership not found' },
        { status: 400 }
      );
    }

    // Create session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   request.ip,
        user_agent: request.headers.get('user-agent'),
      });

    if (sessionError) throw sessionError;

    // Log backup code usage
    await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: 'mfa_backup_code_used',
      p_severity: 'high',
      p_details: { factor_id: factorId },
    });

    return NextResponse.json({
      success: true,
      sessionToken,
      expiresAt: expiresAt.toISOString(),
      user: { id: userId },
      membership,
    });

  } catch (error) {
    console.error('Backup code verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify backup code' },
      { status: 500 }
    );
  }
}
