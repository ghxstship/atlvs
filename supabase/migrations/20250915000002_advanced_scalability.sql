-- Enterprise Scalability and Data Governance Migration
-- Phase 2: Advanced Features and Compliance

-- Create data retention policies table
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    retention_period INTERVAL NOT NULL,
    archive_after INTERVAL,
    delete_after INTERVAL,
    policy_type TEXT NOT NULL CHECK (policy_type IN ('legal', 'business', 'technical')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, table_name)
);

-- Create data archival table for soft deletes
CREATE TABLE IF NOT EXISTS public.archived_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    original_table TEXT NOT NULL,
    original_id UUID NOT NULL,
    record_data JSONB NOT NULL,
    archived_reason TEXT NOT NULL,
    archived_by UUID REFERENCES public.users(id),
    archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    restore_before TIMESTAMPTZ,
    permanent_delete_at TIMESTAMPTZ
);

-- Create connection pooling configuration table
CREATE TABLE IF NOT EXISTS public.connection_pool_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    pool_name TEXT NOT NULL,
    max_connections INTEGER DEFAULT 20,
    min_connections INTEGER DEFAULT 5,
    connection_timeout INTERVAL DEFAULT '30 seconds',
    idle_timeout INTERVAL DEFAULT '10 minutes',
    max_lifetime INTERVAL DEFAULT '1 hour',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, pool_name)
);

-- Create query cache table
CREATE TABLE IF NOT EXISTS public.query_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT NOT NULL UNIQUE,
    query_hash TEXT NOT NULL,
    result_data JSONB NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    hit_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create API usage tracking table
CREATE TABLE IF NOT EXISTS public.api_usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    ip_address INET,
    user_agent TEXT,
    api_key_id UUID,
    rate_limited BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create background job queue table
CREATE TABLE IF NOT EXISTS public.background_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL,
    job_data JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    priority INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    attempt_count INTEGER DEFAULT 0,
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    result_data JSONB,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
    is_enabled BOOLEAN DEFAULT true,
    frequency TEXT DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, organization_id, notification_type, channel)
);

-- Create webhook endpoints table
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    secret_key TEXT NOT NULL,
    events TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    retry_count INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 30,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    failure_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create webhook delivery log table
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_endpoint_id UUID NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'delivered', 'failed', 'cancelled')),
    http_status_code INTEGER,
    response_body TEXT,
    attempt_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add partitioning for large tables (time-based)
-- Partition audit_logs by month
CREATE TABLE IF NOT EXISTS public.audit_logs_y2025m01 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE IF NOT EXISTS public.audit_logs_y2025m02 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE IF NOT EXISTS public.audit_logs_y2025m03 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_org_id ON public.data_retention_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_table_name ON public.data_retention_policies(table_name);

CREATE INDEX IF NOT EXISTS idx_archived_records_org_id ON public.archived_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_archived_records_original_table ON public.archived_records(original_table);
CREATE INDEX IF NOT EXISTS idx_archived_records_original_id ON public.archived_records(original_id);
CREATE INDEX IF NOT EXISTS idx_archived_records_archived_at ON public.archived_records(archived_at);
CREATE INDEX IF NOT EXISTS idx_archived_records_permanent_delete_at ON public.archived_records(permanent_delete_at);

CREATE INDEX IF NOT EXISTS idx_query_cache_cache_key ON public.query_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_query_cache_expires_at ON public.query_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_query_cache_organization_id ON public.query_cache(organization_id);

