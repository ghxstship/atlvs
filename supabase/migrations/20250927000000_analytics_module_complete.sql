-- ============================================
-- ANALYTICS MODULE - COMPLETE DATABASE SCHEMA
-- ============================================
-- This migration creates all tables, policies, indexes, and functions
-- for the Analytics module with comprehensive business intelligence capabilities

-- ============================================
-- CORE ANALYTICS TABLES
-- ============================================

-- Analytics Dashboards
CREATE TABLE IF NOT EXISTS public.analytics_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Dashboard Configuration
    layout JSONB NOT NULL DEFAULT '{"widgets": []}',
    tags TEXT[] DEFAULT '{}',
    
    -- Status and Visibility
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    is_public BOOLEAN NOT NULL DEFAULT false,
    
    -- Metadata
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT analytics_dashboards_name_org_unique UNIQUE (organization_id, name)
);

-- Analytics Reports
CREATE TABLE IF NOT EXISTS public.analytics_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Report Configuration
    data_source VARCHAR(50) NOT NULL CHECK (data_source IN (
        'projects', 'people', 'finance', 'jobs', 'companies', 
        'resources', 'analytics', 'programming', 'procurement'
    )),
    query_config JSONB NOT NULL DEFAULT '{}',
    visualization JSONB,
    parameters JSONB DEFAULT '[]',
    
    -- Scheduling
    schedule JSONB,
    next_run_at TIMESTAMPTZ,
    
    -- Status and Visibility
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    is_public BOOLEAN NOT NULL DEFAULT false,
    
    -- Usage Statistics
    run_count INTEGER NOT NULL DEFAULT 0,
    last_run_at TIMESTAMPTZ,
    
    -- Metadata
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT analytics_reports_name_org_unique UNIQUE (organization_id, name)
);

-- Analytics Export Jobs
CREATE TABLE IF NOT EXISTS public.analytics_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Export Configuration
    data_source VARCHAR(50) NOT NULL CHECK (data_source IN (
        'projects', 'people', 'finance', 'jobs', 'companies', 
        'resources', 'analytics', 'programming', 'procurement'
    )),
    format VARCHAR(10) NOT NULL CHECK (format IN ('csv', 'xlsx', 'json', 'pdf')),
    fields JSONB DEFAULT '[]',
    filters JSONB DEFAULT '{}',
    
    -- Scheduling
    schedule JSONB,
    next_run_at TIMESTAMPTZ,
    
    -- Recipients
    recipients TEXT[] DEFAULT '{}',
    compression BOOLEAN NOT NULL DEFAULT false,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived', 'running', 'completed', 'failed')),
    
    -- Usage Statistics
    run_count INTEGER NOT NULL DEFAULT 0,
    last_run_at TIMESTAMPTZ,
    
    -- Metadata
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT analytics_exports_name_org_unique UNIQUE (organization_id, name)
);

