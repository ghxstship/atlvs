import { z } from 'zod';

const JsonResponseSchema = z.object({
  error: z.string().optional()
}).passthrough();

export class SettingsAccountError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'SettingsAccountError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    const payload = text ? JsonResponseSchema.parse(JSON.parse(text)) : {};
    throw new SettingsAccountError(payload.error ?? 'Request failed', response.status);
  }
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  const payload = JsonResponseSchema.parse(JSON.parse(text));
  return payload as T;
}

export interface SessionLocation {
  country?: string | null;
  city?: string | null;
  region?: string | null;
}

export interface UserSessionSummary {
  id: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: {
    device?: string | null;
    [key: string]: unknown;
  } | null;
  location?: SessionLocation | null;
  isActive: boolean;
  isCurrent: boolean;
  lastActivityAt: string;
  expiresAt: string;
  createdAt: string;
}

export interface ApiKeySummary {
  id: string;
  name: string;
  description?: string;
  scopes: string[];
  lastUsedAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  keyPrefix: string;
}

export interface CreateApiKeyInput {
  name: string;
  description?: string;
  scopes: string[];
  expiresAt?: string | null;
}

export interface CreateApiKeyResult {
  apiKey: {
    id: string;
    name: string;
    description?: string;
    scopes: string[];
    expiresAt?: string;
    key: string;
  };
  message: string;
}

export interface SetupTwoFactorResult {
  qrCode: string;
  otpauth: string;
}

export interface VerifyTwoFactorResult {
  success: boolean;
  backupCodes: string[];
}

async function jsonFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    credentials: 'include'
  });
}

export async function fetchSessions(): Promise<UserSessionSummary[]> {
  const response = await jsonFetch('/api/v1/settings/sessions');
  const payload = await handleResponse<{ sessions: UserSessionSummary[] }>(response);
  return payload.sessions ?? [];
}

export async function revokeSession(sessionId: string): Promise<void> {
  const response = await jsonFetch(`/api/v1/settings/sessions?id=${encodeURIComponent(sessionId)}`, {
    method: 'DELETE'
  });
  await handleResponse(response);
}

export async function revokeAllSessions(): Promise<number> {
  const response = await jsonFetch('/api/v1/settings/sessions?action=revoke-all', {
    method: 'DELETE'
  });
  const payload = await handleResponse<{ count: number }>(response);
  return payload.count ?? 0;
}

export async function fetchApiKeys(): Promise<ApiKeySummary[]> {
  const response = await jsonFetch('/api/v1/settings/api-keys');
  const payload = await handleResponse<{ apiKeys: ApiKeySummary[] }>(response);
  return payload.apiKeys ?? [];
}

export async function createApiKey(input: CreateApiKeyInput): Promise<CreateApiKeyResult> {
  const response = await jsonFetch('/api/v1/settings/api-keys', {
    method: 'POST',
    body: JSON.stringify(input)
  });
  return handleResponse<CreateApiKeyResult>(response);
}

export async function revokeApiKey(apiKeyId: string): Promise<void> {
  const response = await jsonFetch(`/api/v1/settings/api-keys?id=${encodeURIComponent(apiKeyId)}`, {
    method: 'DELETE'
  });
  await handleResponse(response);
}

export async function setupTwoFactor(): Promise<SetupTwoFactorResult> {
  const response = await jsonFetch('/api/v1/settings/security/2fa/setup', {
    method: 'POST'
  });
  return handleResponse<SetupTwoFactorResult>(response);
}

export async function verifyTwoFactor(code: string): Promise<VerifyTwoFactorResult> {
  const response = await jsonFetch('/api/v1/settings/security/2fa/verify', {
    method: 'POST',
    body: JSON.stringify({ code })
  });
  return handleResponse<VerifyTwoFactorResult>(response);
}
