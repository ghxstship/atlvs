import { z } from 'zod';

const BaseResponseSchema = z
  .object({
    error: z.string().optional(),
  })
  .passthrough();

export class SettingsSecurityError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'SettingsSecurityError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload = text ? BaseResponseSchema.parse(JSON.parse(text)) : {};
  if (!response.ok) {
    throw new SettingsSecurityError(payload.error ?? 'Request failed', response.status);
  }

  return payload as T;
}

async function jsonFetch(url: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
  });
}

export const SecuritySettingsSchema = z.object({
  passwordPolicy: z
    .object({
      minLength: z.number().min(8).max(128),
      requireUppercase: z.boolean(),
      requireLowercase: z.boolean(),
      requireNumbers: z.boolean(),
      requireSpecialChars: z.boolean(),
      maxAge: z.number().min(0).max(365).optional(),
      preventReuse: z.number().min(0).max(24).optional(),
    })
    .optional(),
  sessionSettings: z
    .object({
      maxSessionDuration: z.number().min(300).max(86400),
      idleTimeout: z.number().min(300).max(7200),
      requireReauth: z.boolean(),
      maxConcurrentSessions: z.number().min(1).max(10),
    })
    .optional(),
  mfaSettings: z
    .object({
      required: z.boolean(),
      allowedMethods: z.array(z.enum(['totp', 'sms', 'email'])).min(1),
      gracePeriod: z.number().min(0).max(30),
    })
    .optional(),
  accessControl: z
    .object({
      ipWhitelist: z.array(z.string()).optional(),
      allowedDomains: z.array(z.string()).optional(),
      blockSuspiciousActivity: z.boolean(),
      maxFailedAttempts: z.number().min(3).max(10),
      lockoutDuration: z.number().min(300).max(86400),
    })
    .optional(),
  auditSettings: z
    .object({
      logAllActions: z.boolean(),
      retentionPeriod: z.number().min(30).max(2555),
      alertOnSensitiveActions: z.boolean(),
      exportEnabled: z.boolean(),
    })
    .optional(),
});

export type SecuritySettings = z.infer<typeof SecuritySettingsSchema>;

const SecurityMetricsSchema = z.object({
  failedLoginsLast24h: z.number(),
  activeSessions: z.number(),
  auditLogsLast7Days: z.number(),
});

export type SecurityMetrics = z.infer<typeof SecurityMetricsSchema>;

const SessionRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: z.string(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  lastSeenAt: z.string().nullable().optional(),
});

export type SecuritySessionRecord = z.infer<typeof SessionRecordSchema>;

const DeviceRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  deviceName: z.string().nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  lastSeenAt: z.string().nullable().optional(),
  trustLevel: z.string().nullable().optional(),
});

export type SecurityDeviceRecord = z.infer<typeof DeviceRecordSchema>;

const SecurityEventSchema = z.object({
  id: z.string(),
  action: z.string(),
  occurredAt: z.string(),
  details: z.unknown().nullable().optional(),
});

export type SecurityEventRecord = z.infer<typeof SecurityEventSchema>;

const SecuritySettingsResponseSchema = z.object({
  securitySettings: SecuritySettingsSchema,
  securityMetrics: SecurityMetricsSchema,
  sessions: z.array(SessionRecordSchema),
  devices: z.array(DeviceRecordSchema),
  mfaCoverage: z.record(z.array(z.string())),
  recentSecurityEvents: z.array(SecurityEventSchema),
});

export type SecuritySettingsResponse = z.infer<typeof SecuritySettingsResponseSchema>;

const SecurityTestResponseSchema = z.object({
  passwordPolicyCompliance: z.boolean(),
  sessionSecurityScore: z.number(),
  mfaCoverage: z.number(),
  accessControlEffectiveness: z.number(),
  auditingCompleteness: z.number(),
  overallScore: z.number(),
  recommendations: z.array(z.string()),
});

export type SecurityTestResponse = z.infer<typeof SecurityTestResponseSchema>;

const BackupCodesResponseSchema = z.object({
  backupCodes: z.array(z.string()),
});

export type BackupCodesResponse = z.infer<typeof BackupCodesResponseSchema>;

export async function fetchSecuritySettings(): Promise<SecuritySettingsResponse> {
  const response = await jsonFetch('/api/v1/settings/security');
  const data = await handleResponse<unknown>(response);
  return SecuritySettingsResponseSchema.parse(data);
}

export async function updateSecuritySettings(input: SecuritySettings): Promise<SecuritySettings> {
  const payload = SecuritySettingsSchema.parse(input);
  const response = await jsonFetch('/api/v1/settings/security', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<unknown>(response);
  interface ResponseData {
    securitySettings?: unknown;
  }
  return SecuritySettingsSchema.parse((data as ResponseData).securitySettings ?? payload);
}

export async function runSecurityTest(): Promise<SecurityTestResponse> {
  const response = await jsonFetch('/api/v1/settings/security', {
    method: 'POST',
    body: JSON.stringify({ action: 'test_security' }),
  });
  const data = await handleResponse<unknown>(response);
  return SecurityTestResponseSchema.parse(data);
}

export async function generateSecurityBackupCodes(): Promise<string[]> {
  const response = await jsonFetch('/api/v1/settings/security', {
    method: 'POST',
    body: JSON.stringify({ action: 'generate_backup_codes' }),
  });
  const data = await handleResponse<unknown>(response);
  return BackupCodesResponseSchema.parse(data).backupCodes;
}

export async function resetSecuritySettings(resetType: 'all' | 'sessions'): Promise<void> {
  await jsonFetch('/api/v1/settings/security', {
    method: 'DELETE',
    body: JSON.stringify({ confirm: true, resetType }),
  });
}
