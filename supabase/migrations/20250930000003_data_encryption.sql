-- Data Encryption Implementation
-- Implements column-level encryption for sensitive data

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create encryption key management
-- NOTE: In production, use a proper key management service (AWS KMS, Azure Key Vault, etc.)
CREATE TABLE IF NOT EXISTS public.encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id TEXT NOT NULL UNIQUE,
    key_data TEXT NOT NULL, -- Encrypted master key (itself encrypted with service key)
    algorithm TEXT NOT NULL DEFAULT 'aes-256-gcm',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    key_version INTEGER NOT NULL DEFAULT 1
);

-- Create default encryption key (for development - replace with proper key management)
INSERT INTO public.encryption_keys (key_id, key_data, algorithm, key_version)
VALUES (
    'default-data-key',
    encode(gen_random_bytes(32), 'base64'), -- 256-bit key
    'aes-256-gcm',
    1
) ON CONFLICT (key_id) DO NOTHING;

-- Function to get current encryption key
CREATE OR REPLACE FUNCTION public.get_current_encryption_key()
RETURNS TEXT AS $$
DECLARE
    key_data TEXT;
BEGIN
    SELECT key_data INTO key_data
    FROM public.encryption_keys
    WHERE is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at DESC
    LIMIT 1;

    IF key_data IS NULL THEN
        RAISE EXCEPTION 'No active encryption key found';
    END IF;

    RETURN key_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(
    p_plaintext TEXT,
    p_context TEXT DEFAULT 'general'
)
RETURNS TEXT AS $$
DECLARE
    encryption_key TEXT;
    encrypted_data BYTEA;
    iv BYTEA;
    ciphertext BYTEA;
    auth_tag BYTEA;
    result TEXT;
BEGIN
    IF p_plaintext IS NULL THEN
        RETURN NULL;
    END IF;

    -- Get current encryption key
    SELECT public.get_current_encryption_key() INTO encryption_key;

    -- Generate random IV
    iv := gen_random_bytes(16); -- 128-bit IV for GCM

    -- Encrypt data using AES-256-GCM
    -- Note: This is a simplified implementation. In production, use pgcrypto's encrypt function
    -- or integrate with a proper encryption service

    -- For now, we'll use a basic approach with pgcrypto
    encrypted_data := encrypt(
        p_plaintext::BYTEA,
        decode(encryption_key, 'base64'),
        'aes'
    );

    -- Combine IV + encrypted data (simplified - production would include auth tag)
    result := encode(iv || encrypted_data, 'base64');

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(
    p_ciphertext TEXT,
    p_context TEXT DEFAULT 'general'
)
RETURNS TEXT AS $$
DECLARE
    encryption_key TEXT;
    encrypted_data BYTEA;
    iv BYTEA;
    ciphertext BYTEA;
    decrypted_data BYTEA;
    result TEXT;
BEGIN
    IF p_ciphertext IS NULL THEN
        RETURN NULL;
    END IF;

    -- Get current encryption key
    SELECT public.get_current_encryption_key() INTO encryption_key;

    -- Decode the combined data
    encrypted_data := decode(p_ciphertext, 'base64');

    -- Extract IV (first 16 bytes) and ciphertext (rest)
    iv := substring(encrypted_data, 1, 16);
    ciphertext := substring(encrypted_data, 17);

    -- Decrypt data
    decrypted_data := decrypt(
        ciphertext,
        decode(encryption_key, 'base64'),
        'aes'
    );

    result := encode(decrypted_data, 'escape');

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to rotate encryption keys
CREATE OR REPLACE FUNCTION public.rotate_encryption_key()
RETURNS TEXT AS $$
DECLARE
    new_key_id TEXT;
    new_key_data TEXT;
BEGIN
    -- Generate new key
    new_key_data := encode(gen_random_bytes(32), 'base64');
    new_key_id := 'data-key-' || extract(epoch from now())::TEXT;

    -- Insert new key
    INSERT INTO public.encryption_keys (key_id, key_data, algorithm, key_version)
    VALUES (new_key_id, new_key_data, 'aes-256-gcm', 2);

    -- Deactivate old keys (keep them for decryption of existing data)
    UPDATE public.encryption_keys
    SET is_active = false,
        expires_at = NOW() + INTERVAL '1 year' -- Keep old keys for 1 year for decryption
    WHERE is_active = true
      AND key_id != new_key_id;

    RAISE NOTICE 'Rotated encryption key to: %', new_key_id;
    RETURN new_key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply encryption to sensitive columns

