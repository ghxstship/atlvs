-- Database Performance Analysis and Monitoring
-- Phase 1.4: Performance analysis functions and views

-- =============================================================================
-- PERFORMANCE MONITORING FUNCTIONS
-- =============================================================================

-- Function to analyze table sizes and index usage
CREATE OR REPLACE FUNCTION public.analyze_table_performance()
RETURNS TABLE (
    table_name text,
    table_size text,
    index_size text,
    total_size text,
    row_count bigint,
    seq_scan bigint,
    seq_tup_read bigint,
    idx_scan bigint,
    idx_tup_fetch bigint,
    n_tup_ins bigint,
    n_tup_upd bigint,
    n_tup_del bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) + pg_indexes_size(schemaname||'.'||tablename)) as total_size,
        n_tup_ins + n_tup_upd + n_tup_del as row_count,
        seq_scan,
        seq_tup_read,
        idx_scan,
        idx_tup_fetch,
        n_tup_ins,
        n_tup_upd,
        n_tup_del
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to identify missing indexes
CREATE OR REPLACE FUNCTION public.identify_missing_indexes()
RETURNS TABLE (
    table_name text,
    column_name text,
    constraint_type text,
    recommendation text
) AS $$
BEGIN
    RETURN QUERY
    -- Find foreign key columns without indexes
    SELECT 
        tc.table_name::text,
        kcu.column_name::text,
        'foreign_key'::text as constraint_type,
        'Consider adding index on ' || kcu.column_name || ' for FK performance'::text as recommendation
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' 
                AND tablename = tc.table_name 
                AND indexdef LIKE '%' || kcu.column_name || '%'
        )
    
    UNION ALL
    
    -- Find frequently queried columns without indexes
    SELECT 
        t.table_name::text,
        c.column_name::text,
        'frequent_filter'::text as constraint_type,
        'Consider adding index on ' || c.column_name || ' for filtering performance'::text as recommendation
    FROM information_schema.tables t
    JOIN information_schema.columns c ON t.table_name = c.table_name
    WHERE t.table_schema = 'public'
        AND c.table_schema = 'public'
        AND c.column_name IN ('status', 'type', 'category', 'priority', 'is_active', 'is_public')
        AND NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' 
                AND tablename = t.table_name 
                AND indexdef LIKE '%' || c.column_name || '%'
        )
    ORDER BY table_name, column_name;
END;
$$ LANGUAGE plpgsql;

