/**
 * Account Settings Module Type Definitions
 * ATLVS Architecture Compliance
 */

// Core Account Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  ip_address: string;
  user_agent: string;
  device_info?: unknown;
  location?: string;
  is_current: boolean;
  created_at: string;
  last_active: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  last_used?: string;
  expires_at?: string;
  created_at: string;
  is_active: boolean;
}

export interface TwoFactorAuth {
  id: string;
  is_enabled: boolean;
  backup_codes: string[];
  recovery_codes: string[];
  created_at: string;
  last_used?: string;
}

// Account Record for ATLVS DataViews
export interface AccountRecord {
  id: string;
  type: AccountRecordType;
  name: string;
  value: string;
  description: string;
  status: AccountStatus;
  category: AccountCategory;
  created_at: string;
  updated_at: string;
  metadata?: unknown;
}

export type AccountRecordType = 'profile' | 'session' | 'api_key' | 'security' | 'preference';
export type AccountStatus = 'active' | 'inactive' | 'expired' | 'revoked';
export type AccountCategory = 'personal' | 'security' | 'api' | 'sessions' | 'preferences';

// ATLVS DataViews Configuration Types
export interface AccountFieldConfig {
  key: keyof AccountRecord;
  label: string;
  type: 'text' | 'select' | 'date' | 'textarea' | 'boolean';
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

export interface AccountViewConfig {
  id: string;
  name: string;
  viewType: 'grid' | 'list' | 'kanban';
  defaultView: string;
  fields: AccountFieldConfig[];
  data: AccountRecord[];
  onSearch?: (query: string) => Promise<void>;
  onFilter?: (filters: unknown) => Promise<void>;
  onSort?: (sorts: unknown) => Promise<void>;
  onRefresh?: () => Promise<AccountRecord[]>;
  onExport?: (data: unknown, format: string) => void;
}

// Form Types
export interface ProfileFormData {
  name: string;
  email: string;
  phone?: string;
  timezone?: string;
  language?: string;
}

export interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ApiKeyFormData {
  name: string;
  permissions: string[];
  expires_at?: string;
}

export interface TwoFactorFormData {
  verification_code: string;
  backup_code?: string;
}

// Statistics Types
export interface AccountStatistics {
  totalSessions: number;
  activeSessions: number;
  totalApiKeys: number;
  activeApiKeys: number;
  securityScore: number;
  lastLoginDate: string;
  accountAge: number;
}

// Search and Filter Types
export interface AccountSearchParams {
  query?: string;
  type?: AccountRecordType;
  status?: AccountStatus;
  category?: AccountCategory;
  created_after?: string;
  created_before?: string;
}

export interface AccountFilterOptions {
  types: Array<{ value: AccountRecordType; label: string; count: number }>;
  statuses: Array<{ value: AccountStatus; label: string; count: number }>;
  categories: Array<{ value: AccountCategory; label: string; count: number }>;
}

// Drawer Types
export interface AccountDrawerProps {
  mode: 'create' | 'edit' | 'view';
  record?: AccountRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: unknown) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

// Component Props Types
export interface AccountClientProps {
  userId: string;
  orgId: string;
}

export interface AccountGridViewProps {
  records: AccountRecord[];
  loading: boolean;
  onEdit: (record: AccountRecord) => void;
  onDelete: (id: string) => void;
  onSelect: (ids: string[]) => void;
  selectedIds: string[];
}

export interface AccountListViewProps {
  records: AccountRecord[];
  loading: boolean;
  onEdit: (record: AccountRecord) => void;
  onView: (record: AccountRecord) => void;
}

// Audit Types
export interface AccountAuditLog {
  id: string;
  action: 'profile_update' | 'password_change' | 'session_revoke' | 'api_key_create' | 'api_key_revoke' | '2fa_enable' | '2fa_disable';
  details: unknown;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

// Export Types
export interface AccountExportOptions {
  format: 'csv' | 'json';
  includeMetadata: boolean;
  categories?: AccountCategory[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// Validation Types
export interface AccountValidationError {
  field: string;
  message: string;
  code: string;
}

export interface AccountValidationResult {
  valid: boolean;
  errors: AccountValidationError[];
}

// State Management Types
export interface AccountState {
  profile: UserProfile | null;
  sessions: UserSession[];
  apiKeys: ApiKey[];
  twoFactor: TwoFactorAuth | null;
  records: AccountRecord[];
  loading: boolean;
  error: string | null;
  selectedRecords: string[];
  searchQuery: string;
  filters: AccountSearchParams;
  statistics: AccountStatistics | null;
  auditLogs: AccountAuditLog[];
}

export interface AccountActions {
  loadProfile: () => Promise<void>;
  updateProfile: (data: ProfileFormData) => Promise<void>;
  changePassword: (data: PasswordFormData) => Promise<void>;
  loadSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;
  loadApiKeys: () => Promise<void>;
  createApiKey: (data: ApiKeyFormData) => Promise<void>;
  revokeApiKey: (keyId: string) => Promise<void>;
  setupTwoFactor: () => Promise<string>; // Returns QR code
  enableTwoFactor: (code: string) => Promise<void>;
  disableTwoFactor: (code: string) => Promise<void>;
  loadRecords: () => Promise<void>;
  searchRecords: (query: string) => Promise<void>;
  filterRecords: (filters: AccountSearchParams) => Promise<void>;
  exportRecords: (options: AccountExportOptions) => Promise<void>;
  loadStatistics: () => Promise<void>;
  loadAuditLogs: () => Promise<void>;
}