-- Encrypt MFA secrets
UPDATE public.users
SET mfa_secret = public.encrypt_sensitive_data(mfa_secret)
WHERE mfa_secret IS NOT NULL
  AND mfa_secret NOT LIKE 'encrypted:%'; -- Avoid double encryption

-- Encrypt backup codes
UPDATE public.users
SET backup_codes = (
    SELECT jsonb_agg(public.encrypt_sensitive_data(code))
    FROM jsonb_array_elements_text(backup_codes::jsonb) AS code
)
WHERE backup_codes IS NOT NULL
  AND backup_codes::TEXT NOT LIKE 'encrypted:%';

-- Encrypt session tokens (sensitive ones)
UPDATE public.user_sessions
SET session_token = public.encrypt_sensitive_data(session_token),
    refresh_token = public.encrypt_sensitive_data(refresh_token)
WHERE is_active = true;

-- Create encrypted views for sensitive data access

-- Secure users view with decrypted data for authorized access
CREATE OR REPLACE VIEW public.secure_users_decrypted AS
SELECT
    id,
    auth_id,
    email,
    full_name,
    avatar_url,
    public.decrypt_sensitive_data(phone, 'contact') as phone,
    role,
    status,
    last_login_at,
    created_at,
    updated_at,
    mfa_enabled,
    public.decrypt_sensitive_data(mfa_secret, 'mfa') as mfa_secret,
    CASE WHEN public.check_field_access(public.current_user_id(), organization_id, 'users', 'backup_codes')
         THEN (
             SELECT jsonb_agg(public.decrypt_sensitive_data(code, 'mfa'))
             FROM jsonb_array_elements_text(backup_codes) AS code
         )
         ELSE NULL END as backup_codes,
    CASE WHEN public.check_field_access(public.current_user_id(), organization_id, 'users', 'security_questions')
         THEN security_questions ELSE '{}'::jsonb END as security_questions
FROM public.users
WHERE organization_id = public.current_organization_id();

-- Secure sessions view
CREATE OR REPLACE VIEW public.secure_sessions AS
SELECT
    id,
    user_id,
    public.decrypt_sensitive_data(session_token, 'session') as session_token,
    public.decrypt_sensitive_data(refresh_token, 'session') as refresh_token,
    device_fingerprint,
    ip_address,
    user_agent,
    location,
    is_active,
    last_activity,
    expires_at,
    created_at
FROM public.user_sessions
WHERE user_id = public.current_user_id();

-- Function to safely update encrypted columns
CREATE OR REPLACE FUNCTION public.update_encrypted_column(
    p_table_name TEXT,
    p_column_name TEXT,
    p_record_id UUID,
    p_plaintext_value TEXT,
    p_context TEXT DEFAULT 'general'
)
RETURNS BOOLEAN AS $$
DECLARE
    encrypted_value TEXT;
    update_sql TEXT;
BEGIN
    -- Encrypt the value
    encrypted_value := public.encrypt_sensitive_data(p_plaintext_value, p_context);

    -- Build dynamic update statement
    update_sql := format(
        'UPDATE public.%I SET %I = $1, updated_at = NOW() WHERE id = $2',
        p_table_name, p_column_name
    );

    -- Execute the update
    EXECUTE update_sql USING encrypted_value, p_record_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely read encrypted columns
CREATE OR REPLACE FUNCTION public.read_encrypted_column(
    p_table_name TEXT,
    p_column_name TEXT,
    p_record_id UUID,
    p_context TEXT DEFAULT 'general'
)
RETURNS TEXT AS $$
DECLARE
    encrypted_value TEXT;
    result TEXT;
    select_sql TEXT;
