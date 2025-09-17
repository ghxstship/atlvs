-- Enterprise Security Hardening Migration
-- Phase 1: Foundation Security Enhancement

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create audit log table for comprehensive tracking
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    correlation_id UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create security events table for monitoring
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'login_success', 'login_failure', 'logout', 'password_change',
        'mfa_enabled', 'mfa_disabled', 'suspicious_activity',
        'rate_limit_exceeded', 'unauthorized_access_attempt'
    )),
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user sessions table for advanced session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT UNIQUE,
    device_fingerprint TEXT,
    ip_address INET,
    user_agent TEXT,
    location JSONB,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create data classification table
CREATE TABLE IF NOT EXISTS public.data_classification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    column_name TEXT NOT NULL,
    classification_level TEXT NOT NULL CHECK (classification_level IN (
        'public', 'internal', 'confidential', 'restricted'
    )),
    encryption_required BOOLEAN DEFAULT false,
    retention_period INTERVAL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(table_name, column_name)
);

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL, -- IP, user_id, or API key
    identifier_type TEXT NOT NULL CHECK (identifier_type IN ('ip', 'user', 'api_key')),
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    window_duration INTERVAL DEFAULT '1 hour',
    limit_exceeded BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enhanced organizations table with security fields
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS security_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'compliant', 'non_compliant')),
ADD COLUMN IF NOT EXISTS data_retention_policy JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS encryption_key_id TEXT,
ADD COLUMN IF NOT EXISTS last_security_audit TIMESTAMPTZ;

-- Enhanced users table with security fields
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mfa_secret TEXT,
ADD COLUMN IF NOT EXISTS backup_codes TEXT[],
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_login_ip INET,
ADD COLUMN IF NOT EXISTS security_questions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}';

-- Create indexes for audit and security tables
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation_id ON public.audit_logs(correlation_id);

