-- Programming Overview Module Tables
-- This migration creates the comprehensive programming tables needed for the overview module

-- Programming Workshops table
CREATE TABLE IF NOT EXISTS programming_workshops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(64) NOT NULL DEFAULT 'general',
  status VARCHAR(32) NOT NULL DEFAULT 'planning' CHECK (status IN (
    'planning',
    'open_registration',
    'registration_closed',
    'in_progress',
    'completed',
    'cancelled'
  )),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  venue TEXT,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  primary_instructor UUID REFERENCES users(id) ON DELETE SET NULL,
  secondary_instructors UUID[] DEFAULT '{}',
  materials JSONB DEFAULT '[]'::jsonb,
  requirements TEXT[],
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Programming Spaces table (enhanced version)
CREATE TABLE IF NOT EXISTS programming_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  kind VARCHAR(32) NOT NULL DEFAULT 'space' CHECK (kind IN (
    'space',
    'room',
    'green_room',
    'dressing_room',
    'meeting_room',
    'classroom',
    'stage',
    'backstage',
    'outdoor',
    'virtual',
    'other'
  )),
  status VARCHAR(32) NOT NULL DEFAULT 'available' CHECK (status IN (
    'available',
    'occupied',
    'reserved',
    'maintenance',
    'unavailable'
  )),
  building VARCHAR(255),
  floor VARCHAR(32),
  room_number VARCHAR(32),
  capacity INTEGER,
  current_occupancy INTEGER DEFAULT 0,
  amenities TEXT[] DEFAULT '{}',
  equipment JSONB DEFAULT '[]'::jsonb,
  booking_rules JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Programming Performances table
CREATE TABLE IF NOT EXISTS programming_performances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  event_id UUID REFERENCES programming_events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(64) NOT NULL DEFAULT 'performance',
  status VARCHAR(32) NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled',
    'in_progress',
    'completed',
    'cancelled',
    'postponed'
  )),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  venue TEXT,
  stage VARCHAR(64),
  audience_capacity INTEGER,
  expected_attendance INTEGER,
  actual_attendance INTEGER,
  performers JSONB DEFAULT '[]'::jsonb,
  technical_requirements JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Programming Riders table (enhanced)
CREATE TABLE IF NOT EXISTS programming_riders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES programming_events(id) ON DELETE CASCADE,
  performance_id UUID REFERENCES programming_performances(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  kind VARCHAR(32) NOT NULL DEFAULT 'technical' CHECK (kind IN (
    'technical',
    'hospitality',
    'stage_plot',
    'catering',
    'transportation',
    'accommodation',
    'security',
    'other'
  )),
  status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'in_review',
    'approved',
    'rejected',
    'fulfilled'
  )),
  priority VARCHAR(16) NOT NULL DEFAULT 'medium' CHECK (priority IN (
    'low',
    'medium',
    'high',
    'critical'
  )),
  details JSONB DEFAULT '{}'::jsonb,
  requirements TEXT[],
  attachments TEXT[],
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Programming Lineups table (enhanced)
CREATE TABLE IF NOT EXISTS programming_lineups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES programming_events(id) ON DELETE CASCADE,
  performance_id UUID REFERENCES programming_performances(id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'active',
    'locked',
    'archived'
  )),
  performers_count INTEGER DEFAULT 0,
  lineup_order JSONB DEFAULT '[]'::jsonb,
  time_slots JSONB DEFAULT '[]'::jsonb,
  transitions JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Programming Call Sheets table (enhanced)
CREATE TABLE IF NOT EXISTS programming_call_sheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES programming_events(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'active',
    'distributed',
    'archived'
  )),
  call_times JSONB DEFAULT '{}'::jsonb,
  crew_calls JSONB DEFAULT '[]'::jsonb,
  talent_calls JSONB DEFAULT '[]'::jsonb,
  schedule JSONB DEFAULT '[]'::jsonb,
  locations JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  weather_info JSONB DEFAULT '{}'::jsonb,
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Programming Itineraries table
CREATE TABLE IF NOT EXISTS programming_itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'active',
    'completed',
    'archived'
  )),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  destinations JSONB DEFAULT '[]'::jsonb,
  travel_segments JSONB DEFAULT '[]'::jsonb,
  accommodations JSONB DEFAULT '[]'::jsonb,
  activities JSONB DEFAULT '[]'::jsonb,
  participants UUID[] DEFAULT '{}',
  budget DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_programming_workshops_org ON programming_workshops(organization_id);
