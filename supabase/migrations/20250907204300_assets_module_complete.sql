-- Assets Module Complete Database Schema
-- This migration creates all tables and functions needed for the Assets module

-- Create asset category enum
CREATE TYPE asset_category AS ENUM (
  'site_infrastructure',
  'site_assets',
  'site_vehicles', 
  'site_services',
  'heavy_machinery',
  'it_communication',
  'office_admin',
  'access_credentials',
  'parking',
  'travel_lodging',
  'artist_technical',
  'artist_hospitality',
  'artist_travel'
);

-- Create asset type enum
CREATE TYPE asset_type AS ENUM ('fixed', 'rentable', 'service');

-- Create asset status enum
CREATE TYPE asset_status AS ENUM (
  'available',
  'in_use',
  'under_maintenance',
  'damaged',
  'missing',
  'retired'
);

-- Create asset condition enum
CREATE TYPE asset_condition AS ENUM ('excellent', 'good', 'fair', 'poor', 'damaged');

-- Main assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category asset_category NOT NULL,
  type asset_type NOT NULL,
  status asset_status NOT NULL DEFAULT 'available',
  sku TEXT,
  serial_number TEXT,
  current_value DECIMAL(12,2),
  purchase_value DECIMAL(12,2),
  purchase_date DATE,
  location TEXT,
  assigned_to TEXT,
  assigned_to_type TEXT CHECK (assigned_to_type IN ('user', 'project', 'vendor', 'partner')),
  condition asset_condition DEFAULT 'good',
  warranty_expiry DATE,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Asset advancing table (migrated from pipeline)
CREATE TABLE IF NOT EXISTS asset_advancing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  asset_id UUID REFERENCES assets(id),
  title TEXT NOT NULL,
  description TEXT,
  category asset_category NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'in_progress', 'completed', 'cancelled', 'rejected')),
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  vendor_id UUID REFERENCES companies(id),
  estimated_cost DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  requested_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  required_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  location TEXT,
  specifications JSONB,
  attachments TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Asset assignments table
CREATE TABLE IF NOT EXISTS asset_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  assigned_to TEXT NOT NULL,
  assigned_to_type TEXT NOT NULL CHECK (assigned_to_type IN ('user', 'project', 'vendor', 'partner')),
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'returned', 'overdue', 'damaged', 'lost', 'cancelled')),
  condition asset_condition NOT NULL,
  assigned_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expected_return_date TIMESTAMPTZ,
  actual_return_date TIMESTAMPTZ,
  location TEXT,
  purpose TEXT,
  notes TEXT,
  checkout_notes TEXT,
  checkin_notes TEXT,
  damage_reported BOOLEAN DEFAULT FALSE,
  damage_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Asset tracking table
CREATE TABLE IF NOT EXISTS asset_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  tracking_method TEXT NOT NULL CHECK (tracking_method IN ('manual', 'barcode', 'qr_code', 'rfid', 'gps', 'bluetooth', 'wifi')),
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'lost_signal', 'low_battery', 'offline')),
  location TEXT,
  coordinates JSONB, -- {latitude: number, longitude: number}
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_by UUID REFERENCES auth.users(id),
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
  signal_strength INTEGER CHECK (signal_strength >= 0 AND signal_strength <= 100),
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  notes TEXT,
  alerts JSONB, -- Array of alert objects
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, asset_id)
);

-- Asset maintenance table
CREATE TABLE IF NOT EXISTS asset_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('preventive', 'corrective', 'predictive', 'emergency', 'calibration', 'inspection', 'cleaning', 'upgrade')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'overdue', 'on_hold')),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMPTZ NOT NULL,
  completed_date TIMESTAMPTZ,
  estimated_duration INTEGER, -- in hours
  actual_duration INTEGER, -- in hours
  estimated_cost DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  performed_by UUID REFERENCES auth.users(id),
  vendor_id UUID REFERENCES companies(id),
  location TEXT,
  parts_used JSONB, -- Array of part objects
  work_performed TEXT,
  next_maintenance_date TIMESTAMPTZ,
  warranty_impact BOOLEAN DEFAULT FALSE,
  downtime INTEGER, -- in hours
  attachments TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Asset reports table