-- Function to analyze slow queries
CREATE OR REPLACE FUNCTION public.analyze_query_performance()
RETURNS TABLE (
    query text,
    calls bigint,
    total_time double precision,
    mean_time double precision,
    rows bigint,
    hit_percent double precision
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        substr(query, 1, 100) as query,
        calls,
        total_exec_time as total_time,
        mean_exec_time as mean_time,
        rows,
        CASE 
            WHEN (shared_blks_hit + shared_blks_read) > 0 
            THEN (shared_blks_hit::float / (shared_blks_hit + shared_blks_read)) * 100 
            ELSE 0 
        END as hit_percent
    FROM pg_stat_statements 
    WHERE query NOT LIKE '%pg_stat_statements%'
        AND query NOT LIKE '%information_schema%'
    ORDER BY total_exec_time DESC
    LIMIT 20;
EXCEPTION
    WHEN undefined_table THEN
        -- pg_stat_statements extension not available
        RETURN;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- PERFORMANCE MONITORING VIEWS
-- =============================================================================

-- View for table statistics
CREATE OR REPLACE VIEW public.table_performance_stats AS
SELECT 
    schemaname||'.'||tablename as table_name,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
    n_tup_ins + n_tup_upd + n_tup_del as total_operations,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    CASE 
        WHEN seq_scan + idx_scan > 0 
        THEN round((idx_scan::float / (seq_scan + idx_scan)) * 100, 2) 
        ELSE 0 
    END as index_usage_percent,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- View for index usage statistics
CREATE OR REPLACE VIEW public.index_usage_stats AS
SELECT 
    schemaname||'.'||tablename as table_name,
    indexrelname as index_name,
    idx_scan as times_used,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- View for unused indexes
CREATE OR REPLACE VIEW public.unused_indexes AS
SELECT 
    schemaname||'.'||tablename as table_name,
    indexrelname as index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as times_used
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
    AND idx_scan = 0
    AND indexrelname NOT LIKE '%_pkey'  -- Exclude primary keys
ORDER BY pg_relation_size(indexrelid) DESC;

-- =============================================================================
-- MAINTENANCE FUNCTIONS
-- =============================================================================

-- Function to update table statistics
CREATE OR REPLACE FUNCTION public.update_table_statistics()
RETURNS text AS $$
DECLARE
    table_record RECORD;
    result_text text := '';
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ANALYZE public.' || quote_ident(table_record.tablename);
        result_text := result_text || 'Analyzed table: ' || table_record.tablename || E'\n';
    END LOOP;
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- Function to identify tables needing vacuum
CREATE OR REPLACE FUNCTION public.identify_vacuum_candidates()
RETURNS TABLE (
    table_name text,
    n_dead_tup bigint,
    n_live_tup bigint,
    dead_tup_percent numeric,
    last_vacuum timestamp with time zone,
    last_autovacuum timestamp with time zone,
    recommendation text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        n_dead_tup,
        n_live_tup,
        CASE 
            WHEN n_live_tup > 0 
            THEN round((n_dead_tup::numeric / n_live_tup) * 100, 2)
            ELSE 0 
        END as dead_tup_percent,
        last_vacuum,
        last_autovacuum,
        CASE 
            WHEN n_dead_tup > 1000 AND n_live_tup > 0 AND (n_dead_tup::float / n_live_tup) > 0.1 
            THEN 'VACUUM recommended - high dead tuple ratio'
            WHEN n_dead_tup > 10000 
            THEN 'VACUUM recommended - high dead tuple count'
            ELSE 'No immediate action needed'
        END as recommendation
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
    ORDER BY n_dead_tup DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- PERFORMANCE OPTIMIZATION RECOMMENDATIONS
-- =============================================================================

-- Function to generate performance recommendations
CREATE OR REPLACE FUNCTION public.generate_performance_recommendations()
RETURNS TABLE (
    category text,
    priority text,
    table_name text,
    recommendation text,
    impact text
) AS $$
BEGIN
    -- Missing foreign key indexes
    RETURN QUERY
    SELECT 
        'Missing Indexes'::text as category,
        'HIGH'::text as priority,
        tc.table_name::text,
        'Add index on ' || kcu.column_name || ' (foreign key)'::text as recommendation,
        'Improves JOIN performance and referential integrity checks'::text as impact
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' 
                AND tablename = tc.table_name 
                AND indexdef LIKE '%' || kcu.column_name || '%'
        )
    
    UNION ALL
    
    -- Tables with high sequential scan ratio
    SELECT 
        'Query Optimization'::text as category,
        'MEDIUM'::text as priority,
        schemaname||'.'||tablename as table_name,
        'Consider adding indexes - high sequential scan ratio'::text as recommendation,
        'Reduces full table scans and improves query performance'::text as impact
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
        AND seq_scan > 100
        AND idx_scan > 0
        AND (seq_scan::float / (seq_scan + idx_scan)) > 0.5
    
    UNION ALL
    
    -- Tables needing vacuum
    SELECT 
        'Maintenance'::text as category,
        'MEDIUM'::text as priority,
        schemaname||'.'||tablename as table_name,
        'VACUUM recommended - high dead tuple ratio'::text as recommendation,
        'Reclaims space and improves query performance'::text as impact
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
        AND n_dead_tup > 1000 
        AND n_live_tup > 0 
        AND (n_dead_tup::float / n_live_tup) > 0.1
    
    UNION ALL
    
    -- Large tables without recent analysis
    SELECT 
        'Maintenance'::text as category,
        'LOW'::text as priority,
        schemaname||'.'||tablename as table_name,
        'Update table statistics with ANALYZE'::text as recommendation,
        'Improves query planner decisions'::text as impact
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
        AND (last_analyze IS NULL OR last_analyze < NOW() - INTERVAL '7 days')
        AND (n_tup_ins + n_tup_upd + n_tup_del) > 1000
    
    ORDER BY 
        CASE priority 
            WHEN 'HIGH' THEN 1 
            WHEN 'MEDIUM' THEN 2 
            WHEN 'LOW' THEN 3 
        END,
        table_name;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- PERFORMANCE MONITORING DASHBOARD FUNCTION
-- =============================================================================

-- Function to generate a comprehensive performance report
CREATE OR REPLACE FUNCTION public.database_performance_report()
RETURNS TABLE (
    section text,
    metric text,
    value text,
    status text,
    recommendation text
) AS $$
BEGIN
    -- Database size metrics
    RETURN QUERY
    SELECT 
        'Database Size'::text as section,
        'Total Database Size'::text as metric,
        pg_size_pretty(pg_database_size(current_database()))::text as value,
        'INFO'::text as status,
        'Monitor growth trends'::text as recommendation
    
    UNION ALL
    
    SELECT 
        'Database Size'::text as section,
        'Total Tables'::text as metric,
        count(*)::text as value,
        'INFO'::text as status,
        'Normal'::text as recommendation
    FROM pg_tables WHERE schemaname = 'public'
    
    UNION ALL
    
    SELECT 
        'Database Size'::text as section,
        'Total Indexes'::text as metric,
        count(*)::text as value,
        'INFO'::text as status,
        'Normal'::text as recommendation
    FROM pg_indexes WHERE schemaname = 'public'
    
    UNION ALL
    
    -- Performance metrics
    SELECT 
        'Performance'::text as section,
        'Tables with High Sequential Scans'::text as metric,
        count(*)::text as value,
        CASE WHEN count(*) > 5 THEN 'WARNING' ELSE 'OK' END::text as status,
        CASE WHEN count(*) > 5 THEN 'Review indexing strategy' ELSE 'Good' END::text as recommendation
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
        AND seq_scan > 100
        AND idx_scan > 0
        AND (seq_scan::float / (seq_scan + idx_scan)) > 0.5
    
    UNION ALL
    
    SELECT 
        'Performance'::text as section,
        'Unused Indexes'::text as metric,
        count(*)::text as value,
        CASE WHEN count(*) > 10 THEN 'WARNING' ELSE 'OK' END::text as status,
        CASE WHEN count(*) > 10 THEN 'Consider dropping unused indexes' ELSE 'Good' END::text as recommendation
    FROM pg_stat_user_indexes 
    WHERE schemaname = 'public'
        AND idx_scan = 0
        AND indexrelname NOT LIKE '%_pkey'
    
    UNION ALL
    
    -- Maintenance metrics
    SELECT 
        'Maintenance'::text as section,
        'Tables Needing Vacuum'::text as metric,
        count(*)::text as value,
        CASE WHEN count(*) > 3 THEN 'WARNING' ELSE 'OK' END::text as status,
        CASE WHEN count(*) > 3 THEN 'Schedule vacuum operations' ELSE 'Good' END::text as recommendation
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
        AND n_dead_tup > 1000 
        AND n_live_tup > 0 
        AND (n_dead_tup::float / n_live_tup) > 0.1
    
    ORDER BY section, metric;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.analyze_table_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.identify_missing_indexes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.analyze_query_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_table_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.identify_vacuum_candidates() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_performance_recommendations() TO authenticated;
GRANT EXECUTE ON FUNCTION public.database_performance_report() TO authenticated;
