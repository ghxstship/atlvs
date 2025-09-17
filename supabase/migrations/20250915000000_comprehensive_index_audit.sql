-- Comprehensive Database Index Audit and Performance Optimization
-- Phase 1.4: Database Index Audit - Add missing performance indexes

-- =============================================================================
-- CORE TABLES - MISSING INDEXES
-- =============================================================================

-- Users table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_updated_at ON public.users(updated_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_timezone ON public.users(timezone);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_locale ON public.users(preferred_locale);

-- Organizations table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_created_by ON public.organizations(created_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_created_at ON public.organizations(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_updated_at ON public.organizations(updated_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_stripe_customer ON public.organizations(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Companies table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_industry ON public.companies(industry);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_created_at ON public.companies(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_updated_at ON public.companies(updated_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_name_org ON public.companies(organization_id, name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_status_org ON public.companies(organization_id, status);

-- People table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_people_user_id ON public.people(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_people_email ON public.people(email) WHERE email IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_people_status ON public.people(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_people_role ON public.people(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_people_department ON public.people(department);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_people_created_at ON public.people(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_people_updated_at ON public.people(updated_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_people_name_org ON public.people(organization_id, first_name, last_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_people_status_org ON public.people(organization_id, status);

-- =============================================================================
-- FINANCE MODULE INDEXES
-- =============================================================================

-- Finance accounts indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_finance_accounts_type ON public.finance_accounts(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_finance_accounts_status ON public.finance_accounts(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_finance_accounts_currency ON public.finance_accounts(currency);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_finance_accounts_created_at ON public.finance_accounts(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_finance_accounts_updated_at ON public.finance_accounts(updated_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_finance_accounts_org_type ON public.finance_accounts(organization_id, type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_finance_accounts_org_status ON public.finance_accounts(organization_id, status);

-- Procurement orders indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_procurement_orders_project_id ON public.procurement_orders(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_procurement_orders_status ON public.procurement_orders(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_procurement_orders_vendor ON public.procurement_orders(vendor);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_procurement_orders_currency ON public.procurement_orders(currency);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_procurement_orders_created_at ON public.procurement_orders(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_procurement_orders_updated_at ON public.procurement_orders(updated_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_procurement_orders_org_status ON public.procurement_orders(organization_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_procurement_orders_org_vendor ON public.procurement_orders(organization_id, vendor);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_procurement_orders_number_org ON public.procurement_orders(organization_id, order_number);

-- =============================================================================
-- EVENTS MODULE INDEXES
-- =============================================================================

-- Events table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_type ON public.events(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_end_date ON public.events(end_date) WHERE end_date IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_created_at ON public.events(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_updated_at ON public.events(updated_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_org_type ON public.events(organization_id, type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_org_status ON public.events(organization_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_date_range ON public.events(start_date, end_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_project_date ON public.events(project_id, start_date) WHERE project_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_name_search ON public.events USING gin(to_tsvector('english', name));

-- =============================================================================
-- CONDITIONAL INDEXES FOR OPTIONAL TABLES
-- =============================================================================

-- Projects table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_organization_id ON public.projects(organization_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_status ON public.projects(status)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_priority ON public.projects(priority)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_manager_id ON public.projects(manager_id) WHERE manager_id IS NOT NULL';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_client_id ON public.projects(client_id) WHERE client_id IS NOT NULL';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_created_at ON public.projects(created_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_start_date ON public.projects(start_date) WHERE start_date IS NOT NULL';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_end_date ON public.projects(end_date) WHERE end_date IS NOT NULL';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_org_status ON public.projects(organization_id, status)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_org_priority ON public.projects(organization_id, priority)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_name_search ON public.projects USING gin(to_tsvector(''english'', name))';
    END IF;
END $$;
