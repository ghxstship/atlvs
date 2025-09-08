-- Resources Module Complete Migration
-- This migration creates all tables and policies for the Resources module

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('policy', 'guide', 'training', 'template', 'procedure', 'featured')),
    category VARCHAR(100) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'under_review')),
    visibility VARCHAR(50) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'team', 'role_based')),
    allowed_roles TEXT[] DEFAULT '{}',
    allowed_teams TEXT[] DEFAULT '{}',
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    file_url TEXT,
    file_size BIGINT,
    file_type VARCHAR(100),
    thumbnail_url TEXT,
    download_count INTEGER NOT NULL DEFAULT 0,
    view_count INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    expiry_date TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create resource_categories table
CREATE TABLE IF NOT EXISTS resource_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    color VARCHAR(7),
    icon VARCHAR(50),
    parent_id UUID REFERENCES resource_categories(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    UNIQUE(organization_id, name, type)
);

-- Create resource_access table for tracking access logs
CREATE TABLE IF NOT EXISTS resource_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    access_type VARCHAR(50) NOT NULL CHECK (access_type IN ('view', 'download', 'edit', 'share')),
    ip_address INET,
    user_agent TEXT,
    duration INTEGER, -- in seconds
    accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create resource_comments table
CREATE TABLE IF NOT EXISTS resource_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    parent_id UUID REFERENCES resource_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create resource_templates table
CREATE TABLE IF NOT EXISTS resource_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    usage_count INTEGER NOT NULL DEFAULT 0,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create training_modules table
CREATE TABLE IF NOT EXISTS training_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('video', 'document', 'interactive', 'quiz', 'assessment')),
    category VARCHAR(100),
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    duration INTEGER, -- in minutes
    passing_score INTEGER DEFAULT 80,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    prerequisites TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create training_progress table