CREATE TABLE IF NOT EXISTS asset_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('inventory_summary', 'asset_utilization', 'maintenance_schedule', 'cost_analysis', 'depreciation_report', 'assignment_history', 'tracking_summary', 'performance_metrics', 'compliance_audit', 'custom')),
  format TEXT NOT NULL CHECK (format IN ('pdf', 'excel', 'csv', 'json')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'generating', 'completed', 'failed', 'expired')),
  parameters JSONB NOT NULL,
  generated_at TIMESTAMPTZ,
  generated_by UUID NOT NULL REFERENCES auth.users(id),
  file_url TEXT,
  file_size BIGINT,
  expires_at TIMESTAMPTZ,
  scheduled_generation JSONB,
  recipients TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_organization_id ON assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_assigned_to ON assets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_assets_location ON assets(location);

CREATE INDEX IF NOT EXISTS idx_asset_advancing_organization_id ON asset_advancing(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_advancing_project_id ON asset_advancing(project_id);
CREATE INDEX IF NOT EXISTS idx_asset_advancing_status ON asset_advancing(status);
CREATE INDEX IF NOT EXISTS idx_asset_advancing_assigned_to ON asset_advancing(assigned_to);

CREATE INDEX IF NOT EXISTS idx_asset_assignments_organization_id ON asset_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_asset_id ON asset_assignments(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_assigned_to ON asset_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_status ON asset_assignments(status);

CREATE INDEX IF NOT EXISTS idx_asset_tracking_organization_id ON asset_tracking(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_tracking_asset_id ON asset_tracking(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_tracking_status ON asset_tracking(status);

CREATE INDEX IF NOT EXISTS idx_asset_maintenance_organization_id ON asset_maintenance(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_maintenance_asset_id ON asset_maintenance(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_maintenance_scheduled_date ON asset_maintenance(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_asset_maintenance_status ON asset_maintenance(status);

CREATE INDEX IF NOT EXISTS idx_asset_reports_organization_id ON asset_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_reports_type ON asset_reports(type);
CREATE INDEX IF NOT EXISTS idx_asset_reports_status ON asset_reports(status);

-- Enable RLS on all tables
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_advancing ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view assets in their organization" ON assets
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can insert assets in their organization" ON assets
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can update assets in their organization" ON assets
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can delete assets in their organization" ON assets
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Similar policies for other tables
CREATE POLICY "Users can view asset_advancing in their organization" ON asset_advancing
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can insert asset_advancing in their organization" ON asset_advancing
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can update asset_advancing in their organization" ON asset_advancing
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can delete asset_advancing in their organization" ON asset_advancing
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Policies for asset_assignments
CREATE POLICY "Users can view asset_assignments in their organization" ON asset_assignments
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can insert asset_assignments in their organization" ON asset_assignments
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can update asset_assignments in their organization" ON asset_assignments
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can delete asset_assignments in their organization" ON asset_assignments
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Policies for asset_tracking
CREATE POLICY "Users can view asset_tracking in their organization" ON asset_tracking
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can insert asset_tracking in their organization" ON asset_tracking
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can update asset_tracking in their organization" ON asset_tracking
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can delete asset_tracking in their organization" ON asset_tracking
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Policies for asset_maintenance
CREATE POLICY "Users can view asset_maintenance in their organization" ON asset_maintenance
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can insert asset_maintenance in their organization" ON asset_maintenance
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can update asset_maintenance in their organization" ON asset_maintenance
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can delete asset_maintenance in their organization" ON asset_maintenance
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Policies for asset_reports
CREATE POLICY "Users can view asset_reports in their organization" ON asset_reports
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can insert asset_reports in their organization" ON asset_reports
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can update asset_reports in their organization" ON asset_reports
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can delete asset_reports in their organization" ON asset_reports
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_advancing_updated_at BEFORE UPDATE ON asset_advancing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_assignments_updated_at BEFORE UPDATE ON asset_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_tracking_updated_at BEFORE UPDATE ON asset_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_maintenance_updated_at BEFORE UPDATE ON asset_maintenance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_reports_updated_at BEFORE UPDATE ON asset_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to seed demo assets data
CREATE OR REPLACE FUNCTION seed_demo_assets_data(org_id UUID, user_id UUID)
RETURNS VOID AS $$
DECLARE
    asset_1_id UUID;
    asset_2_id UUID;
    asset_3_id UUID;
    asset_4_id UUID;
    asset_5_id UUID;
BEGIN
    -- Insert demo assets
    INSERT INTO assets (id, organization_id, name, description, category, type, status, sku, current_value, location, created_by, updated_by)
    VALUES 
        (gen_random_uuid(), org_id, 'Main Stage Rigging System', 'Professional stage rigging and truss system for main performance area', 'site_infrastructure', 'fixed', 'in_use', 'STAGE-RIG-001', 45000, 'Main Deck', user_id, user_id),
        (gen_random_uuid(), org_id, 'Professional Sound System', 'High-end PA system with mixing console and monitors', 'artist_technical', 'rentable', 'available', 'AUDIO-PA-002', 25000, 'Equipment Storage', user_id, user_id),
        (gen_random_uuid(), org_id, 'LED Video Wall Panels', 'Modular LED display panels for backdrop and visual effects', 'artist_technical', 'rentable', 'under_maintenance', 'LED-WALL-003', 35000, 'Tech Workshop', user_id, user_id),
        (gen_random_uuid(), org_id, 'Catering Services', 'Full-service catering for crew and artist hospitality', 'artist_hospitality', 'service', 'available', 'CATER-SRV-004', NULL, 'Galley', user_id, user_id),
        (gen_random_uuid(), org_id, 'Generator - 500kW', 'Primary power generation unit for event infrastructure', 'site_services', 'fixed', 'in_use', 'GEN-500-005', 75000, 'Power Station', user_id, user_id)
    RETURNING id INTO asset_1_id, asset_2_id, asset_3_id, asset_4_id, asset_5_id;

    -- Insert demo advancing items
    INSERT INTO asset_advancing (organization_id, title, description, category, priority, status, requested_by, estimated_cost, created_by, updated_by)
    VALUES 
        (org_id, 'Additional Lighting Truss', 'Need additional lighting truss for expanded stage setup', 'site_infrastructure', 'high', 'approved', user_id, 8000, user_id, user_id),
        (org_id, 'Backup Sound Equipment', 'Backup PA system for redundancy during main event', 'artist_technical', 'medium', 'in_progress', user_id, 15000, user_id, user_id),
        (org_id, 'VIP Hospitality Setup', 'Premium catering and hospitality setup for VIP guests', 'artist_hospitality', 'high', 'submitted', user_id, 12000, user_id, user_id);

    -- Insert demo assignments
    INSERT INTO asset_assignments (organization_id, asset_id, assigned_to, assigned_to_type, assigned_by, status, condition, purpose, created_by, updated_by)
    SELECT org_id, id, 'Jack Sparrow', 'user', user_id, 'active', 'good', 'Main event production', user_id, user_id
    FROM assets WHERE organization_id = org_id AND status = 'in_use' LIMIT 2;

    -- Insert demo tracking data
    INSERT INTO asset_tracking (organization_id, asset_id, tracking_method, status, location, last_seen_by, created_by, updated_by)
    SELECT org_id, id, 'manual', 'active', location, user_id, user_id, user_id
    FROM assets WHERE organization_id = org_id LIMIT 3;

    -- Insert demo maintenance records
    INSERT INTO asset_maintenance (organization_id, asset_id, type, priority, status, title, scheduled_date, estimated_cost, created_by, updated_by)
    SELECT org_id, id, 'preventive', 'medium', 'scheduled', 'Quarterly maintenance check', NOW() + INTERVAL '30 days', 500, user_id, user_id
    FROM assets WHERE organization_id = org_id LIMIT 2;

    -- Insert demo report
    INSERT INTO asset_reports (organization_id, name, type, format, status, parameters, generated_by, created_by, updated_by)
    VALUES (org_id, 'Monthly Asset Utilization Report', 'asset_utilization', 'pdf', 'completed', '{"dateRange": {"start": "2024-01-01", "end": "2024-01-31"}}', user_id, user_id, user_id);

END;
$$ LANGUAGE plpgsql;

-- Function to remove demo assets data
CREATE OR REPLACE FUNCTION remove_demo_assets_data(org_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM asset_reports WHERE organization_id = org_id;
    DELETE FROM asset_maintenance WHERE organization_id = org_id;
    DELETE FROM asset_tracking WHERE organization_id = org_id;
    DELETE FROM asset_assignments WHERE organization_id = org_id;
    DELETE FROM asset_advancing WHERE organization_id = org_id;
    DELETE FROM assets WHERE organization_id = org_id;
END;
$$ LANGUAGE plpgsql;