-- Export History
CREATE TABLE IF NOT EXISTS public.analytics_export_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    export_job_id UUID NOT NULL REFERENCES public.analytics_exports(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Execution Details
    status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    file_size BIGINT,
    record_count INTEGER,
    download_url TEXT,
    error_message TEXT,
    
    -- Timing
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Report Templates
CREATE TABLE IF NOT EXISTS public.analytics_report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template Information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    
    -- Template Configuration
    data_source VARCHAR(50) NOT NULL,
    template_config JSONB NOT NULL DEFAULT '{}',
    preview_image TEXT,
    
    -- Metadata
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT analytics_report_templates_name_unique UNIQUE (name)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Analytics Dashboards Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_org_id ON public.analytics_dashboards(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_created_by ON public.analytics_dashboards(created_by);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_status ON public.analytics_dashboards(status);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_is_public ON public.analytics_dashboards(is_public);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_tags ON public.analytics_dashboards USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_created_at ON public.analytics_dashboards(created_at DESC);

-- Analytics Reports Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_reports_org_id ON public.analytics_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_created_by ON public.analytics_reports(created_by);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_data_source ON public.analytics_reports(data_source);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_status ON public.analytics_reports(status);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_next_run_at ON public.analytics_reports(next_run_at) WHERE next_run_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_reports_created_at ON public.analytics_reports(created_at DESC);

-- Analytics Exports Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_exports_org_id ON public.analytics_exports(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_exports_created_by ON public.analytics_exports(created_by);
CREATE INDEX IF NOT EXISTS idx_analytics_exports_data_source ON public.analytics_exports(data_source);
CREATE INDEX IF NOT EXISTS idx_analytics_exports_status ON public.analytics_exports(status);
CREATE INDEX IF NOT EXISTS idx_analytics_exports_next_run_at ON public.analytics_exports(next_run_at) WHERE next_run_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_exports_created_at ON public.analytics_exports(created_at DESC);

-- Export History Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_export_history_export_job_id ON public.analytics_export_history(export_job_id);
CREATE INDEX IF NOT EXISTS idx_analytics_export_history_org_id ON public.analytics_export_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_export_history_status ON public.analytics_export_history(status);
CREATE INDEX IF NOT EXISTS idx_analytics_export_history_started_at ON public.analytics_export_history(started_at DESC);

-- Report Templates Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_report_templates_category ON public.analytics_report_templates(category);
CREATE INDEX IF NOT EXISTS idx_analytics_report_templates_data_source ON public.analytics_report_templates(data_source);
CREATE INDEX IF NOT EXISTS idx_analytics_report_templates_is_system ON public.analytics_report_templates(is_system);

-- ============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ============================================

-- Update timestamps on record changes
CREATE OR REPLACE FUNCTION public.update_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all analytics tables
CREATE TRIGGER analytics_dashboards_updated_at
    BEFORE UPDATE ON public.analytics_dashboards
    FOR EACH ROW EXECUTE FUNCTION public.update_analytics_updated_at();

CREATE TRIGGER analytics_reports_updated_at
    BEFORE UPDATE ON public.analytics_reports
    FOR EACH ROW EXECUTE FUNCTION public.update_analytics_updated_at();

CREATE TRIGGER analytics_exports_updated_at
    BEFORE UPDATE ON public.analytics_exports
    FOR EACH ROW EXECUTE FUNCTION public.update_analytics_updated_at();

CREATE TRIGGER analytics_report_templates_updated_at
    BEFORE UPDATE ON public.analytics_report_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_analytics_updated_at();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_report_templates ENABLE ROW LEVEL SECURITY;

-- Analytics Dashboards Policies
CREATE POLICY analytics_dashboards_org_members ON public.analytics_dashboards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = analytics_dashboards.organization_id
              AND m.user_id = public.current_user_id()
              AND m.status = 'active'
        )
    );

CREATE POLICY analytics_dashboards_create ON public.analytics_dashboards
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = analytics_dashboards.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin', 'manager')
              AND m.status = 'active'
        )
    );

CREATE POLICY analytics_dashboards_update ON public.analytics_dashboards
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = analytics_dashboards.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin', 'manager')
              AND m.status = 'active'
        )
    );

CREATE POLICY analytics_dashboards_delete ON public.analytics_dashboards
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = analytics_dashboards.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

-- Analytics Reports Policies (same pattern)
CREATE POLICY analytics_reports_org_members ON public.analytics_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = analytics_reports.organization_id
              AND m.user_id = public.current_user_id()
              AND m.status = 'active'
        )
    );

CREATE POLICY analytics_reports_create ON public.analytics_reports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = analytics_reports.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin', 'manager')
              AND m.status = 'active'
        )
    );

CREATE POLICY analytics_reports_update ON public.analytics_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = analytics_reports.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin', 'manager')
              AND m.status = 'active'
        )
    );

CREATE POLICY analytics_reports_delete ON public.analytics_reports
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = analytics_reports.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

-- Analytics Exports Policies (same pattern)
CREATE POLICY analytics_exports_org_members ON public.analytics_exports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = analytics_exports.organization_id
              AND m.user_id = public.current_user_id()
              AND m.status = 'active'
        )
    );

CREATE POLICY analytics_exports_create ON public.analytics_exports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = analytics_exports.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin', 'manager')
              AND m.status = 'active'
        )
    );

CREATE POLICY analytics_exports_update ON public.analytics_exports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = analytics_exports.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin', 'manager')
              AND m.status = 'active'
        )
    );

CREATE POLICY analytics_exports_delete ON public.analytics_exports
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = analytics_exports.organization_id
              AND m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

-- Export History Policies
CREATE POLICY analytics_export_history_org_members ON public.analytics_export_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = analytics_export_history.organization_id
              AND m.user_id = public.current_user_id()
              AND m.status = 'active'
        )
    );

-- Report Templates Policies (public read, admin write)
CREATE POLICY analytics_report_templates_public_read ON public.analytics_report_templates
    FOR SELECT USING (true);