CREATE INDEX IF NOT EXISTS idx_programming_workshops_status ON programming_workshops(status);
CREATE INDEX IF NOT EXISTS idx_programming_workshops_start ON programming_workshops(start_date);

CREATE INDEX IF NOT EXISTS idx_programming_spaces_org ON programming_spaces(organization_id);
CREATE INDEX IF NOT EXISTS idx_programming_spaces_status ON programming_spaces(status);
CREATE INDEX IF NOT EXISTS idx_programming_spaces_kind ON programming_spaces(kind);

CREATE INDEX IF NOT EXISTS idx_programming_performances_org ON programming_performances(organization_id);
CREATE INDEX IF NOT EXISTS idx_programming_performances_event ON programming_performances(event_id);
CREATE INDEX IF NOT EXISTS idx_programming_performances_scheduled ON programming_performances(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_programming_riders_org ON programming_riders(organization_id);
CREATE INDEX IF NOT EXISTS idx_programming_riders_event ON programming_riders(event_id);
CREATE INDEX IF NOT EXISTS idx_programming_riders_status ON programming_riders(status);
CREATE INDEX IF NOT EXISTS idx_programming_riders_priority ON programming_riders(priority);

CREATE INDEX IF NOT EXISTS idx_programming_lineups_org ON programming_lineups(organization_id);
CREATE INDEX IF NOT EXISTS idx_programming_lineups_event ON programming_lineups(event_id);

CREATE INDEX IF NOT EXISTS idx_programming_call_sheets_org ON programming_call_sheets(organization_id);
CREATE INDEX IF NOT EXISTS idx_programming_call_sheets_date ON programming_call_sheets(date);

CREATE INDEX IF NOT EXISTS idx_programming_itineraries_org ON programming_itineraries(organization_id);
CREATE INDEX IF NOT EXISTS idx_programming_itineraries_dates ON programming_itineraries(start_date, end_date);

-- Enable RLS
ALTER TABLE programming_workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE programming_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE programming_performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE programming_riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE programming_lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE programming_call_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE programming_itineraries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "programming_workshops_org_access" ON programming_workshops
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.organization_id = programming_workshops.organization_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

CREATE POLICY "programming_spaces_org_access" ON programming_spaces
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.organization_id = programming_spaces.organization_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

CREATE POLICY "programming_performances_org_access" ON programming_performances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.organization_id = programming_performances.organization_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

CREATE POLICY "programming_riders_org_access" ON programming_riders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.organization_id = programming_riders.organization_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

CREATE POLICY "programming_lineups_org_access" ON programming_lineups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.organization_id = programming_lineups.organization_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

CREATE POLICY "programming_call_sheets_org_access" ON programming_call_sheets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.organization_id = programming_call_sheets.organization_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

CREATE POLICY "programming_itineraries_org_access" ON programming_itineraries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.organization_id = programming_itineraries.organization_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_programming_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_programming_workshops_timestamp
  BEFORE UPDATE ON programming_workshops
  FOR EACH ROW EXECUTE FUNCTION update_programming_timestamp();

CREATE TRIGGER update_programming_spaces_timestamp
  BEFORE UPDATE ON programming_spaces
  FOR EACH ROW EXECUTE FUNCTION update_programming_timestamp();

CREATE TRIGGER update_programming_performances_timestamp
  BEFORE UPDATE ON programming_performances
  FOR EACH ROW EXECUTE FUNCTION update_programming_timestamp();

CREATE TRIGGER update_programming_riders_timestamp
  BEFORE UPDATE ON programming_riders
  FOR EACH ROW EXECUTE FUNCTION update_programming_timestamp();

CREATE TRIGGER update_programming_lineups_timestamp
  BEFORE UPDATE ON programming_lineups
  FOR EACH ROW EXECUTE FUNCTION update_programming_timestamp();

CREATE TRIGGER update_programming_call_sheets_timestamp
  BEFORE UPDATE ON programming_call_sheets
  FOR EACH ROW EXECUTE FUNCTION update_programming_timestamp();

CREATE TRIGGER update_programming_itineraries_timestamp
  BEFORE UPDATE ON programming_itineraries
  FOR EACH ROW EXECUTE FUNCTION update_programming_timestamp();
