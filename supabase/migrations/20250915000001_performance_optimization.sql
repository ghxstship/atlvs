-- Enterprise Performance Optimization Migration
-- Phase 1: Advanced Indexing and Query Optimization

-- Create materialized views for complex reporting queries
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_organization_metrics AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    COUNT(DISTINCT p.id) as total_projects,
    COUNT(DISTINCT pe.id) as total_people,
    COUNT(DISTINCT c.id) as total_companies,
    COALESCE(SUM(b.allocated), 0) as total_budget_allocated,
    COALESCE(SUM(e.amount), 0) as total_expenses,
    COALESCE(SUM(r.amount), 0) as total_revenue,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
    ROUND(
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT t.id), 0) * 100, 2
    ) as task_completion_rate,
    MAX(p.updated_at) as last_project_update,
    NOW() as refreshed_at
FROM public.organizations o
LEFT JOIN public.projects p ON p.organization_id = o.id
LEFT JOIN public.people pe ON pe.organization_id = o.id
LEFT JOIN public.companies c ON c.organization_id = o.id
LEFT JOIN public.budgets b ON b.organization_id = o.id
LEFT JOIN public.expenses e ON e.organization_id = o.id
LEFT JOIN public.revenue r ON r.organization_id = o.id
LEFT JOIN public.tasks t ON t.organization_id = o.id
GROUP BY o.id, o.name;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_organization_metrics_org_id 
ON public.mv_organization_metrics(organization_id);

-- Create materialized view for project analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_project_analytics AS
SELECT 
    p.id as project_id,
    p.organization_id,
    p.name as project_name,
    p.status,
    p.starts_at,
    p.ends_at,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as active_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'todo' THEN t.id END) as pending_tasks,
    COALESCE(SUM(b.allocated), 0) as budget_allocated,
    COALESCE(SUM(e.amount), 0) as expenses_total,
    COALESCE(SUM(CASE WHEN e.status = 'approved' THEN e.amount ELSE 0 END), 0) as expenses_approved,
    COUNT(DISTINCT pe.id) as team_members,
    COUNT(DISTINCT ev.id) as events_count,
    EXTRACT(DAYS FROM (COALESCE(p.ends_at, NOW()) - p.starts_at)) as duration_days,
    CASE 
        WHEN p.ends_at IS NULL THEN NULL
        WHEN p.ends_at < NOW() THEN 'overdue'
        WHEN p.ends_at - NOW() <= INTERVAL '7 days' THEN 'due_soon'
        ELSE 'on_track'
    END as timeline_status,
    NOW() as refreshed_at
FROM public.projects p
LEFT JOIN public.tasks t ON t.project_id = p.id
LEFT JOIN public.budgets b ON b.project_id = p.id
LEFT JOIN public.expenses e ON e.project_id = p.id
LEFT JOIN public.people pe ON pe.organization_id = p.organization_id
LEFT JOIN public.events ev ON ev.project_id = p.id
GROUP BY p.id, p.organization_id, p.name, p.status, p.starts_at, p.ends_at;

-- Create unique index on project analytics
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_project_analytics_project_id 
ON public.mv_project_analytics(project_id);

-- Create materialized view for financial analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_financial_analytics AS
SELECT 
    fa.organization_id,
    DATE_TRUNC('month', COALESCE(ft.created_at, fa.created_at)) as month,
    fa.currency,
    COUNT(DISTINCT fa.id) as accounts_count,
    SUM(fa.balance) as total_balance,
    COUNT(DISTINCT ft.id) as transactions_count,
    SUM(CASE WHEN ft.type = 'debit' THEN ft.amount ELSE 0 END) as total_debits,
    SUM(CASE WHEN ft.type = 'credit' THEN ft.amount ELSE 0 END) as total_credits,
    SUM(CASE WHEN ft.type = 'credit' THEN ft.amount ELSE -ft.amount END) as net_flow,
    COUNT(DISTINCT i.id) as invoices_count,
    SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) as invoices_paid,
    SUM(CASE WHEN i.status = 'pending' THEN i.total ELSE 0 END) as invoices_pending,
    COUNT(DISTINCT e.id) as expenses_count,
    SUM(CASE WHEN e.status = 'approved' THEN e.amount ELSE 0 END) as expenses_approved,
    COUNT(DISTINCT r.id) as revenue_count,
    SUM(CASE WHEN r.status = 'received' THEN r.amount ELSE 0 END) as revenue_received,
    NOW() as refreshed_at
