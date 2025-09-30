-- Programming calendar events table
CREATE TABLE IF NOT EXISTS programming_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(32) NOT NULL CHECK (event_type IN (
    'performance',
    'activation',
    'workshop',
    'meeting',
    'rehearsal',
    'setup',
    'breakdown',
    'other'
  )),
  status VARCHAR(32) NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'scheduled',
    'in_progress',
    'completed',
    'cancelled'
  )),
  location TEXT,
  capacity INTEGER,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  setup_start TIMESTAMPTZ,
  teardown_end TIMESTAMPTZ,
  timezone VARCHAR(64) DEFAULT 'UTC',
  is_all_day BOOLEAN DEFAULT FALSE,
  broadcast_url TEXT,
  tags TEXT[] DEFAULT '{}',
  resources JSONB DEFAULT '[]'::jsonb,
  staffing JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Trigger to maintain updated_at
CREATE OR REPLACE FUNCTION update_programming_events_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_programming_events_updated_at ON programming_events;
CREATE TRIGGER trg_programming_events_updated_at
  BEFORE UPDATE ON programming_events
  FOR EACH ROW
  EXECUTE PROCEDURE update_programming_events_timestamp();

-- Indexes
CREATE INDEX IF NOT EXISTS programming_events_org_idx ON programming_events (organization_id);
CREATE INDEX IF NOT EXISTS programming_events_project_idx ON programming_events (project_id);
CREATE INDEX IF NOT EXISTS programming_events_time_idx ON programming_events (start_at DESC);
CREATE INDEX IF NOT EXISTS programming_events_status_idx ON programming_events (status);
CREATE INDEX IF NOT EXISTS programming_events_type_idx ON programming_events (event_type);

-- Row-Level Security
ALTER TABLE programming_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS programming_events_select ON programming_events;
CREATE POLICY programming_events_select ON programming_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM memberships
      WHERE memberships.organization_id = programming_events.organization_id
        AND memberships.user_id = auth.uid()
        AND memberships.status = 'active'
    )
  );

DROP POLICY IF EXISTS programming_events_insert ON programming_events;
CREATE POLICY programming_events_insert ON programming_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM memberships
      WHERE memberships.organization_id = programming_events.organization_id
        AND memberships.user_id = auth.uid()
        AND memberships.status = 'active'
    )
  );

DROP POLICY IF EXISTS programming_events_update ON programming_events;
CREATE POLICY programming_events_update ON programming_events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM memberships
      WHERE memberships.organization_id = programming_events.organization_id
        AND memberships.user_id = auth.uid()
        AND memberships.status = 'active'
    )
  );

DROP POLICY IF EXISTS programming_events_delete ON programming_events;
CREATE POLICY programming_events_delete ON programming_events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM memberships
      WHERE memberships.organization_id = programming_events.organization_id
        AND memberships.user_id = auth.uid()
        AND memberships.status = 'active'
    )
  );

-- Helper view for calendar agenda
CREATE OR REPLACE VIEW programming_events_agenda AS
SELECT
  e.id,
  e.organization_id,
  e.project_id,
  p.name AS project_name,
  e.title,
  e.description,
  e.event_type,
  e.status,
  e.location,
  e.capacity,
  e.start_at,
  e.end_at,
  e.setup_start,
  e.teardown_end,
  e.is_all_day,
  e.timezone,
  e.tags,
  e.resources,
  e.staffing,
  e.metadata
FROM programming_events e
LEFT JOIN projects p ON p.id = e.project_id;
