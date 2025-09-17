-- Enterprise Security Enhancement Migration
-- Phase 2: Advanced Security Features and Threat Detection

-- Create advanced security monitoring tables
CREATE TABLE IF NOT EXISTS public.threat_detection_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    rule_type TEXT NOT NULL CHECK (rule_type IN (
        'anomaly_detection', 'brute_force', 'suspicious_activity', 
        'data_exfiltration', 'privilege_escalation', 'unusual_access_pattern'
    )),
    conditions JSONB NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_active BOOLEAN DEFAULT true,
    alert_threshold INTEGER DEFAULT 5,
    time_window INTERVAL DEFAULT '15 minutes',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.security_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES public.threat_detection_rules(id),
    incident_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
    affected_user_id UUID REFERENCES public.users(id),
    source_ip INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    evidence JSONB DEFAULT '{}',
    assigned_to UUID REFERENCES public.users(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.data_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    table_name TEXT NOT NULL,
    record_id UUID,
    access_type TEXT NOT NULL CHECK (access_type IN ('read', 'write', 'delete', 'export')),
    data_classification TEXT CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted')),
    query_fingerprint TEXT,
    row_count INTEGER,
    sensitive_fields TEXT[],
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    correlation_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    key_type TEXT NOT NULL CHECK (key_type IN ('aes_256', 'rsa_2048', 'rsa_4096')),
    key_purpose TEXT NOT NULL CHECK (key_purpose IN ('data_encryption', 'token_signing', 'backup_encryption')),
    key_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    rotation_schedule INTERVAL DEFAULT '90 days',
    last_rotated TIMESTAMPTZ DEFAULT NOW(),
    next_rotation TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.compliance_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    check_type TEXT NOT NULL CHECK (check_type IN (
        'gdpr_data_inventory', 'gdpr_consent_tracking', 'gdpr_data_retention',
        'soc2_access_controls', 'soc2_data_protection', 'soc2_monitoring',
        'iso27001_risk_assessment', 'iso27001_incident_response'
    )),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed', 'not_applicable')),
    score NUMERIC(5,2),
    max_score NUMERIC(5,2) DEFAULT 100.00,
    findings JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '{}',
    evidence JSONB DEFAULT '{}',
    checked_at TIMESTAMPTZ DEFAULT NOW(),
    next_check_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced user behavior tracking
CREATE TABLE IF NOT EXISTS public.user_behavior_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    session_id TEXT,
    behavior_type TEXT NOT NULL CHECK (behavior_type IN (
        'login_pattern', 'data_access_pattern', 'feature_usage', 
        'time_pattern', 'location_pattern', 'device_pattern'
    )),
    baseline_score NUMERIC(10,4),
    current_score NUMERIC(10,4),
    anomaly_score NUMERIC(10,4),
    is_anomalous BOOLEAN DEFAULT false,
    confidence_level NUMERIC(5,2),
    features JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advanced indexing for security tables
CREATE INDEX IF NOT EXISTS idx_threat_detection_rules_type_active ON public.threat_detection_rules(rule_type, is_active);
CREATE INDEX IF NOT EXISTS idx_security_incidents_org_status_severity ON public.security_incidents(organization_id, status, severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_org_user_created ON public.data_access_logs(organization_id, user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_table_classification ON public.data_access_logs(table_name, data_classification);
CREATE INDEX IF NOT EXISTS idx_encryption_keys_org_active ON public.encryption_keys(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_org_type_status ON public.compliance_checks(organization_id, check_type, status);
CREATE INDEX IF NOT EXISTS idx_user_behavior_user_type_recorded ON public.user_behavior_analytics(user_id, behavior_type, recorded_at DESC);

-- Advanced threat detection functions
CREATE OR REPLACE FUNCTION public.detect_brute_force_attempts(
    p_user_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_time_window INTERVAL DEFAULT '15 minutes',
    p_threshold INTEGER DEFAULT 5
)
RETURNS TABLE (
    user_id UUID,
    ip_address INET,
    attempt_count BIGINT,
    first_attempt TIMESTAMPTZ,
    last_attempt TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        se.user_id,
        se.ip_address,
        COUNT(*) as attempt_count,
        MIN(se.created_at) as first_attempt,
        MAX(se.created_at) as last_attempt
    FROM public.security_events se
    WHERE se.event_type = 'login_failure'
      AND se.created_at >= NOW() - p_time_window
      AND (p_user_id IS NULL OR se.user_id = p_user_id)
      AND (p_ip_address IS NULL OR se.ip_address = p_ip_address)
    GROUP BY se.user_id, se.ip_address
    HAVING COUNT(*) >= p_threshold
    ORDER BY attempt_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.detect_anomalous_data_access(
    p_organization_id UUID,
    p_time_window INTERVAL DEFAULT '1 hour',
    p_threshold_multiplier NUMERIC DEFAULT 3.0
)
RETURNS TABLE (
    user_id UUID,
    table_name TEXT,
    access_count BIGINT,
    avg_baseline NUMERIC,
    anomaly_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH baseline AS (
        SELECT 
            dal.user_id,
            dal.table_name,
            AVG(daily_count) as avg_daily_access
        FROM (
            SELECT 
                user_id,
                table_name,
                DATE(created_at) as access_date,
                COUNT(*) as daily_count
            FROM public.data_access_logs
            WHERE organization_id = p_organization_id
              AND created_at >= NOW() - INTERVAL '30 days'
              AND created_at < NOW() - p_time_window
            GROUP BY user_id, table_name, DATE(created_at)
        ) dal
        GROUP BY dal.user_id, dal.table_name
    ),
    current_access AS (
        SELECT 
            user_id,
            table_name,
            COUNT(*) as current_count
        FROM public.data_access_logs
        WHERE organization_id = p_organization_id
          AND created_at >= NOW() - p_time_window
        GROUP BY user_id, table_name
    )
    SELECT 
        ca.user_id,
        ca.table_name,
        ca.current_count,
        COALESCE(b.avg_daily_access, 0) as avg_baseline,
        CASE 
            WHEN COALESCE(b.avg_daily_access, 0) > 0 THEN 
                ca.current_count / b.avg_daily_access
            ELSE ca.current_count::NUMERIC
        END as anomaly_score
    FROM current_access ca
    LEFT JOIN baseline b ON ca.user_id = b.user_id AND ca.table_name = b.table_name
    WHERE CASE 
        WHEN COALESCE(b.avg_daily_access, 0) > 0 THEN 
            ca.current_count / b.avg_daily_access >= p_threshold_multiplier
        ELSE ca.current_count >= 10
    END
    ORDER BY anomaly_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.analyze_user_behavior(
    p_user_id UUID,
    p_organization_id UUID
)
RETURNS JSONB AS $$
DECLARE
    behavior_analysis JSONB := '{}';
    login_pattern JSONB;
    access_pattern JSONB;
    time_pattern JSONB;
BEGIN
    -- Analyze login patterns
    SELECT jsonb_build_object(
        'avg_logins_per_day', AVG(daily_logins),
        'login_time_variance', STDDEV(EXTRACT(HOUR FROM created_at)),
        'unique_ips_last_30_days', COUNT(DISTINCT ip_address),
        'most_common_user_agent', mode() WITHIN GROUP (ORDER BY user_agent)
    ) INTO login_pattern
    FROM (
        SELECT 
            DATE(created_at) as login_date,
            COUNT(*) as daily_logins,
            created_at,
            ip_address,
            user_agent
        FROM public.security_events
        WHERE user_id = p_user_id
          AND organization_id = p_organization_id
          AND event_type = 'login_success'
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at), created_at, ip_address, user_agent
    ) login_stats;

    -- Analyze data access patterns
    SELECT jsonb_build_object(
        'avg_queries_per_day', AVG(daily_queries),
        'most_accessed_tables', array_agg(table_name ORDER BY access_count DESC LIMIT 5),
        'sensitive_data_access_count', SUM(CASE WHEN data_classification IN ('confidential', 'restricted') THEN 1 ELSE 0 END),
        'peak_access_hour', mode() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM created_at))
    ) INTO access_pattern
    FROM (
        SELECT 
            DATE(created_at) as access_date,
            COUNT(*) as daily_queries,
            table_name,
            COUNT(*) OVER (PARTITION BY table_name) as access_count,
            data_classification,
            created_at
        FROM public.data_access_logs
        WHERE user_id = p_user_id
          AND organization_id = p_organization_id
          AND created_at >= NOW() - INTERVAL '30 days'
    ) access_stats;

    -- Combine analysis
    behavior_analysis := jsonb_build_object(
        'user_id', p_user_id,
        'organization_id', p_organization_id,
        'analysis_date', NOW(),
        'login_patterns', login_pattern,
        'access_patterns', access_pattern,
        'risk_score', CASE 
            WHEN (login_pattern->>'unique_ips_last_30_days')::INTEGER > 10 THEN 'high'
            WHEN (access_pattern->>'sensitive_data_access_count')::INTEGER > 100 THEN 'medium'
            ELSE 'low'
        END
    );

    RETURN behavior_analysis;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Compliance automation functions
CREATE OR REPLACE FUNCTION public.run_gdpr_compliance_check(
    p_organization_id UUID
)
RETURNS UUID AS $$
DECLARE
    check_id UUID;
    data_inventory JSONB;
    consent_status JSONB;
    retention_compliance JSONB;
    overall_score NUMERIC := 0;
    findings JSONB := '{}';
BEGIN
    -- Data inventory check
    SELECT jsonb_build_object(
        'total_personal_data_records', COUNT(*),
        'tables_with_personal_data', COUNT(DISTINCT table_name),
        'unclassified_personal_data', COUNT(*) FILTER (WHERE classification_level IS NULL)
    ) INTO data_inventory
    FROM public.data_classification dc
    WHERE EXISTS (
        SELECT 1 FROM information_schema.tables t 
        WHERE t.table_name = dc.table_name 
        AND t.table_schema = 'public'
    );

    -- Calculate compliance score
    overall_score := CASE 
        WHEN (data_inventory->>'unclassified_personal_data')::INTEGER = 0 THEN 100
        ELSE GREATEST(0, 100 - (data_inventory->>'unclassified_personal_data')::INTEGER * 10)
    END;

    findings := jsonb_build_object(
        'data_inventory', data_inventory,
        'compliance_gaps', CASE 
            WHEN (data_inventory->>'unclassified_personal_data')::INTEGER > 0 
            THEN jsonb_build_array('Unclassified personal data found')
            ELSE jsonb_build_array()
        END
    );

    -- Insert compliance check record
    INSERT INTO public.compliance_checks (
        organization_id,
        check_type,
        status,
        score,
        findings,
        next_check_at
    ) VALUES (
        p_organization_id,
        'gdpr_data_inventory',
        CASE WHEN overall_score >= 90 THEN 'passed' ELSE 'failed' END,
        overall_score,
        findings,
        NOW() + INTERVAL '30 days'
    ) RETURNING id INTO check_id;

    RETURN check_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.encrypt_sensitive_field(
    p_plaintext TEXT,
    p_organization_id UUID,
    p_key_purpose TEXT DEFAULT 'data_encryption'
)
RETURNS TEXT AS $$
DECLARE
    encryption_key TEXT;
    encrypted_data TEXT;
BEGIN
    -- Get active encryption key
    SELECT key_hash INTO encryption_key
    FROM public.encryption_keys
    WHERE organization_id = p_organization_id
      AND key_purpose = p_key_purpose
      AND is_active = true
    ORDER BY created_at DESC
    LIMIT 1;

    IF encryption_key IS NULL THEN
        RAISE EXCEPTION 'No active encryption key found for organization';
    END IF;

    -- Encrypt using pgcrypto
    encrypted_data := encode(
        encrypt(p_plaintext::bytea, encryption_key::bytea, 'aes'),
        'base64'
    );

    RETURN encrypted_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrypt_sensitive_field(
    p_encrypted_text TEXT,
    p_organization_id UUID,
    p_key_purpose TEXT DEFAULT 'data_encryption'
)
RETURNS TEXT AS $$
DECLARE
    encryption_key TEXT;
    decrypted_data TEXT;
BEGIN
    -- Get active encryption key
    SELECT key_hash INTO encryption_key
    FROM public.encryption_keys
    WHERE organization_id = p_organization_id
      AND key_purpose = p_key_purpose
      AND is_active = true
    ORDER BY created_at DESC
    LIMIT 1;

    IF encryption_key IS NULL THEN
        RAISE EXCEPTION 'No active encryption key found for organization';
    END IF;

    -- Decrypt using pgcrypto
    decrypted_data := convert_from(
        decrypt(decode(p_encrypted_text, 'base64'), encryption_key::bytea, 'aes'),
        'UTF8'
    );

    RETURN decrypted_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on security tables
ALTER TABLE public.threat_detection_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for security tables (admin/owner only)
CREATE POLICY threat_detection_rules_admin ON public.threat_detection_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

CREATE POLICY security_incidents_org_admin ON public.security_incidents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = security_incidents.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

CREATE POLICY data_access_logs_org_admin ON public.data_access_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = data_access_logs.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

CREATE POLICY encryption_keys_org_admin ON public.encryption_keys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = encryption_keys.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

CREATE POLICY compliance_checks_org_admin ON public.compliance_checks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = compliance_checks.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

CREATE POLICY user_behavior_analytics_org_admin ON public.user_behavior_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = user_behavior_analytics.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

-- Insert default threat detection rules
INSERT INTO public.threat_detection_rules (name, description, rule_type, conditions, severity, alert_threshold, time_window) VALUES
    ('Brute Force Login Detection', 'Detect multiple failed login attempts', 'brute_force', 
     '{"event_type": "login_failure", "threshold": 5, "window": "15 minutes"}', 'high', 5, '15 minutes'),
    ('Unusual Data Access Volume', 'Detect abnormal data access patterns', 'anomaly_detection',
     '{"access_multiplier": 3.0, "baseline_days": 30}', 'medium', 1, '1 hour'),
    ('Suspicious IP Activity', 'Detect access from suspicious IP addresses', 'suspicious_activity',
     '{"new_ip_threshold": 5, "geo_anomaly": true}', 'medium', 3, '1 hour'),
    ('Privilege Escalation Attempt', 'Detect unauthorized privilege changes', 'privilege_escalation',
     '{"role_changes": true, "permission_changes": true}', 'critical', 1, '5 minutes'),
    ('Large Data Export', 'Detect large data export operations', 'data_exfiltration',
     '{"export_size_mb": 100, "export_count": 10}', 'high', 1, '30 minutes')
ON CONFLICT DO NOTHING;

-- Create updated_at triggers for new tables
CREATE TRIGGER set_updated_at_threat_detection_rules
    BEFORE UPDATE ON public.threat_detection_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_security_incidents
    BEFORE UPDATE ON public.security_incidents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add comments
COMMENT ON TABLE public.threat_detection_rules IS 'Configurable threat detection and security monitoring rules';
COMMENT ON TABLE public.security_incidents IS 'Security incidents and investigation tracking';
COMMENT ON TABLE public.data_access_logs IS 'Detailed logging of all data access operations';
COMMENT ON TABLE public.encryption_keys IS 'Encryption key management for data protection';
COMMENT ON TABLE public.compliance_checks IS 'Automated compliance checking and reporting';
COMMENT ON TABLE public.user_behavior_analytics IS 'User behavior analysis for anomaly detection';