FROM public.finance_accounts fa
LEFT JOIN public.finance_transactions ft ON ft.account_id = fa.id
LEFT JOIN public.invoices i ON i.organization_id = fa.organization_id
LEFT JOIN public.expenses e ON e.organization_id = fa.organization_id
LEFT JOIN public.revenue r ON r.organization_id = fa.organization_id
GROUP BY fa.organization_id, DATE_TRUNC('month', COALESCE(ft.created_at, fa.created_at)), fa.currency;

-- Create composite index on financial analytics
CREATE INDEX IF NOT EXISTS idx_mv_financial_analytics_org_month 
ON public.mv_financial_analytics(organization_id, month);

-- Advanced composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_tasks_org_project_status 
ON public.tasks(organization_id, project_id, status) 
INCLUDE (assignee_id, due_at, created_at);

CREATE INDEX IF NOT EXISTS idx_expenses_org_status_amount 
ON public.expenses(organization_id, status, amount DESC) 
INCLUDE (project_id, created_at);

CREATE INDEX IF NOT EXISTS idx_invoices_org_status_total 
ON public.invoices(organization_id, status, total DESC) 
INCLUDE (project_id, due_date, created_at);

CREATE INDEX IF NOT EXISTS idx_projects_org_status_dates 
ON public.projects(organization_id, status) 
INCLUDE (starts_at, ends_at, created_by, updated_at);

CREATE INDEX IF NOT EXISTS idx_people_org_status_role 
ON public.people(organization_id, status, role) 
INCLUDE (department, created_at);

CREATE INDEX IF NOT EXISTS idx_companies_org_status_industry 
ON public.companies(organization_id, status, industry) 
INCLUDE (created_at, updated_at);

-- Partial indexes for active records only
CREATE INDEX IF NOT EXISTS idx_active_projects_org 
ON public.projects(organization_id, updated_at DESC) 
WHERE status IN ('active', 'planning', 'in_progress');

CREATE INDEX IF NOT EXISTS idx_active_tasks_assignee 
ON public.tasks(assignee_id, due_at) 
WHERE status IN ('todo', 'in_progress');

CREATE INDEX IF NOT EXISTS idx_pending_expenses_org 
ON public.expenses(organization_id, amount DESC, created_at DESC) 
WHERE status IN ('pending', 'submitted');

CREATE INDEX IF NOT EXISTS idx_overdue_invoices_org 
ON public.invoices(organization_id, due_date, total DESC) 
WHERE status = 'pending' AND due_date < NOW();

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_organizations_security_settings_gin 
ON public.organizations USING GIN (security_settings);

CREATE INDEX IF NOT EXISTS idx_users_privacy_settings_gin 
ON public.users USING GIN (privacy_settings);

CREATE INDEX IF NOT EXISTS idx_audit_logs_old_values_gin 
ON public.audit_logs USING GIN (old_values);

CREATE INDEX IF NOT EXISTS idx_audit_logs_new_values_gin 
ON public.audit_logs USING GIN (new_values);

CREATE INDEX IF NOT EXISTS idx_security_events_details_gin 
ON public.security_events USING GIN (details);

