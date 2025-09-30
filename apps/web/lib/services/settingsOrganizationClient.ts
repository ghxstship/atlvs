import { z } from 'zod';

const BaseResponseSchema = z
  .object({
    error: z.string().optional(),
  })
  .passthrough();

export class SettingsOrganizationError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'SettingsOrganizationError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload = text ? BaseResponseSchema.parse(JSON.parse(text)) : {};
  if (!response.ok) {
    throw new SettingsOrganizationError(payload.error ?? 'Request failed', response.status);
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

const OrganizationSchema = z
  .object({
    id: z.string(),
    name: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    industry: z.string().nullable().optional(),
    size: z.string().nullable().optional(),
    address: z
      .object({
        street: z.string().nullable().optional(),
        city: z.string().nullable().optional(),
        state: z.string().nullable().optional(),
        zipCode: z.string().nullable().optional(),
        country: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    contact: z
      .object({
        phone: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
        supportEmail: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    branding: z
      .object({
        logo: z.string().nullable().optional(),
        primaryColor: z.string().nullable().optional(),
        secondaryColor: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    timezone: z.string().nullable().optional(),
    locale: z.string().nullable().optional(),
    currency: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
  })
  .passthrough();

export type OrganizationRecord = z.infer<typeof OrganizationSchema>;

const OrganizationStatsSchema = z.object({
  totalMembers: z.number(),
  totalProjects: z.number(),
  totalJobs: z.number(),
});

export type OrganizationStats = z.infer<typeof OrganizationStatsSchema>;

const OrganizationSettingsResponseSchema = z.object({
  organization: OrganizationSchema,
  stats: OrganizationStatsSchema,
});

export type OrganizationSettingsResponse = z.infer<typeof OrganizationSettingsResponseSchema>;

const OrganizationMemberSchema = z.object({
  membershipId: z.string(),
  userId: z.string(),
  role: z.string(),
  status: z.string(),
  joinedAt: z.string().nullable().optional(),
  fullName: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
});

export type OrganizationMember = z.infer<typeof OrganizationMemberSchema>;

const OrganizationMembersResponseSchema = z.object({
  members: z.array(OrganizationMemberSchema),
});

export type OrganizationMembersResponse = z.infer<typeof OrganizationMembersResponseSchema>;

const UpdateOrganizationInputSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional(),
  address: z
    .object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      country: z.string(),
    })
    .optional(),
  contact: z
    .object({
      phone: z.string().optional(),
      email: z.string().email().optional(),
      supportEmail: z.string().email().optional(),
    })
    .optional(),
  branding: z
    .object({
      logo: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
    })
    .optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  currency: z.string().optional(),
});

export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationInputSchema>;

export async function fetchOrganizationSettings(): Promise<OrganizationSettingsResponse> {
  const response = await jsonFetch('/api/v1/settings/organization');
  const payload = await handleResponse<unknown>(response);
  return OrganizationSettingsResponseSchema.parse(payload);
}

export async function updateOrganizationSettings(input: UpdateOrganizationInput): Promise<{ organization: OrganizationRecord }> {
  const payload = UpdateOrganizationInputSchema.parse(input);
  const response = await jsonFetch('/api/v1/settings/organization', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<unknown>(response);
  return z.object({ organization: OrganizationSchema }).parse(data);
}

export async function transferOrganizationOwnership(userId: string): Promise<{ success: true; message: string }> {
  const response = await jsonFetch('/api/v1/settings/organization', {
    method: 'DELETE',
    body: JSON.stringify({ confirm: true, transferTo: userId }),
  });
  return handleResponse(response);
}

export async function deactivateOrganization(): Promise<{ success: true; message: string }> {
  const response = await jsonFetch('/api/v1/settings/organization', {
    method: 'DELETE',
    body: JSON.stringify({ confirm: true }),
  });
  return handleResponse(response);
}

export async function fetchOrganizationMembers(): Promise<OrganizationMembersResponse> {
  const response = await jsonFetch('/api/v1/settings/organization/members');
  const data = await handleResponse<unknown>(response);
  return OrganizationMembersResponseSchema.parse(data);
}
