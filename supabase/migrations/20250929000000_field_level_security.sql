-- Enterprise RLS Enhancements: Field-Level Security
-- Phase 1: Column Masking and Field-Level Access Control

-- Create function to check field access based on classification
CREATE OR REPLACE FUNCTION public.check_field_access(
    p_table_name TEXT,
    p_column_name TEXT,
    p_user_id UUID DEFAULT public.current_user_id()
)
RETURNS BOOLEAN AS $$
DECLARE
    classification_level TEXT;
    user_role TEXT;
BEGIN
    -- Get data classification for the field
    SELECT dc.classification_level INTO classification_level
    FROM public.data_classification dc
    WHERE dc.table_name = p_table_name
      AND dc.column_name = p_column_name;

    -- If no classification defined, allow access
    IF classification_level IS NULL THEN
        RETURN true;
    END IF;

    -- Get user role
    SELECT m.role INTO user_role
    FROM public.memberships m
    WHERE m.user_id = p_user_id
      AND m.status = 'active'
    LIMIT 1;

    -- Access control based on classification and role
    CASE classification_level
        WHEN 'public' THEN
            RETURN true;
        WHEN 'internal' THEN
            RETURN user_role IN ('owner', 'admin', 'manager', 'producer', 'member');
        WHEN 'confidential' THEN
            RETURN user_role IN ('owner', 'admin', 'manager');
        WHEN 'restricted' THEN
            RETURN user_role IN ('owner', 'admin');
        ELSE
            RETURN false;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mask sensitive fields
CREATE OR REPLACE FUNCTION public.mask_sensitive_field(
    p_value TEXT,
    p_table_name TEXT,
    p_column_name TEXT,
    p_user_id UUID DEFAULT public.current_user_id()
)
RETURNS TEXT AS $$
DECLARE
    has_access BOOLEAN;
BEGIN
    -- Check if user has access to this field
    SELECT public.check_field_access(p_table_name, p_column_name, p_user_id) INTO has_access;

    IF has_access THEN
        RETURN p_value;
    ELSE
        -- Return masked value based on field type
        CASE p_column_name
            WHEN 'email' THEN RETURN '***@***.***';
            WHEN 'phone' THEN RETURN '***-***-****';
            WHEN 'mfa_secret', 'backup_codes', 'session_token', 'refresh_token' THEN RETURN '***REDACTED***';
            ELSE RETURN '***RESTRICTED***';
        END CASE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for users table with field-level masking
CREATE OR REPLACE VIEW public.users_masked AS
SELECT
    u.id,
    u.created_at,
    u.updated_at,
    CASE WHEN public.check_field_access('users', 'email', public.current_user_id()) THEN u.email ELSE '***@***.***' END as email,
    CASE WHEN public.check_field_access('users', 'full_name', public.current_user_id()) THEN u.full_name ELSE '***RESTRICTED***' END as full_name,
    CASE WHEN public.check_field_access('users', 'first_name', public.current_user_id()) THEN u.first_name ELSE '***RESTRICTED***' END as first_name,
    CASE WHEN public.check_field_access('users', 'last_name', public.current_user_id()) THEN u.last_name ELSE '***RESTRICTED***' END as last_name,
    CASE WHEN public.check_field_access('users', 'mfa_enabled', public.current_user_id()) THEN u.mfa_enabled ELSE false END as mfa_enabled,
    CASE WHEN public.check_field_access('users', 'mfa_secret', public.current_user_id()) THEN u.mfa_secret ELSE '***REDACTED***' END as mfa_secret,
    CASE WHEN public.check_field_access('users', 'backup_codes', public.current_user_id()) THEN u.backup_codes ELSE ARRAY['***REDACTED***'] END as backup_codes,
    CASE WHEN public.check_field_access('users', 'security_questions', public.current_user_id()) THEN u.security_questions ELSE '{}'::jsonb END as security_questions,
    CASE WHEN public.check_field_access('users', 'failed_login_attempts', public.current_user_id()) THEN u.failed_login_attempts ELSE 0 END as failed_login_attempts,
    CASE WHEN public.check_field_access('users', 'last_login_at', public.current_user_id()) THEN u.last_login_at ELSE NULL END as last_login_at,
    CASE WHEN public.check_field_access('users', 'last_login_ip', public.current_user_id()) THEN u.last_login_ip ELSE NULL END as last_login_ip
FROM public.users u;

-- Enable RLS on the masked view
ALTER VIEW public.users_masked SET (security_barrier = true);

-- Create RLS policy for the masked view
CREATE POLICY users_masked_read ON public.users_masked
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = public.current_user_id()
              AND m.status = 'active'
        )
    );

