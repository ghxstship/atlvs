import { z } from 'zod';
import { 
  Settings,
  Shield,
  Users,
  Bell,
  Palette,
  Globe,
  Database,
  Key,
  Mail,
  Smartphone,
  CreditCard,
  FileText,
  Lock,
  Eye,
  Zap,
  Code,
  Download,
  Upload,
  Plus,
  Trash
} from 'lucide-react';
import type { ModuleConfig } from '@ghxstship/ui/config/types';

// Schemas
const OrganizationSettingsSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Organization name is required'),
  display_name: z.string().optional(),
  description: z.string().optional(),
  logo_url: z.string().url().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  timezone: z.string().default('UTC'),
  locale: z.string().default('en-US'),
  currency: z.string().default('USD'),
  date_format: z.string().default('MM/dd/yyyy'),
  time_format: z.enum(['12h', '24h']).default('12h'),
  fiscal_year_start: z.number().int().min(1).max(12).default(1),
  business_hours: z.object({
    monday: z.object({ start: z.string(), end: z.string(), enabled: z.boolean() }),
    tuesday: z.object({ start: z.string(), end: z.string(), enabled: z.boolean() }),
    wednesday: z.object({ start: z.string(), end: z.string(), enabled: z.boolean() }),
    thursday: z.object({ start: z.string(), end: z.string(), enabled: z.boolean() }),
    friday: z.object({ start: z.string(), end: z.string(), enabled: z.boolean() }),
    saturday: z.object({ start: z.string(), end: z.string(), enabled: z.boolean() }),
    sunday: z.object({ start: z.string(), end: z.string(), enabled: z.boolean() })
  }).optional(),
  contact_info: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional()
  }).optional(),
  features: z.record(z.boolean()).optional(),
  custom_fields: z.record(z.any()).optional(),
  updated_at: z.date()
});

const UserRoleSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  level: z.number().int().min(0).max(100).default(0),
  is_system_role: z.boolean().default(false),
  permissions: z.array(z.object({
    resource: z.string(),
    actions: z.array(z.string()),
    conditions: z.record(z.any()).optional()
  })),
  inherits_from: z.string().uuid().optional(),
  color: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

const NotificationSettingsSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  type: z.enum(['email', 'sms', 'push', 'in_app']),
  category: z.enum(['security', 'updates', 'reminders', 'mentions', 'assignments', 'deadlines', 'system']),
  enabled: z.boolean().default(true),
  frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly', 'never']).default('immediate'),
  quiet_hours: z.object({
    enabled: z.boolean().default(false),
    start: z.string(),
    end: z.string(),
    timezone: z.string()
  }).optional(),
  filters: z.record(z.any()).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

const IntegrationSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Integration name is required'),
  provider: z.string().min(1, 'Provider is required'),
  type: z.enum(['oauth', 'api_key', 'webhook', 'saml', 'custom']),
  status: z.enum(['active', 'inactive', 'error', 'pending']),
  configuration: z.record(z.any()),
  credentials: z.record(z.any()).optional(),
  webhook_url: z.string().url().optional(),
  webhook_secret: z.string().optional(),
  scopes: z.array(z.string()).optional(),
  rate_limit: z.object({
    requests_per_minute: z.number().int().positive(),
    requests_per_hour: z.number().int().positive()
  }).optional(),
  last_sync: z.date().optional(),
  sync_frequency: z.enum(['manual', 'real_time', 'hourly', 'daily', 'weekly']).default('manual'),
  error_count: z.number().int().default(0),
  last_error: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

const AuditLogSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  action: z.string().min(1, 'Action is required'),
  resource_type: z.string().min(1, 'Resource type is required'),
  resource_id: z.string().optional(),
  details: z.record(z.any()).optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  session_id: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: z.enum(['success', 'failure', 'warning']).default('success'),
  timestamp: z.date()
});

