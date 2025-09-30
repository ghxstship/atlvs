import type { DataRecord } from '@ghxstship/ui';

export interface MarketplaceSettingsData extends DataRecord {
  id: string;
  user_id: string;
  organization_id: string;
  
  // Profile Settings
  display_name: string;
  business_description: string;
  website_url: string;
  logo_url: string;
  
  // Privacy Settings
  profile_visibility: 'public' | 'marketplace_only' | 'private';
  show_contact_info: boolean;
  allow_direct_messages: boolean;
  
  // Notification Settings
  email_notifications: {
    new_messages: boolean;
    project_updates: boolean;
    payment_notifications: boolean;
    review_notifications: boolean;
    marketing_emails: boolean;
  };
  
  sms_notifications: {
    urgent_messages: boolean;
    payment_alerts: boolean;
  };
  
  // Marketplace Preferences
  auto_accept_projects: boolean;
  default_response_time: string;
  preferred_categories: string[];
  minimum_project_value: number;
  currency: string;
  
  // Security Settings
  two_factor_enabled: boolean;
  login_notifications: boolean;
  session_timeout: number;
  
  // Payment Settings
  auto_invoice: boolean;
  payment_terms: string;
  late_fee_percentage: number;
  escrow_preference: 'always' | 'large_projects' | 'never';
  
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quiet_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
    timezone: string;
  };
  categories: {
    messages: boolean;
    projects: boolean;
    payments: boolean;
    reviews: boolean;
    contracts: boolean;
    system: boolean;
  };
}

export interface SecuritySettings {
  two_factor_authentication: {
    enabled: boolean;
    method: 'sms' | 'email' | 'authenticator';
    backup_codes: string[];
  };
  login_notifications: boolean;
  session_management: {
    timeout_minutes: number;
    remember_device: boolean;
    max_concurrent_sessions: number;
  };
  api_access: {
    enabled: boolean;
    api_keys: Array<{
      id: string;
      name: string;
      key: string;
      permissions: string[];
      last_used: string;
      created_at: string;
    }>;
  };
  audit_log: {
    retention_days: number;
    include_ip_addresses: boolean;
    include_device_info: boolean;
  };
}

export interface PaymentConfiguration {
  default_currency: string;
  supported_currencies: string[];
  payment_methods: Array<{
    id: string;
    type: 'card' | 'bank' | 'paypal' | 'crypto';
    is_default: boolean;
    enabled: boolean;
  }>;
  invoicing: {
    auto_generate: boolean;
    default_terms: string;
    late_fee_percentage: number;
    tax_rate: number;
    include_tax: boolean;
  };
  escrow: {
    default_preference: 'always' | 'large_projects' | 'never';
    minimum_amount: number;
    auto_release_days: number;
  };
  fees: {
    transaction_percentage: number;
    minimum_fee: number;
    currency_conversion_fee: number;
  };
}

export interface IntegrationSettings {
  calendar: {
    provider: 'google' | 'outlook' | 'apple' | 'none';
    sync_enabled: boolean;
    calendar_id?: string;
  };
  communication: {
    slack: {
      enabled: boolean;
      webhook_url?: string;
      channels: string[];
    };
    discord: {
      enabled: boolean;
      webhook_url?: string;
    };
    teams: {
      enabled: boolean;
      webhook_url?: string;
    };
  };
  project_management: {
    trello: {
      enabled: boolean;
      api_key?: string;
      board_id?: string;
    };
    asana: {
      enabled: boolean;
      api_key?: string;
      workspace_id?: string;
    };
    notion: {
      enabled: boolean;
      api_key?: string;
      database_id?: string;
    };
  };
  accounting: {
    quickbooks: {
      enabled: boolean;
      company_id?: string;
    };
    xero: {
      enabled: boolean;
      tenant_id?: string;
    };
  };
}

export interface MarketplacePreferences {
  search_defaults: {
    radius_miles: number;
    sort_by: 'relevance' | 'distance' | 'rating' | 'price';
    include_remote: boolean;
  };
  project_matching: {
    auto_apply: boolean;
    match_threshold: number;
    preferred_project_types: string[];
    blacklisted_clients: string[];
  };
  vendor_discovery: {
    show_in_directory: boolean;
    featured_listing: boolean;
    portfolio_visibility: 'public' | 'clients_only' | 'private';
  };
  communication: {
    auto_respond: boolean;
    response_templates: Array<{
      id: string;
      name: string;
      content: string;
      trigger: string;
    }>;
    working_hours: {
      timezone: string;
      schedule: Record<string, { start: string; end: string; available: boolean }>;
    };
  };
}

export interface SettingsFormData {
  profile?: Partial<MarketplaceSettingsData>;
  notifications?: Partial<NotificationPreferences>;
  security?: Partial<SecuritySettings>;
  payments?: Partial<PaymentConfiguration>;
  integrations?: Partial<IntegrationSettings>;
  preferences?: Partial<MarketplacePreferences>;
}

export interface SettingsActivity extends DataRecord {
  id: string;
  user_id: string;
  category: 'profile' | 'notifications' | 'security' | 'payments' | 'integrations' | 'preferences';
  action: 'updated' | 'enabled' | 'disabled' | 'created' | 'deleted';
  description: string;
  old_value?: unknown;
  new_value?: unknown;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