CREATE TABLE IF NOT EXISTS training_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    score INTEGER,
    attempts INTEGER NOT NULL DEFAULT 0,
    time_spent INTEGER NOT NULL DEFAULT 0, -- in minutes
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    certificate_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(training_module_id, user_id, organization_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_resources_organization_id ON resources(organization_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_visibility ON resources(visibility);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON resources USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);
CREATE INDEX IF NOT EXISTS idx_resources_is_featured ON resources(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_resources_is_pinned ON resources(is_pinned) WHERE is_pinned = TRUE;

CREATE INDEX IF NOT EXISTS idx_resource_categories_organization_id ON resource_categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_resource_categories_parent_id ON resource_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_resource_categories_type ON resource_categories(type);

CREATE INDEX IF NOT EXISTS idx_resource_access_resource_id ON resource_access(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_organization_id ON resource_access(organization_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_user_id ON resource_access(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_accessed_at ON resource_access(accessed_at);

CREATE INDEX IF NOT EXISTS idx_resource_comments_resource_id ON resource_comments(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_comments_organization_id ON resource_comments(organization_id);
CREATE INDEX IF NOT EXISTS idx_resource_comments_parent_id ON resource_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_resource_templates_organization_id ON resource_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_resource_templates_template_type ON resource_templates(template_type);

CREATE INDEX IF NOT EXISTS idx_training_modules_organization_id ON training_modules(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_modules_type ON training_modules(type);
CREATE INDEX IF NOT EXISTS idx_training_modules_category ON training_modules(category);
CREATE INDEX IF NOT EXISTS idx_training_modules_is_required ON training_modules(is_required) WHERE is_required = TRUE;

CREATE INDEX IF NOT EXISTS idx_training_progress_module_id ON training_progress(training_module_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_organization_id ON training_progress(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_user_id ON training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_status ON training_progress(status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resource_categories_updated_at BEFORE UPDATE ON resource_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resource_comments_updated_at BEFORE UPDATE ON resource_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resource_templates_updated_at BEFORE UPDATE ON resource_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_modules_updated_at BEFORE UPDATE ON training_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_progress_updated_at BEFORE UPDATE ON training_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for resources
CREATE POLICY "Users can view resources in their organization" ON resources
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can insert resources" ON resources
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT om.organization_id FROM organization_members om
            JOIN user_roles ur ON om.user_id = ur.user_id AND om.organization_id = ur.organization_id
            WHERE om.user_id = auth.uid() AND ur.role IN ('owner', 'admin', 'manager')
        )
    );

CREATE POLICY "Admins can update resources" ON resources
    FOR UPDATE USING (
        organization_id IN (
            SELECT om.organization_id FROM organization_members om
            JOIN user_roles ur ON om.user_id = ur.user_id AND om.organization_id = ur.organization_id
            WHERE om.user_id = auth.uid() AND ur.role IN ('owner', 'admin', 'manager')
        )
    );

CREATE POLICY "Admins can delete resources" ON resources
    FOR DELETE USING (
        organization_id IN (
            SELECT om.organization_id FROM organization_members om
            JOIN user_roles ur ON om.user_id = ur.user_id AND om.organization_id = ur.organization_id
            WHERE om.user_id = auth.uid() AND ur.role IN ('owner', 'admin')
        )
    );

-- Create RLS policies for resource_categories
CREATE POLICY "Users can view resource categories in their organization" ON resource_categories
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage resource categories" ON resource_categories
    FOR ALL USING (
        organization_id IN (
            SELECT om.organization_id FROM organization_members om
            JOIN user_roles ur ON om.user_id = ur.user_id AND om.organization_id = ur.organization_id
            WHERE om.user_id = auth.uid() AND ur.role IN ('owner', 'admin', 'manager')
        )
    );

-- Create RLS policies for resource_access
CREATE POLICY "Users can view resource access in their organization" ON resource_access
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own resource access" ON resource_access
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for resource_comments
CREATE POLICY "Users can view resource comments in their organization" ON resource_comments
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own resource comments" ON resource_comments
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own resource comments" ON resource_comments
    FOR UPDATE USING (
        user_id = auth.uid() AND
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for resource_templates
CREATE POLICY "Users can view resource templates in their organization" ON resource_templates
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage resource templates" ON resource_templates
    FOR ALL USING (
        organization_id IN (
            SELECT om.organization_id FROM organization_members om
            JOIN user_roles ur ON om.user_id = ur.user_id AND om.organization_id = ur.organization_id
            WHERE om.user_id = auth.uid() AND ur.role IN ('owner', 'admin', 'manager')
        )
    );

-- Create RLS policies for training_modules
CREATE POLICY "Users can view training modules in their organization" ON training_modules
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage training modules" ON training_modules
    FOR ALL USING (
        organization_id IN (
            SELECT om.organization_id FROM organization_members om
            JOIN user_roles ur ON om.user_id = ur.user_id AND om.organization_id = ur.organization_id
            WHERE om.user_id = auth.uid() AND ur.role IN ('owner', 'admin', 'manager')
        )
    );

-- Create RLS policies for training_progress
CREATE POLICY "Users can view training progress in their organization" ON training_progress
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own training progress" ON training_progress
    FOR ALL USING (
        user_id = auth.uid() AND
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all training progress" ON training_progress
    FOR ALL USING (
        organization_id IN (
            SELECT om.organization_id FROM organization_members om
            JOIN user_roles ur ON om.user_id = ur.user_id AND om.organization_id = ur.organization_id
            WHERE om.user_id = auth.uid() AND ur.role IN ('owner', 'admin', 'manager')
        )
    );

-- Create audit trigger function for resources
CREATE OR REPLACE FUNCTION audit_resources_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (
            occurred_at,
            organization_id,
            user_id,
            action,
            entity_type,
            entity_id,
            metadata
        ) VALUES (
            NOW(),
            NEW.organization_id,
            NEW.created_by,
            'create',
            'resource',
            NEW.id,
            jsonb_build_object(
                'title', NEW.title,
                'type', NEW.type,
                'category', NEW.category
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (
            occurred_at,
            organization_id,
            user_id,
            action,
            entity_type,
            entity_id,
            metadata
        ) VALUES (
            NOW(),
            NEW.organization_id,
            NEW.updated_by,
            'update',
            'resource',
            NEW.id,
            jsonb_build_object(
                'title', NEW.title,
                'type', NEW.type,
                'category', NEW.category,
                'changes', jsonb_build_object(
                    'old', to_jsonb(OLD),
                    'new', to_jsonb(NEW)
                )
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (
            occurred_at,
            organization_id,
            user_id,
            action,
            entity_type,
            entity_id,
            metadata
        ) VALUES (
            NOW(),
            OLD.organization_id,
            auth.uid(),
            'delete',
            'resource',
            OLD.id,
            jsonb_build_object(
                'title', OLD.title,
                'type', OLD.type,
                'category', OLD.category
            )
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers
CREATE TRIGGER audit_resources_trigger
    AFTER INSERT OR UPDATE OR DELETE ON resources
    FOR EACH ROW EXECUTE FUNCTION audit_resources_changes();

CREATE TRIGGER audit_training_modules_trigger
    AFTER INSERT OR UPDATE OR DELETE ON training_modules
    FOR EACH ROW EXECUTE FUNCTION audit_resources_changes();

-- Add comments for documentation
COMMENT ON TABLE resources IS 'Stores organizational resources like policies, guides, training materials, templates, and procedures';
COMMENT ON TABLE resource_categories IS 'Hierarchical categorization system for resources';
COMMENT ON TABLE resource_access IS 'Tracks user access to resources for analytics and compliance';
COMMENT ON TABLE resource_comments IS 'Comments and discussions on resources with threading support';
COMMENT ON TABLE resource_templates IS 'Reusable templates for creating new resources';
COMMENT ON TABLE training_modules IS 'Training content and modules for organizational learning';
COMMENT ON TABLE training_progress IS 'Tracks individual user progress through training modules';
