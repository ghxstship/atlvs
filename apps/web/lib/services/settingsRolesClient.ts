import { z } from 'zod';

const BaseResponseSchema = z
  .object({
    error: z.string().optional(),
  })
  .passthrough();

export class SettingsRolesError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'SettingsRolesError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload = text ? BaseResponseSchema.parse(JSON.parse(text)) : {};
  if (!response.ok) {
    throw new SettingsRolesError(payload.error ?? 'Request failed', response.status);
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

const RolePermissionsSchema = z.record(z.array(z.string()));

export const RoleRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  permissions: RolePermissionsSchema,
  isSystem: z.boolean(),
  assignedUsers: z.number().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export type RoleRecord = z.infer<typeof RoleRecordSchema>;

const RolesResponseSchema = z.object({
  roles: z.array(RoleRecordSchema),
});

export type RolesResponse = z.infer<typeof RolesResponseSchema>;

const CreateRoleInputSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  permissions: RolePermissionsSchema,
});

export type CreateRoleInput = z.infer<typeof CreateRoleInputSchema>;

const UpdateRoleInputSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
  permissions: RolePermissionsSchema.optional(),
});

export type UpdateRoleInput = z.infer<typeof UpdateRoleInputSchema>;

export async function fetchRoles(options: { includeSystem?: boolean } = {}): Promise<RolesResponse> {
  const searchParams = new URLSearchParams();
  if (options.includeSystem) {
    searchParams.set('includeSystem', 'true');
  }
  const url = `/api/v1/settings/roles${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await jsonFetch(url);
  const data = await handleResponse<unknown>(response);
  return RolesResponseSchema.parse(data);
}

export async function createRole(input: CreateRoleInput): Promise<{ role: RoleRecord }> {
  const payload = CreateRoleInputSchema.parse(input);
  const response = await jsonFetch('/api/v1/settings/roles', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<unknown>(response);
  return z.object({ role: RoleRecordSchema }).parse(data);
}

export async function updateRole(input: UpdateRoleInput): Promise<{ role: RoleRecord }> {
  const payload = UpdateRoleInputSchema.parse(input);
  const searchParams = new URLSearchParams({ id: payload.id });
  const { id, ...rest } = payload;
  void id; // Mark as intentionally unused
  const response = await jsonFetch(`/api/v1/settings/roles?${searchParams.toString()}`, {
    method: 'PUT',
    body: JSON.stringify(rest),
  });
  const data = await handleResponse<unknown>(response);
  return z.object({ role: RoleRecordSchema }).parse(data);
}

export async function deleteRole(roleId: string): Promise<{ success: true; message: string }> {
  const searchParams = new URLSearchParams({ id: roleId });
  const response = await jsonFetch(`/api/v1/settings/roles?${searchParams.toString()}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}
