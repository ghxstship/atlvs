-- Dashboard Module Complete Schema
-- Comprehensive dashboard system with widgets, layouts, and personalization

-- Dashboard configurations table
CREATE TABLE IF NOT EXISTS dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'custom', -- 'system', 'custom', 'template'
  layout JSONB NOT NULL DEFAULT '[]', -- Widget layout configuration
  settings JSONB NOT NULL DEFAULT '{}', -- Dashboard-level settings
  is_default BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT dashboards_name_org_unique UNIQUE (organization_id, name)
);

-- Dashboard widgets table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  widget_type VARCHAR(100) NOT NULL, -- 'metric', 'chart', 'table', 'activity', 'calendar', etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,
  position JSONB NOT NULL DEFAULT '{}', -- x, y, width, height
  config JSONB NOT NULL DEFAULT '{}', -- Widget-specific configuration
  data_source VARCHAR(100), -- 'projects', 'people', 'finance', 'analytics', etc.
  query_config JSONB DEFAULT '{}', -- Query parameters and filters
  refresh_interval INTEGER DEFAULT 300, -- Seconds
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User dashboard preferences
CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  layout JSONB DEFAULT '{}', -- User-specific layout overrides
  settings JSONB DEFAULT '{}', -- User-specific settings
  is_favorite BOOLEAN DEFAULT FALSE,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT user_dashboard_prefs_unique UNIQUE (user_id, dashboard_id)
);

-- Dashboard sharing and permissions
CREATE TABLE IF NOT EXISTS dashboard_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shared_with_role VARCHAR(50), -- 'admin', 'manager', 'contributor', 'viewer'
  permission_level VARCHAR(20) NOT NULL DEFAULT 'view', -- 'view', 'edit', 'admin'
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT dashboard_shares_unique UNIQUE (dashboard_id, shared_with_user_id, shared_with_role)
);

-- Dashboard activity and audit log
CREATE TABLE IF NOT EXISTS dashboard_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
  widget_id UUID REFERENCES dashboard_widgets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'view', 'share', 'export'
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Widget templates for reusability
CREATE TABLE IF NOT EXISTS widget_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  widget_type VARCHAR(100) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  is_system BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT widget_templates_name_org_unique UNIQUE (organization_id, name)
);