CREATE INDEX IF NOT EXISTS idx_security_events_organization_id ON public.security_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_endpoint ON public.rate_limits(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits(window_start);

-- Enable RLS on new security tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_classification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit logs (admin/owner only)
CREATE POLICY audit_logs_read ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = audit_logs.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

-- RLS policies for security events (admin/owner only)
CREATE POLICY security_events_read ON public.security_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = security_events.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

-- RLS policies for user sessions (self only)
CREATE POLICY user_sessions_read_self ON public.user_sessions
    FOR SELECT USING (user_id = public.current_user_id());

CREATE POLICY user_sessions_update_self ON public.user_sessions
    FOR UPDATE USING (user_id = public.current_user_id());

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changed_fields TEXT[] := '{}';
    field_name TEXT;
BEGIN
    -- Skip audit for audit tables to prevent recursion
    IF TG_TABLE_NAME IN ('audit_logs', 'security_events', 'rate_limits') THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Prepare old and new data
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := to_jsonb(NEW);
    ELSE -- UPDATE
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        
        -- Identify changed fields
        FOR field_name IN SELECT jsonb_object_keys(new_data) LOOP
            IF old_data->field_name IS DISTINCT FROM new_data->field_name THEN
                changed_fields := array_append(changed_fields, field_name);
            END IF;
        END LOOP;
    END IF;

    -- Insert audit record
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
        public.current_user_id(),
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

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create security event logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_organization_id UUID,
    p_user_id UUID,
    p_event_type TEXT,
    p_severity TEXT DEFAULT 'info',
    p_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO public.security_events (
        organization_id,
        user_id,
        event_type,
        severity,
        details,
        ip_address,
        user_agent,
        session_id
    ) VALUES (
        p_organization_id,
        p_user_id,
        p_event_type,
        p_severity,
        p_details,
        COALESCE(p_ip_address, inet_client_addr()),
        p_user_agent,
        p_session_id
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_identifier TEXT,
    p_identifier_type TEXT,
    p_endpoint TEXT,
    p_limit INTEGER DEFAULT 100,
    p_window_duration INTERVAL DEFAULT '1 hour'
)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMPTZ;
BEGIN
    window_start := NOW() - p_window_duration;
    
    -- Clean up old entries
    DELETE FROM public.rate_limits 
    WHERE window_start < (NOW() - p_window_duration * 2);
    
    -- Get current count for this identifier/endpoint combination
    SELECT COALESCE(SUM(request_count), 0) INTO current_count
    FROM public.rate_limits
    WHERE identifier = p_identifier
      AND identifier_type = p_identifier_type
      AND endpoint = p_endpoint
      AND window_start >= (NOW() - p_window_duration);
    
    -- Check if limit exceeded
    IF current_count >= p_limit THEN
        -- Update limit_exceeded flag
        UPDATE public.rate_limits 
        SET limit_exceeded = true
        WHERE identifier = p_identifier
          AND identifier_type = p_identifier_type
          AND endpoint = p_endpoint
          AND window_start >= (NOW() - p_window_duration);
        
        RETURN false;
    END IF;
    
    -- Insert or update rate limit record
    INSERT INTO public.rate_limits (
        identifier,
        identifier_type,
        endpoint,
        request_count,
        window_start,
        window_duration
    ) VALUES (
        p_identifier,
        p_identifier_type,
        p_endpoint,
        1,
        NOW(),
        p_window_duration
    )
    ON CONFLICT (identifier, identifier_type, endpoint, window_start)
    DO UPDATE SET 
        request_count = rate_limits.request_count + 1,
        updated_at = NOW();
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to critical tables
DO $$
DECLARE
    table_name TEXT;
    tables_to_audit TEXT[] := ARRAY[
        'organizations', 'users', 'memberships', 'projects', 'tasks',
        'companies', 'people', 'finance_accounts', 'finance_transactions',
        'invoices', 'budgets', 'expenses', 'revenue', 'forecasts',
        'jobs', 'opportunities', 'rfps', 'bids', 'job_contracts',
        'procurement_orders', 'products', 'services'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_audit LOOP
        -- Drop existing trigger if it exists
        EXECUTE format('DROP TRIGGER IF EXISTS audit_trigger_%s ON public.%I', table_name, table_name);
        
        -- Create new audit trigger
        EXECUTE format('
            CREATE TRIGGER audit_trigger_%s
                AFTER INSERT OR UPDATE OR DELETE ON public.%I
                FOR EACH ROW
                EXECUTE FUNCTION public.audit_trigger_function()
        ', table_name, table_name);
    END LOOP;
END $$;

-- Insert default data classifications
INSERT INTO public.data_classification (table_name, column_name, classification_level, encryption_required) VALUES
    ('users', 'email', 'confidential', true),
    ('users', 'full_name', 'internal', false),
    ('users', 'mfa_secret', 'restricted', true),
    ('users', 'backup_codes', 'restricted', true),
    ('users', 'security_questions', 'confidential', true),
    ('organizations', 'stripe_customer_id', 'confidential', true),
    ('people', 'email', 'confidential', true),
    ('people', 'phone', 'confidential', true),
    ('companies', 'email', 'internal', false),
    ('finance_accounts', 'balance', 'confidential', false),
    ('finance_transactions', 'amount', 'confidential', false),
    ('invoices', 'total', 'internal', false),
    ('user_sessions', 'session_token', 'restricted', true),
    ('user_sessions', 'refresh_token', 'restricted', true)
ON CONFLICT (table_name, column_name) DO NOTHING;

-- Create updated_at triggers for new tables
CREATE TRIGGER set_updated_at_rate_limits
    BEFORE UPDATE ON public.rate_limits
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit trail for all data modifications';
COMMENT ON TABLE public.security_events IS 'Security-related events and incidents';
COMMENT ON TABLE public.user_sessions IS 'Advanced session management with device tracking';
COMMENT ON TABLE public.data_classification IS 'Data classification and encryption requirements';
COMMENT ON TABLE public.rate_limits IS 'API rate limiting and abuse prevention';

COMMENT ON FUNCTION public.audit_trigger_function() IS 'Automatic audit logging for all table changes';
COMMENT ON FUNCTION public.log_security_event(UUID, UUID, TEXT, TEXT, JSONB, INET, TEXT, TEXT) IS 'Log security events with context';
COMMENT ON FUNCTION public.check_rate_limit(TEXT, TEXT, TEXT, INTEGER, INTERVAL) IS 'Rate limiting with configurable windows';
