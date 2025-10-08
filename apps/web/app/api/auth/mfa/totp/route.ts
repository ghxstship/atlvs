import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

// Validation schemas
const CreateTOTPSchema = z.object({
  name: z.string().min(1).max(100)
});

const VerifyTOTPSchema = z.object({
  factorId: z.string().uuid(),
  code: z.string().length(6).regex(/^\d{6}$/)
});

const CreateWebAuthnSchema = z.object({
  name: z.string().min(1).max(100),
  challengeResponse: z.object({
    id: z.string(),
    rawId: z.string(),
    response: z.object({
      clientDataJSON: z.string(),
      attestationObject: z.string()
    }),
    type: z.literal('public-key')
  })
});

// POST /api/auth/mfa/totp/setup - Generate TOTP setup
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient({
      get: (name: string) => {
        const cookie = request.cookies.get(name);
        return cookie ? { name: cookie.name, value: cookie.value } : undefined;
      },
      set: () => {},
      remove: () => {}
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate TOTP secret
    const { data: secretData, error: secretError } = await supabase.rpc('generate_totp_secret');
    if (secretError) throw secretError;

    // Create setup challenge
    const challengeId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const { error: challengeError } = await supabase
      .from('mfa_challenges')
      .insert({
        user_id: user.id,
        challenge_type: 'enrollment',
        challenge_data: {
          type: 'totp',
          secret: secretData,
          challenge_id: challengeId
        },
        expires_at: expiresAt.toISOString()
      });

    if (challengeError) throw challengeError;

    // Generate QR code URL
    const issuer = 'GHXSTSHIP';
    const accountName = user.email;
    const qrUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secretData}&issuer=${issuer}`;

    return NextResponse.json({
      challengeId,
      secret: secretData,
      qrUrl,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('TOTP setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup TOTP' },
      { status: 500 }
    );
  }
}

// PUT /api/auth/mfa/totp/verify - Verify and create TOTP factor
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = VerifyTOTPSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { factorId, code } = validation.data;

    const supabase = createServerClient({
      get: (name: string) => {
        const cookie = request.cookies.get(name);
        return cookie ? { name: cookie.name, value: cookie.value } : undefined;
      },
      set: () => {},
      remove: () => {}
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get challenge data
    const { data: challenge, error: challengeError } = await supabase
      .from('mfa_challenges')
      .select('challenge_data, expires_at')
      .eq('user_id', user.id)
      .eq('challenge_type', 'enrollment')
      .eq('is_completed', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json(
        { error: 'Invalid or expired challenge' },
        { status: 400 }
      );
    }

    const challengeData = challenge.challenge_data as any;
    if (!challengeData.secret) {
      return NextResponse.json(
        { error: 'Invalid challenge data' },
        { status: 400 }
      );
    }

    // Verify TOTP code
    const { data: isValid, error: verifyError } = await supabase.rpc(
      'verify_totp_code',
      { p_secret: challengeData.secret, p_code: code }
    );

    if (verifyError) throw verifyError;

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid TOTP code' },
        { status: 400 }
      );
    }

    // Generate backup codes
    const { data: backupCodes, error: backupError } = await supabase.rpc(
      'generate_backup_codes',
      { p_count: 10 }
    );

    if (backupError) throw backupError;

    // Create MFA factor
    const { data: newFactorId, error: factorError } = await supabase.rpc(
      'create_mfa_factor',
      {
        p_user_id: user.id,
        p_factor_type: 'totp',
        p_name: challengeData.name || 'TOTP Authenticator',
        p_secret: challengeData.secret,
        p_backup_codes: backupCodes
      }
    );

    if (factorError) throw factorError;

    // Mark challenge as completed
    await supabase
      .from('mfa_challenges')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('challenge_type', 'enrollment');

    return NextResponse.json({
      factorId: newFactorId,
      backupCodes, // Only shown once for security
      message: 'TOTP factor created successfully'
    });

  } catch (error) {
    console.error('TOTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify TOTP' },
      { status: 500 }
    );
  }
}
