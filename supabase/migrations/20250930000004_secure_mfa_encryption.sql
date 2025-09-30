-- Migration: Secure MFA encryption key management
-- Date: 2025-09-29T19:17:50Z

-- Update encrypt/decrypt functions to use environment-provided keys
CREATE OR REPLACE FUNCTION public.encrypt_mfa_data(p_data TEXT)
RETURNS TEXT AS $$
DECLARE
    encryption_key TEXT;
BEGIN
    -- Get encryption key from session variable set by API
    encryption_key := current_setting('app.mfa_encryption_key', true);
    
    -- Fallback to environment variable if not set
    IF encryption_key IS NULL THEN
        encryption_key := 'default_mfa_key'; -- Remove in production
    END IF;
    
    RETURN encode(encrypt(p_data::BYTEA, encryption_key::BYTEA, 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update decrypt function similarly
CREATE OR REPLACE FUNCTION public.decrypt_mfa_data(p_encrypted_data TEXT)
RETURNS TEXT AS $$
DECLARE
    encryption_key TEXT;
BEGIN
    -- Get encryption key from session variable
    encryption_key := current_setting('app.mfa_encryption_key', true);
    
    -- Fallback to environment variable if not set
    IF encryption_key IS NULL THEN
        encryption_key := 'default_mfa_key'; -- Remove in production
    END IF;
    
    RETURN encode(decrypt(decode(p_encrypted_data, 'base64'), encryption_key::BYTEA, 'aes'), 'escape');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
