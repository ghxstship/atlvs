import { z } from 'zod';

const JsonResponseSchema = z.object({
  error: z.string().optional()
}).passthrough();

export class SettingsAutomationsError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'SettingsAutomationsError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    const payload = text ? JsonResponseSchema.parse(JSON.parse(text)) : {};
    throw new SettingsAutomationsError(payload.error ?? 'Request failed', response.status);
  }
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  const payload = JsonResponseSchema.parse(JSON.parse(text));
  return payload as T;
}

async function jsonFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
  });
}

export type AutomationLogic = 'AND' | 'OR';

export interface AutomationCondition {
  field: string;
  operator: string;
  value: unknown;
  logic?: AutomationLogic;
}

export interface AutomationAction {
  type: string;
  config: Record<string, unknown>;
  order: number;
}

export interface AutomationRuleSummary {
  id: string;
  name: string;
  description?: string | null;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  runCount?: number;
  lastRunAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AutomationRuleFilters {
  isActive?: boolean;
  triggerType?: string;
}

export interface CreateAutomationRuleInput {
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
  conditions?: AutomationCondition[];
  actions: AutomationAction[];
  isActive?: boolean;
}

export type UpdateAutomationRuleInput = Partial<Omit<CreateAutomationRuleInput, 'triggerType'> & {
  triggerType?: string;
}>;

export async function fetchAutomationRules(filters: AutomationRuleFilters = {}): Promise<AutomationRuleSummary[]> {
  const query = new URLSearchParams();
  if (filters.isActive !== undefined) {
    query.set('active', String(filters.isActive));
  }
  if (filters.triggerType) {
    query.set('triggerType', filters.triggerType);
  }

  const response = await jsonFetch(`/api/v1/settings/automations${query.toString() ? `?${query.toString()}` : ''}`);
  const payload = await handleResponse<{ automationRules: AutomationRuleSummary[] }>(response);
  return payload.automationRules ?? [];
}

export async function createAutomationRule(input: CreateAutomationRuleInput): Promise<AutomationRuleSummary> {
  const response = await jsonFetch('/api/v1/settings/automations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  const payload = await handleResponse<{ automationRule: AutomationRuleSummary }>(response);
  if (!payload.automationRule) {
    throw new SettingsAutomationsError('Invalid response when creating automation rule');
  }
  return payload.automationRule;
}

export async function updateAutomationRule(id: string, input: UpdateAutomationRuleInput): Promise<AutomationRuleSummary> {
  const response = await jsonFetch(`/api/v1/settings/automations?id=${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  const payload = await handleResponse<{ automationRule: AutomationRuleSummary }>(response);
  if (!payload.automationRule) {
    throw new SettingsAutomationsError('Invalid response when updating automation rule');
  }
  return payload.automationRule;
}

export async function deleteAutomationRule(id: string): Promise<void> {
  const response = await jsonFetch(`/api/v1/settings/automations?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  await handleResponse(response);
}
