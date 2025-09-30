import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';
import { logger, RequestTimer } from '@ghxstship/application';
import type { Database } from '@/types/database';

export type TypedSupabaseClient = SupabaseClient<Database>;

const MembershipSchema = z.object({
  organization_id: z.string().uuid(),
  role: z.string(),
  status: z.string()
});

const OrganizationSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().optional()
});

const MembershipPermissionsSchema = z.object({
  role: z.string(),
  permissions: z.array(z.string()).optional()
});

export interface AuthenticatedUserContext {
  supabase: TypedSupabaseClient;
  userId: string;
  organizationId: string;
  role: string;
  permissions: string[];
}

export interface ApiHandlerContext extends AuthenticatedUserContext {
  requestId: string;
  timer: RequestTimer;
}

export interface AccessRequirements {
  permission?: string;
  allowedRoles?: string[];
}

const DEFAULT_ALLOWED_ROLES = ['owner', 'admin', 'manager'];

function createSupabaseClient(): TypedSupabaseClient {
  const cookieStore = cookies();

  return createServerClient({
    get: (name: string) => {
      const cookie = cookieStore.get(name);
      return cookie ? { name: cookie.name, value: cookie.value } : undefined;
    },
    set: (name, value, options) => {
      cookieStore.set(name, value, options);
    },
    remove: (name: string) => cookieStore.delete(name)
  }) as TypedSupabaseClient;
}

async function resolveOrganizationId(
  request: NextRequest,
  supabase: TypedSupabaseClient,
  userId: string
): Promise<{ organizationId: string; role: string; permissions: string[] }> {
  const requestedOrgId = request.headers.get('x-organization-id');

  if (requestedOrgId) {
    return validateMembership(supabase, userId, requestedOrgId);
  }

  const { data, error } = await supabase
    .from('memberships')
    .select('organization_id, role, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (error) {
    logger.error('Failed to load membership', { error, userId });
    throw new Error('Failed to resolve organization');
  }

  const membership = data ? MembershipSchema.parse(data) : null;
  if (!membership) {
    throw new Error('No active organization membership');
  }

  const permissions = await loadPermissions(supabase, membership.organization_id, userId, membership.role);

  return {
    organizationId: membership.organization_id,
    role: membership.role,
    permissions
  };
}

async function validateMembership(
  supabase: TypedSupabaseClient,
  userId: string,
  organizationId: string
): Promise<{ organizationId: string; role: string; permissions: string[] }> {
  const { data, error } = await supabase
    .from('memberships')
    .select('organization_id, role, status')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .single();

  if (error) {
    logger.error('Membership validation failed', { error, userId, organizationId });
    throw new Error('Invalid organization membership');
  }

  const membership = MembershipSchema.parse(data);
  const permissions = await loadPermissions(supabase, membership.organization_id, userId, membership.role);

  return {
    organizationId: membership.organization_id,
    role: membership.role,
    permissions
  };
}

async function loadPermissions(
  supabase: TypedSupabaseClient,
  organizationId: string,
  userId: string,
  role: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('organization_memberships')
    .select('role, permissions')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    logger.error('Failed to load permissions', { error, organizationId, userId });
    return [];
  }

  const membership = data ? MembershipPermissionsSchema.parse(data) : null;
  if (membership?.permissions && membership.permissions.length > 0) {
    return membership.permissions;
  }

  const { data: rolePermissions, error: roleError } = await supabase
    .from('role_permissions')
    .select('permission')
    .eq('role', role);

  if (roleError) {
    logger.error('Failed to load role permissions', { error: roleError, role });
    return [];
  }

  return rolePermissions?.map((entry) => entry.permission) ?? [];
}

function ensureAuthorization(requirements: AccessRequirements, role: string, permissions: string[]): void {
  if (requirements.allowedRoles) {
    const allowedRoles = requirements.allowedRoles.length > 0 ? requirements.allowedRoles : DEFAULT_ALLOWED_ROLES;
    if (!allowedRoles.includes(role)) {
      throw new Error('Insufficient role permissions');
    }
  }

  if (requirements.permission && !permissions.includes(requirements.permission)) {
    throw new Error('Missing required permission');
  }
}

export async function createApiContext(
  request: NextRequest,
  requirements: AccessRequirements = {}
): Promise<ApiHandlerContext> {
  const supabase = createSupabaseClient();
  const requestId = logger.logRequest(request);
  const timer = new RequestTimer(requestId);

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { organizationId, role, permissions } = await resolveOrganizationId(request, supabase, user.id);
  ensureAuthorization(requirements, role, permissions);

  return {
    supabase,
    userId: user.id,
    organizationId,
    role,
    permissions,
    requestId,
    timer
  };
}

export function handleApiError(requestId: string, error: unknown, statusOverride?: number) {
  const status = statusOverride || 500;
  const message = error instanceof Error ? error.message : 'Unexpected error';
  logger.error('API handler error', { requestId, error, status });

  return {
    status,
    body: {
      error: message
    }
  } as const;
}

export async function closeApiContext(
  context: ApiHandlerContext,
  statusCode: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  context.timer.end(statusCode, {
    requestId: context.requestId,
    userId: context.userId,
    organizationId: context.organizationId,
    metadata
  });
}

export async function assertOrganizationExists(
  supabase: TypedSupabaseClient,
  organizationId: string
): Promise<void> {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, slug')
    .eq('id', organizationId)
    .maybeSingle();

  if (error) {
    logger.error('Organization lookup failed', { error, organizationId });
    throw new Error('Failed to resolve organization');
  }

  if (!data) {
    throw new Error('Organization not found');
  }

  OrganizationSchema.parse(data);
}
