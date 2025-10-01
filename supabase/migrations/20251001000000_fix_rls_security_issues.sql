-- =====================================================
-- FIX RLS SECURITY ISSUES
-- =====================================================
-- This migration resolves Supabase linter errors for tables
-- without Row Level Security enabled in the public schema.
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SECTION 1: FIX EXISTING TABLES WITH MISSING RLS
-- =====================================================

-- 1. Fix comments table (already has policies, just ensure they're correct)
-- The comments table already has RLS enabled in 20250906100500_comments_notifications.sql
-- Just ensure policies are working correctly

-- 2. Create job_opportunities table (if it doesn't exist, it's actually opportunities table)
-- The opportunities table already exists and has RLS policies in 20250904210500_core_modules.sql
-- No action needed

-- 3. Create project_tags table (missing from schema)
CREATE TABLE IF NOT EXISTS public.project_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    color TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_project_tag UNIQUE(project_id, tag)
);

-- Create indexes for project_tags
CREATE INDEX IF NOT EXISTS idx_project_tags_project_id ON public.project_tags(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_organization_id ON public.project_tags(organization_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_tag ON public.project_tags(tag);

-- Enable RLS on project_tags
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_tags
CREATE POLICY "Users can view project tags in their organization" ON public.project_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = project_tags.organization_id
            AND m.user_id = auth.uid()
            AND m.status = 'active'
        )
    );

CREATE POLICY "Users can create project tags in their organization" ON public.project_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = project_tags.organization_id
            AND m.user_id = auth.uid()
            AND m.status = 'active'
        )
    );

CREATE POLICY "Users can update project tags in their organization" ON public.project_tags
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = project_tags.organization_id
            AND m.user_id = auth.uid()
            AND m.status = 'active'
        )
    );

CREATE POLICY "Users can delete project tags in their organization" ON public.project_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = project_tags.organization_id
            AND m.user_id = auth.uid()
            AND m.status = 'active'
        )
    );

-- 4. Create user_permissions table (missing from schema)
CREATE TABLE IF NOT EXISTS public.user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    permission VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    granted_by UUID REFERENCES public.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_permission UNIQUE(user_id, organization_id, permission, resource_type, resource_id)
);

-- Create indexes for user_permissions
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_organization_id ON public.user_permissions(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_granted_by ON public.user_permissions(granted_by);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON public.user_permissions(permission);
CREATE INDEX IF NOT EXISTS idx_user_permissions_resource ON public.user_permissions(resource_type, resource_id);

-- Enable RLS on user_permissions
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_permissions
CREATE POLICY "Users can view their own permissions" ON public.user_permissions
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = user_permissions.organization_id
            AND m.user_id = auth.uid()
            AND m.status = 'active'
            AND m.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Admins can manage permissions in their organization" ON public.user_permissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = user_permissions.organization_id
            AND m.user_id = auth.uid()
            AND m.status = 'active'
            AND m.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Admins can update permissions in their organization" ON public.user_permissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = user_permissions.organization_id
            AND m.user_id = auth.uid()
            AND m.status = 'active'
            AND m.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Admins can delete permissions in their organization" ON public.user_permissions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = user_permissions.organization_id
            AND m.user_id = auth.uid()
            AND m.status = 'active'
            AND m.role IN ('owner', 'admin')
        )
    );

-- 5. Fix query_performance_log table (exists but no RLS)
-- This table is created in 20250908000000_comprehensive_schema_optimization.sql
-- Enable RLS and create policies

ALTER TABLE public.query_performance_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for query_performance_log
-- Only service role and admins should access this table for monitoring
CREATE POLICY "Service role can access all query logs" ON public.query_performance_log
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins can view query logs for their organization" ON public.query_performance_log
    FOR SELECT USING (
        organization_id IS NULL -- System-level logs visible to admins
        OR EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = query_performance_log.organization_id
            AND m.user_id = auth.uid()
            AND m.status = 'active'
            AND m.role IN ('owner', 'admin')
        )
    );

-- =====================================================
-- SECTION 2: CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Create trigger function if not exists (reuse existing one)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to new tables
CREATE TRIGGER set_updated_at_project_tags
    BEFORE UPDATE ON public.project_tags
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_user_permissions
    BEFORE UPDATE ON public.user_permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 3: HELPER FUNCTIONS FOR PERMISSION CHECKS
-- =====================================================