-- Create function to get accessible fields for a table
CREATE OR REPLACE FUNCTION public.get_accessible_fields(
    p_table_name TEXT,
    p_user_id UUID DEFAULT public.current_user_id()
)
RETURNS TABLE(column_name TEXT, classification_level TEXT, has_access BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.column_name,
        dc.classification_level,
        public.check_field_access(dc.table_name, dc.column_name, p_user_id) as has_access
    FROM public.data_classification dc
    WHERE dc.table_name = p_table_name
    ORDER BY dc.column_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to filter query results based on field access
CREATE OR REPLACE FUNCTION public.filter_by_field_access(
    p_table_name TEXT,
    p_user_id UUID DEFAULT public.current_user_id()
)
RETURNS TABLE(column_name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT dc.column_name
    FROM public.data_classification dc
    WHERE dc.table_name = p_table_name
      AND public.check_field_access(dc.table_name, dc.column_name, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced audit trigger that includes field access information
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changed_fields TEXT[] := '{}';
    field_name TEXT;
    user_id UUID;
    accessible_fields TEXT[];
BEGIN
    -- Skip audit for audit tables to prevent recursion
    IF TG_TABLE_NAME IN ('audit_logs', 'security_events', 'rate_limits') THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Get current user
    user_id := public.current_user_id();

    -- Get accessible fields for this user
    SELECT array_agg(column_name) INTO accessible_fields
    FROM public.filter_by_field_access(TG_TABLE_NAME, user_id);

    -- Prepare old and new data, filtering by accessible fields
    IF TG_OP = 'DELETE' THEN
        old_data := row_to_json(OLD)::JSONB;
        new_data := NULL;

        -- Filter old_data to only include accessible fields
        IF accessible_fields IS NOT NULL THEN
            SELECT jsonb_object_agg(key, value) INTO old_data
            FROM jsonb_each(old_data)
            WHERE key = ANY(accessible_fields);
        END IF;
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := row_to_json(NEW)::JSONB;

        -- Filter new_data to only include accessible fields
        IF accessible_fields IS NOT NULL THEN
            SELECT jsonb_object_agg(key, value) INTO new_data
            FROM jsonb_each(new_data)
            WHERE key = ANY(accessible_fields);
        END IF;
    ELSE -- UPDATE
        old_data := row_to_json(OLD)::JSONB;
        new_data := row_to_json(NEW)::JSONB;

        -- Identify changed fields (only accessible ones)
        FOR field_name IN SELECT jsonb_object_keys(new_data) LOOP
            IF accessible_fields IS NULL OR field_name = ANY(accessible_fields) THEN
                IF old_data->field_name IS DISTINCT FROM new_data->field_name THEN
                    changed_fields := array_append(changed_fields, field_name);
                END IF;
            END IF;
        END LOOP;

        -- Filter data to only include accessible fields
        IF accessible_fields IS NOT NULL THEN
            SELECT jsonb_object_agg(key, value) INTO old_data
            FROM jsonb_each(old_data)
            WHERE key = ANY(accessible_fields);

            SELECT jsonb_object_agg(key, value) INTO new_data
            FROM jsonb_each(new_data)
            WHERE key = ANY(accessible_fields);
        END IF;
    END IF;

    -- Only log if there are accessible changes or it's an insert/delete
    IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' OR array_length(changed_fields, 1) > 0 THEN
        INSERT INTO public.audit_logs (
            organization_id,
            user_id,
            table_name,
            record_id,
            action,
            old_values,
            new_values,
            changed_fields,
            ip_address,
            session_id
        ) VALUES (
            COALESCE(
                (new_data->>'organization_id')::UUID,
                (old_data->>'organization_id')::UUID
            ),
            user_id,
            TG_TABLE_NAME,
            COALESCE(
                (new_data->>'id')::UUID,
                (old_data->>'id')::UUID
            ),
            TG_OP,
            old_data,
            new_data,
            changed_fields,
            inet_client_addr(),
            current_setting('app.session_id', true)
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON FUNCTION public.check_field_access(TEXT, TEXT, UUID) IS 'Checks if a user has access to a specific field based on data classification';
COMMENT ON FUNCTION public.mask_sensitive_field(TEXT, TEXT, TEXT, UUID) IS 'Masks sensitive field values based on user access level';
COMMENT ON VIEW public.users_masked IS 'Users table with field-level masking applied';
COMMENT ON FUNCTION public.get_accessible_fields(TEXT, UUID) IS 'Returns list of accessible fields for a user on a table';
COMMENT ON FUNCTION public.filter_by_field_access(TEXT, UUID) IS 'Returns accessible column names for field filtering';