CREATE INDEX IF NOT EXISTS idx_api_usage_tracking_org_id ON public.api_usage_tracking(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_tracking_created_at ON public.api_usage_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_tracking_endpoint ON public.api_usage_tracking(endpoint);

CREATE INDEX IF NOT EXISTS idx_background_jobs_status ON public.background_jobs(status);
CREATE INDEX IF NOT EXISTS idx_background_jobs_scheduled_at ON public.background_jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_background_jobs_org_id ON public.background_jobs(organization_id);

CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_org_id ON public.webhook_endpoints(organization_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_is_active ON public.webhook_endpoints(is_active);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON public.webhook_deliveries(webhook_endpoint_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON public.webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON public.webhook_deliveries(created_at);

-- Enable RLS on new tables
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archived_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_pool_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS policies for new tables
CREATE POLICY data_retention_policies_read ON public.data_retention_policies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = data_retention_policies.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

CREATE POLICY archived_records_read ON public.archived_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = archived_records.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

CREATE POLICY query_cache_read ON public.query_cache
    FOR SELECT USING (
        organization_id IS NULL OR 
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = query_cache.organization_id
              AND m.user_id = public.current_user_id()
              AND m.status = 'active'
        )
    );

CREATE POLICY notification_preferences_self ON public.notification_preferences
    FOR ALL USING (user_id = public.current_user_id());

-- Advanced functions for scalability

-- Function to archive old records based on retention policies
CREATE OR REPLACE FUNCTION public.archive_old_records()
RETURNS INTEGER AS $$
DECLARE
    policy_record RECORD;
    archived_count INTEGER := 0;
    sql_query TEXT;
BEGIN
    FOR policy_record IN 
        SELECT * FROM public.data_retention_policies 
        WHERE is_active = true AND archive_after IS NOT NULL
    LOOP
        -- Build dynamic SQL to archive records
        sql_query := format('
            INSERT INTO public.archived_records (
                organization_id, original_table, original_id, record_data, 
                archived_reason, archived_at, permanent_delete_at
            )
            SELECT 
                organization_id, %L, id, to_jsonb(%I.*),
                ''Automatic archival based on retention policy'',
                NOW(),
                NOW() + %L::INTERVAL
            FROM public.%I
            WHERE organization_id = %L
              AND created_at < NOW() - %L::INTERVAL
              AND id NOT IN (
                  SELECT original_id FROM public.archived_records 
                  WHERE original_table = %L AND organization_id = %L
              )
        ', 
            policy_record.table_name,
            policy_record.table_name,
            policy_record.delete_after,
            policy_record.table_name,
            policy_record.organization_id,
            policy_record.archive_after,
            policy_record.table_name,
            policy_record.organization_id
        );
        
        EXECUTE sql_query;
        GET DIAGNOSTICS archived_count = ROW_COUNT;
        
        -- Log the archival
        INSERT INTO public.audit_logs (
            organization_id, table_name, action, new_values
        ) VALUES (
            policy_record.organization_id,
            'archived_records',
            'INSERT',
            jsonb_build_object(
                'archived_table', policy_record.table_name,
                'archived_count', archived_count,
                'policy_id', policy_record.id
            )
        );
    END LOOP;
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.query_cache 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup
    INSERT INTO public.audit_logs (
        table_name, action, new_values
    ) VALUES (
        'query_cache',
        'DELETE',
        jsonb_build_object(
            'cleanup_type', 'expired_entries',
            'deleted_count', deleted_count,
            'cleaned_at', NOW()
        )
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or set cached query results
CREATE OR REPLACE FUNCTION public.get_cached_query(
    p_cache_key TEXT,
    p_organization_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    cached_result JSONB;
BEGIN
    SELECT result_data INTO cached_result
    FROM public.query_cache
    WHERE cache_key = p_cache_key
      AND expires_at > NOW()
      AND (p_organization_id IS NULL OR organization_id = p_organization_id);
    
    IF FOUND THEN
        -- Update hit count and last accessed
        UPDATE public.query_cache 
        SET hit_count = hit_count + 1,
            last_accessed = NOW()
        WHERE cache_key = p_cache_key;
        
        RETURN cached_result;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set cached query results
CREATE OR REPLACE FUNCTION public.set_cached_query(
    p_cache_key TEXT,
    p_query_hash TEXT,
    p_result_data JSONB,
    p_ttl_seconds INTEGER DEFAULT 3600,
    p_organization_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO public.query_cache (
        cache_key,
        query_hash,
        result_data,
        organization_id,
        user_id,
        expires_at
    ) VALUES (
        p_cache_key,
        p_query_hash,
        p_result_data,
        p_organization_id,
        p_user_id,
        NOW() + (p_ttl_seconds || ' seconds')::INTERVAL
    )
    ON CONFLICT (cache_key) DO UPDATE SET
        result_data = EXCLUDED.result_data,
        expires_at = EXCLUDED.expires_at,
        hit_count = 0,
        last_accessed = NOW();
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process background jobs
CREATE OR REPLACE FUNCTION public.process_background_job(
    p_job_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    job_record RECORD;
    result_data JSONB;
BEGIN
    -- Get and lock the job
    SELECT * INTO job_record
    FROM public.background_jobs
    WHERE id = p_job_id
      AND status = 'pending'
    FOR UPDATE SKIP LOCKED;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Update job status to running
    UPDATE public.background_jobs
    SET status = 'running',
        started_at = NOW(),
        attempt_count = attempt_count + 1
    WHERE id = p_job_id;
    
    -- Process job based on type
    CASE job_record.job_type
        WHEN 'archive_records' THEN
            result_data := jsonb_build_object(
                'archived_count', public.archive_old_records()
            );
        WHEN 'cleanup_cache' THEN
            result_data := jsonb_build_object(
                'deleted_count', public.cleanup_expired_cache()
            );
        WHEN 'refresh_analytics' THEN
            PERFORM public.refresh_analytics_views();
            result_data := jsonb_build_object(
                'refreshed_at', NOW()
            );
        ELSE
            -- Unknown job type
            UPDATE public.background_jobs
            SET status = 'failed',
                error_message = 'Unknown job type: ' || job_record.job_type,
                completed_at = NOW()
            WHERE id = p_job_id;
            RETURN false;
    END CASE;
    
    -- Mark job as completed
    UPDATE public.background_jobs
    SET status = 'completed',
        result_data = result_data,
        completed_at = NOW()
    WHERE id = p_job_id;
    
    RETURN true;
EXCEPTION WHEN OTHERS THEN
    -- Mark job as failed
    UPDATE public.background_jobs
    SET status = 'failed',
        error_message = SQLERRM,
        completed_at = NOW()
    WHERE id = p_job_id;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to queue background job
CREATE OR REPLACE FUNCTION public.queue_background_job(
    p_job_type TEXT,
    p_job_data JSONB,
    p_organization_id UUID DEFAULT NULL,
    p_priority INTEGER DEFAULT 0,
    p_scheduled_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID AS $$
DECLARE
    job_id UUID;
BEGIN
    INSERT INTO public.background_jobs (
        organization_id,
        job_type,
        job_data,
        priority,
        scheduled_at,
        created_by
    ) VALUES (
        p_organization_id,
        p_job_type,
        p_job_data,
        p_priority,
        p_scheduled_at,
        public.current_user_id()
    ) RETURNING id INTO job_id;
    
    RETURN job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at on new tables
CREATE TRIGGER set_updated_at_data_retention_policies
    BEFORE UPDATE ON public.data_retention_policies
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_connection_pool_config
    BEFORE UPDATE ON public.connection_pool_config
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_background_jobs
    BEFORE UPDATE ON public.background_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_notification_preferences
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_webhook_endpoints
    BEFORE UPDATE ON public.webhook_endpoints
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert default data retention policies
INSERT INTO public.data_retention_policies (
    organization_id, table_name, retention_period, archive_after, delete_after, policy_type, created_by
)
SELECT 
    o.id,
    'audit_logs',
    '7 years'::INTERVAL,
    '1 year'::INTERVAL,
    '7 years'::INTERVAL,
    'legal',
    (SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1)
FROM public.organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM public.data_retention_policies 
    WHERE organization_id = o.id AND table_name = 'audit_logs'
);

-- Add comments for documentation
COMMENT ON TABLE public.data_retention_policies IS 'Data retention and archival policies per organization';
COMMENT ON TABLE public.archived_records IS 'Archived records for compliance and recovery';
COMMENT ON TABLE public.query_cache IS 'Query result caching for performance optimization';
COMMENT ON TABLE public.background_jobs IS 'Asynchronous job processing queue';
COMMENT ON TABLE public.webhook_endpoints IS 'Webhook endpoints for event notifications';

COMMENT ON FUNCTION public.archive_old_records() IS 'Archive old records based on retention policies';
COMMENT ON FUNCTION public.cleanup_expired_cache() IS 'Clean up expired cache entries';
COMMENT ON FUNCTION public.get_cached_query(TEXT, UUID) IS 'Get cached query results';
COMMENT ON FUNCTION public.set_cached_query(TEXT, TEXT, JSONB, INTEGER, UUID, UUID) IS 'Set cached query results';
COMMENT ON FUNCTION public.process_background_job(UUID) IS 'Process a background job';
COMMENT ON FUNCTION public.queue_background_job(TEXT, JSONB, UUID, INTEGER, TIMESTAMPTZ) IS 'Queue a background job';
