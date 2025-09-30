import { z } from 'zod';

const JsonResponseSchema = z.object({
  error: z.string().optional(),
}).passthrough();

export class SettingsBillingError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'SettingsBillingError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    const payload = text ? JsonResponseSchema.parse(JSON.parse(text)) : {};
    throw new SettingsBillingError(payload.error ?? 'Request failed', response.status);
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  const payload = JsonResponseSchema.parse(JSON.parse(text));
  return payload as T;
}

async function jsonFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
  });
}

export interface BillingSettings {
  id: string;
  planId?: string | null;
  planName?: string | null;
  billingCycle?: string | null;
  status?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean | null;
  trialEnd?: string | null;
  seats?: number | null;
  usedSeats?: number | null;
  billingEmail?: string | null;
  taxId?: string | null;
  billingAddress?: Record<string, unknown> | null;
  paymentMethod?: Record<string, unknown> | null;
  invoiceSettings?: Record<string, unknown> | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface SubscriptionSummary {
  id: string;
  status: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean | null;
  interval: string | null;
  amount: number | null;
  currency: string | null;
  product: string | null;
  priceId: string | null;
}

export interface SeatUsageSummary {
  configuredSeats: number | null;
  usedSeats: number;
}

export interface BillingSettingsResponse {
  billingSettings: BillingSettings | null;
  subscription: SubscriptionSummary | null;
  seatUsage: SeatUsageSummary;
  stripe: {
    configured: boolean;
    customerId: string | null;
  };
  organization: {
    id: string;
    name: string | null;
    stripeCustomerId: string | null;
  } | null;
}

export interface UpdateBillingSettingsInput {
  billingEmail?: string;
  billingAddress?: Record<string, unknown>;
  paymentMethod?: Record<string, unknown>;
  invoiceSettings?: Record<string, unknown>;
}

const UPDATE_INPUT_SCHEMA = z.object({
  billingEmail: z.string().email().optional(),
  billingAddress: z.record(z.unknown()).optional(),
  paymentMethod: z.record(z.unknown()).optional(),
  invoiceSettings: z.record(z.unknown()).optional(),
});

export async function fetchBillingSettings(): Promise<BillingSettingsResponse> {
  const response = await jsonFetch('/api/v1/settings/billing');
  return handleResponse<BillingSettingsResponse>(response);
}

export async function updateBillingSettings(input: UpdateBillingSettingsInput): Promise<BillingSettingsResponse> {
  const payload = UPDATE_INPUT_SCHEMA.parse(input);
  const response = await jsonFetch('/api/v1/settings/billing', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return handleResponse<BillingSettingsResponse>(response);
}
