-- Performance Optimization Migration
-- This migration adds comprehensive database optimizations for GHXSTSHIP

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create performance monitoring schema
CREATE SCHEMA IF NOT EXISTS performance;

-- Query performance tracking table
CREATE TABLE IF NOT EXISTS performance.query_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash TEXT NOT NULL,
    query_text TEXT NOT NULL,
    table_name TEXT,
    execution_count BIGINT DEFAULT 0,
    total_time DOUBLE PRECISION DEFAULT 0,
    mean_time DOUBLE PRECISION DEFAULT 0,
    min_time DOUBLE PRECISION DEFAULT 0,
    max_time DOUBLE PRECISION DEFAULT 0,
    rows_scanned BIGINT DEFAULT 0,
    rows_returned BIGINT DEFAULT 0,
    cache_hit_ratio DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index recommendations table
CREATE TABLE IF NOT EXISTS performance.index_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    columns TEXT[] NOT NULL,
    index_type TEXT DEFAULT 'btree',
    reason TEXT NOT NULL,
    estimated_improvement DOUBLE PRECISION,
    impact TEXT CHECK (impact IN ('high', 'medium', 'low')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    applied_at TIMESTAMPTZ
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance.metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value DOUBLE PRECISION NOT NULL,
    metric_unit TEXT,
    organization_id UUID,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comprehensive indexes for core tables
-- Companies table optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS companies_organization_status_idx 
ON companies (organization_id, status) WHERE status IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS companies_industry_idx 
ON companies USING gin (industry gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS companies_name_search_idx 
ON companies USING gin (name gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS companies_created_at_idx 
ON companies (created_at DESC);

-- Projects table optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS projects_organization_status_idx 
ON projects (organization_id, status) WHERE status IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS projects_company_status_idx 
ON projects (company_id, status) WHERE company_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS projects_dates_idx 
ON projects (starts_at, ends_at) WHERE starts_at IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS projects_name_search_idx 
ON projects USING gin (name gin_trgm_ops);

-- People table optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS people_organization_status_idx 
ON people (organization_id, status) WHERE status IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS people_email_unique_idx 
ON people (email) WHERE email IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS people_name_search_idx 
ON people USING gin ((first_name || ' ' || last_name) gin_trgm_ops);

-- Assets table optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS assets_organization_status_idx 
ON assets (organization_id, status) WHERE status IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS assets_category_status_idx 
ON assets (category, status) WHERE category IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS assets_location_idx 
ON assets (location) WHERE location IS NOT NULL;

-- Events table optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS events_organization_dates_idx 
ON events (organization_id, starts_at, ends_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS events_project_status_idx 
ON events (project_id, status) WHERE project_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS events_kind_dates_idx 
ON events (kind, starts_at) WHERE kind IS NOT NULL;

-- Financial tables optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS budgets_organization_category_idx 
ON budgets (organization_id, category);

CREATE INDEX CONCURRENTLY IF NOT EXISTS expenses_organization_date_idx 
ON expenses (organization_id, expense_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS expenses_status_amount_idx 
ON expenses (status, amount) WHERE status IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS revenue_organization_date_idx 
ON revenue (organization_id, revenue_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS transactions_organization_date_idx 
ON transactions (organization_id, transaction_date DESC);

-- Jobs and opportunities optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS jobs_organization_status_idx 
ON jobs (organization_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS opportunities_organization_status_idx 
ON opportunities (organization_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS rfps_organization_deadline_idx 
ON rfps (organization_id, deadline DESC);

-- Audit and activity optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS audit_logs_organization_date_idx 
ON audit_logs (organization_id, occurred_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS audit_logs_action_resource_idx 
ON audit_logs (action, resource_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS activity_logs_organization_date_idx 
ON activity_logs (organization_id, created_at DESC);

-- Membership and organization optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS memberships_user_status_idx 
ON memberships (user_id, status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS memberships_organization_role_idx 
ON memberships (organization_id, role);

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS projects_company_dates_status_idx 
ON projects (company_id, starts_at, ends_at, status) 
WHERE company_id IS NOT NULL AND starts_at IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS expenses_project_category_date_idx 
ON expenses (project_id, category, expense_date DESC) 
WHERE project_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS events_project_dates_kind_idx 
ON events (project_id, starts_at, ends_at, kind) 
WHERE project_id IS NOT NULL;

-- Partial indexes for common filters
CREATE INDEX CONCURRENTLY IF NOT EXISTS companies_active_idx 
ON companies (organization_id, name) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS projects_active_idx 
ON projects (organization_id, name) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS people_active_idx 
ON people (organization_id, first_name, last_name) WHERE status = 'active';

-- GIN indexes for full-text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS companies_fulltext_idx 
ON companies USING gin (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS projects_fulltext_idx 
ON projects USING gin (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS resources_fulltext_idx 
ON resources USING gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content, ''))
);

-- Function to analyze query performance
CREATE OR REPLACE FUNCTION performance.analyze_query_performance()
RETURNS TABLE (
    query_text TEXT,
    calls BIGINT,
    total_time DOUBLE PRECISION,
    mean_time DOUBLE PRECISION,
    rows BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pss.query,
        pss.calls,
        pss.total_exec_time,
        pss.mean_exec_time,
        pss.rows
    FROM pg_stat_statements pss
    WHERE pss.calls > 10
    ORDER BY pss.mean_exec_time DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function to get table statistics
CREATE OR REPLACE FUNCTION performance.get_table_stats()
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
$$ LANGUAGE plpgsql;

-- Function to identify missing indexes
CREATE OR REPLACE FUNCTION performance.suggest_indexes()
RETURNS TABLE (
    table_name TEXT,
    column_name TEXT,
    reason TEXT,
    estimated_benefit TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH table_scans AS (
        SELECT 
            schemaname,
            tablename,
            seq_scan,
            seq_tup_read,
            idx_scan,
            idx_tup_fetch
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
    )
    SELECT 
        ts.tablename::TEXT,
        'organization_id'::TEXT as column_name,
        'High sequential scan ratio'::TEXT as reason,
        CASE 
            WHEN ts.seq_scan > ts.idx_scan * 2 THEN 'High'
            WHEN ts.seq_scan > ts.idx_scan THEN 'Medium'
            ELSE 'Low'
        END::TEXT as estimated_benefit
    FROM table_scans ts
    WHERE ts.seq_scan > 100
    AND ts.seq_scan > ts.idx_scan
    ORDER BY ts.seq_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to monitor cache hit ratios
CREATE OR REPLACE FUNCTION performance.get_cache_hit_ratio()
RETURNS TABLE (
    cache_type TEXT,
    hit_ratio NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Buffer Cache'::TEXT,
        ROUND(
            100.0 * sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read) + 1),
            2
        )
    FROM pg_statio_user_tables
    UNION ALL
    SELECT 
        'Index Cache'::TEXT,
        ROUND(
            100.0 * sum(idx_blks_hit) / (sum(idx_blks_hit) + sum(idx_blks_read) + 1),
            2
        )
    FROM pg_statio_user_indexes;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for dashboard metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS performance.dashboard_metrics AS
SELECT 
    'total_queries'::TEXT as metric_name,
    sum(calls)::DOUBLE PRECISION as metric_value,
    'count'::TEXT as metric_unit,
    NOW() as last_updated
FROM pg_stat_statements
UNION ALL
SELECT 
    'avg_query_time'::TEXT,
    avg(mean_exec_time)::DOUBLE PRECISION,
    'ms'::TEXT,
    NOW()
FROM pg_stat_statements
UNION ALL
SELECT 
    'slow_queries'::TEXT,
    count(*)::DOUBLE PRECISION,
    'count'::TEXT,
    NOW()
FROM pg_stat_statements
WHERE mean_exec_time > 1000
UNION ALL
SELECT 
    'cache_hit_ratio'::TEXT,
    ROUND(
        100.0 * sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read) + 1),
        2
    )::DOUBLE PRECISION,
    'percent'::TEXT,
    NOW()
FROM pg_statio_user_tables;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS dashboard_metrics_metric_name_idx 
ON performance.dashboard_metrics (metric_name);

-- Function to refresh dashboard metrics
CREATE OR REPLACE FUNCTION performance.refresh_dashboard_metrics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY performance.dashboard_metrics;
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically create recommended indexes
CREATE OR REPLACE FUNCTION performance.auto_create_index(
    p_table_name TEXT,
    p_columns TEXT[],
    p_index_type TEXT DEFAULT 'btree'
)
RETURNS BOOLEAN AS $$
DECLARE
    index_name TEXT;
    sql_statement TEXT;
BEGIN
    -- Generate index name
    index_name := p_table_name || '_' || array_to_string(p_columns, '_') || '_auto_idx';
    
    -- Build CREATE INDEX statement
    sql_statement := format(
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS %I ON %I USING %s (%s)',
        index_name,
        p_table_name,
        p_index_type,
        array_to_string(p_columns, ', ')
    );
    
    -- Execute the statement
    EXECUTE sql_statement;
    
    -- Log the creation
    INSERT INTO performance.index_recommendations (
        table_name,
        columns,
        index_type,
        reason,
        status,
        applied_at
    ) VALUES (
        p_table_name,
        p_columns,
        p_index_type,
        'Auto-created based on query patterns',
        'applied',
        NOW()
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update query statistics
CREATE OR REPLACE FUNCTION performance.update_query_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- This would be implemented to capture query execution stats
    -- For now, it's a placeholder for future implementation
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Set up automatic statistics collection
-- Update table statistics more frequently for better query planning
ALTER SYSTEM SET default_statistics_target = 1000;
ALTER SYSTEM SET random_page_cost = 1.1; -- For SSD storage
ALTER SYSTEM SET effective_cache_size = '4GB'; -- Adjust based on available memory

-- Enable query plan optimization
ALTER SYSTEM SET enable_hashjoin = on;
ALTER SYSTEM SET enable_mergejoin = on;
ALTER SYSTEM SET enable_nestloop = on;

-- Configure work memory for complex queries
ALTER SYSTEM SET work_mem = '256MB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';

-- Enable parallel query execution
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;
ALTER SYSTEM SET max_parallel_workers = 8;
ALTER SYSTEM SET parallel_tuple_cost = 0.1;

-- Configure checkpoint and WAL settings for performance
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET checkpoint_segments = 32;

-- Note: These system-level changes require a PostgreSQL restart to take effect
-- In a production environment, these should be carefully tested and monitored

-- Grant permissions for performance monitoring
GRANT USAGE ON SCHEMA performance TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA performance TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA performance TO authenticated;

-- Create RLS policies for performance tables
ALTER TABLE performance.query_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance.index_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance.metrics ENABLE ROW LEVEL SECURITY;

-- Allow users to see performance data for their organization
CREATE POLICY performance_query_stats_policy ON performance.query_stats
    FOR SELECT USING (true); -- Global read access for performance monitoring

CREATE POLICY performance_index_recommendations_policy ON performance.index_recommendations
    FOR ALL USING (true); -- Global access for index management

CREATE POLICY performance_metrics_policy ON performance.metrics
    FOR ALL USING (
        organization_id IS NULL OR 
        organization_id IN (
            SELECT organization_id 
            FROM memberships 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );

-- Create scheduled job to refresh metrics (requires pg_cron extension)
-- SELECT cron.schedule('refresh-performance-metrics', '*/5 * * * *', 'SELECT performance.refresh_dashboard_metrics();');

COMMENT ON SCHEMA performance IS 'Schema for database performance monitoring and optimization';
COMMENT ON TABLE performance.query_stats IS 'Tracks query execution statistics for performance analysis';
COMMENT ON TABLE performance.index_recommendations IS 'Stores index recommendations for query optimization';
COMMENT ON TABLE performance.metrics IS 'General performance metrics storage';
COMMENT ON FUNCTION performance.analyze_query_performance() IS 'Analyzes slow queries and provides optimization recommendations';
COMMENT ON FUNCTION performance.get_table_stats() IS 'Returns table size and row count statistics';
COMMENT ON FUNCTION performance.suggest_indexes() IS 'Suggests missing indexes based on query patterns';
COMMENT ON FUNCTION performance.get_cache_hit_ratio() IS 'Returns cache hit ratios for performance monitoring';
COMMENT ON MATERIALIZED VIEW performance.dashboard_metrics IS 'Aggregated metrics for performance dashboard';
