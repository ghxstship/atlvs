import { z } from 'zod';

const BaseResponseSchema = z
  .object({
    error: z.string().optional()
  })
  .passthrough();

export class SettingsTeamsError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'SettingsTeamsError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload = text ? BaseResponseSchema.parse(JSON.parse(text)) : {};
  if (!response.ok) {
    throw new SettingsTeamsError(payload.error ?? 'Request failed', response.status);
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

const InviteRecordSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.string(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional()
});

export type InviteRecord = z.infer<typeof InviteRecordSchema>;

const SeatUsageSchema = z.object({
  seatPolicy: z.string(),
  seatsLimit: z.number().nullable(),
  activeCount: z.number(),
  remainingSeats: z.number().nullable()
});

export type SeatUsage = z.infer<typeof SeatUsageSchema>;

const DomainRecordSchema = z.object({
  id: z.string(),
  domain: z.string(),
  status: z.string(),
  created_at: z.string().nullable().optional()
});

export type DomainRecord = z.infer<typeof DomainRecordSchema>;

const TeamsSettingsResponseSchema = z.object({
  invites: z.array(InviteRecordSchema),
  seatUsage: SeatUsageSchema,
  domains: z.array(DomainRecordSchema),
  activeDomains: z.array(z.string()),
  canManage: z.boolean()
});

export type TeamsSettingsResponse = z.infer<typeof TeamsSettingsResponseSchema>;

const InviteInputSchema = z.object({
  email: z.string().email(),
  role: z.enum(['viewer', 'contributor', 'manager', 'admin'])
});

export type InviteInput = z.infer<typeof InviteInputSchema>;

const BulkInviteInputSchema = z.object({
  emails: z.array(z.string().email()),
  role: z.enum(['viewer', 'contributor', 'manager', 'admin'])
});

export type BulkInviteInput = z.infer<typeof BulkInviteInputSchema>;

const BulkInviteResultSchema = z.object({
  success: z.boolean(),
  results: z.object({
    successes: z.number(),
    failures: z.number()
  })
});

export type BulkInviteResult = z.infer<typeof BulkInviteResultSchema>;

export async function fetchTeamsSettings(): Promise<TeamsSettingsResponse> {
  const response = await jsonFetch('/api/v1/settings/teams');
  const data = await handleResponse<unknown>(response);
  return TeamsSettingsResponseSchema.parse(data);
}

export async function inviteMember(input: InviteInput): Promise<void> {
  const payload = InviteInputSchema.parse(input);
  await jsonFetch('/api/v1/settings/teams', {
    method: 'POST',
    body: JSON.stringify({ action: 'invite', ...payload })
  });
}

export async function addExistingMember(input: InviteInput): Promise<void> {
  const payload = InviteInputSchema.parse(input);
  await jsonFetch('/api/v1/settings/teams', {
    method: 'POST',
    body: JSON.stringify({ action: 'addExisting', ...payload })
  });
}

export async function bulkInviteMembers(input: BulkInviteInput): Promise<BulkInviteResult> {
  const payload = BulkInviteInputSchema.parse(input);
  const response = await jsonFetch('/api/v1/settings/teams', {
    method: 'POST',
    body: JSON.stringify({ action: 'bulkInvite', ...payload })
  });
  const data = await handleResponse<unknown>(response);
  return BulkInviteResultSchema.parse(data);
}

export async function resendInvite(inviteId: string): Promise<void> {
  await jsonFetch('/api/v1/settings/teams', {
    method: 'POST',
    body: JSON.stringify({ action: 'resend', inviteId })
  });
}

export async function revokeInvite(inviteId: string): Promise<void> {
  await jsonFetch('/api/v1/settings/teams', {
    method: 'DELETE',
    body: JSON.stringify({ inviteId })
  });
}
