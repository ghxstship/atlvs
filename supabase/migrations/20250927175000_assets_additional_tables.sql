-- Additional Assets Module Tables
-- This migration adds the missing tables for compliance, inspections, lifecycle, and barcode tracking

-- Asset compliance table
CREATE TABLE IF NOT EXISTS asset_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  compliance_type TEXT NOT NULL CHECK (compliance_type IN ('safety', 'regulatory', 'certification', 'audit', 'insurance', 'environmental', 'quality')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'compliant', 'non_compliant', 'expired')),
  requirement TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed_date DATE,
  assigned_to TEXT,
  inspector TEXT,
  certificate_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Asset inspections table
CREATE TABLE IF NOT EXISTS asset_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  inspection_type TEXT NOT NULL CHECK (inspection_type IN ('safety', 'quality', 'maintenance', 'compliance', 'performance', 'condition', 'calibration')),
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed', 'cancelled')),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMPTZ NOT NULL,
  completed_date TIMESTAMPTZ,
  inspector TEXT NOT NULL,
  checklist_template TEXT,
  checklist_items JSONB DEFAULT '[]',
  findings TEXT,
  recommendations TEXT,
  pass_fail TEXT CHECK (pass_fail IN ('pass', 'fail', 'conditional')),
  next_inspection_date TIMESTAMPTZ,
  attachments TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Asset lifecycle table
CREATE TABLE IF NOT EXISTS asset_lifecycle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  lifecycle_stage TEXT NOT NULL CHECK (lifecycle_stage IN ('acquisition', 'deployment', 'operation', 'maintenance', 'optimization', 'decline', 'disposal', 'retired')),
  acquisition_date DATE NOT NULL,
  acquisition_cost DECIMAL(12,2) NOT NULL,
  current_value DECIMAL(12,2),
  depreciation_method TEXT CHECK (depreciation_method IN ('straight_line', 'declining_balance', 'sum_of_years', 'units_of_production', 'custom')),
  depreciation_rate DECIMAL(5,2),
  useful_life_years INTEGER NOT NULL,
  remaining_life_years INTEGER,
  salvage_value DECIMAL(12,2),
  accumulated_depreciation DECIMAL(12,2) DEFAULT 0,
  utilization_rate DECIMAL(5,2),
  maintenance_cost_total DECIMAL(12,2) DEFAULT 0,
  roi_percentage DECIMAL(5,2),
  replacement_recommended BOOLEAN DEFAULT FALSE,
  replacement_date DATE,
  replacement_cost DECIMAL(12,2),
  disposal_date DATE,
  disposal_value DECIMAL(12,2),
  disposal_method TEXT CHECK (disposal_method IN ('sale', 'trade_in', 'donation', 'recycling', 'scrap', 'destruction')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, asset_id)
);

