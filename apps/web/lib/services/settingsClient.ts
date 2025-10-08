import { z } from 'zod';

const BaseResponseSchema = z
  .object({
    error: z.string().optional()
  })
  .passthrough();

export class SettingsError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'SettingsError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload = text ? BaseResponseSchema.parse(JSON.parse(text)) : {};
  if (!response.ok) {
    throw new SettingsError(payload.error ?? 'Request failed', response.status);
  }
  return payload as T;
}

async function jsonFetch(url: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    credentials: 'include'
  });
}

// General Settings Schemas
export const GeneralSettingsSchema = z.object({
  organizationName: z.string().optional(),
  timeZone: z.string().optional(),
  dateFormat: z.string().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
  fiscalYearStart: z.string().optional()
});

export type GeneralSettings = z.infer<typeof GeneralSettingsSchema>;

// Branding Settings
export const BrandingSettingsSchema = z.object({
  logo: z.string().nullable().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  customCss: z.string().nullable().optional()
});

export type BrandingSettings = z.infer<typeof BrandingSettingsSchema>;

// Features Settings
export const FeaturesSettingsSchema = z.object({
  enableProjects: z.boolean().optional(),
  enableJobs: z.boolean().optional(),
  enableMarketplace: z.boolean().optional(),
  enableFinance: z.boolean().optional(),
  enableReporting: z.boolean().optional(),
  enableIntegrations: z.boolean().optional()
});

export type FeaturesSettings = z.infer<typeof FeaturesSettingsSchema>;

// Permissions Settings
export const PasswordPolicySchema = z.object({
  minLength: z.number().min(6).max(128).optional(),
  requireUppercase: z.boolean().optional(),
  requireLowercase: z.boolean().optional(),
  requireNumbers: z.boolean().optional(),
  requireSymbols: z.boolean().optional(),
  maxAge: z.number().optional()
});

export const PermissionsSettingsSchema = z.object({
  defaultUserRole: z.enum(['member', 'manager', 'admin']).optional(),
  allowSelfRegistration: z.boolean().optional(),
  requireEmailVerification: z.boolean().optional(),
  passwordPolicy: PasswordPolicySchema.optional()
});

export type PermissionsSettings = z.infer<typeof PermissionsSettingsSchema>;

// Notifications Settings
export const NotificationsSettingsSchema = z.object({
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  defaultChannels: z.array(z.enum(['email', 'sms', 'push', 'in_app'])).optional(),
  digestFrequency: z.enum(['none', 'daily', 'weekly', 'monthly']).optional()
});

export type NotificationsSettings = z.infer<typeof NotificationsSettingsSchema>;

// Integrations Settings
export const IntegrationsSettingsSchema = z.object({
  webhooksEnabled: z.boolean().optional(),
  apiRateLimit: z.number().positive().optional(),
  allowedDomains: z.array(z.string()).optional(),
  ssoEnabled: z.boolean().optional(),
  ssoProvider: z.string().nullable().optional()
});

export type IntegrationsSettings = z.infer<typeof IntegrationsSettingsSchema>;

// Compliance Settings
export const ComplianceSettingsSchema = z.object({
  dataRetentionDays: z.number().positive().optional(),
  auditLogRetentionDays: z.number().positive().optional(),
  requireDataProcessingConsent: z.boolean().optional(),
  enableGDPRCompliance: z.boolean().optional(),
  enableSOXCompliance: z.boolean().optional()
});

export type ComplianceSettings = z.infer<typeof ComplianceSettingsSchema>;

// Backup Settings
export const BackupSettingsSchema = z.object({
  autoBackupEnabled: z.boolean().optional(),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  retentionPeriod: z.number().positive().optional(),
  includeFiles: z.boolean().optional()
});

export type BackupSettings = z.infer<typeof BackupSettingsSchema>;

// Complete Settings
export const SettingsSchema = z.object({
  general: GeneralSettingsSchema.optional(),
  branding: BrandingSettingsSchema.optional(),
  features: FeaturesSettingsSchema.optional(),
  permissions: PermissionsSettingsSchema.optional(),
  notifications: NotificationsSettingsSchema.optional(),
  integrations: IntegrationsSettingsSchema.optional(),
  compliance: ComplianceSettingsSchema.optional(),
  backup: BackupSettingsSchema.optional()
});

export type Settings = z.infer<typeof SettingsSchema>;

export const SettingsResponseSchema = z.object({
  settings: SettingsSchema,
  lastUpdated: z.string().nullable().optional()
});

export type SettingsResponse = z.infer<typeof SettingsResponseSchema>;

export const UpdateSettingsInputSchema = z.object({
  general: GeneralSettingsSchema.optional(),
  branding: BrandingSettingsSchema.optional(),
  features: FeaturesSettingsSchema.optional(),
  permissions: PermissionsSettingsSchema.optional(),
  notifications: NotificationsSettingsSchema.optional(),
  integrations: IntegrationsSettingsSchema.optional(),
  compliance: ComplianceSettingsSchema.optional(),
  backup: BackupSettingsSchema.optional()
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsInputSchema>;

// API Functions
export async function fetchSettings(category?: string): Promise<SettingsResponse> {
  const url = category 
    ? `/api/v1/settings?category=${encodeURIComponent(category)}`
    : '/api/v1/settings';
  const response = await jsonFetch(url);
  return handleResponse<SettingsResponse>(response);
}

export async function updateSettings(input: UpdateSettingsInput): Promise<SettingsResponse> {
  const payload = UpdateSettingsInputSchema.parse(input);
  const response = await jsonFetch('/api/v1/settings', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  return handleResponse<SettingsResponse>(response);
}

export async function resetSettings(category?: string, confirm = true): Promise<{ success: boolean; message: string }> {
  const response = await jsonFetch('/api/v1/settings', {
    method: 'DELETE',
    body: JSON.stringify({ category, confirm })
  });
  return handleResponse(response);
}

// Helper function to get a specific category
export async function fetchSettingsCategory<K extends keyof Settings>(
  category: K
): Promise<Settings[K] | undefined> {
  const response = await fetchSettings(category);
  return response.settings[category];
}
