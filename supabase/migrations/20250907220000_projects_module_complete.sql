-- Complete Projects Module Database Schema
-- This migration creates all tables, indexes, RLS policies, and triggers for the Projects module

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Projects table (main entity)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  type VARCHAR(20) NOT NULL DEFAULT 'internal' CHECK (type IN ('internal', 'client', 'maintenance', 'research', 'development')),
  start_date DATE,
  end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  budget DECIMAL(15,2),
  budget_currency VARCHAR(3) DEFAULT 'USD',
  actual_cost DECIMAL(15,2) DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  team_members UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  location TEXT,
  coordinates POINT,
  is_archived BOOLEAN DEFAULT FALSE,
  visibility VARCHAR(20) DEFAULT 'team' CHECK (visibility IN ('public', 'private', 'team', 'client')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Project tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
  estimated_hours DECIMAL(8,2),
  actual_hours DECIMAL(8,2) DEFAULT 0,
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  dependencies UUID[] DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Project task comments table
CREATE TABLE IF NOT EXISTS project_task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES project_task_comments(id) ON DELETE CASCADE,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project milestones table
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  dependencies UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Project risks table
CREATE TABLE IF NOT EXISTS project_risks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('technical', 'financial', 'operational', 'legal', 'environmental', 'safety')),
  probability VARCHAR(20) NOT NULL CHECK (probability IN ('very_low', 'low', 'medium', 'high', 'very_high')),
  impact VARCHAR(20) NOT NULL CHECK (impact IN ('very_low', 'low', 'medium', 'high', 'very_high')),
  risk_score INTEGER NOT NULL DEFAULT 1 CHECK (risk_score >= 1 AND risk_score <= 25),
  status VARCHAR(20) DEFAULT 'identified' CHECK (status IN ('identified', 'assessed', 'mitigated', 'closed')),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  mitigation_plan TEXT,
  contingency_plan TEXT,
  identified_date DATE NOT NULL DEFAULT CURRENT_DATE,
  review_date DATE,
  closed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Project files table
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  category VARCHAR(20) DEFAULT 'document' CHECK (category IN ('document', 'image', 'video', 'audio', 'drawing', 'specification', 'report', 'other')),
  version VARCHAR(20) DEFAULT '1.0',
  is_latest BOOLEAN DEFAULT TRUE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  access_level VARCHAR(20) DEFAULT 'team' CHECK (access_level IN ('public', 'team', 'restricted')),
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project inspections table
CREATE TABLE IF NOT EXISTS project_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('safety', 'quality', 'compliance', 'progress', 'final')),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed', 'cancelled')),
  scheduled_date TIMESTAMPTZ NOT NULL,
  completed_date TIMESTAMPTZ,
  inspector_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location TEXT,
  findings TEXT,
  recommendations TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  is_passed BOOLEAN DEFAULT FALSE,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Project activations table
CREATE TABLE IF NOT EXISTS project_activations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('kickoff', 'phase_start', 'milestone', 'delivery', 'closure')),
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  scheduled_date TIMESTAMPTZ NOT NULL,
  actual_date TIMESTAMPTZ,
  duration INTEGER, -- in minutes
  location TEXT,
  attendees UUID[] DEFAULT '{}',
  agenda TEXT,
  notes TEXT,
  outcomes TEXT,
  action_items TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Project time entries table
CREATE TABLE IF NOT EXISTS project_time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER NOT NULL, -- in minutes
  billable_rate DECIMAL(10,2),
  is_billable BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_manager_id ON projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_team_members ON projects USING GIN(team_members);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_organization_id ON project_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assignee_id ON project_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_parent_task_id ON project_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_due_date ON project_tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_project_task_comments_task_id ON project_task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_project_task_comments_author_id ON project_task_comments(author_id);

CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_due_date ON project_milestones(due_date);
CREATE INDEX IF NOT EXISTS idx_project_milestones_status ON project_milestones(status);

CREATE INDEX IF NOT EXISTS idx_project_risks_project_id ON project_risks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_risks_status ON project_risks(status);
CREATE INDEX IF NOT EXISTS idx_project_risks_risk_score ON project_risks(risk_score);
CREATE INDEX IF NOT EXISTS idx_project_risks_owner_id ON project_risks(owner_id);

CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_category ON project_files(category);
CREATE INDEX IF NOT EXISTS idx_project_files_uploaded_by ON project_files(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_project_inspections_project_id ON project_inspections(project_id);
CREATE INDEX IF NOT EXISTS idx_project_inspections_inspector_id ON project_inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_project_inspections_scheduled_date ON project_inspections(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_project_inspections_status ON project_inspections(status);

CREATE INDEX IF NOT EXISTS idx_project_activations_project_id ON project_activations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activations_scheduled_date ON project_activations(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_project_activations_status ON project_activations(status);

CREATE INDEX IF NOT EXISTS idx_project_time_entries_project_id ON project_time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_task_id ON project_time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_user_id ON project_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_start_time ON project_time_entries(start_time);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_task_comments_updated_at BEFORE UPDATE ON project_task_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_milestones_updated_at BEFORE UPDATE ON project_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_risks_updated_at BEFORE UPDATE ON project_risks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_files_updated_at BEFORE UPDATE ON project_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_inspections_updated_at BEFORE UPDATE ON project_inspections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_activations_updated_at BEFORE UPDATE ON project_activations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_time_entries_updated_at BEFORE UPDATE ON project_time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate risk score
CREATE OR REPLACE FUNCTION calculate_risk_score(prob TEXT, imp TEXT)
RETURNS INTEGER AS $$
DECLARE
  prob_val INTEGER;
  imp_val INTEGER;
BEGIN
  -- Convert probability to numeric value
  CASE prob
    WHEN 'very_low' THEN prob_val := 1;
    WHEN 'low' THEN prob_val := 2;
    WHEN 'medium' THEN prob_val := 3;
    WHEN 'high' THEN prob_val := 4;
    WHEN 'very_high' THEN prob_val := 5;
    ELSE prob_val := 1;
  END CASE;
  
  -- Convert impact to numeric value
  CASE imp
    WHEN 'very_low' THEN imp_val := 1;
    WHEN 'low' THEN imp_val := 2;
    WHEN 'medium' THEN imp_val := 3;
    WHEN 'high' THEN imp_val := 4;
    WHEN 'very_high' THEN imp_val := 5;
    ELSE imp_val := 1;
  END CASE;
  
  RETURN prob_val * imp_val;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate risk score
CREATE OR REPLACE FUNCTION update_risk_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.risk_score = calculate_risk_score(NEW.probability, NEW.impact);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_project_risk_score 
  BEFORE INSERT OR UPDATE ON project_risks 
  FOR EACH ROW EXECUTE FUNCTION update_risk_score();

-- Create function to update milestone status based on due date
CREATE OR REPLACE FUNCTION update_milestone_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL THEN
    NEW.status = 'completed';
  ELSIF NEW.due_date < CURRENT_DATE AND NEW.completed_at IS NULL THEN
    NEW.status = 'overdue';
  ELSE
    NEW.status = 'pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_milestone_status 
  BEFORE INSERT OR UPDATE ON project_milestones 
  FOR EACH ROW EXECUTE FUNCTION update_milestone_status();

-- Row Level Security (RLS) Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_time_entries ENABLE ROW LEVEL SECURITY;

-- Projects RLS policies
CREATE POLICY "Users can view projects in their organization" ON projects
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create projects in their organization" ON projects
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update projects in their organization" ON projects
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete projects in their organization" ON projects
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Project tasks RLS policies
CREATE POLICY "Users can view project tasks in their organization" ON project_tasks
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create project tasks in their organization" ON project_tasks
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update project tasks in their organization" ON project_tasks
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete project tasks in their organization" ON project_tasks
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Apply similar RLS policies to all other project-related tables
-- Project task comments
CREATE POLICY "Users can view task comments in their organization" ON project_task_comments
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create task comments in their organization" ON project_task_comments
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Project milestones
CREATE POLICY "Users can view milestones in their organization" ON project_milestones
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can manage milestones in their organization" ON project_milestones
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Project risks
CREATE POLICY "Users can view risks in their organization" ON project_risks
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can manage risks in their organization" ON project_risks
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Project files
CREATE POLICY "Users can view files in their organization" ON project_files
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can manage files in their organization" ON project_files
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Project inspections
CREATE POLICY "Users can view inspections in their organization" ON project_inspections
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can manage inspections in their organization" ON project_inspections
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Project activations
CREATE POLICY "Users can view activations in their organization" ON project_activations
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can manage activations in their organization" ON project_activations
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Project time entries
CREATE POLICY "Users can view time entries in their organization" ON project_time_entries
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can manage their own time entries" ON project_time_entries
  FOR ALL USING (
    user_id = auth.uid() AND
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Create audit triggers for all project tables
CREATE OR REPLACE FUNCTION audit_project_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
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
      jsonb_build_object('name', COALESCE(NEW.name, NEW.title))
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
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
      jsonb_build_object('name', COALESCE(NEW.name, NEW.title))
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
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
      jsonb_build_object('name', COALESCE(OLD.name, OLD.title))
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to all project tables
CREATE TRIGGER audit_projects_changes AFTER INSERT OR UPDATE OR DELETE ON projects FOR EACH ROW EXECUTE FUNCTION audit_project_changes();
CREATE TRIGGER audit_project_tasks_changes AFTER INSERT OR UPDATE OR DELETE ON project_tasks FOR EACH ROW EXECUTE FUNCTION audit_project_changes();
CREATE TRIGGER audit_project_milestones_changes AFTER INSERT OR UPDATE OR DELETE ON project_milestones FOR EACH ROW EXECUTE FUNCTION audit_project_changes();
CREATE TRIGGER audit_project_risks_changes AFTER INSERT OR UPDATE OR DELETE ON project_risks FOR EACH ROW EXECUTE FUNCTION audit_project_changes();
CREATE TRIGGER audit_project_inspections_changes AFTER INSERT OR UPDATE OR DELETE ON project_inspections FOR EACH ROW EXECUTE FUNCTION audit_project_changes();
CREATE TRIGGER audit_project_activations_changes AFTER INSERT OR UPDATE OR DELETE ON project_activations FOR EACH ROW EXECUTE FUNCTION audit_project_changes();
