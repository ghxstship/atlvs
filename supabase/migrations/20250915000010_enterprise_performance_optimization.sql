-- Enterprise Performance Optimization Migration
-- Phase 1: Advanced Indexing and Query Optimization

-- Enable performance monitoring extensions
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_buffercache";

-- Create performance monitoring tables
CREATE TABLE IF NOT EXISTS public.query_performance_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash TEXT NOT NULL,
    query_text TEXT NOT NULL,
    organization_id UUID REFERENCES public.organizations(id),
    execution_count INTEGER DEFAULT 0,
    total_time NUMERIC DEFAULT 0,
    mean_time NUMERIC DEFAULT 0,
    min_time NUMERIC DEFAULT 0,
    max_time NUMERIC DEFAULT 0,
    rows_returned BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.connection_pool_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_name TEXT NOT NULL,
    active_connections INTEGER DEFAULT 0,
    idle_connections INTEGER DEFAULT 0,
    waiting_connections INTEGER DEFAULT 0,
    max_connections INTEGER DEFAULT 0,
    connection_utilization NUMERIC DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advanced composite indexes for multi-tenant queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_org_status_created 
ON public.projects (organization_id, status, created_at DESC) 
WHERE status IN ('active', 'in_progress');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_project_assignee_status 
ON public.tasks (project_id, assignee_id, status) 
WHERE status != 'completed';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_people_org_role_status 
ON public.people (organization_id, role, status) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_org_industry_status 
ON public.companies (organization_id, industry, status) 
WHERE status = 'active';

-- GIN indexes for JSONB columns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_security_settings_gin 
ON public.organizations USING GIN (security_settings);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_privacy_settings_gin 
ON public.users USING GIN (privacy_settings);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_details_gin 
ON public.audit_logs USING GIN (new_values, old_values);

-- Partial indexes for common filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_memberships_active_org 
ON public.memberships (organization_id, user_id) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_unpaid_org 
ON public.invoices (organization_id, due_date) 
WHERE status IN ('issued', 'overdue');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_upcoming_org 
ON public.events (organization_id, start_date) 
WHERE start_date > NOW() AND status = 'scheduled';

-- Create materialized views for analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_organization_metrics AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    COUNT(DISTINCT p.id) as total_projects,
    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
    COUNT(DISTINCT pe.id) as total_people,
    COUNT(DISTINCT CASE WHEN pe.status = 'active' THEN pe.id END) as active_people,
    COUNT(DISTINCT c.id) as total_companies,
    COUNT(DISTINCT m.id) as total_members,
    COALESCE(SUM(b.allocated_amount), 0) as total_budget,
    COALESCE(SUM(CASE WHEN b.status = 'active' THEN b.allocated_amount ELSE 0 END), 0) as active_budget,
    NOW() as last_updated
FROM public.organizations o
LEFT JOIN public.projects p ON o.id = p.organization_id
LEFT JOIN public.people pe ON o.id = pe.organization_id
LEFT JOIN public.companies c ON o.id = c.organization_id
LEFT JOIN public.memberships m ON o.id = m.organization_id AND m.status = 'active'
LEFT JOIN public.budgets b ON o.id = b.organization_id
GROUP BY o.id, o.name;

CREATE UNIQUE INDEX ON public.mv_organization_metrics (organization_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_project_analytics AS
SELECT 
    p.id as project_id,
    p.organization_id,
    p.name as project_name,
    p.status,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN t.status IN ('todo', 'in_progress') THEN t.id END) as pending_tasks,
    COUNT(DISTINCT pe.id) as assigned_people,
    COALESCE(SUM(b.allocated_amount), 0) as total_budget,
    COALESCE(SUM(b.spent_amount), 0) as spent_amount,
    CASE 
        WHEN COUNT(t.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::NUMERIC / COUNT(t.id)::NUMERIC) * 100, 2)
        ELSE 0 
    END as completion_percentage,
    p.created_at,
    p.updated_at,
    NOW() as last_updated
FROM public.projects p
LEFT JOIN public.tasks t ON p.id = t.project_id
LEFT JOIN public.people pe ON t.assignee_id = pe.id
LEFT JOIN public.budgets b ON p.id = b.project_id
GROUP BY p.id, p.organization_id, p.name, p.status, p.created_at, p.updated_at;

CREATE UNIQUE INDEX ON public.mv_project_analytics (project_id);
CREATE INDEX ON public.mv_project_analytics (organization_id, status);

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_financial_analytics AS
SELECT 
    o.id as organization_id,
    DATE_TRUNC('month', COALESCE(i.created_at, e.created_at, r.created_at)) as month,
    COALESCE(SUM(i.total), 0) as total_invoices,
    COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END), 0) as paid_invoices,
    COALESCE(SUM(e.amount), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN e.status = 'approved' THEN e.amount ELSE 0 END), 0) as approved_expenses,
    COALESCE(SUM(r.amount), 0) as total_revenue,
    COALESCE(SUM(CASE WHEN r.status = 'received' THEN r.amount ELSE 0 END), 0) as received_revenue,
    COUNT(DISTINCT i.id) as invoice_count,
    COUNT(DISTINCT e.id) as expense_count,
    COUNT(DISTINCT r.id) as revenue_count,
    NOW() as last_updated
FROM public.organizations o
LEFT JOIN public.invoices i ON o.id = i.organization_id 
    AND i.created_at >= DATE_TRUNC('year', NOW()) - INTERVAL '1 year'
