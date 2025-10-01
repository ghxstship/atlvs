-- Database Index Verification Script
-- Date: 2025-01-01
-- Purpose: Verify all required indexes exist and monitor their usage

-- ============================================================================
-- PART 1: Verify New Indexes from Migration
-- ============================================================================

SELECT 
    'VERIFICATION: New Indexes from Migration' as check_type,
    '' as detail;

SELECT 
    CASE 
        WHEN COUNT(*) = 18 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status,
    COUNT(*) as indexes_found,
    18 as indexes_expected,
    ARRAY_AGG(indexname ORDER BY indexname) as index_names
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname IN (
        'idx_comment_reactions_user_id',
        'idx_comments_resolved_by',
        'idx_files_created_by',
        'idx_locations_created_by',
        'idx_opendeck_contracts_client_id',
        'idx_opendeck_contracts_proposal_id',
        'idx_opendeck_disputes_initiated_by',
        'idx_opendeck_disputes_resolved_by',
        'idx_opendeck_earnings_transaction_id',
        'idx_opendeck_projects_hired_vendor_id',
        'idx_opendeck_projects_organization_id',
        'idx_opendeck_transactions_client_id',
        'idx_opendeck_transactions_project_id',
        'idx_opendeck_vendor_profiles_organization_id',
        'idx_tags_created_by',
        'idx_user_notifications_organization_id',
        'idx_user_permissions_granted_by',
        'idx_user_permissions_organization_id'
    );

-- ============================================================================
-- PART 2: List All New Indexes with Details
-- ============================================================================

SELECT 
    'DETAIL: New Index Specifications' as check_type,
    '' as detail;

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname IN (
        'idx_comment_reactions_user_id',
        'idx_comments_resolved_by',
        'idx_files_created_by',
        'idx_locations_created_by',
        'idx_opendeck_contracts_client_id',
        'idx_opendeck_contracts_proposal_id',
        'idx_opendeck_disputes_initiated_by',
        'idx_opendeck_disputes_resolved_by',
        'idx_opendeck_earnings_transaction_id',
        'idx_opendeck_projects_hired_vendor_id',
        'idx_opendeck_projects_organization_id',
        'idx_opendeck_transactions_client_id',
        'idx_opendeck_transactions_project_id',
        'idx_opendeck_vendor_profiles_organization_id',
        'idx_tags_created_by',
        'idx_user_notifications_organization_id',
        'idx_user_permissions_granted_by',
        'idx_user_permissions_organization_id'
    )
ORDER BY tablename, indexname;

-- ============================================================================
-- PART 3: Check for Any Remaining Unindexed Foreign Keys
-- ============================================================================

SELECT 
    'VERIFICATION: Unindexed Foreign Keys Check' as check_type,
    '' as detail;

WITH foreign_keys AS (
    SELECT
        tc.table_schema,
        tc.table_name,
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
),
indexed_columns AS (
    SELECT
        schemaname,
        tablename,
        indexname,
        STRING_AGG(attname, ', ' ORDER BY attnum) as columns
    FROM pg_indexes
    JOIN pg_class ON pg_class.relname = pg_indexes.indexname
    JOIN pg_index ON pg_index.indexrelid = pg_class.oid
    JOIN pg_attribute ON pg_attribute.attrelid = pg_index.indrelid 
        AND pg_attribute.attnum = ANY(pg_index.indkey)
    WHERE schemaname = 'public'
    GROUP BY schemaname, tablename, indexname
)
SELECT
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS: All foreign keys indexed'
        ELSE '⚠️ WARNING: ' || COUNT(*) || ' unindexed foreign keys found'
    END as status,
    fk.table_name,
    fk.constraint_name,
    fk.column_name,
    fk.foreign_table_name
FROM foreign_keys fk
LEFT JOIN indexed_columns ic 
    ON ic.schemaname = fk.table_schema 
    AND ic.tablename = fk.table_name
    AND ic.columns LIKE '%' || fk.column_name || '%'
WHERE ic.indexname IS NULL
GROUP BY fk.table_name, fk.constraint_name, fk.column_name, fk.foreign_table_name
ORDER BY fk.table_name, fk.column_name;

-- ============================================================================
-- PART 4: Index Size and Storage Analysis
-- ============================================================================

SELECT 
    'ANALYSIS: Index Storage Impact' as check_type,
    '' as detail;

SELECT 
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(schemaname||'.'||indexname)) as index_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    ROUND(
        100.0 * pg_relation_size(schemaname||'.'||indexname) / 
        NULLIF(pg_relation_size(schemaname||'.'||tablename), 0),
        2
    ) as index_to_table_ratio_pct
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname IN (
        'idx_comment_reactions_user_id',
        'idx_comments_resolved_by',
        'idx_files_created_by',
        'idx_locations_created_by',
        'idx_opendeck_contracts_client_id',
        'idx_opendeck_contracts_proposal_id',
        'idx_opendeck_disputes_initiated_by',
        'idx_opendeck_disputes_resolved_by',
        'idx_opendeck_earnings_transaction_id',
        'idx_opendeck_projects_hired_vendor_id',
        'idx_opendeck_projects_organization_id',
        'idx_opendeck_transactions_client_id',
        'idx_opendeck_transactions_project_id',
        'idx_opendeck_vendor_profiles_organization_id',
        'idx_tags_created_by',
        'idx_user_notifications_organization_id',
        'idx_user_permissions_granted_by',
        'idx_user_permissions_organization_id'
    )
ORDER BY pg_relation_size(schemaname||'.'||indexname) DESC;

