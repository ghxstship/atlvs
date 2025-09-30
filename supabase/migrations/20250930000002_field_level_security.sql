-- Field-Level Security Implementation
-- Implements column-level access control for sensitive data

-- Function to check if user has permission to access a specific field
CREATE OR REPLACE FUNCTION public.check_field_access(
    p_user_id UUID,
    p_organization_id UUID,
    p_table_name TEXT,
    p_column_name TEXT,
    p_access_type TEXT DEFAULT 'read' -- 'read', 'write', 'update'
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    field_sensitivity TEXT;
BEGIN
    -- Get user role
    SELECT role INTO user_role
    FROM public.memberships
    WHERE user_id = p_user_id
      AND organization_id = p_organization_id
      AND status = 'active'
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Get field sensitivity level
    SELECT classification_level INTO field_sensitivity
    FROM public.data_classification
    WHERE table_name = p_table_name
      AND column_name = p_column_name;

    -- Default to 'internal' if not classified
    field_sensitivity := COALESCE(field_sensitivity, 'internal');

    -- Check access based on role and sensitivity
    CASE field_sensitivity
        WHEN 'public' THEN
            RETURN true; -- Everyone can access public fields
        WHEN 'internal' THEN
            -- All authenticated users can access internal fields
            RETURN user_role IN ('owner', 'admin', 'manager', 'producer', 'member');
        WHEN 'confidential' THEN
            -- Only privileged users can access confidential fields
            RETURN user_role IN ('owner', 'admin', 'manager');
        WHEN 'restricted' THEN
            -- Only owners and admins can access restricted fields
            RETURN user_role IN ('owner', 'admin');
        ELSE
            -- Deny access for unknown classifications
            RETURN false;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mask sensitive fields based on user permissions
CREATE OR REPLACE FUNCTION public.mask_sensitive_field(
    p_value TEXT,
    p_user_id UUID,
    p_organization_id UUID,
    p_table_name TEXT,
    p_column_name TEXT
)
RETURNS TEXT AS $$
BEGIN
    -- Check if user has access to this field
    IF public.check_field_access(p_user_id, p_organization_id, p_table_name, p_column_name) THEN
        RETURN p_value; -- Return actual value
    ELSE
        -- Return masked value based on field type
        CASE p_column_name
            WHEN 'email', 'phone', 'address' THEN
                RETURN '[REDACTED]';
            WHEN 'ssn', 'tax_id', 'passport_number' THEN
                RETURN '***-**-****';
            WHEN 'salary', 'compensation', 'bonus' THEN
                RETURN '$***.***';
            WHEN 'bank_account', 'credit_card' THEN
                RETURN '****-****-****-****';
            WHEN 'password', 'secret', 'token', 'key' THEN
                RETURN '***HIDDEN***';
            ELSE
                RETURN '[REDACTED]';
        END CASE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create views with field-level security for sensitive tables

-- Secure view for users table (masks sensitive fields)
CREATE OR REPLACE VIEW public.secure_users AS
SELECT
    id,
    auth_id,
    public.mask_sensitive_field(email, public.current_user_id(), organization_id, 'users', 'email') as email,
    full_name,
    avatar_url,
    public.mask_sensitive_field(phone, public.current_user_id(), organization_id, 'users', 'phone') as phone,
    role,
    status,
    last_login_at,
    created_at,
    updated_at,
    -- Only show MFA status, not secrets
    mfa_enabled,
    -- Hide sensitive fields completely
    CASE WHEN public.check_field_access(public.current_user_id(), organization_id, 'users', 'backup_codes')
         THEN backup_codes ELSE NULL END as backup_codes,
    CASE WHEN public.check_field_access(public.current_user_id(), organization_id, 'users', 'security_questions')
         THEN security_questions ELSE '{}'::jsonb END as security_questions
FROM public.users
WHERE organization_id = public.current_organization_id();

-- Secure view for people table (masks PII)
CREATE OR REPLACE VIEW public.secure_people AS
SELECT
    id,
    organization_id,
    public.mask_sensitive_field(email, public.current_user_id(), organization_id, 'people', 'email') as email,
    full_name,
    job_title,
    department,
    public.mask_sensitive_field(phone, public.current_user_id(), organization_id, 'people', 'phone') as phone,
    hire_date,
    status,
    created_at,
    updated_at
FROM public.people
WHERE organization_id = public.current_organization_id();

-- Secure view for finance data
CREATE OR REPLACE VIEW public.secure_finance_transactions AS
SELECT
    id,
    organization_id,
    account_id,
    public.mask_sensitive_field(amount::text, public.current_user_id(), organization_id, 'finance_transactions', 'amount') as amount,
    currency,
    description,
    transaction_date,
    transaction_type,
    status,
    created_at
FROM public.finance_transactions
WHERE organization_id = public.current_organization_id();

-- Function to create dynamic field-level policies
CREATE OR REPLACE FUNCTION public.create_field_level_policy(
    p_table_name TEXT,
    p_policy_name TEXT DEFAULT 'field_level_security'
)
RETURNS BOOLEAN AS $$
DECLARE
    policy_exists BOOLEAN;
    policy_sql TEXT;
BEGIN
    -- Check if policy already exists
    SELECT EXISTS(
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = p_table_name
          AND policyname = p_policy_name
    ) INTO policy_exists;

    IF policy_exists THEN
        RETURN false;
    END IF;

    -- Create policy SQL - this is a template, actual policies need to be customized per table
    policy_sql := format('
        CREATE POLICY %I ON public.%I
        FOR SELECT USING (
            -- Base tenant isolation
            organization_id = public.current_organization_id()
            -- Additional field-level checks would be added here
        )', p_policy_name, p_table_name);

    EXECUTE policy_sql;

    RAISE NOTICE 'Created field-level policy % on table %', p_policy_name, p_table_name;
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply field-level security to sensitive tables
DO $$
DECLARE
    sensitive_tables TEXT[] := ARRAY[
        'users', 'people', 'companies', 'finance_accounts', 'finance_transactions',
        'contracts', 'invoices', 'user_sessions', 'audit_logs', 'security_events'
    ];
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY sensitive_tables LOOP
        BEGIN
            -- Note: This creates basic policies. In production, each table would need
            -- customized field-level security policies based on specific requirements
            PERFORM public.create_field_level_policy(table_name, 'field_level_security');

        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error creating field-level policy for table %: %', table_name, SQLERRM;
        END LOOP;
    END;

    RAISE NOTICE 'Field-level security implementation completed';
END $$;

-- Update data classification with more granular classifications
INSERT INTO public.data_classification (
    table_name, column_name, classification_level, encryption_required, retention_period
) VALUES
    -- User PII
    ('users', 'email', 'confidential', true, '7 years'),
    ('users', 'phone', 'confidential', false, '7 years'),
    ('users', 'mfa_secret', 'restricted', true, NULL),
    ('users', 'backup_codes', 'restricted', true, NULL),
    ('users', 'security_questions', 'confidential', true, NULL),
    ('users', 'failed_login_attempts', 'internal', false, '1 year'),
    ('users', 'last_login_ip', 'internal', false, '1 year'),

    -- People/HR Data
    ('people', 'email', 'confidential', true, '7 years'),
    ('people', 'phone', 'confidential', false, '7 years'),
    ('people', 'salary', 'restricted', true, '7 years'),
    ('people', 'ssn', 'restricted', true, '7 years'),
    ('people', 'emergency_contact', 'confidential', false, '7 years'),

    -- Financial Data
    ('finance_accounts', 'account_number', 'restricted', true, NULL),
    ('finance_accounts', 'routing_number', 'restricted', true, NULL),
    ('finance_transactions', 'amount', 'confidential', false, '7 years'),
    ('contracts', 'value', 'confidential', false, '10 years'),
    ('invoices', 'total', 'internal', false, '7 years'),

    -- System Security
    ('user_sessions', 'session_token', 'restricted', true, NULL),
    ('user_sessions', 'refresh_token', 'restricted', true, NULL),
    ('user_sessions', 'device_fingerprint', 'internal', false, '1 year'),
    ('security_events', 'ip_address', 'internal', false, '1 year'),
    ('audit_logs', 'ip_address', 'internal', false, '7 years')
ON CONFLICT (table_name, column_name) DO UPDATE SET
    classification_level = EXCLUDED.classification_level,
    encryption_required = EXCLUDED.encryption_required,
    retention_period = EXCLUDED.retention_period;

-- Grant usage on secure views to authenticated users
GRANT SELECT ON public.secure_users TO authenticated;
GRANT SELECT ON public.secure_people TO authenticated;
GRANT SELECT ON public.secure_finance_transactions TO authenticated;

-- Comments
COMMENT ON FUNCTION public.check_field_access(UUID, UUID, TEXT, TEXT, TEXT) IS 'Checks if user has permission to access a specific field';
COMMENT ON FUNCTION public.mask_sensitive_field(TEXT, UUID, UUID, TEXT, TEXT) IS 'Masks sensitive field values based on user permissions';
COMMENT ON VIEW public.secure_users IS 'Users view with field-level security masking';
COMMENT ON VIEW public.secure_people IS 'People view with PII masking';
COMMENT ON VIEW public.secure_finance_transactions IS 'Finance transactions with amount masking';
