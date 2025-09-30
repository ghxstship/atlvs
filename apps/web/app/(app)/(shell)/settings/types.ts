/**
 * Settings Module Type Definitions
 * ATLVS Architecture Compliance
 */

import type { ReactNode } from 'react';

// Core Settings Types
export interface Setting {
  id: string;
  organization_id: string;
  name: string;
  category: SettingCategory;
  value: string | number | boolean | object;
  description?: string;
  type: SettingType;
  is_public: boolean;
  is_editable: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export type SettingCategory = 
  | 'organization' 
  | 'security' 
  | 'notifications' 
  | 'integrations' 
  | 'billing'
  | 'permissions'
  | 'automations'
  | 'compliance'
  | 'backup';

export type SettingType = 'string' | 'number' | 'boolean' | 'json' | 'array';

// Settings Configuration Types
export interface GeneralSettings {
  organizationName?: string;
  timeZone?: string;
  dateFormat?: string;
  currency?: string;
  language?: string;
  fiscalYearStart?: string;
}

export interface BrandingSettings {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customCss?: string;
}

export interface FeaturesSettings {
  enableProjects?: boolean;
  enableJobs?: boolean;
  enableMarketplace?: boolean;
  enableFinance?: boolean;
  enableReporting?: boolean;
  enableIntegrations?: boolean;
}

export interface PermissionsSettings {
  defaultUserRole?: 'member' | 'manager' | 'admin';
  allowSelfRegistration?: boolean;
  requireEmailVerification?: boolean;
  passwordPolicy?: PasswordPolicy;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  maxAge?: number; // in days
}

export interface NotificationSettings {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  defaultChannels?: NotificationChannel[];
  digestFrequency?: DigestFrequency;
}

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';
export type DigestFrequency = 'none' | 'daily' | 'weekly' | 'monthly';

export interface IntegrationSettings {
  webhooksEnabled?: boolean;
  apiRateLimit?: number;
  allowedDomains?: string[];
  ssoEnabled?: boolean;
  ssoProvider?: string;
}

export interface ComplianceSettings {
  dataRetentionDays?: number;
  auditLogRetentionDays?: number;
  requireDataProcessingConsent?: boolean;
  enableGDPRCompliance?: boolean;
  enableSOXCompliance?: boolean;
}

export interface BackupSettings {
  autoBackupEnabled?: boolean;
  backupFrequency?: 'daily' | 'weekly' | 'monthly';
  retentionPeriod?: number; // in days
  includeFiles?: boolean;
}

// Comprehensive Settings Interface
export interface Settings {
  general?: GeneralSettings;
  branding?: BrandingSettings;
  features?: FeaturesSettings;
  permissions?: PermissionsSettings;
  notifications?: NotificationSettings;
  integrations?: IntegrationSettings;
  compliance?: ComplianceSettings;
  backup?: BackupSettings;
}

// API Response Types
export interface SettingsResponse {
  settings: Settings;
  success: boolean;
  message?: string;
}

export interface SettingRecord {
  id: string;
  name: string;
  category: SettingCategory;
  value: string;
  description: string;
  type: SettingType;
  is_public: string;
  is_editable: string;
  created_at: string;
  updated_at: string;
}

// ATLVS DataViews Configuration Types
export interface SettingsFieldConfig {
  key: keyof SettingRecord;
  label: string;
  type: 'text' | 'select' | 'date' | 'textarea' | 'boolean';
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

export type SettingsSearchFilters = SettingsSearchParams;

export type SettingsExportFormat = 'csv' | 'json';

export interface SettingsSort {
  field: keyof SettingRecord;
  direction: 'asc' | 'desc';
}

export type UpdateSettingPayload = Partial<SettingsFormData>;

export interface MoveSettingPayload {
  settingId: string;
  category: SettingCategory;
}

export interface SettingsViewConfig {
  id: string;
  name: string;
  viewType: 'grid' | 'list' | 'kanban' | 'calendar';
  availableViews?: Array<'grid' | 'list' | 'kanban' | 'calendar'>;
  defaultView: string;
  fields: SettingsFieldConfig[];
  data: SettingRecord[];
  onSearch?: (query: string) => Promise<void>;
  onFilter?: (filters: SettingsSearchFilters) => Promise<void>;
  onSort?: (sorts: SettingsSort[]) => Promise<void>;
  onRefresh?: () => Promise<SettingRecord[]>;
  onExport?: (format: SettingsExportFormat, data: SettingRecord[], meta?: SettingsExportMeta) => void | Promise<void>;
  onImport?: (data: unknown[]) => void | Promise<void>;
  bulkActions?: SettingsBulkAction[];
  exportConfig?: SettingsExportConfig;
}

// Drawer Types
export interface SettingsDrawerProps {
  mode: 'create' | 'edit' | 'view';
  setting?: SettingRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: SettingsFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export interface SettingsBulkAction {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  confirmMessage?: string;
  onClick: (selectedIds: string[]) => void | Promise<void>;
}

export interface SettingsExportMeta {
  filters?: SettingsSearchFilters;
  sorts?: SettingsSort[];
  fields?: SettingsFieldConfig[];
}

export interface SettingsExportConfig {
  formats: SettingsExportFormat[];
  onExport: (format: SettingsExportFormat, data: SettingRecord[], meta?: SettingsExportMeta) => void | Promise<void>;
}

// Form Types
export interface SettingsFormData {
  name: string;
  category: SettingCategory;
  value: string;
  description?: string;
  type: SettingType;
  is_public: boolean;
  is_editable: boolean;
}

// Statistics Types
export interface SettingsStatistics {
  totalSettings: number;
  settingsByCategory: Record<SettingCategory, number>;
  publicSettings: number;
  editableSettings: number;
  recentlyUpdated: number;
}

// Audit Types
export interface SettingsAuditLog {
  id: string;
  setting_id: string;
  action: 'create' | 'update' | 'delete';
  old_value?: unknown;
  new_value?: unknown;
  user_id: string;
  user_name: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

// Search and Filter Types
export interface SettingsSearchParams {
  query?: string;
  category?: SettingCategory;
  type?: SettingType;
  is_public?: boolean;
  is_editable?: boolean;
  created_after?: string;
  created_before?: string;
}

export interface SettingsFilterOptions {
  categories: Array<{ value: SettingCategory; label: string; count: number }>;
  types: Array<{ value: SettingType; label: string; count: number }>;
  publicOptions: Array<{ value: boolean; label: string; count: number }>;
  editableOptions: Array<{ value: boolean; label: string; count: number }>;
}

// Export Types
export interface SettingsExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeMetadata: boolean;
  categories?: SettingCategory[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// Import Types
export interface SettingsImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

// Validation Types
export interface SettingsValidationError {
  field: string;
  message: string;
  code: string;
}

export interface SettingsValidationResult {
  valid: boolean;
  errors: SettingsValidationError[];
}

// State Management Types
export interface SettingsState {
  settings: SettingRecord[];
  loading: boolean;
  error: string | null;
  selectedSettings: string[];
  searchQuery: string;
  filters: SettingsSearchParams;
  statistics: SettingsStatistics | null;
  auditLogs: SettingsAuditLog[];
}

export interface SettingsActions {
  loadSettings: () => Promise<void>;
  createSetting: (data: SettingsFormData) => Promise<void>;
  updateSetting: (id: string, data: Partial<SettingsFormData>) => Promise<void>;
  deleteSetting: (id: string) => Promise<void>;
  bulkDeleteSettings: (ids: string[]) => Promise<void>;
  searchSettings: (query: string) => Promise<void>;
  filterSettings: (filters: SettingsSearchParams) => Promise<void>;
  exportSettings: (options: SettingsExportOptions) => Promise<void>;
  importSettings: (file: File) => Promise<SettingsImportResult>;
  loadStatistics: () => Promise<void>;
  loadAuditLogs: (settingId?: string) => Promise<void>;
}

// Component Props Types
export interface SettingsClientProps {
  orgId: string;
  userId: string;
}

export interface CreateSettingsClientProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface SettingsGridViewProps {
  settings: SettingRecord[];
  loading: boolean;
  onEdit: (setting: SettingRecord) => void;
  onDelete: (id: string) => void;
  onSelect: (ids: string[]) => void;
  selectedIds: string[];
}

export interface SettingsListViewProps {
  settings: SettingRecord[];
  loading: boolean;
  onEdit: (setting: SettingRecord) => void;
  onView: (setting: SettingRecord) => void;
}

export interface SettingsKanbanViewProps {
  settings: SettingRecord[];
  loading: boolean;
  onEdit: (setting: SettingRecord) => void;
  onMove: (settingId: string, newCategory: SettingCategory) => void;
}
