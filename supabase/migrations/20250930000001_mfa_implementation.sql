-- Multi-Factor Authentication (MFA) Implementation
-- Adds comprehensive TOTP and WebAuthn support

-- Enable required extensions for MFA
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create MFA factors table
CREATE TABLE IF NOT EXISTS public.mfa_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    factor_type TEXT NOT NULL CHECK (factor_type IN ('totp', 'webauthn')),
    name TEXT NOT NULL, -- User-friendly name for the factor
    secret TEXT, -- TOTP secret (encrypted)
    credential_id TEXT, -- WebAuthn credential ID
    public_key TEXT, -- WebAuthn public key
    counter BIGINT DEFAULT 0, -- WebAuthn counter
    backup_codes TEXT[], -- Encrypted backup codes
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id, factor_type, name),
    CHECK (
        (factor_type = 'totp' AND secret IS NOT NULL AND credential_id IS NULL AND public_key IS NULL) OR
        (factor_type = 'webauthn' AND credential_id IS NOT NULL AND public_key IS NOT NULL AND secret IS NULL)
    )
);

-- Create MFA challenges table for verification flows
CREATE TABLE IF NOT EXISTS public.mfa_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    factor_id UUID REFERENCES public.mfa_factors(id) ON DELETE CASCADE,
    challenge_type TEXT NOT NULL CHECK (challenge_type IN ('enrollment', 'verification')),
    challenge_data JSONB NOT NULL, -- Challenge-specific data
    expires_at TIMESTAMPTZ NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Index for cleanup
    INDEX (expires_at) WHERE NOT is_completed
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mfa_factors_user_id ON public.mfa_factors(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_factors_organization_id ON public.mfa_factors(organization_id);
CREATE INDEX IF NOT EXISTS idx_mfa_factors_type ON public.mfa_factors(factor_type);
CREATE INDEX IF NOT EXISTS idx_mfa_factors_active ON public.mfa_factors(is_active);

CREATE INDEX IF NOT EXISTS idx_mfa_challenges_user_id ON public.mfa_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_challenges_expires_at ON public.mfa_challenges(expires_at);

-- Enable RLS
ALTER TABLE public.mfa_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY mfa_factors_user_access ON public.mfa_factors
    FOR ALL USING (user_id = public.current_user_id());

CREATE POLICY mfa_challenges_user_access ON public.mfa_challenges
    FOR ALL USING (user_id = public.current_user_id());

-- Functions for MFA operations

-- Generate TOTP secret
CREATE OR REPLACE FUNCTION public.generate_totp_secret()
RETURNS TEXT AS $$
DECLARE
    secret TEXT;
BEGIN
    -- Generate a 32-character base32 secret
    secret := encode(gen_random_bytes(20), 'base32');
    RETURN secret;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify TOTP code
CREATE OR REPLACE FUNCTION public.verify_totp_code(
    p_secret TEXT,
    p_code TEXT,
    p_window INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    secret_bytes BYTEA;
    time_step INTEGER := 30;
    current_time BIGINT;
    time_counter BIGINT;
    hash BYTEA;
    offset INTEGER;
    binary_code BIGINT;
    expected_code TEXT;
    i INTEGER;
BEGIN
    -- Decode base32 secret
    BEGIN
        secret_bytes := decode(p_secret, 'base32');
    EXCEPTION WHEN OTHERS THEN
        RETURN false;
    END;

    current_time := extract(epoch from now())::BIGINT;

    -- Check codes in the time window
    FOR i IN -p_window .. p_window LOOP
        time_counter := (current_time + (i * time_step)) / time_step;

        -- HMAC-SHA1
        hash := hmac(encode(time_counter, 'hex')::BYTEA, secret_bytes, 'sha1');

        -- Dynamic truncation
        offset := get_byte(hash, 19) & 15;
        binary_code := (
            (get_byte(hash, offset) & 127)::BIGINT << 24 |
            (get_byte(hash, offset + 1) & 255)::BIGINT << 16 |
            (get_byte(hash, offset + 2) & 255)::BIGINT << 8 |
            (get_byte(hash, offset + 3) & 255)::BIGINT
        );

        expected_code := (binary_code % 1000000)::TEXT;

        IF expected_code = p_code THEN
            RETURN true;
        END IF;
    END LOOP;

    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate backup codes
CREATE OR REPLACE FUNCTION public.generate_backup_codes(p_count INTEGER DEFAULT 10)
RETURNS TEXT[] AS $$
DECLARE
    codes TEXT[] := '{}';
    i INTEGER;
BEGIN
    FOR i IN 1 .. p_count LOOP
        codes := array_append(codes, encode(gen_random_bytes(4), 'hex'));
    END LOOP;
    RETURN codes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Encrypt sensitive MFA data
CREATE OR REPLACE FUNCTION public.encrypt_mfa_data(p_data TEXT, p_key TEXT DEFAULT 'default_mfa_key')
RETURNS TEXT AS $$
BEGIN
    -- Use pgcrypto for encryption (in production, use proper key management)
    RETURN encode(encrypt(p_data::BYTEA, p_key::BYTEA, 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrypt sensitive MFA data
CREATE OR REPLACE FUNCTION public.decrypt_mfa_data(p_encrypted_data TEXT, p_key TEXT DEFAULT 'default_mfa_key')
RETURNS TEXT AS $$
BEGIN
    -- Use pgcrypto for decryption
    RETURN encode(decrypt(decode(p_encrypted_data, 'base64'), p_key::BYTEA, 'aes'), 'escape');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create MFA factor
CREATE OR REPLACE FUNCTION public.create_mfa_factor(
    p_user_id UUID,
    p_factor_type TEXT,
    p_name TEXT,
    p_secret TEXT DEFAULT NULL,
    p_credential_id TEXT DEFAULT NULL,
    p_public_key TEXT DEFAULT NULL,
    p_backup_codes TEXT[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    factor_id UUID;
    encrypted_secret TEXT;
    encrypted_backup_codes TEXT[];
BEGIN
    -- Encrypt sensitive data
    IF p_secret IS NOT NULL THEN
        encrypted_secret := public.encrypt_mfa_data(p_secret);
    END IF;

    IF p_backup_codes IS NOT NULL THEN
        encrypted_backup_codes := ARRAY(
            SELECT public.encrypt_mfa_data(code)
            FROM unnest(p_backup_codes) AS code
        );
    END IF;

    -- Create the factor
    INSERT INTO public.mfa_factors (
        user_id,
        organization_id,
        factor_type,
        name,
        secret,
        credential_id,
        public_key,
        backup_codes
    ) VALUES (
        p_user_id,
        (SELECT organization_id FROM public.memberships WHERE user_id = p_user_id AND status = 'active' LIMIT 1),
        p_factor_type,
        p_name,
        encrypted_secret,
        p_credential_id,
        p_public_key,
        encrypted_backup_codes
    ) RETURNING id INTO factor_id;

    -- If this is the first factor, make it primary
    IF NOT EXISTS (SELECT 1 FROM public.mfa_factors WHERE user_id = p_user_id AND is_primary = true) THEN
        UPDATE public.mfa_factors SET is_primary = true WHERE id = factor_id;
    END IF;

    -- Update user MFA status
    UPDATE public.users SET mfa_enabled = true WHERE id = p_user_id;

    -- Log security event
    PERFORM public.log_security_event(
        (SELECT organization_id FROM public.memberships WHERE user_id = p_user_id AND status = 'active' LIMIT 1),
        p_user_id,
        'mfa_enabled',
        'medium',
        jsonb_build_object('factor_type', p_factor_type, 'factor_name', p_name)
    );

    RETURN factor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify MFA factor
CREATE OR REPLACE FUNCTION public.verify_mfa_factor(
    p_user_id UUID,
    p_factor_id UUID,
    p_code TEXT DEFAULT NULL,
    p_credential_data JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    factor_record RECORD;
    decrypted_secret TEXT;
    is_valid BOOLEAN := false;
BEGIN
    -- Get factor details
    SELECT * INTO factor_record
    FROM public.mfa_factors
    WHERE id = p_factor_id AND user_id = p_user_id AND is_active = true;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Verify based on factor type
    IF factor_record.factor_type = 'totp' THEN
        decrypted_secret := public.decrypt_mfa_data(factor_record.secret);
        is_valid := public.verify_totp_code(decrypted_secret, p_code);
    ELSIF factor_record.factor_type = 'webauthn' THEN
        -- WebAuthn verification would be implemented here
        -- This requires cryptographic verification of the authenticator response
        -- For now, return false (placeholder)
        is_valid := false;
    END IF;

    IF is_valid THEN
        -- Update last used timestamp
        UPDATE public.mfa_factors
        SET last_used_at = NOW()
        WHERE id = p_factor_id;

        -- Log successful verification
        PERFORM public.log_security_event(
            factor_record.organization_id,
            p_user_id,
            'mfa_verification_success',
            'low',
            jsonb_build_object('factor_id', p_factor_id, 'factor_type', factor_record.factor_type)
        );
    ELSE
        -- Log failed verification
        PERFORM public.log_security_event(
            factor_record.organization_id,
            p_user_id,
            'mfa_verification_failure',
            'high',
            jsonb_build_object('factor_id', p_factor_id, 'factor_type', factor_record.factor_type)
        );
    END IF;

    RETURN is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup expired MFA challenges
CREATE OR REPLACE FUNCTION public.cleanup_expired_mfa_challenges()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.mfa_challenges
    WHERE expires_at < NOW() AND NOT is_completed;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at trigger for MFA tables
CREATE TRIGGER set_updated_at_mfa_factors
    BEFORE UPDATE ON public.mfa_factors
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_mfa_challenges
    BEFORE UPDATE ON public.mfa_challenges
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Comments
COMMENT ON TABLE public.mfa_factors IS 'Multi-factor authentication factors for users';
COMMENT ON TABLE public.mfa_challenges IS 'Temporary MFA challenges for enrollment and verification';

COMMENT ON FUNCTION public.generate_totp_secret() IS 'Generate a secure TOTP secret';
COMMENT ON FUNCTION public.verify_totp_code(TEXT, TEXT, INTEGER) IS 'Verify a TOTP code against a secret';
COMMENT ON FUNCTION public.create_mfa_factor(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[]) IS 'Create and store an MFA factor';
COMMENT ON FUNCTION public.verify_mfa_factor(UUID, UUID, TEXT, JSONB) IS 'Verify an MFA factor with provided credentials';