-- Dashboard alerts and notifications
CREATE TABLE IF NOT EXISTS dashboard_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
  widget_id UUID REFERENCES dashboard_widgets(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  condition_config JSONB NOT NULL, -- Alert conditions and thresholds
  notification_config JSONB DEFAULT '{}', -- Email, Slack, webhook settings
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dashboards_organization_id ON dashboards(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_created_by ON dashboards(created_by);
CREATE INDEX IF NOT EXISTS idx_dashboards_type ON dashboards(type);
CREATE INDEX IF NOT EXISTS idx_dashboards_is_default ON dashboards(is_default) WHERE is_default = TRUE;

CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_dashboard_id ON dashboard_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_organization_id ON dashboard_widgets(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_widget_type ON dashboard_widgets(widget_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_data_source ON dashboard_widgets(data_source);

CREATE INDEX IF NOT EXISTS idx_user_dashboard_preferences_user_id ON user_dashboard_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dashboard_preferences_dashboard_id ON user_dashboard_preferences(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_user_dashboard_preferences_last_accessed ON user_dashboard_preferences(last_accessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_dashboard_shares_dashboard_id ON dashboard_shares(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_shares_shared_with_user_id ON dashboard_shares(shared_with_user_id);

CREATE INDEX IF NOT EXISTS idx_dashboard_activity_organization_id ON dashboard_activity(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_activity_dashboard_id ON dashboard_activity(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_activity_user_id ON dashboard_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_activity_created_at ON dashboard_activity(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_widget_templates_organization_id ON widget_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_widget_templates_widget_type ON widget_templates(widget_type);

CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_organization_id ON dashboard_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_dashboard_id ON dashboard_alerts(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_is_active ON dashboard_alerts(is_active) WHERE is_active = TRUE;

-- RLS Policies
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_alerts ENABLE ROW LEVEL SECURITY;

-- Dashboards policies
CREATE POLICY "Users can view dashboards in their organization" ON dashboards
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create dashboards in their organization" ON dashboards
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update their own dashboards or with admin role" ON dashboards
  FOR UPDATE USING (
    created_by = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can delete their own dashboards or with admin role" ON dashboards
  FOR DELETE USING (
    created_by = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner', 'admin')
    )
  );

-- Dashboard widgets policies
CREATE POLICY "Users can view widgets in their organization dashboards" ON dashboard_widgets
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can manage widgets in their organization dashboards" ON dashboard_widgets
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- User preferences policies
CREATE POLICY "Users can manage their own dashboard preferences" ON user_dashboard_preferences
  FOR ALL USING (user_id = auth.uid());

-- Dashboard shares policies
CREATE POLICY "Users can view shares for their dashboards" ON dashboard_shares
  FOR SELECT USING (
    shared_with_user_id = auth.uid() OR
    dashboard_id IN (
      SELECT id FROM dashboards WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Dashboard owners can manage shares" ON dashboard_shares
  FOR ALL USING (
    dashboard_id IN (
      SELECT id FROM dashboards WHERE created_by = auth.uid()
    )
  );

-- Activity policies
CREATE POLICY "Users can view activity in their organization" ON dashboard_activity
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "System can insert activity logs" ON dashboard_activity
  FOR INSERT WITH CHECK (true);

-- Widget templates policies
CREATE POLICY "Users can view templates in their organization" ON widget_templates
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can manage templates in their organization" ON widget_templates
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Dashboard alerts policies
CREATE POLICY "Users can view alerts in their organization" ON dashboard_alerts
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can manage alerts in their organization" ON dashboard_alerts
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Audit triggers
CREATE OR REPLACE FUNCTION update_dashboard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_updated_at();

CREATE TRIGGER update_dashboard_widgets_updated_at
  BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_updated_at();

CREATE TRIGGER update_user_dashboard_preferences_updated_at
  BEFORE UPDATE ON user_dashboard_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_updated_at();

CREATE TRIGGER update_widget_templates_updated_at
  BEFORE UPDATE ON widget_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_updated_at();

CREATE TRIGGER update_dashboard_alerts_updated_at
  BEFORE UPDATE ON dashboard_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_updated_at();

-- Function to get dashboard metrics
CREATE OR REPLACE FUNCTION get_dashboard_metrics(org_id UUID, dashboard_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{}';
  total_dashboards INTEGER;
  total_widgets INTEGER;
  active_users INTEGER;
  recent_activity INTEGER;
BEGIN
  -- Total dashboards
  SELECT COUNT(*) INTO total_dashboards
  FROM dashboards d
  WHERE d.organization_id = org_id
    AND (dashboard_id IS NULL OR d.id = dashboard_id);
  
  -- Total widgets
  SELECT COUNT(*) INTO total_widgets
  FROM dashboard_widgets dw
  WHERE dw.organization_id = org_id
    AND (dashboard_id IS NULL OR dw.dashboard_id = dashboard_id);
  
  -- Active users (accessed in last 7 days)
  SELECT COUNT(DISTINCT user_id) INTO active_users
  FROM user_dashboard_preferences udp
  JOIN dashboards d ON d.id = udp.dashboard_id
  WHERE d.organization_id = org_id
    AND udp.last_accessed_at >= NOW() - INTERVAL '7 days'
    AND (dashboard_id IS NULL OR udp.dashboard_id = dashboard_id);
  
  -- Recent activity (last 24 hours)
  SELECT COUNT(*) INTO recent_activity
  FROM dashboard_activity da
  WHERE da.organization_id = org_id
    AND da.created_at >= NOW() - INTERVAL '24 hours'
    AND (dashboard_id IS NULL OR da.dashboard_id = dashboard_id);
  
  result := jsonb_build_object(
    'total_dashboards', total_dashboards,
    'total_widgets', total_widgets,
    'active_users', active_users,
    'recent_activity', recent_activity
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to duplicate dashboard
CREATE OR REPLACE FUNCTION duplicate_dashboard(
  source_dashboard_id UUID,
  new_name VARCHAR(255),
  new_description TEXT DEFAULT NULL,
  target_org_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_dashboard_id UUID;
  source_org_id UUID;
  widget_record RECORD;
BEGIN
  -- Get source dashboard organization
  SELECT organization_id INTO source_org_id
  FROM dashboards
  WHERE id = source_dashboard_id;
  
  -- Use target org or source org
  IF target_org_id IS NULL THEN
    target_org_id := source_org_id;
  END IF;
  
  -- Create new dashboard
  INSERT INTO dashboards (organization_id, name, description, type, layout, settings, created_by)
  SELECT 
    target_org_id,
    new_name,
    COALESCE(new_description, description),
    'custom',
    layout,
    settings,
    auth.uid()
  FROM dashboards
  WHERE id = source_dashboard_id
  RETURNING id INTO new_dashboard_id;
  
  -- Copy widgets
  FOR widget_record IN
    SELECT * FROM dashboard_widgets WHERE dashboard_id = source_dashboard_id
  LOOP
    INSERT INTO dashboard_widgets (
      organization_id, dashboard_id, widget_type, title, description,
      position, config, data_source, query_config, refresh_interval, is_visible
    ) VALUES (
      target_org_id, new_dashboard_id, widget_record.widget_type,
      widget_record.title, widget_record.description, widget_record.position,
      widget_record.config, widget_record.data_source, widget_record.query_config,
      widget_record.refresh_interval, widget_record.is_visible
    );
  END LOOP;
  
  RETURN new_dashboard_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default system dashboards and widget templates
INSERT INTO dashboards (organization_id, name, description, type, layout, is_default, created_by)
SELECT 
  o.id,
  'Executive Overview',
  'High-level metrics and KPIs for executive decision making',
  'system',
  '[
    {"i": "projects-overview", "x": 0, "y": 0, "w": 6, "h": 4},
    {"i": "finance-summary", "x": 6, "y": 0, "w": 6, "h": 4},
    {"i": "people-metrics", "x": 0, "y": 4, "w": 4, "h": 3},
    {"i": "recent-activity", "x": 4, "y": 4, "w": 8, "h": 3}
  ]'::jsonb,
  true,
  (SELECT id FROM users WHERE email = 'system@ghxstship.com' LIMIT 1)
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM dashboards d 
  WHERE d.organization_id = o.id AND d.name = 'Executive Overview'
);

-- Insert system widget templates
INSERT INTO widget_templates (organization_id, name, description, widget_type, config, is_system, created_by)
SELECT 
  o.id,
  'Project Status Overview',
  'Overview of project statuses and progress',
  'chart',
  '{
    "chartType": "doughnut",
    "dataSource": "projects",
    "groupBy": "status",
    "aggregation": "count",
    "colors": ["#10B981", "#F59E0B", "#EF4444", "#6B7280"]
  }'::jsonb,
  true,
  (SELECT id FROM users WHERE email = 'system@ghxstship.com' LIMIT 1)
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM widget_templates wt 
  WHERE wt.organization_id = o.id AND wt.name = 'Project Status Overview'
);

INSERT INTO widget_templates (organization_id, name, description, widget_type, config, is_system, created_by)
SELECT 
  o.id,
  'Financial Summary Card',
  'Key financial metrics and trends',
  'metric',
  '{
    "metrics": [
      {"key": "total_revenue", "label": "Total Revenue", "format": "currency"},
      {"key": "total_expenses", "label": "Total Expenses", "format": "currency"},
      {"key": "profit_margin", "label": "Profit Margin", "format": "percentage"}
    ],
    "dataSource": "finance",
    "timeframe": "current_month"
  }'::jsonb,
  true,
  (SELECT id FROM users WHERE email = 'system@ghxstship.com' LIMIT 1)
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM widget_templates wt 
  WHERE wt.organization_id = o.id AND wt.name = 'Financial Summary Card'
);

INSERT INTO widget_templates (organization_id, name, description, widget_type, config, is_system, created_by)
SELECT 
  o.id,
  'Team Activity Feed',
  'Recent team activities and updates',
  'activity',
  '{
    "maxItems": 10,
    "showAvatars": true,
    "groupByDate": true,
    "includeModules": ["projects", "people", "finance"],
    "refreshInterval": 60
  }'::jsonb,
  true,
  (SELECT id FROM users WHERE email = 'system@ghxstship.com' LIMIT 1)
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM widget_templates wt 
  WHERE wt.organization_id = o.id AND wt.name = 'Team Activity Feed'
);
