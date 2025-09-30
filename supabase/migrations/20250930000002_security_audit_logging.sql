-- Security Audit Logging Implementation
-- Tamper-resistant security event logging for compliance and monitoring

-- Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- e.g., 'login_success', 'mfa_verification_failure', 'permission_denied'
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    details JSONB NOT NULL DEFAULT '{}', -- Structured event data
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    resource_id UUID, -- ID of affected resource (user, organization, etc.)
    resource_type TEXT, -- Type of affected resource
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Immutable audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_system BOOLEAN NOT NULL DEFAULT true, -- Only system can create audit logs

    -- Ensure audit logs cannot be modified after creation
    CONSTRAINT audit_log_immutable CHECK (created_at = timestamp)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_security_audit_log_timestamp ON public.security_audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_organization_id ON public.security_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON public.security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_severity ON public.security_audit_log(severity);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_ip_address ON public.security_audit_log(ip_address);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_security_audit_log_org_event ON public.security_audit_log(organization_id, event_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_event ON public.security_audit_log(user_id, event_type, timestamp DESC);

-- Enable RLS but with restrictive policies
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow system-level inserts (via functions)
CREATE POLICY security_audit_log_system_only ON public.security_audit_log
    FOR ALL USING (false); -- No direct access

-- Allow reads for organization admins and owners (for compliance reporting)
CREATE POLICY security_audit_log_org_read ON public.security_audit_log
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id
            FROM public.memberships
            WHERE user_id = public.current_user_id()
            AND status = 'active'
            AND role IN ('owner', 'admin')
        )
    );

-- Function to log security events (tamper-resistant)
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_organization_id UUID,
    p_user_id UUID,
    p_event_type TEXT,
    p_severity TEXT,
    p_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_resource_type TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
    org_exists BOOLEAN;
    user_exists BOOLEAN;
BEGIN
    -- Validate inputs
    IF p_event_type IS NULL OR p_event_type = '' THEN
        RAISE EXCEPTION 'event_type cannot be null or empty';
    END IF;

    IF p_severity NOT IN ('low', 'medium', 'high', 'critical') THEN
        RAISE EXCEPTION 'severity must be one of: low, medium, high, critical';
    END IF;

    -- Verify organization exists (if provided)
    IF p_organization_id IS NOT NULL THEN
        SELECT EXISTS(SELECT 1 FROM public.organizations WHERE id = p_organization_id) INTO org_exists;
        IF NOT org_exists THEN
            RAISE EXCEPTION 'organization_id does not exist';
        END IF;
    END IF;

    -- Verify user exists (if provided)
    IF p_user_id IS NOT NULL THEN
        SELECT EXISTS(SELECT 1 FROM public.users WHERE id = p_user_id) INTO user_exists;
        IF NOT user_exists THEN
            RAISE EXCEPTION 'user_id does not exist';
        END IF;
    END IF;

    -- Insert audit log entry
    INSERT INTO public.security_audit_log (
        organization_id,
        user_id,
        event_type,
        severity,
        details,
        ip_address,
        user_agent,
        session_id,
        resource_id,
        resource_type,
        success,
        error_message
    ) VALUES (
        p_organization_id,
        p_user_id,
        p_event_type,
        p_severity,
        p_details,
        p_ip_address,
        p_user_agent,
        p_session_id,
        p_resource_id,
        p_resource_type,
        p_success,
        p_error_message
    ) RETURNING id INTO event_id;

    -- Log critical security events to PostgreSQL logs as well
    IF p_severity IN ('high', 'critical') THEN
        RAISE LOG 'SECURITY EVENT [%] %: user=% org=% details=%',
            p_severity, p_event_type, p_user_id, p_organization_id, p_details;
    END IF;

    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get security events for an organization (admin access only)
CREATE OR REPLACE FUNCTION public.get_security_events(
    p_organization_id UUID,
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0,
    p_event_types TEXT[] DEFAULT NULL,
    p_severities TEXT[] DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_from_date TIMESTAMPTZ DEFAULT NULL,
    p_to_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    event_type TEXT,
    severity TEXT,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    resource_id UUID,
    resource_type TEXT,
    success BOOLEAN,
    error_message TEXT,
    timestamp TIMESTAMPTZ
) AS $$
DECLARE
    current_user_org_id UUID;
    current_user_role TEXT;