CREATE POLICY analytics_report_templates_admin_write ON public.analytics_report_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = public.current_user_id()
              AND m.role IN ('owner', 'admin')
              AND m.status = 'active'
        )
    );

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Function to get analytics statistics
CREATE OR REPLACE FUNCTION public.get_analytics_stats(org_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_dashboards', (
            SELECT COUNT(*) FROM public.analytics_dashboards 
            WHERE organization_id = org_id AND status = 'active'
        ),
        'total_reports', (
            SELECT COUNT(*) FROM public.analytics_reports 
            WHERE organization_id = org_id AND status = 'active'
        ),
        'total_exports', (
            SELECT COUNT(*) FROM public.analytics_exports 
            WHERE organization_id = org_id AND status = 'active'
        ),
        'recent_activity', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', al.id,
                    'type', CASE 
                        WHEN al.action LIKE '%dashboard%' THEN 'dashboard'
                        WHEN al.action LIKE '%report%' THEN 'report'
                        WHEN al.action LIKE '%export%' THEN 'export'
                        ELSE 'other'
                    END,
                    'action', al.action,
                    'timestamp', al.occurred_at,
                    'user', u.name
                )
            )
            FROM public.audit_logs al
            JOIN public.users u ON u.id = al.user_id
            WHERE al.organization_id = org_id
              AND al.action LIKE 'analytics.%'
            ORDER BY al.occurred_at DESC
            LIMIT 10
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to schedule report execution
CREATE OR REPLACE FUNCTION public.schedule_report_execution(report_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    report_record RECORD;
    next_run TIMESTAMPTZ;
BEGIN
    -- Get report details
    SELECT * INTO report_record 
    FROM public.analytics_reports 
    WHERE id = report_id AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate next run time based on schedule
    IF report_record.schedule IS NOT NULL THEN
        CASE report_record.schedule->>'frequency'
            WHEN 'daily' THEN
                next_run := NOW() + INTERVAL '1 day';
            WHEN 'weekly' THEN
                next_run := NOW() + INTERVAL '1 week';
            WHEN 'monthly' THEN
                next_run := NOW() + INTERVAL '1 month';
            ELSE
                next_run := NULL;
        END CASE;
        
        -- Update next run time
        UPDATE public.analytics_reports 
        SET next_run_at = next_run,
            updated_at = NOW()
        WHERE id = report_id;
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DATA - REPORT TEMPLATES
-- ============================================

INSERT INTO public.analytics_report_templates (name, description, category, data_source, template_config, is_system) VALUES
('Project Performance Report', 'Comprehensive project metrics and KPIs', 'projects', 'projects', 
 '{"fields": ["name", "status", "completion_percentage", "budget_utilization"], "charts": ["timeline", "budget_vs_actual"]}', true),
('Financial Summary Report', 'Monthly financial performance overview', 'finance', 'finance', 
 '{"fields": ["revenue", "expenses", "profit_margin"], "charts": ["revenue_trend", "expense_breakdown"]}', true),
('Team Performance Report', 'Employee productivity and engagement metrics', 'people', 'people', 
 '{"fields": ["name", "role", "performance_score", "projects_completed"], "charts": ["performance_distribution", "team_capacity"]}', true),
('Jobs Pipeline Report', 'Current job opportunities and pipeline status', 'jobs', 'jobs', 
 '{"fields": ["title", "status", "value", "probability"], "charts": ["pipeline_funnel", "win_rate_trend"]}', true),
('Company Relationships Report', 'Vendor and client relationship analysis', 'companies', 'companies', 
 '{"fields": ["name", "type", "status", "contract_value"], "charts": ["relationship_map", "contract_timeline"]}', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE public.analytics_dashboards IS 'Custom dashboards with widgets and visualizations';
COMMENT ON TABLE public.analytics_reports IS 'Scheduled and on-demand reports with various data sources';
COMMENT ON TABLE public.analytics_exports IS 'Data export jobs with scheduling and format options';
COMMENT ON TABLE public.analytics_export_history IS 'History of export job executions';
COMMENT ON TABLE public.analytics_report_templates IS 'Pre-built report templates for common use cases';

COMMENT ON FUNCTION public.get_analytics_stats(UUID) IS 'Get comprehensive analytics statistics for an organization';
COMMENT ON FUNCTION public.schedule_report_execution(UUID) IS 'Schedule the next execution of a report based on its schedule configuration';
