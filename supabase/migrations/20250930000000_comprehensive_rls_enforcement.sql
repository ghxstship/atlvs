-- Enterprise RLS Audit and Enforcement
-- Ensures all tables have Row Level Security enabled with proper tenant isolation

-- Function to check if a table has RLS enabled
CREATE OR REPLACE FUNCTION public.check_table_rls_status(p_table_name TEXT)
RETURNS TABLE(table_name TEXT, rls_enabled BOOLEAN, policy_count INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.table_name::TEXT,
        t.row_security::BOOLEAN,
        COUNT(p.policyname)::INTEGER
    FROM information_schema.tables t
    LEFT JOIN pg_policies p ON p.tablename = t.table_name AND p.schemaname = t.table_schema
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND t.table_name = p_table_name
    GROUP BY t.table_name, t.row_security;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enable RLS on a table if not already enabled
CREATE OR REPLACE FUNCTION public.ensure_table_rls(p_table_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    rls_enabled BOOLEAN;
BEGIN
    -- Check if RLS is already enabled
    SELECT row_security INTO rls_enabled
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = p_table_name
      AND table_type = 'BASE TABLE';

    IF rls_enabled IS NULL THEN
        RAISE EXCEPTION 'Table %.% does not exist', 'public', p_table_name;
    END IF;

    IF NOT rls_enabled THEN
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', p_table_name);
        RAISE NOTICE 'Enabled RLS on table: %', p_table_name;
        RETURN true;
    ELSE
        RAISE NOTICE 'RLS already enabled on table: %', p_table_name;
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create standard tenant isolation policy
CREATE OR REPLACE FUNCTION public.create_tenant_policy(
    p_table_name TEXT,
    p_policy_name TEXT DEFAULT 'tenant_isolation',
    p_organization_column TEXT DEFAULT 'organization_id'
)
RETURNS BOOLEAN AS $$
DECLARE
    policy_exists BOOLEAN;
BEGIN
    -- Check if policy already exists
    SELECT EXISTS(
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = p_table_name
          AND policyname = p_policy_name
    ) INTO policy_exists;

    IF NOT policy_exists THEN
        -- Create the policy
        EXECUTE format('
            CREATE POLICY %I ON public.%I
                FOR ALL USING (
                    %I = public.current_organization_id()
                )',
            p_policy_name, p_table_name, p_organization_column
        );
        RAISE NOTICE 'Created tenant policy % on table %', p_policy_name, p_table_name;
        RETURN true;
    ELSE
        RAISE NOTICE 'Policy % already exists on table %', p_policy_name, p_table_name;
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $do_block$
DECLARE
    table_record RECORD;
    tables_to_secure TEXT[] := ARRAY[
        'users', 'organizations', 'memberships', 'user_sessions', 'security_events',
        'audit_logs', 'rate_limits', 'organization_invites', 'api_keys', 'webhooks',
        'projects', 'people', 'companies', 'finance', 'programming_events',
        'procurement', 'jobs', 'analytics', 'assets', 'files', 'settings',
        'dashboard', 'pipeline', 'resources', 'travel_records', 'call_sheets',
        'contracts', 'invoices', 'budgets', 'expenses', 'forecasts', 'transactions',
        'accounts', 'revenue', 'opportunities', 'bids', 'rfps', 'compliance',
        'assignments', 'vendors', 'catalog', 'approvals', 'tracking', 'feedback',
        'marketplace_listings', 'marketplace_vendors', 'marketplace_catalog_items',
        'comments', 'notifications', 'storage_files', 'locations', 'domains',
        'entitlements', 'billing_payments', 'contractor_agreements', 'trainings',
        'training_progress', 'gl_accounts', 'asset_inventory', 'asset_maintenance',
        'asset_tracking', 'asset_reports', 'programming_overview', 'analytics_dashboards',
        'analytics_reports', 'analytics_exports', 'analytics_metrics'
    ];
BEGIN
    -- Ensure all tables exist and enable RLS
    FOREACH table_record IN ARRAY tables_to_secure
    LOOP
        BEGIN
            -- Enable RLS if not already enabled
            PERFORM public.ensure_table_rls(table_record);

            -- Create tenant isolation policy for tables with organization_id
            IF table_record NOT IN ('users', 'organizations', 'user_sessions', 'security_events', 'audit_logs', 'rate_limits') THEN
                PERFORM public.create_tenant_policy(table_record, 'tenant_isolation', 'organization_id');
            END IF;

        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error securing table %: % (SQLSTATE: %)', table_record, SQLERRM, SQLSTATE;
        END LOOP;
    END;

    -- Special policies for core tables
    -- Users table: users can see themselves and other users in their org
    DROP POLICY IF EXISTS users_read ON public.users;
    CREATE POLICY users_read ON public.users
        FOR SELECT USING (
            id = public.current_user_id() OR
            EXISTS (
                SELECT 1 FROM public.memberships m
                WHERE m.user_id = public.current_user_id()
                  AND m.organization_id = (
                      SELECT organization_id FROM public.memberships
                      WHERE user_id = users.id AND status = 'active'
                      LIMIT 1
                  )
                  AND m.status = 'active'
            )
        );

    -- Organizations table: users can see orgs they belong to
    DROP POLICY IF EXISTS organizations_read ON public.organizations;
    CREATE POLICY organizations_read ON public.organizations
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.memberships m
                WHERE m.user_id = public.current_user_id()
                  AND m.organization_id = organizations.id
                  AND m.status = 'active'
            )
        );

    -- Memberships table: users can see memberships for their org
    DROP POLICY IF EXISTS memberships_tenant ON public.memberships;
    CREATE POLICY memberships_tenant ON public.memberships
        FOR ALL USING (
            user_id = public.current_user_id() OR
            EXISTS (
                SELECT 1 FROM public.memberships m
                WHERE m.user_id = public.current_user_id()
                  AND m.organization_id = memberships.organization_id
                  AND m.status = 'active'
            )
        );

    -- User sessions: users can only see their own sessions
    DROP POLICY IF EXISTS user_sessions_owner ON public.user_sessions;
    CREATE POLICY user_sessions_owner ON public.user_sessions
        FOR ALL USING (user_id = public.current_user_id());

    -- Security events: users can see events for their org
    DROP POLICY IF EXISTS security_events_org ON public.security_events;
    CREATE POLICY security_events_org ON public.security_events
        FOR SELECT USING (
            organization_id = public.current_organization_id() OR
            organization_id IS NULL
        );

    -- Audit logs: users can see logs for their org
    DROP POLICY IF EXISTS audit_logs_org ON public.audit_logs;
    CREATE POLICY audit_logs_org ON public.audit_logs
        FOR SELECT USING (
            organization_id = public.current_organization_id() OR
            organization_id IS NULL
        );

    RAISE NOTICE 'Comprehensive RLS enforcement completed';
END $do_block$;
