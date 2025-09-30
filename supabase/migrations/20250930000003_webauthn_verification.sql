-- Verify MFA factor with WebAuthn support
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
    credential_id TEXT;
    authenticator_data BYTEA;
    client_data_json BYTEA;
    signature BYTEA;
    public_key_spki BYTEA;
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
        -- WebAuthn verification
        IF p_credential_data IS NULL THEN
            RETURN false;
        END IF;

        -- Extract WebAuthn data
        credential_id := p_credential_data->>'id';
        authenticator_data := decode(p_credential_data->'response'->>'authenticatorData', 'base64');
        client_data_json := decode(p_credential_data->'response'->>'clientDataJSON', 'base64');
        signature := decode(p_credential_data->'response'->>'signature', 'base64');
        public_key_spki := decode(factor_record.public_key, 'base64');

        -- Verify credential ID matches
        IF credential_id != factor_record.credential_id THEN
            RETURN false;
        END IF;

        -- Basic WebAuthn verification (simplified - in production use @simplewebauthn/server)
        -- This is a placeholder implementation. In production, use a proper WebAuthn library
        -- that handles all the cryptographic verification steps:
        -- 1. Verify clientDataJSON hash
        -- 2. Verify authenticator data
        -- 3. Verify signature with public key
        -- 4. Check user presence/verification flags
        -- 5. Validate counter (prevent replay attacks)

        -- For now, do basic checks
        IF length(authenticator_data) < 37 THEN
            RETURN false;
        END IF;

        -- Check user present flag (bit 0 of flags byte at position 32)
        IF get_byte(authenticator_data, 32) & 1 = 0 THEN
            RETURN false;
        END IF;

        -- Placeholder: In production, implement full WebAuthn verification
        -- using a library like @simplewebauthn/server
        is_valid := true; -- This should be replaced with actual cryptographic verification

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
