export interface Setting {
  id: string;
  organizationId: string;
  name: string;
  category: 'organization' | 'security' | 'notifications' | 'integrations' | 'billing' | 'teams' | 'permissions' | 'automations' | 'account';
  value: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  isPublic: boolean;
  isEditable: boolean;
  isRequired: boolean;
  defaultValue?: string;
  validationRules?: string; // JSON string for validation rules
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface SettingFilters {
  category?: string;
  type?: string;
  isPublic?: boolean;
  isEditable?: boolean;
  search?: string;
}

export interface SettingRepository {
  findById(id: string, orgId: string): Promise<Setting | null>;
  findByName(name: string, orgId: string): Promise<Setting | null>;
  list(orgId: string, filters?: SettingFilters, pagination?: { limit?: number; offset?: number }): Promise<Setting[]>;
  listByCategory(orgId: string, category: string): Promise<Setting[]>;
  create(entity: Setting): Promise<Setting>;
  update(id: string, patch: Partial<Setting>): Promise<Setting>;
  delete(id: string, orgId: string): Promise<void>;
  bulkUpdate(orgId: string, updates: Array<{ id: string; value: string }>): Promise<Setting[]>;
}

export interface OrganizationSetting {
  id: string;
  organizationId: string;
  name: string;
  displayName: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  timezone: string;
  locale: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  weekStartsOn: 'sunday' | 'monday';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecuritySetting {
  id: string;
  organizationId: string;
  twoFactorRequired: boolean;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  allowedIpRanges?: string[];
  ssoEnabled: boolean;
  ssoProvider?: string;
  ssoConfig?: Record<string, any>;
  auditLogRetentionDays: number;
  dataRetentionDays: number;
  encryptionEnabled: boolean;
  backupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationSetting {
  id: string;
  organizationId: string;
  userId?: string; // null for org-wide settings
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  slackEnabled: boolean;
  teamsEnabled: boolean;
  webhookEnabled: boolean;
  emailFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string; // HH:MM format
  weekendNotifications: boolean;
  notificationTypes: {
    projectUpdates: boolean;
    taskAssignments: boolean;
    deadlineReminders: boolean;
    budgetAlerts: boolean;
    securityAlerts: boolean;
    systemMaintenance: boolean;
    invoiceReminders: boolean;
    paymentConfirmations: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface IntegrationSetting {
  id: string;
  organizationId: string;
  name: string;
  provider: string;
  category: 'accounting' | 'crm' | 'project_management' | 'communication' | 'storage' | 'analytics' | 'other';
  isEnabled: boolean;
  config: Record<string, any>;
  credentials?: Record<string, any>; // Encrypted
  webhookUrl?: string;
  syncFrequency?: 'realtime' | 'hourly' | 'daily' | 'weekly';
  lastSyncAt?: string;
  syncStatus: 'active' | 'error' | 'paused';
  errorMessage?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface BillingSetting {
  id: string;
  organizationId: string;
  stripeCustomerId?: string;
  subscriptionId?: string;
  planId: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  seats: number;
  usedSeats: number;
  billingEmail: string;
  taxId?: string;
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  paymentMethod?: {
    type: 'card' | 'bank_account';
    last4: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  invoiceSettings: {
    autoAdvanceEnabled: boolean;
    collectionMethod: 'charge_automatically' | 'send_invoice';
    daysUntilDue?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationSettingRepository {
  findByOrganizationId(orgId: string): Promise<OrganizationSetting | null>;
  create(entity: OrganizationSetting): Promise<OrganizationSetting>;
  update(orgId: string, patch: Partial<OrganizationSetting>): Promise<OrganizationSetting>;
}

export interface SecuritySettingRepository {
  findByOrganizationId(orgId: string): Promise<SecuritySetting | null>;
  create(entity: SecuritySetting): Promise<SecuritySetting>;
  update(orgId: string, patch: Partial<SecuritySetting>): Promise<SecuritySetting>;
}

export interface NotificationSettingRepository {
  findByOrganizationId(orgId: string): Promise<NotificationSetting | null>;
  findByUserId(userId: string, orgId: string): Promise<NotificationSetting | null>;
  list(orgId: string): Promise<NotificationSetting[]>;
  create(entity: NotificationSetting): Promise<NotificationSetting>;
  update(id: string, patch: Partial<NotificationSetting>): Promise<NotificationSetting>;
  delete(id: string, orgId: string): Promise<void>;
}

export interface IntegrationSettingRepository {
  findById(id: string, orgId: string): Promise<IntegrationSetting | null>;
  list(orgId: string, category?: string): Promise<IntegrationSetting[]>;
  findByProvider(orgId: string, provider: string): Promise<IntegrationSetting | null>;
  create(entity: IntegrationSetting): Promise<IntegrationSetting>;
  update(id: string, patch: Partial<IntegrationSetting>): Promise<IntegrationSetting>;
  delete(id: string, orgId: string): Promise<void>;
  updateSyncStatus(id: string, status: string, errorMessage?: string): Promise<void>;
}

export interface BillingSettingRepository {
  findByOrganizationId(orgId: string): Promise<BillingSetting | null>;
  create(entity: BillingSetting): Promise<BillingSetting>;
  update(orgId: string, patch: Partial<BillingSetting>): Promise<BillingSetting>;
}