-- Asset barcodes table
CREATE TABLE IF NOT EXISTS asset_barcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  barcode_type TEXT NOT NULL CHECK (barcode_type IN ('code128', 'code39', 'ean13', 'upc_a', 'qr_code', 'data_matrix', 'pdf417')),
  barcode_value TEXT NOT NULL,
  qr_code_value TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'damaged', 'replaced')),
  print_date DATE NOT NULL,
  printed_by TEXT,
  scan_count INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMPTZ,
  last_scanned_by TEXT,
  location_when_scanned TEXT,
  mobile_app_compatible BOOLEAN DEFAULT TRUE,
  encoding_format TEXT DEFAULT 'utf8' CHECK (encoding_format IN ('utf8', 'ascii', 'iso8859_1', 'binary')),
  label_size TEXT CHECK (label_size IN ('1x1', '1x2', '2x1', '2x2', '3x1', '4x2', 'custom')),
  label_material TEXT CHECK (label_material IN ('paper', 'vinyl', 'polyester', 'aluminum', 'ceramic', 'tamper_evident')),
  replacement_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, asset_id, barcode_value)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_asset_compliance_organization_id ON asset_compliance(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_compliance_asset_id ON asset_compliance(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_compliance_status ON asset_compliance(status);
CREATE INDEX IF NOT EXISTS idx_asset_compliance_due_date ON asset_compliance(due_date);

CREATE INDEX IF NOT EXISTS idx_asset_inspections_organization_id ON asset_inspections(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_inspections_asset_id ON asset_inspections(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_inspections_status ON asset_inspections(status);
CREATE INDEX IF NOT EXISTS idx_asset_inspections_scheduled_date ON asset_inspections(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_asset_lifecycle_organization_id ON asset_lifecycle(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_lifecycle_asset_id ON asset_lifecycle(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_lifecycle_stage ON asset_lifecycle(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_asset_lifecycle_replacement ON asset_lifecycle(replacement_recommended);

CREATE INDEX IF NOT EXISTS idx_asset_barcodes_organization_id ON asset_barcodes(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_barcodes_asset_id ON asset_barcodes(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_barcodes_status ON asset_barcodes(status);
CREATE INDEX IF NOT EXISTS idx_asset_barcodes_value ON asset_barcodes(barcode_value);

-- Enable RLS on all tables
ALTER TABLE asset_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_lifecycle ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_barcodes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for asset_compliance
CREATE POLICY "Users can view asset_compliance in their organization" ON asset_compliance
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can insert asset_compliance in their organization" ON asset_compliance
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can update asset_compliance in their organization" ON asset_compliance
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can delete asset_compliance in their organization" ON asset_compliance
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Create RLS policies for asset_inspections
CREATE POLICY "Users can view asset_inspections in their organization" ON asset_inspections
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can insert asset_inspections in their organization" ON asset_inspections
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can update asset_inspections in their organization" ON asset_inspections
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can delete asset_inspections in their organization" ON asset_inspections
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Create RLS policies for asset_lifecycle
CREATE POLICY "Users can view asset_lifecycle in their organization" ON asset_lifecycle
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can insert asset_lifecycle in their organization" ON asset_lifecycle
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can update asset_lifecycle in their organization" ON asset_lifecycle
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can delete asset_lifecycle in their organization" ON asset_lifecycle
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Create RLS policies for asset_barcodes
CREATE POLICY "Users can view asset_barcodes in their organization" ON asset_barcodes
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can insert asset_barcodes in their organization" ON asset_barcodes
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can update asset_barcodes in their organization" ON asset_barcodes
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "Users can delete asset_barcodes in their organization" ON asset_barcodes
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Create triggers for updated_at
CREATE TRIGGER update_asset_compliance_updated_at BEFORE UPDATE ON asset_compliance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_inspections_updated_at BEFORE UPDATE ON asset_inspections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_lifecycle_updated_at BEFORE UPDATE ON asset_lifecycle
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_barcodes_updated_at BEFORE UPDATE ON asset_barcodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update the demo data seeding function to include new tables
CREATE OR REPLACE FUNCTION seed_demo_assets_data_extended(org_id UUID, user_id UUID)
RETURNS VOID AS $$
DECLARE
    asset_1_id UUID;
    asset_2_id UUID;
    asset_3_id UUID;
    asset_4_id UUID;
    asset_5_id UUID;
BEGIN
    -- First seed the basic assets data
    PERFORM seed_demo_assets_data(org_id, user_id);
    
    -- Get asset IDs for additional data
    SELECT id INTO asset_1_id FROM assets WHERE organization_id = org_id AND name = 'Main Stage Rigging System';
    SELECT id INTO asset_2_id FROM assets WHERE organization_id = org_id AND name = 'Professional Sound System';
    SELECT id INTO asset_3_id FROM assets WHERE organization_id = org_id AND name = 'LED Video Wall Panels';
    SELECT id INTO asset_4_id FROM assets WHERE organization_id = org_id AND name = 'Generator - 500kW';

    -- Insert demo compliance records
    INSERT INTO asset_compliance (organization_id, asset_id, compliance_type, status, requirement, description, due_date, completed_date, assigned_to, inspector, created_by, updated_by)
    VALUES 
        (org_id, asset_1_id, 'safety', 'compliant', 'Annual Safety Inspection', 'Comprehensive safety inspection of rigging system', '2024-03-15', '2024-02-28', 'Jack Sparrow', 'Certified Safety Inspector', user_id, user_id),
        (org_id, asset_2_id, 'regulatory', 'pending', 'FCC Equipment Authorization', 'Federal Communications Commission equipment authorization renewal', '2024-04-30', NULL, 'Will Turner', NULL, user_id, user_id),
        (org_id, asset_3_id, 'certification', 'expired', 'CE Marking Certification', 'European Conformity marking certification for LED panels', '2024-01-31', NULL, 'Elizabeth Swann', NULL, user_id, user_id);

    -- Insert demo inspection records
    INSERT INTO asset_inspections (organization_id, asset_id, inspection_type, status, title, description, scheduled_date, completed_date, inspector, pass_fail, created_by, updated_by)
    VALUES 
        (org_id, asset_1_id, 'safety', 'completed', 'Quarterly Safety Inspection', 'Comprehensive safety inspection including load testing', '2024-02-15', '2024-02-15', 'Jack Sparrow', 'pass', user_id, user_id),
        (org_id, asset_2_id, 'quality', 'in_progress', 'Audio Quality Assessment', 'Comprehensive audio quality and performance testing', '2024-03-01', NULL, 'Will Turner', NULL, user_id, user_id),
        (org_id, asset_4_id, 'compliance', 'failed', 'Environmental Compliance Audit', 'Annual environmental compliance and emissions testing', '2024-01-30', '2024-01-30', 'Hector Barbossa', 'fail', user_id, user_id);

    -- Insert demo lifecycle records
    INSERT INTO asset_lifecycle (organization_id, asset_id, lifecycle_stage, acquisition_date, acquisition_cost, current_value, useful_life_years, remaining_life_years, replacement_recommended, created_by, updated_by)
    VALUES 
        (org_id, asset_1_id, 'operation', '2020-01-15', 45000, 32000, 10, 6, FALSE, user_id, user_id),
        (org_id, asset_2_id, 'optimization', '2019-06-01', 25000, 15000, 8, 3, FALSE, user_id, user_id),
        (org_id, asset_3_id, 'decline', '2018-03-20', 35000, 12000, 8, 2, TRUE, user_id, user_id),
        (org_id, asset_4_id, 'maintenance', '2021-08-10', 75000, 58000, 15, 12, FALSE, user_id, user_id);

    -- Insert demo barcode records
    INSERT INTO asset_barcodes (organization_id, asset_id, barcode_type, barcode_value, qr_code_value, status, print_date, printed_by, scan_count, mobile_app_compatible, created_by, updated_by)
    VALUES 
        (org_id, asset_1_id, 'code128', 'STAGE-RIG-001', '{"asset_id": "' || asset_1_id || '", "name": "Main Stage Rigging System"}', 'active', '2024-01-15', 'Jack Sparrow', 47, TRUE, user_id, user_id),
        (org_id, asset_2_id, 'qr_code', 'AUDIO-PA-002', '{"asset_id": "' || asset_2_id || '", "name": "Professional Sound System"}', 'active', '2024-01-20', 'Elizabeth Swann', 23, TRUE, user_id, user_id),
        (org_id, asset_3_id, 'data_matrix', 'LED-WALL-003', '{"asset_id": "' || asset_3_id || '", "name": "LED Video Wall Panels"}', 'damaged', '2024-01-25', 'Hector Barbossa', 15, TRUE, user_id, user_id),
        (org_id, asset_4_id, 'code39', 'GEN-500-005', '{"asset_id": "' || asset_4_id || '", "name": "Generator - 500kW"}', 'active', '2024-02-01', 'Jack Sparrow', 31, TRUE, user_id, user_id);

END;
$$ LANGUAGE plpgsql;

-- Function to remove extended demo assets data
CREATE OR REPLACE FUNCTION remove_demo_assets_data_extended(org_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM asset_barcodes WHERE organization_id = org_id;
    DELETE FROM asset_lifecycle WHERE organization_id = org_id;
    DELETE FROM asset_inspections WHERE organization_id = org_id;
    DELETE FROM asset_compliance WHERE organization_id = org_id;
    PERFORM remove_demo_assets_data(org_id);
END;
$$ LANGUAGE plpgsql;
