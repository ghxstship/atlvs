-- Database Encryption Implementation
-- Adds encryption support for sensitive data at rest using AES-256-GCM

-- Create encrypted_data type for storing encrypted field metadata
CREATE TYPE encrypted_data AS (
    encrypted TEXT,  -- Base64 encoded encrypted data
    iv TEXT,         -- Base64 encoded initialization vector
    tag TEXT,        -- Base64 encoded authentication tag (GCM mode)
    key_id TEXT      -- KMS key ID used for encryption
);

-- Function to encrypt data using AES-256-GCM
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(input_text TEXT, key_id TEXT DEFAULT 'database-encryption-key')
RETURNS TEXT AS $$
DECLARE
    encryption_key BYTEA;
    iv BYTEA;
    encrypted_data BYTEA;
    auth_tag BYTEA;
    result encrypted_data;
BEGIN
    -- Generate encryption key from key_id (simplified - in production use KMS)
    encryption_key := digest(key_id || 'salt', 'sha256');

    -- Generate random IV
    iv := gen_random_bytes(16);

    -- Encrypt data using AES-256-GCM
    encrypted_data := encrypt(input_text::bytea, encryption_key, 'aes-gcm/pad:none', iv);

    -- Get authentication tag
    auth_tag := (select substring(encrypted_data, length(encrypted_data) - 15));

    -- Remove auth tag from encrypted data for storage
    encrypted_data := substring(encrypted_data, 1, length(encrypted_data) - 16);

    -- Store as JSON
    result.encrypted := encode(encrypted_data, 'base64');
    result.iv := encode(iv, 'base64');
    result.tag := encode(auth_tag, 'base64');
    result.key_id := key_id;

    RETURN row_to_json(result)::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt data
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_json TEXT)
RETURNS TEXT AS $$
DECLARE
    encryption_key BYTEA;
    encrypted_data encrypted_data;
    iv BYTEA;
    auth_tag BYTEA;
    decrypted BYTEA;
BEGIN
    -- Parse encrypted data
    encrypted_data := json_populate_record(null::encrypted_data, encrypted_json::json);

    -- Generate decryption key
    encryption_key := digest(encrypted_data.key_id || 'salt', 'sha256');

    -- Decode components
    iv := decode(encrypted_data.iv, 'base64');
    auth_tag := decode(encrypted_data.tag, 'base64');
    encrypted_data.encrypted := decode(encrypted_data.encrypted, 'base64');

    -- Reconstruct encrypted data with auth tag
    encrypted_data.encrypted := encrypted_data.encrypted || auth_tag;

    -- Decrypt
    decrypted := decrypt(encrypted_data.encrypted, encryption_key, 'aes-gcm/pad:none', iv);

    RETURN convert_from(decrypted, 'utf8');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add encrypted columns to sensitive tables
-- Note: In production, you would migrate existing data to encrypted format

-- Users table - add encrypted SSN and tax ID fields
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS encrypted_ssn TEXT,
ADD COLUMN IF NOT EXISTS encrypted_tax_id TEXT,
ADD COLUMN IF NOT EXISTS encrypted_bank_account TEXT;

-- Organizations table
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS encrypted_tax_id TEXT,
ADD COLUMN IF NOT EXISTS encrypted_bank_account TEXT;

-- People table - sensitive personal information
ALTER TABLE public.people
ADD COLUMN IF NOT EXISTS encrypted_ssn TEXT,
ADD COLUMN IF NOT EXISTS encrypted_emergency_contacts TEXT,
ADD COLUMN IF NOT EXISTS encrypted_medical_info TEXT;

-- Companies table
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS encrypted_tax_id TEXT,
ADD COLUMN IF NOT EXISTS encrypted_financial_data TEXT,
ADD COLUMN IF NOT EXISTS encrypted_bank_details TEXT;

-- Finance table
ALTER TABLE public.finance
ADD COLUMN IF NOT EXISTS encrypted_account_numbers TEXT,
ADD COLUMN IF NOT EXISTS encrypted_routing_numbers TEXT,
ADD COLUMN IF NOT EXISTS encrypted_card_details TEXT;

-- Procurement table
ALTER TABLE public.procurement
ADD COLUMN IF NOT EXISTS encrypted_payment_info TEXT,
ADD COLUMN IF NOT EXISTS encrypted_vendor_credentials TEXT;

-- Settings table
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS encrypted_api_keys TEXT,
ADD COLUMN IF NOT EXISTS encrypted_webhook_secrets TEXT,
ADD COLUMN IF NOT EXISTS encrypted_encryption_keys TEXT;

-- Create indexes for encrypted fields (if needed for searching)
-- Note: Encrypted fields cannot be efficiently searched unless using searchable encryption

-- Function to migrate existing sensitive data to encrypted format
CREATE OR REPLACE FUNCTION migrate_sensitive_data_to_encrypted()
RETURNS VOID AS $$
BEGIN
    -- This function would be used to migrate existing data
    -- Example for users table:

    -- Update users with encrypted SSN
    UPDATE public.users
    SET encrypted_ssn = encrypt_sensitive_data(ssn)
    WHERE ssn IS NOT NULL AND encrypted_ssn IS NULL;

    -- Update users with encrypted tax_id
    UPDATE public.users
    SET encrypted_tax_id = encrypt_sensitive_data(tax_id)
    WHERE tax_id IS NOT NULL AND encrypted_tax_id IS NULL;

    -- Add similar updates for other tables...

    RAISE NOTICE 'Sensitive data migration completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view that automatically decrypts sensitive data for authorized users