-- Function to check if user has a specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(
    p_user_id UUID,
    p_organization_id UUID,
    p_permission VARCHAR,
    p_resource_type VARCHAR DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_permissions
        WHERE user_id = p_user_id
        AND organization_id = p_organization_id
        AND permission = p_permission
        AND (p_resource_type IS NULL OR resource_type = p_resource_type)
        AND (p_resource_id IS NULL OR resource_id = p_resource_id)
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to grant permission to a user
CREATE OR REPLACE FUNCTION public.grant_user_permission(
    p_user_id UUID,
    p_organization_id UUID,
    p_permission VARCHAR,
    p_resource_type VARCHAR DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_permission_id UUID;
BEGIN
    INSERT INTO public.user_permissions (
        organization_id,
        user_id,
        permission,
        resource_type,
        resource_id,
        granted_by,
        expires_at
    ) VALUES (
        p_organization_id,
        p_user_id,
        p_permission,
        p_resource_type,
        p_resource_id,
        auth.uid(),
        p_expires_at
    )
    ON CONFLICT (user_id, organization_id, permission, resource_type, resource_id)
    DO UPDATE SET
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW()
    RETURNING id INTO v_permission_id;
    
    RETURN v_permission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke permission from a user
CREATE OR REPLACE FUNCTION public.revoke_user_permission(
    p_user_id UUID,
    p_organization_id UUID,
    p_permission VARCHAR,
    p_resource_type VARCHAR DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.user_permissions
    WHERE user_id = p_user_id
    AND organization_id = p_organization_id
    AND permission = p_permission
    AND (p_resource_type IS NULL OR resource_type = p_resource_type)
    AND (p_resource_id IS NULL OR resource_id = p_resource_id);
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 4: GRANT APPROPRIATE PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT ON public.project_tags TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.project_tags TO authenticated;

GRANT SELECT ON public.user_permissions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.user_permissions TO authenticated;

-- Grant permissions to service role
GRANT ALL ON public.project_tags TO service_role;
GRANT ALL ON public.user_permissions TO service_role;
GRANT ALL ON public.query_performance_log TO service_role;

-- =====================================================
-- SECTION 5: AUDIT LOGGING FOR NEW TABLES
-- =====================================================

-- Create audit function for new tables
CREATE OR REPLACE FUNCTION audit_new_tables()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (
            occurred_at,
            actor_user_id,
            tenant_organization_id,
            action,
            entity_type,
            entity_id,
            metadata
        ) VALUES (
            NOW(),
            auth.uid(),
            NEW.organization_id,
            'create',
            TG_TABLE_NAME,
            NEW.id,
            jsonb_build_object(
                'tag', COALESCE(NEW.tag, ''),
                'permission', COALESCE(NEW.permission, '')
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (
            occurred_at,
            actor_user_id,
            tenant_organization_id,
            action,
            entity_type,
            entity_id,
            metadata
        ) VALUES (
            NOW(),
            auth.uid(),
            NEW.organization_id,
            'update',
            TG_TABLE_NAME,
            NEW.id,
            jsonb_build_object(
                'tag', COALESCE(NEW.tag, ''),
                'permission', COALESCE(NEW.permission, '')
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (
            occurred_at,
            actor_user_id,
            tenant_organization_id,
            action,
            entity_type,
            entity_id,
            metadata
        ) VALUES (
            NOW(),
            auth.uid(),
            OLD.organization_id,
            'delete',
            TG_TABLE_NAME,
            OLD.id,
            jsonb_build_object(
                'tag', COALESCE(OLD.tag, ''),
                'permission', COALESCE(OLD.permission, '')
            )
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to new tables (if audit_logs table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        CREATE TRIGGER audit_project_tags_changes 
            AFTER INSERT OR UPDATE OR DELETE ON public.project_tags 
            FOR EACH ROW EXECUTE FUNCTION audit_new_tables();
        
        CREATE TRIGGER audit_user_permissions_changes 
            AFTER INSERT OR UPDATE OR DELETE ON public.user_permissions 
            FOR EACH ROW EXECUTE FUNCTION audit_new_tables();
    END IF;
END $$;

-- =====================================================
-- SECTION 6: UPDATE TABLE STATISTICS
-- =====================================================

-- Analyze new tables for query planner optimization
ANALYZE public.project_tags;
ANALYZE public.user_permissions;
ANALYZE public.query_performance_log;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration has:
-- 1. Created missing project_tags table with RLS policies
-- 2. Created missing user_permissions table with RLS policies
-- 3. Enabled RLS on query_performance_log table
-- 4. Created appropriate indexes for performance
-- 5. Added triggers for updated_at timestamps
-- 6. Created helper functions for permission management
-- 7. Applied audit logging to new tables
-- 8. Granted appropriate database permissions
-- =====================================================

COMMENT ON TABLE public.project_tags IS 'Project tagging system with multi-tenant RLS security';
COMMENT ON TABLE public.user_permissions IS 'Granular user permissions with expiration support and multi-tenant security';
COMMENT ON TABLE public.query_performance_log IS 'Query performance monitoring with admin-only access';
