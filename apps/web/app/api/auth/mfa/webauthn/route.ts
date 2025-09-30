import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { 
  generateRegistrationOptions, 
  verifyRegistrationResponse,
  type GenerateRegistrationOptionsOpts,
  type RegistrationResponseJSON 
} from '@simplewebauthn/server';
import { z } from 'zod';

interface WebAuthnConfig {
  rpName: string;
  rpID: string;
  origin: string;
  timeout: number;
}

const CreateWebAuthnSchema = z.object({
  name: z.string().min(1).max(100),
  challengeResponse: z.custom<RegistrationResponseJSON>(value => {
    if (!value || typeof value !== 'object') return false;
    return 'id' in value && 'rawId' in value && 'response' in value && 'type' in value;
  }, { message: 'Invalid WebAuthn response payload' }),
});

function getWebAuthnConfig(): WebAuthnConfig {
  const rpID = process.env.NEXT_PUBLIC_AUTH_RP_ID || process.env.NEXT_PUBLIC_APP_DOMAIN;
  const origin = process.env.NEXT_PUBLIC_APP_URL;
  if (!rpID || !origin) {
    throw new Error('Missing WebAuthn configuration. Set NEXT_PUBLIC_AUTH_RP_ID and NEXT_PUBLIC_APP_URL.');
  }

  return {
    rpName: process.env.NEXT_PUBLIC_APP_NAME || 'GHXSTSHIP',
    rpID,
    origin,
    timeout: 60_000,
  };
}

function buildRegistrationOptions(opts: Partial<GenerateRegistrationOptionsOpts>): GenerateRegistrationOptionsOpts {
  const base = getWebAuthnConfig();
  return {
    rpName: base.rpName,
    rpID: base.rpID,
    timeout: base.timeout,
    attestationType: 'indirect',
    authenticatorSelection: {
      authenticatorAttachment: 'cross-platform',
      requireResidentKey: false,
      userVerification: 'preferred',
    },
    supportedAlgorithmIDs: [-7, -257],
    ...opts,
  } as GenerateRegistrationOptionsOpts;
}

// POST /api/auth/mfa/webauthn/setup - Generate WebAuthn challenge
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient({
      get: (name: string) => {
        const cookie = request.cookies.get(name);
        return cookie ? { name: cookie.name, value: cookie.value } : undefined;
      },
      set: () => {},
      remove: () => {},
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = getWebAuthnConfig();

    const registrationOptions = await generateRegistrationOptions(buildRegistrationOptions({
      userID: new TextEncoder().encode(user.id),
      userName: user.email || user.id,
      userDisplayName: user.email || user.id,
      attestationType: 'none',
    }));

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const { error: challengeError } = await supabase
      .from('mfa_challenges')
      .insert({
        user_id: user.id,
        challenge_type: 'enrollment',
        challenge_data: {
          type: 'webauthn',
          challenge: registrationOptions.challenge as string,
          rpId: config.rpID,
          origin: config.origin,
          options: registrationOptions,
        },
        expires_at: expiresAt.toISOString(),
      });

    if (challengeError) throw challengeError;

    return NextResponse.json({
      options: registrationOptions,
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error('WebAuthn setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup WebAuthn' },
      { status: 500 }
    );
  }
}

// PUT /api/auth/mfa/webauthn/verify - Verify and create WebAuthn factor
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = CreateWebAuthnSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, challengeResponse } = validation.data;

    const supabase = createServerClient({
      get: (name: string) => {
        const cookie = request.cookies.get(name);
        return cookie ? { name: cookie.name, value: cookie.value } : undefined;
      },
      set: () => {},
      remove: () => {},
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get challenge data
    const { data: challenge, error: challengeError } = await supabase
      .from('mfa_challenges')
      .select('challenge_data')
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

    const challengeData = challenge.challenge_data as {
      challenge: string;
      rpId: string;
      origin: string;
      options: GenerateRegistrationOptionsOpts;
    };

    const verification = await verifyRegistrationResponse({
      response: challengeResponse,
      expectedChallenge: challengeData.challenge,
      expectedOrigin: challengeData.origin,
      expectedRPID: challengeData.rpId,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Invalid WebAuthn registration response' },
        { status: 400 }
      );
    }

    const { credential, credentialBackedUp } = verification.registrationInfo;
    const credentialId = Buffer.from(credential.id).toString('base64url');
    const publicKey = Buffer.from(credential.publicKey).toString('base64');
    const counter = credential.counter;

    // Generate backup codes
    const { data: backupCodes, error: backupError } = await supabase.rpc(
      'generate_backup_codes',
      { p_count: 10 }
    );

    if (backupError) throw backupError;

    // Create MFA factor
    const { data: factorId, error: factorError } = await supabase.rpc(
      'create_mfa_factor',
      {
        p_user_id: user.id,
        p_factor_type: 'webauthn',
        p_name: name,
        p_credential_id: credentialId,
        p_public_key: publicKey,
        p_is_backed_up: credentialBackedUp,
        p_counter: counter,
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
      factorId,
      backupCodes, // Only shown once for security
      message: 'WebAuthn factor created successfully',
    });

  } catch (error) {
    console.error('WebAuthn verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify WebAuthn' },
      { status: 500 }
    );
  }
}