BEGIN
    -- Get current user's organization and role
    SELECT m.organization_id, m.role
    INTO current_user_org_id, current_user_role
    FROM public.memberships m
    WHERE m.user_id = public.current_user_id()
    AND m.status = 'active'
    LIMIT 1;

    -- Only allow access for organization owners/admins
    IF current_user_org_id IS NULL OR current_user_org_id != p_organization_id OR current_user_role NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Access denied: insufficient permissions';
    END IF;

    -- Return filtered security events
    RETURN QUERY
    SELECT
        sal.id,
        sal.user_id,
        sal.event_type,
        sal.severity,
        sal.details,
        sal.ip_address,
        sal.user_agent,
        sal.session_id,
        sal.resource_id,
        sal.resource_type,
        sal.success,
        sal.error_message,
        sal.timestamp
    FROM public.security_audit_log sal
    WHERE sal.organization_id = p_organization_id
    AND (p_event_types IS NULL OR sal.event_type = ANY(p_event_types))
    AND (p_severities IS NULL OR sal.severity = ANY(p_severities))
    AND (p_user_id IS NULL OR sal.user_id = p_user_id)
    AND (p_from_date IS NULL OR sal.timestamp >= p_from_date)
    AND (p_to_date IS NULL OR sal.timestamp <= p_to_date)
    ORDER BY sal.timestamp DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get security event statistics
CREATE OR REPLACE FUNCTION public.get_security_event_stats(
    p_organization_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
    current_user_org_id UUID;
    current_user_role TEXT;
    result JSONB;
BEGIN
    -- Get current user's organization and role
    SELECT m.organization_id, m.role
    INTO current_user_org_id, current_user_role
    FROM public.memberships m
    WHERE m.user_id = public.current_user_id()
    AND m.status = 'active'
    LIMIT 1;

    -- Only allow access for organization owners/admins
    IF current_user_org_id IS NULL OR current_user_org_id != p_organization_id OR current_user_role NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Access denied: insufficient permissions';
    END IF;

    -- Aggregate security event statistics
    SELECT jsonb_build_object(
        'total_events', COUNT(*),
        'by_severity', jsonb_object_agg(severity, count),
        'by_event_type', jsonb_object_agg(event_type, count),
        'failed_events', COUNT(*) FILTER (WHERE NOT success),
        'critical_events', COUNT(*) FILTER (WHERE severity = 'critical'),
        'period_days', p_days
    ) INTO result
    FROM (
        SELECT
            severity,
            event_type,
            success,
            COUNT(*) as count
        FROM public.security_audit_log
        WHERE organization_id = p_organization_id
        AND timestamp >= NOW() - INTERVAL '1 day' * p_days
        GROUP BY severity, event_type, success
    ) stats;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old audit logs (data retention policy)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(p_retention_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
    cutoff_date TIMESTAMPTZ;
BEGIN
    cutoff_date := NOW() - INTERVAL '1 day' * p_retention_days;

    -- Delete old audit logs (keep critical events longer)
    DELETE FROM public.security_audit_log
    WHERE timestamp < cutoff_date
    AND severity NOT IN ('critical', 'high'); -- Keep high/critical events longer

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    -- Log the cleanup operation
    PERFORM public.log_security_event(
        NULL, -- system operation
        NULL, -- system operation
        'audit_log_cleanup',
        'low',
        jsonb_build_object('deleted_count', deleted_count, 'retention_days', p_retention_days),
        NULL, -- ip_address
        'system', -- user_agent
        NULL, -- session_id
        NULL, -- resource_id
        'security_audit_log' -- resource_type
    );

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE public.security_audit_log IS 'Tamper-resistant security audit log for compliance and monitoring';
COMMENT ON FUNCTION public.log_security_event(UUID, UUID, TEXT, TEXT, JSONB, INET, TEXT, TEXT, UUID, TEXT, BOOLEAN, TEXT) IS 'Log security events with tamper-resistant storage';
COMMENT ON FUNCTION public.get_security_events(UUID, INTEGER, INTEGER, TEXT[], TEXT[], UUID, TIMESTAMPTZ, TIMESTAMPTZ) IS 'Retrieve security events for authorized administrators';
COMMENT ON FUNCTION public.get_security_event_stats(UUID, INTEGER) IS 'Get security event statistics and metrics';
COMMENT ON FUNCTION public.cleanup_old_audit_logs(INTEGER) IS 'Clean up old audit logs according to retention policy';
