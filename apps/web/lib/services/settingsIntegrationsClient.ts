import { z } from 'zod';

const BaseResponseSchema = z
  .object({
    error: z.string().optional()
  })
  .passthrough();

export class SettingsIntegrationsError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'SettingsIntegrationsError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload = text ? BaseResponseSchema.parse(JSON.parse(text)) : {};
  if (!response.ok) {
    throw new SettingsIntegrationsError(payload.error ?? 'Request failed', response.status);
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

export const IntegrationTypeSchema = z.enum([
  'webhook',
  'api',
  'sso',
  'email',
  'sms',
  'accounting',
  'crm',
  'project_management',
]);

export type IntegrationType = z.infer<typeof IntegrationTypeSchema>;

export const IntegrationSettingsSchema = z
  .object({
    syncFrequency: z.enum(['realtime', 'hourly', 'daily', 'weekly']).optional(),
    retryAttempts: z.number().min(0).max(10).optional(),
    timeout: z.number().positive().optional(),
    rateLimitPerHour: z.number().positive().optional()
  })
  .partial();

export type IntegrationSettings = z.infer<typeof IntegrationSettingsSchema>;

export const IntegrationRecordSchema = z.object({
  id: z.string(),
  organization_id: z.string().optional(),
  name: z.string(),
  type: IntegrationTypeSchema,
  enabled: z.boolean(),
  status: z.string().optional(),
  config: z.record(z.unknown()).optional(),
  credentials: z.record(z.unknown()).optional(),
  settings: IntegrationSettingsSchema.optional(),
  last_sync: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export type IntegrationRecord = z.infer<typeof IntegrationRecordSchema>;

export const AvailableIntegrationSchema = z.object({
  type: IntegrationTypeSchema,
  name: z.string(),
  description: z.string()
});

export type AvailableIntegration = z.infer<typeof AvailableIntegrationSchema>;

export const IntegrationsResponseSchema = z.object({
  integrations: z.array(IntegrationRecordSchema),
  availableIntegrations: z.array(AvailableIntegrationSchema)
});

export type IntegrationsResponse = z.infer<typeof IntegrationsResponseSchema>;

export const CreateIntegrationInputSchema = z.object({
  name: z.string().min(1),
  type: IntegrationTypeSchema,
  enabled: z.boolean().optional().default(true),
  config: z.record(z.unknown()).default({}),
  credentials: z.record(z.unknown()).optional(),
  settings: IntegrationSettingsSchema.optional()
});

export type CreateIntegrationInput = z.infer<typeof CreateIntegrationInputSchema>;

export const UpdateIntegrationInputSchema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    enabled: z.boolean().optional(),
    config: z.record(z.unknown()).optional(),
    credentials: z.record(z.unknown()).optional(),
    settings: IntegrationSettingsSchema.optional(),
    status: z.string().optional()
  })
  .refine((value) => {
    const keysToCheck = Object.keys(value).filter(key => key !== 'id');
    return keysToCheck.length > 0;
  }, { message: 'No updates provided', path: ['config'] });

export type UpdateIntegrationInput = z.infer<typeof UpdateIntegrationInputSchema>;

export const TestIntegrationInputSchema = z.object({
  integrationId: z.string()
});

export type TestIntegrationInput = z.infer<typeof TestIntegrationInputSchema>;

export interface IntegrationCreateResponse {
  integration: IntegrationRecord;
}

export interface IntegrationUpdateResponse {
  integration: IntegrationRecord;
}

export interface IntegrationTestResponse {
  success: boolean;
  message: string;
}

export interface IntegrationDeleteResponse {
  success: boolean;
}

export async function fetchIntegrations(): Promise<IntegrationsResponse> {
  const response = await jsonFetch('/api/v1/settings/integrations');
  return handleResponse<IntegrationsResponse>(response);
}

export async function createIntegration(input: CreateIntegrationInput): Promise<IntegrationCreateResponse> {
  const payload = CreateIntegrationInputSchema.parse(input);
  const response = await jsonFetch('/api/v1/settings/integrations', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return handleResponse<IntegrationCreateResponse>(response);
}

export async function updateIntegration(input: UpdateIntegrationInput): Promise<IntegrationUpdateResponse> {
  const payload = UpdateIntegrationInputSchema.parse(input);
  const response = await jsonFetch('/api/v1/settings/integrations', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  return handleResponse<IntegrationUpdateResponse>(response);
}

export async function deleteIntegration(id: string): Promise<IntegrationDeleteResponse> {
  const response = await jsonFetch('/api/v1/settings/integrations', {
    method: 'DELETE',
    body: JSON.stringify({ id })
  });
  return handleResponse<IntegrationDeleteResponse>(response);
}

export async function testIntegration(input: TestIntegrationInput): Promise<IntegrationTestResponse> {
  const payload = TestIntegrationInputSchema.parse(input);
  const response = await jsonFetch('/api/v1/settings/integrations', {
    method: 'POST',
    body: JSON.stringify({ action: 'test_integration', ...payload })
  });
  return handleResponse<IntegrationTestResponse>(response);
}