LEFT JOIN public.expenses e ON o.id = e.organization_id 
    AND e.created_at >= DATE_TRUNC('year', NOW()) - INTERVAL '1 year'
LEFT JOIN public.revenue r ON o.id = r.organization_id 
    AND r.created_at >= DATE_TRUNC('year', NOW()) - INTERVAL '1 year'
GROUP BY o.id, DATE_TRUNC('month', COALESCE(i.created_at, e.created_at, r.created_at));

CREATE INDEX ON public.mv_financial_analytics (organization_id, month);

-- Create query result caching table
CREATE TABLE IF NOT EXISTS public.query_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT NOT NULL UNIQUE,
    organization_id UUID REFERENCES public.organizations(id),
    query_hash TEXT NOT NULL,
    result_data JSONB NOT NULL,
    ttl_seconds INTEGER DEFAULT 3600,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour'),
    hit_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_query_cache_key ON public.query_cache (cache_key);
CREATE INDEX IF NOT EXISTS idx_query_cache_org_expires ON public.query_cache (organization_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_query_cache_expires ON public.query_cache (expires_at);

-- Performance monitoring functions
CREATE OR REPLACE FUNCTION public.get_slow_queries(
    p_organization_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    query_text TEXT,
    execution_count INTEGER,
    mean_time NUMERIC,
    total_time NUMERIC,
    organization_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qps.query_text,
        qps.execution_count,
        qps.mean_time,
        qps.total_time,
        qps.organization_id
    FROM public.query_performance_stats qps
    WHERE (p_organization_id IS NULL OR qps.organization_id = p_organization_id)
    ORDER BY qps.mean_time DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_table_stats(
    p_organization_id UUID DEFAULT NULL
)
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    table_size TEXT,
    index_size TEXT,
    total_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        n_tup_ins + n_tup_upd + n_tup_del as row_count,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) + pg_indexes_size(schemaname||'.'||tablename)) as total_size
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cache management functions
CREATE OR REPLACE FUNCTION public.get_cached_result(
    p_cache_key TEXT,
    p_organization_id UUID
)
RETURNS JSONB AS $$
DECLARE
    cached_data JSONB;
BEGIN
    -- Update hit count and last accessed
    UPDATE public.query_cache 
    SET 
        hit_count = hit_count + 1,
        last_accessed = NOW()
    WHERE cache_key = p_cache_key 
      AND organization_id = p_organization_id
      AND expires_at > NOW()
    RETURNING result_data INTO cached_data;
    
    RETURN cached_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.set_cached_result(
    p_cache_key TEXT,
    p_organization_id UUID,
    p_query_hash TEXT,
    p_result_data JSONB,
    p_ttl_seconds INTEGER DEFAULT 3600
)
RETURNS UUID AS $$
DECLARE
    cache_id UUID;
BEGIN
    INSERT INTO public.query_cache (
        cache_key,
        organization_id,
        query_hash,
        result_data,
        ttl_seconds,
        expires_at
    ) VALUES (
        p_cache_key,
        p_organization_id,
        p_query_hash,
        p_result_data,
        p_ttl_seconds,
        NOW() + (p_ttl_seconds || ' seconds')::INTERVAL
    )
    ON CONFLICT (cache_key) 
    DO UPDATE SET
        result_data = EXCLUDED.result_data,
        ttl_seconds = EXCLUDED.ttl_seconds,
        expires_at = EXCLUDED.expires_at,
        created_at = NOW(),
        hit_count = 0
    RETURNING id INTO cache_id;
    
    RETURN cache_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.invalidate_cache(
    p_organization_id UUID,
    p_pattern TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    IF p_pattern IS NOT NULL THEN
        DELETE FROM public.query_cache 
        WHERE organization_id = p_organization_id 
          AND cache_key LIKE p_pattern;
    ELSE
        DELETE FROM public.query_cache 
        WHERE organization_id = p_organization_id;
    END IF;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup function for expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.query_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Materialized view refresh function
CREATE OR REPLACE FUNCTION public.refresh_analytics_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_organization_metrics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_project_analytics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_financial_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on performance tables
ALTER TABLE public.query_performance_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_pool_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies for performance monitoring (admin/owner only)
CREATE POLICY query_performance_stats_read ON public.query_performance_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = query_performance_stats.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

CREATE POLICY query_cache_read ON public.query_cache
    FOR SELECT USING (
        organization_id IN (
            SELECT m.organization_id FROM public.memberships m
            WHERE m.user_id = public.current_user_id()
              AND m.status = 'active'
        )
    );

-- Create indexes for performance tables
CREATE INDEX IF NOT EXISTS idx_query_performance_org_hash ON public.query_performance_stats(organization_id, query_hash);
CREATE INDEX IF NOT EXISTS idx_connection_pool_recorded ON public.connection_pool_stats(recorded_at);

-- Add comments
COMMENT ON TABLE public.query_performance_stats IS 'Query performance monitoring and optimization';
COMMENT ON TABLE public.connection_pool_stats IS 'Database connection pool monitoring';
COMMENT ON TABLE public.query_cache IS 'Query result caching for performance optimization';
COMMENT ON MATERIALIZED VIEW public.mv_organization_metrics IS 'Real-time organization analytics';
COMMENT ON MATERIALIZED VIEW public.mv_project_analytics IS 'Real-time project analytics and progress tracking';
COMMENT ON MATERIALIZED VIEW public.mv_financial_analytics IS 'Financial analytics and reporting data';
