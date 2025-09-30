-- =====================================================
-- COMPREHENSIVE SETTINGS MODULE DATABASE SCHEMA
-- =====================================================

-- 1. ORGANIZATION SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key VARCHAR(255) NOT NULL,
  value JSONB NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN ('general', 'branding', 'locale', 'features', 'limits')),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  is_editable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(organization_id, key)
);

-- 2. USER SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key VARCHAR(255) NOT NULL,
  value JSONB NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN ('preferences', 'display', 'privacy', 'accessibility')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- 3. NOTIFICATION PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'push', 'in_app', 'sms', 'slack')),
  category VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  frequency VARCHAR(50) CHECK (frequency IN ('instant', 'hourly', 'daily', 'weekly', 'never')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id, channel, category)
);

-- 4. SECURITY SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  two_factor_required BOOLEAN DEFAULT false,
  two_factor_methods JSONB DEFAULT '["authenticator", "sms"]',
  sso_enabled BOOLEAN DEFAULT false,
  sso_provider VARCHAR(100),
  sso_config JSONB,
  password_policy JSONB DEFAULT '{
    "min_length": 8,
    "require_uppercase": true,
    "require_lowercase": true,
    "require_numbers": true,
    "require_special": false,
    "max_age_days": 90,
    "history_count": 5
  }',
  session_timeout_minutes INTEGER DEFAULT 1440,
  ip_whitelist JSONB DEFAULT '[]',
  audit_retention_days INTEGER DEFAULT 365,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- 5. API KEYS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  key_prefix VARCHAR(20) NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  rate_limit INTEGER DEFAULT 1000,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- 6. INTEGRATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  credentials JSONB,
  webhook_url TEXT,
  webhook_secret TEXT,
  status VARCHAR(50) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'pending')),
  last_sync_at TIMESTAMPTZ,
  sync_frequency VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- 7. WEBHOOKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  secret VARCHAR(255),
  events JSONB NOT NULL DEFAULT '[]',
  headers JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- 8. AUTOMATION RULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(100) NOT NULL,
  trigger_config JSONB NOT NULL,
  conditions JSONB DEFAULT '[]',
  actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  run_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- 9. CUSTOM ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  UNIQUE(organization_id, name)
);

-- 10. PERMISSION MATRIX TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS permission_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role_id UUID REFERENCES custom_roles(id) ON DELETE CASCADE,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  allowed BOOLEAN DEFAULT false,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, role_id, resource, action)
);

-- 11. USER SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  location JSONB,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AUDIT LOGS TABLE (Enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS settings_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  changes JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_org_settings_org_id ON organization_settings(organization_id);
CREATE INDEX idx_org_settings_category ON organization_settings(category);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_notification_prefs_user_org ON notification_preferences(user_id, organization_id);
CREATE INDEX idx_api_keys_org_id ON api_keys(organization_id);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_integrations_org_id ON integrations(organization_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_webhooks_org_id ON webhooks(organization_id);
CREATE INDEX idx_automation_rules_org_id ON automation_rules(organization_id);
CREATE INDEX idx_custom_roles_org_id ON custom_roles(organization_id);
CREATE INDEX idx_permission_matrix_org_role ON permission_matrix(organization_id, role_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_audit_logs_org_id ON settings_audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON settings_audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON settings_audit_logs(created_at);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Organization Settings RLS
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_settings_view" ON organization_settings FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "org_settings_manage" ON organization_settings FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role IN ('owner', 'admin')
    )
  );

-- User Settings RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_settings_own" ON user_settings FOR ALL
  USING (user_id = auth.uid());

-- Notification Preferences RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notification_prefs_own" ON notification_preferences FOR ALL
  USING (user_id = auth.uid());

-- Security Settings RLS
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "security_settings_view" ON security_settings FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "security_settings_manage" ON security_settings FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role IN ('owner', 'admin')
    )
  );

-- API Keys RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "api_keys_view" ON api_keys FOR SELECT
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "api_keys_manage" ON api_keys FOR ALL
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role IN ('owner', 'admin')
    )
  );

-- Integrations RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integrations_view" ON integrations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "integrations_manage" ON integrations FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role IN ('owner', 'admin')
    )
  );

-- Webhooks RLS
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhooks_view" ON webhooks FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "webhooks_manage" ON webhooks FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role IN ('owner', 'admin')
    )
  );

-- Automation Rules RLS
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "automation_rules_view" ON automation_rules FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "automation_rules_manage" ON automation_rules FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role IN ('owner', 'admin')
    )
  );

-- Custom Roles RLS
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "custom_roles_view" ON custom_roles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "custom_roles_manage" ON custom_roles FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role = 'owner'
    )
  );

-- Permission Matrix RLS
ALTER TABLE permission_matrix ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permission_matrix_view" ON permission_matrix FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "permission_matrix_manage" ON permission_matrix FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role = 'owner'
    )
  );

-- User Sessions RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_sessions_own" ON user_sessions FOR ALL
  USING (user_id = auth.uid());

-- Audit Logs RLS (read-only)
ALTER TABLE settings_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_view" ON settings_audit_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_org_settings_updated_at BEFORE UPDATE ON organization_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notification_prefs_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_security_settings_updated_at BEFORE UPDATE ON security_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON automation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_custom_roles_updated_at BEFORE UPDATE ON custom_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_permission_matrix_updated_at BEFORE UPDATE ON permission_matrix
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