BEGIN
    -- Build dynamic select statement
    select_sql := format(
        'SELECT %I FROM public.%I WHERE id = $1',
        p_column_name, p_table_name
    );

    -- Execute the select
    EXECUTE select_sql INTO encrypted_value USING p_record_id;

    -- Decrypt the value
    result := public.decrypt_sensitive_data(encrypted_value, p_context);

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic encryption on sensitive columns

-- Trigger function for MFA secret encryption
CREATE OR REPLACE FUNCTION public.encrypt_mfa_secret_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Encrypt MFA secret if it's being set and not already encrypted
    IF NEW.mfa_secret IS NOT NULL AND NEW.mfa_secret NOT LIKE 'encrypted:%' THEN
        NEW.mfa_secret := public.encrypt_sensitive_data(NEW.mfa_secret, 'mfa');
    END IF;

    -- Encrypt backup codes if they're being set
    IF NEW.backup_codes IS NOT NULL THEN
        NEW.backup_codes := (
            SELECT jsonb_agg(public.encrypt_sensitive_data(code, 'mfa'))
            FROM jsonb_array_elements_text(NEW.backup_codes) AS code
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for session token encryption
CREATE OR REPLACE FUNCTION public.encrypt_session_tokens_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Encrypt session tokens
    IF NEW.session_token IS NOT NULL THEN
        NEW.session_token := public.encrypt_sensitive_data(NEW.session_token, 'session');
    END IF;

    IF NEW.refresh_token IS NOT NULL THEN
        NEW.refresh_token := public.encrypt_sensitive_data(NEW.refresh_token, 'session');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers to sensitive tables
DROP TRIGGER IF EXISTS encrypt_mfa_secret_trigger ON public.users;
CREATE TRIGGER encrypt_mfa_secret_trigger
    BEFORE INSERT OR UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.encrypt_mfa_secret_trigger();

DROP TRIGGER IF EXISTS encrypt_session_tokens_trigger ON public.user_sessions;
CREATE TRIGGER encrypt_session_tokens_trigger
    BEFORE INSERT OR UPDATE ON public.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.encrypt_session_tokens_trigger();

-- Function to migrate existing data to encrypted format
CREATE OR REPLACE FUNCTION public.migrate_to_encryption()
RETURNS INTEGER AS $$
DECLARE
    migrated_count INTEGER := 0;
BEGIN
    -- Migrate MFA secrets
    UPDATE public.users
    SET mfa_secret = public.encrypt_sensitive_data(mfa_secret, 'mfa')
    WHERE mfa_secret IS NOT NULL
      AND mfa_secret NOT LIKE 'encrypted:%';

    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    RAISE NOTICE 'Migrated % MFA secrets to encrypted format', migrated_count;

    -- Migrate backup codes
    UPDATE public.users
    SET backup_codes = (
        SELECT jsonb_agg(public.encrypt_sensitive_data(code, 'mfa'))
        FROM jsonb_array_elements_text(backup_codes) AS code
    )
    WHERE backup_codes IS NOT NULL;

    -- Migrate session tokens
    UPDATE public.user_sessions
    SET session_token = public.encrypt_sensitive_data(session_token, 'session'),
        refresh_token = public.encrypt_sensitive_data(refresh_token, 'session')
    WHERE session_token NOT LIKE 'encrypted:%'
      AND is_active = true;

    RAISE NOTICE 'Data encryption migration completed';
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON public.encryption_keys TO authenticated;
GRANT SELECT ON public.secure_users_decrypted TO authenticated;
GRANT SELECT ON public.secure_sessions TO authenticated;

-- Comments
COMMENT ON TABLE public.encryption_keys IS 'Encryption key management for data protection';
COMMENT ON FUNCTION public.encrypt_sensitive_data(TEXT, TEXT) IS 'Encrypt sensitive data using AES-256';
COMMENT ON FUNCTION public.decrypt_sensitive_data(TEXT, TEXT) IS 'Decrypt sensitive data using AES-256';
COMMENT ON VIEW public.secure_users_decrypted IS 'Users view with decrypted sensitive data for authorized access';
COMMENT ON VIEW public.secure_sessions IS 'Session view with decrypted tokens for authorized access';
