-- Assets Module Complete Database Schema
-- This migration creates all tables needed for the comprehensive Assets module

-- Asset Categories (13 categories as specified)
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

-- Asset Status Types
CREATE TYPE asset_status AS ENUM (
    'available',
    'in_use',
    'under_maintenance',
    'damaged',
    'missing',
    'retired'
);

-- Asset Types
CREATE TYPE asset_type AS ENUM (
    'fixed',
    'rentable',
    'service'
);

-- Assignment Status
CREATE TYPE assignment_status AS ENUM (
    'pending',
    'confirmed',
    'active',
    'completed',
    'cancelled'
);

-- Maintenance Status
CREATE TYPE maintenance_status AS ENUM (
    'scheduled',
    'in_progress',
    'completed',
    'cancelled'
);

-- Asset Inventory (Master catalog)
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category asset_category NOT NULL,
    type asset_type NOT NULL DEFAULT 'fixed',
    status asset_status NOT NULL DEFAULT 'available',
    sku TEXT,
    barcode TEXT,
    qr_code TEXT,
    rfid_tag TEXT,
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    purchase_date DATE,
    purchase_cost DECIMAL(12,2),
    current_value DECIMAL(12,2),
    depreciation_rate DECIMAL(5,2),
    location TEXT,
    dimensions JSONB, -- {length, width, height, weight}
    specifications JSONB, -- flexible specs per asset type
    images TEXT[], -- array of image URLs
    documents TEXT[], -- array of document URLs
    tags TEXT[],
    notes TEXT,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Asset Advancing (moved from Pipeline)
CREATE TABLE IF NOT EXISTS asset_advancing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    category asset_category NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    quantity INTEGER NOT NULL DEFAULT 1,
    start_date DATE,
    end_date DATE,
    assigned_to_person_id UUID REFERENCES people(id),
    assigned_to TEXT, -- fallback text field
    vendor TEXT,
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    cost_center TEXT,
    options JSONB, -- flexible options and add-ons
    special_accommodations TEXT,
    delivery_location TEXT,
    notes TEXT,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Asset Assignments
CREATE TABLE IF NOT EXISTS asset_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    person_id UUID REFERENCES people(id) ON DELETE SET NULL,
    advancing_request_id UUID REFERENCES asset_advancing(id) ON DELETE SET NULL,
    assignment_type TEXT NOT NULL CHECK (assignment_type IN ('project', 'person', 'vendor', 'partner')),
    assignee_name TEXT, -- for non-person assignments
    status assignment_status NOT NULL DEFAULT 'pending',
    start_date DATE NOT NULL,
    end_date DATE,
    quantity INTEGER NOT NULL DEFAULT 1,
    location TEXT,
    purpose TEXT,
    conditions TEXT,
    return_condition TEXT,
    notes TEXT,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Asset Tracking (status changes and location history)
CREATE TABLE IF NOT EXISTS asset_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES asset_assignments(id) ON DELETE SET NULL,
    status asset_status NOT NULL,
    previous_status asset_status,
    location TEXT,
    previous_location TEXT,
    checked_out_by UUID REFERENCES people(id),
    checked_out_at TIMESTAMP WITH TIME ZONE,
    checked_in_by UUID REFERENCES people(id),
    checked_in_at TIMESTAMP WITH TIME ZONE,
    condition_notes TEXT,
    damage_report TEXT,
    photos TEXT[], -- array of photo URLs
    gps_coordinates POINT, -- for location tracking
    notes TEXT,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Asset Maintenance
CREATE TABLE IF NOT EXISTS asset_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('preventive', 'corrective', 'emergency', 'inspection')),
    title TEXT NOT NULL,
    description TEXT,
    status maintenance_status NOT NULL DEFAULT 'scheduled',
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_technician_id UUID REFERENCES people(id),
    assigned_vendor TEXT,
    scheduled_date DATE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    estimated_duration INTEGER, -- in hours
    actual_duration INTEGER, -- in hours
    parts_used JSONB, -- array of parts with quantities and costs
    labor_hours DECIMAL(5,2),
    work_performed TEXT,
    issues_found TEXT,
    recommendations TEXT,
    next_maintenance_date DATE,
    warranty_info TEXT,
    documents TEXT[], -- array of document URLs
    photos TEXT[], -- array of photo URLs
    notes TEXT,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Asset Reports & Analytics (saved report configurations)
CREATE TABLE IF NOT EXISTS asset_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    report_type TEXT NOT NULL CHECK (report_type IN ('usage', 'cost', 'maintenance', 'depreciation', 'availability', 'custom')),
    configuration JSONB NOT NULL, -- report parameters and filters
    schedule TEXT CHECK (schedule IN ('manual', 'daily', 'weekly', 'monthly', 'quarterly')),
    recipients TEXT[], -- email addresses for scheduled reports
    last_generated_at TIMESTAMP WITH TIME ZONE,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_org_category ON assets(organization_id, category);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_barcode ON assets(barcode);
CREATE INDEX IF NOT EXISTS idx_assets_sku ON assets(sku);

CREATE INDEX IF NOT EXISTS idx_asset_advancing_org_project ON asset_advancing(organization_id, project_id);
CREATE INDEX IF NOT EXISTS idx_asset_advancing_category ON asset_advancing(category);
CREATE INDEX IF NOT EXISTS idx_asset_advancing_status ON asset_advancing(status);
CREATE INDEX IF NOT EXISTS idx_asset_advancing_dates ON asset_advancing(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_asset_assignments_org ON asset_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_asset ON asset_assignments(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_project ON asset_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_person ON asset_assignments(person_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_status ON asset_assignments(status);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_dates ON asset_assignments(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_asset_tracking_asset ON asset_tracking(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_tracking_status ON asset_tracking(status);
CREATE INDEX IF NOT EXISTS idx_asset_tracking_created_at ON asset_tracking(created_at);

CREATE INDEX IF NOT EXISTS idx_asset_maintenance_org ON asset_maintenance(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_maintenance_asset ON asset_maintenance(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_maintenance_status ON asset_maintenance(status);
CREATE INDEX IF NOT EXISTS idx_asset_maintenance_scheduled_date ON asset_maintenance(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_asset_reports_org ON asset_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_reports_type ON asset_reports(report_type);

-- Enable RLS on all tables
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_advancing ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization isolation
CREATE POLICY "Users can access assets in their organization" ON assets
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can access asset_advancing in their organization" ON asset_advancing
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can access asset_assignments in their organization" ON asset_assignments
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can access asset_tracking through their organization" ON asset_tracking
    FOR ALL USING (
        asset_id IN (
            SELECT id FROM assets WHERE organization_id IN (
                SELECT organization_id FROM memberships 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

CREATE POLICY "Users can access asset_maintenance in their organization" ON asset_maintenance
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can access asset_reports in their organization" ON asset_reports
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Update triggers for updated_at timestamps
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_advancing_updated_at BEFORE UPDATE ON asset_advancing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_assignments_updated_at BEFORE UPDATE ON asset_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_maintenance_updated_at BEFORE UPDATE ON asset_maintenance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_reports_updated_at BEFORE UPDATE ON asset_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