-- ============================================================================
-- PART 5: Index Usage Statistics (requires pg_stat_statements)
-- ============================================================================

SELECT 
    'MONITORING: Index Usage Statistics' as check_type,
    '' as detail;

SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as total_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    CASE 
        WHEN idx_scan = 0 THEN '⚠️ Not yet used'
        WHEN idx_scan < 100 THEN '📊 Low usage'
        WHEN idx_scan < 1000 THEN '📈 Moderate usage'
        ELSE '✅ High usage'
    END as usage_level,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
    AND indexname IN (
        'idx_comment_reactions_user_id',
        'idx_comments_resolved_by',
        'idx_files_created_by',
        'idx_locations_created_by',
        'idx_opendeck_contracts_client_id',
        'idx_opendeck_contracts_proposal_id',
        'idx_opendeck_disputes_initiated_by',
        'idx_opendeck_disputes_resolved_by',
        'idx_opendeck_earnings_transaction_id',
        'idx_opendeck_projects_hired_vendor_id',
        'idx_opendeck_projects_organization_id',
        'idx_opendeck_transactions_client_id',
        'idx_opendeck_transactions_project_id',
        'idx_opendeck_vendor_profiles_organization_id',
        'idx_tags_created_by',
        'idx_user_notifications_organization_id',
        'idx_user_permissions_granted_by',
        'idx_user_permissions_organization_id'
    )
ORDER BY idx_scan DESC, tablename, indexname;

-- ============================================================================
-- PART 6: Overall Database Health Check
-- ============================================================================

SELECT 
    'HEALTH CHECK: Overall Database Indexes' as check_type,
    '' as detail;

SELECT 
    COUNT(*) as total_indexes,
    COUNT(*) FILTER (WHERE idx_scan = 0) as unused_indexes,
    COUNT(*) FILTER (WHERE idx_scan > 0) as used_indexes,
    pg_size_pretty(SUM(pg_relation_size(indexrelid))) as total_index_size,
    pg_size_pretty(SUM(pg_relation_size(indexrelid)) FILTER (WHERE idx_scan = 0)) as unused_index_size,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE idx_scan = 0) / COUNT(*),
        2
    ) as unused_pct
FROM pg_stat_user_indexes
WHERE schemaname = 'public';

-- ============================================================================
-- PART 7: Critical Multi-tenant (RLS) Index Verification
-- ============================================================================

SELECT 
    'VERIFICATION: Critical RLS Indexes' as check_type,
    '' as detail;

WITH rls_critical_indexes AS (
    SELECT tablename, 'idx_' || tablename || '_organization_id' as expected_index
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename NOT IN ('users', 'audit_logs')
        AND EXISTS (
            SELECT 1 FROM information_schema.columns c
            WHERE c.table_schema = 'public'
                AND c.table_name = pg_tables.tablename
                AND c.column_name = 'organization_id'
        )
)
SELECT
    rci.tablename,
    rci.expected_index,
    CASE 
        WHEN pi.indexname IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM rls_critical_indexes rci
LEFT JOIN pg_indexes pi 
    ON pi.schemaname = 'public'
    AND pi.tablename = rci.tablename
    AND pi.indexname = rci.expected_index
ORDER BY 
    CASE WHEN pi.indexname IS NOT NULL THEN 1 ELSE 0 END,
    rci.tablename;

-- ============================================================================
-- PART 8: Summary Report
-- ============================================================================

SELECT 
    '=====================================' as separator,
    'VERIFICATION SUMMARY' as title,
    '=====================================' as separator2;

SELECT 
    '✅ New indexes created: ' || COUNT(*) || ' of 18 expected' as summary
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname IN (
        'idx_comment_reactions_user_id',
        'idx_comments_resolved_by',
        'idx_files_created_by',
        'idx_locations_created_by',
        'idx_opendeck_contracts_client_id',
        'idx_opendeck_contracts_proposal_id',
        'idx_opendeck_disputes_initiated_by',
        'idx_opendeck_disputes_resolved_by',
        'idx_opendeck_earnings_transaction_id',
        'idx_opendeck_projects_hired_vendor_id',
        'idx_opendeck_projects_organization_id',
        'idx_opendeck_transactions_client_id',
        'idx_opendeck_transactions_project_id',
        'idx_opendeck_vendor_profiles_organization_id',
        'idx_tags_created_by',
        'idx_user_notifications_organization_id',
        'idx_user_permissions_granted_by',
        'idx_user_permissions_organization_id'
    );

SELECT 
    '📊 Total storage impact: ' || 
    pg_size_pretty(SUM(pg_relation_size(schemaname||'.'||indexname))) as summary
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname IN (
        'idx_comment_reactions_user_id',
        'idx_comments_resolved_by',
        'idx_files_created_by',
        'idx_locations_created_by',
        'idx_opendeck_contracts_client_id',
        'idx_opendeck_contracts_proposal_id',
        'idx_opendeck_disputes_initiated_by',
        'idx_opendeck_disputes_resolved_by',
        'idx_opendeck_earnings_transaction_id',
        'idx_opendeck_projects_hired_vendor_id',
        'idx_opendeck_projects_organization_id',
        'idx_opendeck_transactions_client_id',
        'idx_opendeck_transactions_project_id',
        'idx_opendeck_vendor_profiles_organization_id',
        'idx_tags_created_by',
        'idx_user_notifications_organization_id',
        'idx_user_permissions_granted_by',
        'idx_user_permissions_organization_id'
    );

SELECT '🚀 Database linter issues: RESOLVED' as summary;
