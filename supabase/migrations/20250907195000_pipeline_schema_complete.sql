-- Pipeline Module Complete Database Schema
-- This migration creates all tables needed for the Pipeline module

-- Production Advancing Items
CREATE TABLE IF NOT EXISTS advancing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN (
        'site_infrastructure', 'site_assets', 'site_vehicles', 'site_services',
        'heavy_machinery', 'it_communication', 'office_admin', 'access_credentials',
        'parking', 'travel_lodging', 'artist_technical', 'artist_hospitality', 'artist_travel'
    )),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_to TEXT,
    due_date DATE,
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    vendor TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Manning Slots
CREATE TABLE IF NOT EXISTS manning_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    required_count INTEGER NOT NULL DEFAULT 1,
    filled_count INTEGER NOT NULL DEFAULT 0,
    department TEXT,
    skills_required TEXT[],
    hourly_rate DECIMAL(8,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Manning Assignments
CREATE TABLE IF NOT EXISTS manning_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manning_slot_id UUID NOT NULL REFERENCES manning_slots(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'declined', 'completed')),
    start_date DATE,
    end_date DATE,
    hourly_rate DECIMAL(8,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Onboarding Workflows
CREATE TABLE IF NOT EXISTS onboarding_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'on_hold')),
    start_date DATE NOT NULL,
    expected_completion_date DATE,
    completed_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Onboarding Tasks
CREATE TABLE IF NOT EXISTS onboarding_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES onboarding_workflows(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('documentation', 'training', 'equipment', 'access', 'compliance')),
    required BOOLEAN NOT NULL DEFAULT false,
    completed BOOLEAN NOT NULL DEFAULT false,
    due_date DATE,
    assigned_to TEXT,
    completed_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Programs
CREATE TABLE IF NOT EXISTS training_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('safety', 'technical', 'compliance', 'leadership', 'certification')),
    duration_hours INTEGER NOT NULL DEFAULT 1,
    required BOOLEAN NOT NULL DEFAULT false,
    expiry_months INTEGER,
    certificate_template_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Training Sessions
CREATE TABLE IF NOT EXISTS training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES people(id),
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT NOT NULL,
    max_participants INTEGER NOT NULL DEFAULT 10,
    enrolled_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Training Records
CREATE TABLE IF NOT EXISTS training_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    session_id UUID REFERENCES training_sessions(id),
    status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'expired', 'failed')),
    enrolled_date DATE DEFAULT CURRENT_DATE,
    completed_date DATE,
    expiry_date DATE,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    certificate_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pipeline Contracts
CREATE TABLE IF NOT EXISTS pipeline_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('employment', 'freelance', 'nda', 'vendor', 'service')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'expired', 'terminated')),
    start_date DATE NOT NULL,
    end_date DATE,
    value DECIMAL(12,2),
    currency TEXT NOT NULL DEFAULT 'USD',
    signed_date DATE,
    document_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_advancing_items_org_project ON advancing_items(organization_id, project_id);
CREATE INDEX IF NOT EXISTS idx_advancing_items_status ON advancing_items(status);
CREATE INDEX IF NOT EXISTS idx_advancing_items_category ON advancing_items(category);
CREATE INDEX IF NOT EXISTS idx_advancing_items_due_date ON advancing_items(due_date);

CREATE INDEX IF NOT EXISTS idx_manning_slots_org_project ON manning_slots(organization_id, project_id);
CREATE INDEX IF NOT EXISTS idx_manning_assignments_slot ON manning_assignments(manning_slot_id);
CREATE INDEX IF NOT EXISTS idx_manning_assignments_person ON manning_assignments(person_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_workflows_org ON onboarding_workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_workflows_person ON onboarding_workflows(person_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_workflows_project ON onboarding_workflows(project_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_workflow ON onboarding_tasks(workflow_id);

CREATE INDEX IF NOT EXISTS idx_training_programs_org ON training_programs(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_program ON training_sessions(program_id);
CREATE INDEX IF NOT EXISTS idx_training_records_person ON training_records(person_id);
CREATE INDEX IF NOT EXISTS idx_training_records_program ON training_records(program_id);

CREATE INDEX IF NOT EXISTS idx_pipeline_contracts_org ON pipeline_contracts(organization_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_contracts_person ON pipeline_contracts(person_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_contracts_project ON pipeline_contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_contracts_status ON pipeline_contracts(status);

-- Enable RLS on all tables
ALTER TABLE advancing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE manning_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE manning_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization isolation
CREATE POLICY "Users can access advancing_items in their organization" ON advancing_items
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can access manning_slots in their organization" ON manning_slots
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can access manning_assignments through their organization" ON manning_assignments
    FOR ALL USING (
        manning_slot_id IN (
            SELECT id FROM manning_slots WHERE organization_id IN (
                SELECT organization_id FROM memberships 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

CREATE POLICY "Users can access onboarding_workflows in their organization" ON onboarding_workflows
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can access onboarding_tasks through their organization" ON onboarding_tasks
    FOR ALL USING (
        workflow_id IN (
            SELECT id FROM onboarding_workflows WHERE organization_id IN (
                SELECT organization_id FROM memberships 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

CREATE POLICY "Users can access training_programs in their organization" ON training_programs
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can access training_sessions through their organization" ON training_sessions
    FOR ALL USING (
        program_id IN (
            SELECT id FROM training_programs WHERE organization_id IN (
                SELECT organization_id FROM memberships 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

CREATE POLICY "Users can access training_records through their organization" ON training_records
    FOR ALL USING (
        program_id IN (
            SELECT id FROM training_programs WHERE organization_id IN (
                SELECT organization_id FROM memberships 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

CREATE POLICY "Users can access pipeline_contracts in their organization" ON pipeline_contracts
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_advancing_items_updated_at BEFORE UPDATE ON advancing_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manning_slots_updated_at BEFORE UPDATE ON manning_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manning_assignments_updated_at BEFORE UPDATE ON manning_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_workflows_updated_at BEFORE UPDATE ON onboarding_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_tasks_updated_at BEFORE UPDATE ON onboarding_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_programs_updated_at BEFORE UPDATE ON training_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_sessions_updated_at BEFORE UPDATE ON training_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_records_updated_at BEFORE UPDATE ON training_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipeline_contracts_updated_at BEFORE UPDATE ON pipeline_contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
