-- Advanced Database Indexes - Part 2
-- Additional performance indexes for complex query patterns

-- =============================================================================
-- NOTIFICATIONS AND AUDIT INDEXES
-- =============================================================================

-- Notifications table indexes (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_organization_id ON public.notifications(organization_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type ON public.notifications(type)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at) WHERE expires_at IS NOT NULL';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_org_type ON public.notifications(organization_id, type)';
    END IF;
END $$;

-- Audit logs table indexes (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_organization_id ON public.audit_logs(organization_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_resource_type ON public.audit_logs(resource_type)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_resource_id ON public.audit_logs(resource_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_org_action ON public.audit_logs(organization_id, action)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_org_resource ON public.audit_logs(organization_id, resource_type)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_action ON public.audit_logs(user_id, action)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_resource_action ON public.audit_logs(resource_type, action)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_date_range ON public.audit_logs(created_at, organization_id)';
    END IF;
END $$;

-- =============================================================================
-- FILES AND STORAGE INDEXES
-- =============================================================================

-- Files table indexes (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'files') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_files_organization_id ON public.files(organization_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_files_project_id ON public.files(project_id) WHERE project_id IS NOT NULL';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_files_uploaded_by ON public.files(uploaded_by)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_files_mime_type ON public.files(mime_type)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_files_size ON public.files(size)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_files_is_public ON public.files(is_public)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_files_created_at ON public.files(created_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_files_updated_at ON public.files(updated_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_files_name_search ON public.files USING gin(to_tsvector(''english'', name))';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_files_org_project ON public.files(organization_id, project_id) WHERE project_id IS NOT NULL';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_files_org_type ON public.files(organization_id, mime_type)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_files_uploader_date ON public.files(uploaded_by, created_at)';
    END IF;
END $$;

-- =============================================================================
-- MEMBERSHIP AND PERMISSIONS INDEXES
-- =============================================================================

-- Organization members/memberships table indexes (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organization_members') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organization_members_organization_id ON public.organization_members(organization_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organization_members_user_id ON public.organization_members(user_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organization_members_role ON public.organization_members(role)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organization_members_status ON public.organization_members(status)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organization_members_is_active ON public.organization_members(is_active)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organization_members_created_at ON public.organization_members(created_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organization_members_org_role ON public.organization_members(organization_id, role)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organization_members_org_status ON public.organization_members(organization_id, status)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organization_members_user_active ON public.organization_members(user_id, is_active)';
    END IF;
    
    -- Alternative table name
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'memberships') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_memberships_organization_id ON public.memberships(organization_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_memberships_role ON public.memberships(role)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_memberships_status ON public.memberships(status)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_memberships_created_at ON public.memberships(created_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_memberships_org_role ON public.memberships(organization_id, role)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_memberships_org_status ON public.memberships(organization_id, status)';
    END IF;
END $$;

-- =============================================================================
-- JOBS MODULE INDEXES
-- =============================================================================

-- Jobs table indexes (already exists but add missing ones)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_rfp_id ON public.jobs(rfp_id) WHERE rfp_id IS NOT NULL';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_title_search ON public.jobs USING gin(to_tsvector(''english'', title))';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_org_status ON public.jobs(organization_id, status)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_updated_at ON public.jobs(updated_at)';
    END IF;
END $$;

-- Opportunities table indexes (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'opportunities') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunities_organization_id ON public.opportunities(organization_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunities_status ON public.opportunities(status)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunities_type ON public.opportunities(type)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunities_value ON public.opportunities(value)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunities_deadline ON public.opportunities(deadline) WHERE deadline IS NOT NULL';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunities_created_at ON public.opportunities(created_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunities_org_status ON public.opportunities(organization_id, status)';
    END IF;
END $$;

-- =============================================================================
-- MARKETPLACE INDEXES
-- =============================================================================

-- Marketplace listings table indexes (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_listings') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_listings_organization_id ON public.marketplace_listings(organization_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_listings_vendor_id ON public.marketplace_listings(vendor_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_listings_category ON public.marketplace_listings(category)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_listings_price ON public.marketplace_listings(price)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_listings_created_at ON public.marketplace_listings(created_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_listings_title_search ON public.marketplace_listings USING gin(to_tsvector(''english'', title))';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_listings_org_category ON public.marketplace_listings(organization_id, category)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_listings_vendor_status ON public.marketplace_listings(vendor_id, status)';
    END IF;
END $$;

-- Marketplace vendors table indexes (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_vendors') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_vendors_organization_id ON public.marketplace_vendors(organization_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_vendors_status ON public.marketplace_vendors(status)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_vendors_rating ON public.marketplace_vendors(rating)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_vendors_created_at ON public.marketplace_vendors(created_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_vendors_name_search ON public.marketplace_vendors USING gin(to_tsvector(''english'', name))';
    END IF;
END $$;

-- =============================================================================
-- PROGRAMMING MODULE INDEXES
-- =============================================================================

-- Programming events table indexes (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'programming_events') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_programming_events_organization_id ON public.programming_events(organization_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_programming_events_project_id ON public.programming_events(project_id) WHERE project_id IS NOT NULL';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_programming_events_status ON public.programming_events(status)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_programming_events_type ON public.programming_events(type)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_programming_events_start_date ON public.programming_events(start_date)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_programming_events_end_date ON public.programming_events(end_date) WHERE end_date IS NOT NULL';
    END IF;
END $$;

-- Programming lineups table indexes (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'programming_lineups') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_programming_lineups_organization_id ON public.programming_lineups(organization_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_programming_lineups_event_id ON public.programming_lineups(event_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_programming_lineups_performer_id ON public.programming_lineups(performer_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_programming_lineups_stage ON public.programming_lineups(stage)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_programming_lineups_start_time ON public.programming_lineups(start_time)';
    END IF;
END $$;

-- =============================================================================
-- ANALYTICS AND REPORTING INDEXES
-- =============================================================================

-- Reports table indexes (already exists but add missing ones)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reports') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_name_search ON public.reports USING gin(to_tsvector(''english'', name))';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_created_at ON public.reports(created_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_updated_at ON public.reports(updated_at)';
    END IF;
END $$;

-- Dashboards table indexes (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dashboards') THEN
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dashboards_organization_id ON public.dashboards(organization_id)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dashboards_created_by ON public.dashboards(created_by)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dashboards_is_public ON public.dashboards(is_public)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dashboards_created_at ON public.dashboards(created_at)';
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dashboards_name_search ON public.dashboards USING gin(to_tsvector(''english'', name))';
    END IF;
END $$;
