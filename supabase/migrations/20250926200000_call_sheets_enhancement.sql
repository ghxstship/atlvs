-- Enhanced call sheets table for programming module
-- Extends existing call_sheets table with additional fields for comprehensive call sheet management

-- Add new columns to existing call_sheets table
ALTER TABLE public.call_sheets 
ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'draft' CHECK (status IN (
  'draft',
  'published',
  'distributed',
  'updated',
  'cancelled'
));

ALTER TABLE public.call_sheets 
ADD COLUMN IF NOT EXISTS call_type VARCHAR(32) NOT NULL DEFAULT 'general' CHECK (call_type IN (
  'general',
  'crew',
  'talent',
  'vendor',
  'security',
  'medical',
  'transport'
));

ALTER TABLE public.call_sheets 
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.programming_events(id) ON DELETE SET NULL;

ALTER TABLE public.call_sheets 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.call_sheets 
ADD COLUMN IF NOT EXISTS weather_info JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.call_sheets 
ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.call_sheets 
ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.call_sheets 
ADD COLUMN IF NOT EXISTS crew_assignments JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.call_sheets 
ADD COLUMN IF NOT EXISTS equipment_list JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.call_sheets 
ADD COLUMN IF NOT EXISTS safety_notes TEXT;

ALTER TABLE public.call_sheets 
ADD COLUMN IF NOT EXISTS distribution_list JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.call_sheets 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

ALTER TABLE public.call_sheets 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.call_sheets 
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Update the trigger to handle updated_by
CREATE OR REPLACE FUNCTION update_call_sheets_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_call_sheets_updated_at ON public.call_sheets;
CREATE TRIGGER update_call_sheets_updated_at
  BEFORE UPDATE ON public.call_sheets
  FOR EACH ROW
  EXECUTE PROCEDURE update_call_sheets_timestamp();

-- Additional indexes for performance
CREATE INDEX IF NOT EXISTS call_sheets_status_idx ON public.call_sheets (status);
CREATE INDEX IF NOT EXISTS call_sheets_type_idx ON public.call_sheets (call_type);
CREATE INDEX IF NOT EXISTS call_sheets_event_idx ON public.call_sheets (event_id);
CREATE INDEX IF NOT EXISTS call_sheets_date_idx ON public.call_sheets (event_date DESC);
CREATE INDEX IF NOT EXISTS call_sheets_tags_idx ON public.call_sheets USING GIN (tags);

-- Update RLS policies to use proper auth function
DROP POLICY IF EXISTS call_sheets_access ON public.call_sheets;

CREATE POLICY call_sheets_select ON public.call_sheets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.memberships
      WHERE memberships.organization_id = call_sheets.organization_id
        AND memberships.user_id = auth.uid()
        AND memberships.status = 'active'
    )
  );

CREATE POLICY call_sheets_insert ON public.call_sheets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.memberships
      WHERE memberships.organization_id = call_sheets.organization_id
        AND memberships.user_id = auth.uid()
        AND memberships.status = 'active'
    )
  );

CREATE POLICY call_sheets_update ON public.call_sheets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.memberships
      WHERE memberships.organization_id = call_sheets.organization_id
        AND memberships.user_id = auth.uid()
        AND memberships.status = 'active'
    )
  );

CREATE POLICY call_sheets_delete ON public.call_sheets
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.memberships
      WHERE memberships.organization_id = call_sheets.organization_id
        AND memberships.user_id = auth.uid()
        AND memberships.status = 'active'
    )
  );

-- Helper view for call sheets with related data
CREATE OR REPLACE VIEW call_sheets_with_details AS
SELECT
  cs.*,
  p.name AS project_name,
  pe.title AS event_title,
  pe.start_at AS event_start_at,
  pe.end_at AS event_end_at,
  pe.location AS event_location,
  creator.email AS created_by_email,
  creator.full_name AS created_by_name,
  updater.email AS updated_by_email,
  updater.full_name AS updated_by_name
FROM public.call_sheets cs
LEFT JOIN public.projects p ON cs.project_id = p.id
LEFT JOIN public.programming_events pe ON cs.event_id = pe.id
LEFT JOIN public.users creator ON cs.created_by = creator.id
LEFT JOIN public.users updater ON cs.updated_by = updater.id;

-- Grant permissions on the view
GRANT SELECT ON call_sheets_with_details TO authenticated;

-- Create RLS policy for the view
ALTER VIEW call_sheets_with_details SET (security_invoker = true);