-- Text search indexes for common search fields
CREATE INDEX IF NOT EXISTS idx_projects_name_trgm 
ON public.projects USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_companies_name_trgm 
ON public.companies USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_people_full_name_trgm 
ON public.people USING GIN ((first_name || ' ' || last_name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_tasks_title_trgm 
ON public.tasks USING GIN (title gin_trgm_ops);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION public.refresh_analytics_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_organization_metrics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_project_analytics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_financial_analytics;
    
    -- Log the refresh
    INSERT INTO public.audit_logs (
        table_name,
        action,
        new_values
    ) VALUES (
        'materialized_views',
        'REFRESH',
        jsonb_build_object(
            'views_refreshed', ARRAY['mv_organization_metrics', 'mv_project_analytics', 'mv_financial_analytics'],
            'refreshed_at', NOW()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get query performance statistics
CREATE OR REPLACE FUNCTION public.get_query_performance_stats(
    p_organization_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    query_hash TEXT,
    query_text TEXT,
    calls BIGINT,
    total_time DOUBLE PRECISION,
    mean_time DOUBLE PRECISION,
    max_time DOUBLE PRECISION,
    rows_returned BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pss.queryid::TEXT as query_hash,
        pss.query as query_text,
        pss.calls,
        pss.total_exec_time as total_time,
        pss.mean_exec_time as mean_time,
        pss.max_exec_time as max_time,
        pss.rows
    FROM pg_stat_statements pss
    WHERE (p_organization_id IS NULL OR pss.query ILIKE '%' || p_organization_id::TEXT || '%')
    ORDER BY pss.total_exec_time DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to analyze table statistics
CREATE OR REPLACE FUNCTION public.get_table_statistics(
    p_schema_name TEXT DEFAULT 'public'
)
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    table_size TEXT,
    index_size TEXT,
    total_size TEXT,
    last_vacuum TIMESTAMPTZ,
    last_analyze TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::TEXT,
        COALESCE(c.reltuples::BIGINT, 0) as row_count,
        pg_size_pretty(pg_total_relation_size(c.oid) - pg_indexes_size(c.oid)) as table_size,
        pg_size_pretty(pg_indexes_size(c.oid)) as index_size,
        pg_size_pretty(pg_total_relation_size(c.oid)) as total_size,
        s.last_vacuum,
        s.last_analyze
    FROM information_schema.tables t
    LEFT JOIN pg_class c ON c.relname = t.table_name
    LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
    WHERE t.table_schema = p_schema_name
      AND t.table_type = 'BASE TABLE'
    ORDER BY pg_total_relation_size(c.oid) DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to identify missing indexes
CREATE OR REPLACE FUNCTION public.suggest_missing_indexes()
RETURNS TABLE (
    table_name TEXT,
    column_names TEXT,
    reason TEXT,
    estimated_benefit TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Suggest indexes for foreign keys without indexes
    SELECT 
        t.table_name::TEXT,
        t.column_name::TEXT as column_names,
        'Foreign key without index'::TEXT as reason,
        'High - improves JOIN performance'::TEXT as estimated_benefit
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.tables t 
        ON t.table_name = tc.table_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND NOT EXISTS (
          SELECT 1 FROM pg_indexes pi 
          WHERE pi.tablename = tc.table_name 
            AND pi.indexdef ILIKE '%' || kcu.column_name || '%'
      )
    
    UNION ALL
    
    -- Suggest indexes for frequently filtered columns
    SELECT 
        'Multiple tables'::TEXT as table_name,
        'status columns'::TEXT as column_names,
        'Frequently filtered status columns'::TEXT as reason,
        'Medium - improves WHERE clause performance'::TEXT as estimated_benefit
    WHERE NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexdef ILIKE '%status%' 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to optimize query plans
CREATE OR REPLACE FUNCTION public.optimize_query_plans()
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
BEGIN
    -- Update table statistics
    ANALYZE;
    
    -- Refresh materialized views
    PERFORM public.refresh_analytics_views();
    
    result := 'Query optimization completed: ' || 
              'Statistics updated, materialized views refreshed at ' || 
              NOW()::TEXT;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable pg_trgm extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create scheduled job to refresh materialized views (requires pg_cron extension)
-- Note: This would need to be enabled by Supabase support
-- SELECT cron.schedule('refresh-analytics', '0 */6 * * *', 'SELECT public.refresh_analytics_views();');

-- Add comments for documentation
COMMENT ON MATERIALIZED VIEW public.mv_organization_metrics IS 'Real-time organization performance metrics';
COMMENT ON MATERIALIZED VIEW public.mv_project_analytics IS 'Comprehensive project analytics and KPIs';
COMMENT ON MATERIALIZED VIEW public.mv_financial_analytics IS 'Financial performance metrics by month';

COMMENT ON FUNCTION public.refresh_analytics_views() IS 'Refresh all materialized views for analytics';
COMMENT ON FUNCTION public.get_query_performance_stats(UUID, INTEGER) IS 'Get query performance statistics';
COMMENT ON FUNCTION public.get_table_statistics(TEXT) IS 'Get table size and statistics';
COMMENT ON FUNCTION public.suggest_missing_indexes() IS 'Suggest missing indexes for performance';
COMMENT ON FUNCTION public.optimize_query_plans() IS 'Optimize query plans and refresh statistics';