export const settingsModuleConfig: ModuleConfig = {
  id: 'settings',
  name: 'Settings',
  description: 'Organization settings, security, and system configuration',
  icon: Settings,
  color: 'gray',
  path: '/settings',
  
  entities: {
    organization: {
      table: 'organization_settings',
      singular: 'Organization Setting',
      plural: 'Organization Settings',
      schema: OrganizationSettingsSchema,
      searchFields: ['name', 'description'],
      orderBy: 'updated_at.desc',
      
      fields: [
        { 
          key: 'name', 
          label: 'Organization Name', 
          type: 'text', 
          required: true,
          group: 'basic'
        },
        { 
          key: 'display_name', 
          label: 'Display Name', 
          type: 'text',
          group: 'basic'
        },
        { 
          key: 'description', 
          label: 'Description', 
          type: 'textarea',
          rows: 3,
          group: 'basic'
        },
        { 
          key: 'logo_url', 
          label: 'Logo', 
          type: 'file',
          accept: 'image/*',
          maxSize: 2 * 1024 * 1024,
          group: 'branding'
        },
        { 
          key: 'website', 
          label: 'Website', 
          type: 'text',
          group: 'contact'
        },
        { 
          key: 'industry', 
          label: 'Industry', 
          type: 'select',
          options: [
            { label: 'Technology', value: 'technology' },
            { label: 'Healthcare', value: 'healthcare' },
            { label: 'Finance', value: 'finance' },
            { label: 'Manufacturing', value: 'manufacturing' },
            { label: 'Retail', value: 'retail' },
            { label: 'Education', value: 'education' },
            { label: 'Other', value: 'other' },
          ],
          group: 'basic'
        },
        { 
          key: 'size', 
          label: 'Organization Size', 
          type: 'select',
          options: [
            { label: 'Startup (1-10)', value: 'startup' },
            { label: 'Small (11-50)', value: 'small' },
            { label: 'Medium (51-200)', value: 'medium' },
            { label: 'Large (201-1000)', value: 'large' },
            { label: 'Enterprise (1000+)', value: 'enterprise' },
          ],
          group: 'basic'
        },
        { 
          key: 'timezone', 
          label: 'Timezone', 
          type: 'select',
          defaultValue: 'UTC',
          options: [
            { label: 'UTC', value: 'UTC' },
            { label: 'America/New_York', value: 'America/New_York' },
            { label: 'America/Chicago', value: 'America/Chicago' },
            { label: 'America/Denver', value: 'America/Denver' },
            { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
            { label: 'Europe/London', value: 'Europe/London' },
            { label: 'Europe/Paris', value: 'Europe/Paris' },
            { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
          ],
          group: 'localization'
        },
        { 
          key: 'locale', 
          label: 'Locale', 
          type: 'select',
          defaultValue: 'en-US',
          options: [
            { label: 'English (US)', value: 'en-US' },
            { label: 'English (UK)', value: 'en-GB' },
            { label: 'Spanish', value: 'es-ES' },
            { label: 'French', value: 'fr-FR' },
            { label: 'German', value: 'de-DE' },
            { label: 'Japanese', value: 'ja-JP' },
          ],
          group: 'localization'
        },
        { 
          key: 'currency', 
          label: 'Currency', 
          type: 'select',
          defaultValue: 'USD',
          options: [
            { label: 'USD - US Dollar', value: 'USD' },
            { label: 'EUR - Euro', value: 'EUR' },
            { label: 'GBP - British Pound', value: 'GBP' },
            { label: 'JPY - Japanese Yen', value: 'JPY' },
            { label: 'CAD - Canadian Dollar', value: 'CAD' },
            { label: 'AUD - Australian Dollar', value: 'AUD' },
          ],
          group: 'localization'
        },
        { 
          key: 'date_format', 
          label: 'Date Format', 
          type: 'select',
          defaultValue: 'MM/dd/yyyy',
          options: [
            { label: 'MM/dd/yyyy', value: 'MM/dd/yyyy' },
            { label: 'dd/MM/yyyy', value: 'dd/MM/yyyy' },
            { label: 'yyyy-MM-dd', value: 'yyyy-MM-dd' },
            { label: 'dd MMM yyyy', value: 'dd MMM yyyy' },
          ],
          group: 'localization'
        },
        { 
          key: 'time_format', 
          label: 'Time Format', 
          type: 'select',
          defaultValue: '12h',
          options: [
            { label: '12 Hour', value: '12h' },
            { label: '24 Hour', value: '24h' },
          ],
          group: 'localization'
        },
        { 
          key: 'fiscal_year_start', 
          label: 'Fiscal Year Start Month', 
          type: 'select',
          defaultValue: '1',
          options: [
            { label: 'January', value: '1' },
            { label: 'February', value: '2' },
            { label: 'March', value: '3' },
            { label: 'April', value: '4' },
            { label: 'May', value: '5' },
            { label: 'June', value: '6' },
            { label: 'July', value: '7' },
            { label: 'August', value: '8' },
            { label: 'September', value: '9' },
            { label: 'October', value: '10' },
            { label: 'November', value: '11' },
            { label: 'December', value: '12' },
          ],
          group: 'business'
        }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'xl',
      
      defaultViews: ['list'],
      
      permissions: {
        create: false,
        delete: false,
        update: ['owner', 'admin']
      }
    },
    
    roles: {
      table: 'user_roles',
      singular: 'Role',
      plural: 'Roles',
      schema: UserRoleSchema,
      searchFields: ['name', 'description'],
      orderBy: 'level.desc',
      
      fields: [
        { key: 'name', label: 'Role Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'level', label: 'Permission Level', type: 'number', min: 0, max: 100, defaultValue: 0 },
        { key: 'inherits_from', label: 'Inherits From', type: 'select', options: 'roles' },
        { key: 'color', label: 'Color', type: 'color' }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'lg',
      
      defaultViews: ['list'],
      
      customActions: [
        {
          id: 'duplicate',
          label: 'Duplicate',
          onClick: async (role) => {
            console.log('Duplicating role:', role);
          },
          condition: (role) => !role.is_system_role
        }
      ]
    },
    
    notifications: {
      table: 'notification_settings',
      singular: 'Notification Setting',
      plural: 'Notification Settings',
      schema: NotificationSettingsSchema,
      includes: ['user:users(name,email)'],
      searchFields: ['category'],
      orderBy: 'category.asc',
      
      fields: [
        { key: 'user_id', label: 'User', type: 'select', options: 'users' },
        { 
          key: 'type', 
          label: 'Notification Type', 
          type: 'select',
          required: true,
          options: [
            { label: 'Email', value: 'email' },
            { label: 'SMS', value: 'sms' },
            { label: 'Push', value: 'push' },
            { label: 'In-App', value: 'in_app' },
          ]
        },
        { 
          key: 'category', 
          label: 'Category', 
          type: 'select',
          required: true,
          options: [
            { label: 'Security', value: 'security' },
            { label: 'Updates', value: 'updates' },
            { label: 'Reminders', value: 'reminders' },
            { label: 'Mentions', value: 'mentions' },
            { label: 'Assignments', value: 'assignments' },
            { label: 'Deadlines', value: 'deadlines' },
            { label: 'System', value: 'system' },
          ]
        },
        { key: 'enabled', label: 'Enabled', type: 'switch', defaultValue: true },
        { 
          key: 'frequency', 
          label: 'Frequency', 
          type: 'select',
          defaultValue: 'immediate',
          options: [
            { label: 'Immediate', value: 'immediate' },
            { label: 'Hourly', value: 'hourly' },
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Never', value: 'never' },
          ]
        }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'md',
      
      defaultViews: ['list']
    },
    
    integrations: {
      table: 'integrations',
      singular: 'Integration',
      plural: 'Integrations',
      schema: IntegrationSchema,
      searchFields: ['name', 'provider'],
      orderBy: 'name.asc',
      
      fields: [
        { key: 'name', label: 'Integration Name', type: 'text', required: true },
        { key: 'provider', label: 'Provider', type: 'text', required: true },
        { 
          key: 'type', 
          label: 'Type', 
          type: 'select',
          required: true,
          options: [
            { label: 'OAuth', value: 'oauth' },
            { label: 'API Key', value: 'api_key' },
            { label: 'Webhook', value: 'webhook' },
            { label: 'SAML', value: 'saml' },
            { label: 'Custom', value: 'custom' },
          ]
        },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'inactive',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Error', value: 'error' },
            { label: 'Pending', value: 'pending' },
          ]
        },
        { key: 'webhook_url', label: 'Webhook URL', type: 'text' },
        { key: 'webhook_secret', label: 'Webhook Secret', type: 'password' },
        { 
          key: 'sync_frequency', 
          label: 'Sync Frequency', 
          type: 'select',
          defaultValue: 'manual',
          options: [
            { label: 'Manual', value: 'manual' },
            { label: 'Real Time', value: 'real_time' },
            { label: 'Hourly', value: 'hourly' },
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
          ]
        },
        { key: 'error_count', label: 'Error Count', type: 'number', min: 0 },
        { key: 'last_error', label: 'Last Error', type: 'textarea', rows: 2 },
        { key: 'last_sync', label: 'Last Sync', type: 'datetime' }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'lg',
      
      defaultViews: ['list', 'grid'],
      
      customActions: [
        {
          id: 'test',
          label: 'Test Connection',
          onClick: async (integration) => {
            console.log('Testing integration:', integration);
          }
        },
        {
          id: 'sync',
          label: 'Sync Now',
          onClick: async (integration) => {
            console.log('Syncing integration:', integration);
          },
          condition: (integration) => integration.status === 'active'
        }
      ]
    },
    
    audit_logs: {
      table: 'audit_logs',
      singular: 'Audit Log',
      plural: 'Audit Logs',
      schema: AuditLogSchema,
      includes: ['user:users(name,email)'],
      searchFields: ['action', 'resource_type', 'details'],
      orderBy: 'timestamp.desc',
      
      fields: [
        { key: 'user_id', label: 'User', type: 'select', options: 'users' },
        { key: 'action', label: 'Action', type: 'text', required: true },
        { key: 'resource_type', label: 'Resource Type', type: 'text', required: true },
        { key: 'resource_id', label: 'Resource ID', type: 'text' },
        { key: 'ip_address', label: 'IP Address', type: 'text' },
        { key: 'user_agent', label: 'User Agent', type: 'text' },
        { key: 'session_id', label: 'Session ID', type: 'text' },
        { 
          key: 'severity', 
          label: 'Severity', 
          type: 'select',
          defaultValue: 'medium',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Critical', value: 'critical' },
          ]
        },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select',
          defaultValue: 'success',
          options: [
            { label: 'Success', value: 'success' },
            { label: 'Failure', value: 'failure' },
            { label: 'Warning', value: 'warning' },
          ]
        },
        { key: 'timestamp', label: 'Timestamp', type: 'datetime', required: true }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'lg',
      
      defaultViews: ['list'],
      
      permissions: {
        create: false,
        update: false,
        delete: ['owner']
      }
    }
  },
  
  tabs: [
    {
      id: 'general',
      label: 'General',
      icon: Settings,
      entity: 'organization',
      views: ['list']
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      type: 'custom',
      component: () => null // Will be implemented separately
    },
    {
      id: 'users_roles',
      label: 'Users & Roles',
      icon: Users,
      entity: 'roles',
      views: ['list']
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      entity: 'notifications',
      views: ['list']
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: Zap,
      entity: 'integrations',
      views: ['list', 'grid']
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: CreditCard,
      type: 'custom',
      component: () => null // Will be implemented separately
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: Eye,
      entity: 'audit_logs',
      views: ['list']
    },
    {
      id: 'api',
      label: 'API',
      icon: Code,
      type: 'custom',
      component: () => null // Will be implemented separately
    }
  ],
  
  defaultTab: 'general',
  
  headerActions: [
    {
      id: 'export-settings',
      label: 'Export Settings',
      icon: Download,
      variant: 'outline',
      onClick: () => console.log('Export settings')
    },
    {
      id: 'import-settings',
      label: 'Import Settings',
      icon: Upload,
      variant: 'outline',
      onClick: () => console.log('Import settings')
    }
  ],
  
  features: {
    search: true,
    filters: true,
    sort: true,
    export: true,
    import: true,
    bulkActions: false,
    realtime: true,
    audit: true,
    notifications: true
  },
  
  permissions: {
    view: ['owner', 'admin'],
    create: ['owner', 'admin'],
    update: ['owner', 'admin'],
    delete: ['owner']
  }
};

export default settingsModuleConfig;
