-- Analytics Module Complete Schema
-- This migration creates all necessary tables for the Analytics module

-- Dashboards table for storing custom dashboard configurations
CREATE TABLE IF NOT EXISTS public.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  layout TEXT NOT NULL DEFAULT 'grid' CHECK (layout IN ('grid', 'freeform')),
  widgets JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Widgets table for reusable widget definitions
CREATE TABLE IF NOT EXISTS public.widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  dashboard_id UUID REFERENCES public.dashboards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('chart', 'metric', 'table', 'gauge')),
  chart_type TEXT CHECK (chart_type IN ('bar', 'line', 'pie', 'area')),
  size TEXT NOT NULL DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large')),
  position JSONB NOT NULL DEFAULT '{}'::jsonb,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  data JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Export jobs table for scheduled data exports
CREATE TABLE IF NOT EXISTS public.export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  data_source TEXT NOT NULL CHECK (data_source IN ('projects', 'people', 'finance', 'events', 'custom_query')),
  format TEXT NOT NULL CHECK (format IN ('csv', 'xlsx', 'json', 'pdf')),
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  schedule JSONB DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'failed', 'completed')),
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  file_url TEXT,
  file_size BIGINT,
  record_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Export history table for tracking export executions
CREATE TABLE IF NOT EXISTS public.export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_job_id UUID NOT NULL REFERENCES public.export_jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  file_url TEXT,
  file_size BIGINT,
  record_count INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics metrics table for storing calculated metrics
CREATE TABLE IF NOT EXISTS public.analytics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('count', 'sum', 'avg', 'percentage')),
  value NUMERIC NOT NULL,
  dimensions JSONB DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS dashboards_org_idx ON public.dashboards (organization_id);
CREATE INDEX IF NOT EXISTS dashboards_created_by_idx ON public.dashboards (created_by);
CREATE INDEX IF NOT EXISTS dashboards_public_idx ON public.dashboards (is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS widgets_org_idx ON public.widgets (organization_id);
CREATE INDEX IF NOT EXISTS widgets_dashboard_idx ON public.widgets (dashboard_id);
CREATE INDEX IF NOT EXISTS widgets_type_idx ON public.widgets (type);

CREATE INDEX IF NOT EXISTS export_jobs_org_idx ON public.export_jobs (organization_id);
CREATE INDEX IF NOT EXISTS export_jobs_status_idx ON public.export_jobs (status);
CREATE INDEX IF NOT EXISTS export_jobs_next_run_idx ON public.export_jobs (next_run) WHERE next_run IS NOT NULL;
CREATE INDEX IF NOT EXISTS export_jobs_created_by_idx ON public.export_jobs (created_by);

CREATE INDEX IF NOT EXISTS export_history_job_idx ON public.export_history (export_job_id);
CREATE INDEX IF NOT EXISTS export_history_status_idx ON public.export_history (status);
CREATE INDEX IF NOT EXISTS export_history_started_idx ON public.export_history (started_at);

CREATE INDEX IF NOT EXISTS analytics_metrics_org_idx ON public.analytics_metrics (organization_id);
CREATE INDEX IF NOT EXISTS analytics_metrics_name_idx ON public.analytics_metrics (metric_name);
CREATE INDEX IF NOT EXISTS analytics_metrics_period_idx ON public.analytics_metrics (period_start, period_end);
CREATE INDEX IF NOT EXISTS analytics_metrics_calculated_idx ON public.analytics_metrics (calculated_at);

-- Enable Row Level Security
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dashboards
CREATE POLICY dashboards_org_isolation ON public.dashboards
  FOR ALL USING (organization_id = (current_setting('app.current_organization_id'))::uuid);

CREATE POLICY dashboards_service_role ON public.dashboards
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies for widgets
CREATE POLICY widgets_org_isolation ON public.widgets
  FOR ALL USING (organization_id = (current_setting('app.current_organization_id'))::uuid);

CREATE POLICY widgets_service_role ON public.widgets
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies for export_jobs
CREATE POLICY export_jobs_org_isolation ON public.export_jobs
  FOR ALL USING (organization_id = (current_setting('app.current_organization_id'))::uuid);

CREATE POLICY export_jobs_service_role ON public.export_jobs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies for export_history
CREATE POLICY export_history_org_isolation ON public.export_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.export_jobs 
      WHERE export_jobs.id = export_history.export_job_id 
      AND export_jobs.organization_id = (current_setting('app.current_organization_id'))::uuid
    )
  );

CREATE POLICY export_history_service_role ON public.export_history
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies for analytics_metrics
CREATE POLICY analytics_metrics_org_isolation ON public.analytics_metrics
  FOR ALL USING (organization_id = (current_setting('app.current_organization_id'))::uuid);

CREATE POLICY analytics_metrics_service_role ON public.analytics_metrics
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Triggers for updated_at timestamps
CREATE TRIGGER set_dashboards_updated_at 
  BEFORE UPDATE ON public.dashboards 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_widgets_updated_at 
  BEFORE UPDATE ON public.widgets 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_export_jobs_updated_at 
  BEFORE UPDATE ON public.export_jobs 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Grant permissions
GRANT ALL ON public.dashboards TO authenticated;
GRANT ALL ON public.widgets TO authenticated;
GRANT ALL ON public.export_jobs TO authenticated;
GRANT ALL ON public.export_history TO authenticated;
GRANT ALL ON public.analytics_metrics TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.dashboards IS 'Custom analytics dashboards with widget configurations';
COMMENT ON TABLE public.widgets IS 'Reusable widget definitions for dashboards';
COMMENT ON TABLE public.export_jobs IS 'Scheduled data export job configurations';
COMMENT ON TABLE public.export_history IS 'History of export job executions';
COMMENT ON TABLE public.analytics_metrics IS 'Calculated analytics metrics with time-series data';

COMMENT ON COLUMN public.dashboards.widgets IS 'JSONB array of widget configurations and layout information';
COMMENT ON COLUMN public.widgets.config IS 'Widget-specific configuration options (chart settings, data sources, etc.)';
COMMENT ON COLUMN public.export_jobs.filters IS 'Export filtering criteria and parameters';
COMMENT ON COLUMN public.export_jobs.schedule IS 'Cron-like scheduling configuration for automated exports';
COMMENT ON COLUMN public.analytics_metrics.dimensions IS 'Additional metric dimensions for grouping and filtering';