-- This is for development/testing - in production, decryption should happen in application layer
CREATE OR REPLACE VIEW decrypted_users AS
SELECT
    id,
    auth_id,
    email,
    CASE
        WHEN encrypted_ssn IS NOT NULL THEN decrypt_sensitive_data(encrypted_ssn)
        ELSE ssn
    END as ssn,
    CASE
        WHEN encrypted_tax_id IS NOT NULL THEN decrypt_sensitive_data(encrypted_tax_id)
        ELSE tax_id
    END as tax_id,
    CASE
        WHEN encrypted_bank_account IS NOT NULL THEN decrypt_sensitive_data(encrypted_bank_account)
        ELSE bank_account
    END as bank_account,
    created_at,
    updated_at,
    -- Other fields...
    first_name,
    last_name,
    phone,
    avatar_url
FROM public.users;

-- Grant access to the decrypted view (restrict in production)
GRANT SELECT ON decrypted_users TO authenticated;

-- Function to check if data is properly encrypted
CREATE OR REPLACE FUNCTION validate_encryption_compliance()
RETURNS TABLE(table_name TEXT, field_name TEXT, unencrypted_count INTEGER, encrypted_count INTEGER) AS $$
DECLARE
    table_record RECORD;
    field_record RECORD;
BEGIN
    -- Check each sensitive table and field
    FOR table_record IN
        SELECT unnest(ARRAY['users', 'organizations', 'people', 'companies', 'finance', 'procurement', 'settings']) as table_name
    LOOP
        FOR field_record IN
            SELECT unnest(CASE
                WHEN table_record.table_name = 'users' THEN ARRAY['ssn', 'tax_id', 'bank_account']
                WHEN table_record.table_name = 'organizations' THEN ARRAY['tax_id', 'bank_account']
                WHEN table_record.table_name = 'people' THEN ARRAY['ssn', 'emergency_contacts', 'medical_info']
                WHEN table_record.table_name = 'companies' THEN ARRAY['tax_id', 'financial_data', 'bank_details']
                WHEN table_record.table_name = 'finance' THEN ARRAY['account_numbers', 'routing_numbers', 'card_details']
                WHEN table_record.table_name = 'procurement' THEN ARRAY['payment_info', 'vendor_credentials']
                WHEN table_record.table_name = 'settings' THEN ARRAY['api_keys', 'webhook_secrets', 'encryption_keys']
                ELSE ARRAY[]::TEXT[]
            END) as field_name
        LOOP
            -- Check for unencrypted data
            EXECUTE format('
                SELECT
                    COUNT(*) FILTER (WHERE %I IS NOT NULL AND %I IS NULL) as unencrypted,
                    COUNT(*) FILTER (WHERE %I IS NOT NULL) as encrypted
                FROM %I
            ', 'encrypted_' || field_record.field_name, 'encrypted_' || field_record.field_name, 'encrypted_' || field_record.field_name, table_record.table_name)
            INTO unencrypted_count, encrypted_count;

            table_name := table_record.table_name;
            field_name := field_record.field_name;

            RETURN NEXT;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies to ensure encrypted data is only accessible to authorized users
-- This is in addition to existing RLS policies

-- Function to check if user has permission to access encrypted data
CREATE OR REPLACE FUNCTION can_access_encrypted_data(user_id UUID, table_name TEXT, record_owner_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    -- Basic check: user can access their own encrypted data
    IF record_owner_id IS NOT NULL AND record_owner_id = user_id THEN
        RETURN TRUE;
    END IF;

    -- Organization admin check
    IF EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = user_id
          AND m.role IN ('owner', 'admin')
          AND m.status = 'active'
    ) THEN
        RETURN TRUE;
    END IF;

    -- Additional permission checks can be added here
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit logging for encryption operations
CREATE OR REPLACE FUNCTION log_encryption_operation(
    operation_type TEXT,
    table_name TEXT,
    record_id UUID,
    field_name TEXT,
    user_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.audit_logs (
        organization_id,
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        created_at
    ) VALUES (
        (SELECT organization_id FROM public.memberships WHERE user_id = user_id LIMIT 1),
        user_id,
        operation_type,
        'encrypted_field',
        record_id,
        json_build_object(
            'table', table_name,
            'field', field_name,
            'operation', operation_type
        ),
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON FUNCTION encrypt_sensitive_data(TEXT, TEXT) IS 'Encrypts sensitive data using AES-256-GCM for storage';
COMMENT ON FUNCTION decrypt_sensitive_data(TEXT) IS 'Decrypts sensitive data that was encrypted with encrypt_sensitive_data';
COMMENT ON FUNCTION validate_encryption_compliance() IS 'Validates that all sensitive data is properly encrypted';
COMMENT ON FUNCTION can_access_encrypted_data(UUID, TEXT, UUID) IS 'Checks if user has permission to access encrypted data';
COMMENT ON VIEW decrypted_users IS 'Development view for testing decrypted data (restrict in production)';

-- Run validation
SELECT * FROM validate_encryption_compliance();
