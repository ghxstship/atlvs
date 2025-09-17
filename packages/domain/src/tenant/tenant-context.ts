import type { Role } from '../security/RBAC';

export type TenantContext = {
  organizationId: string;
  projectId?: string;
  userId: string;
  roles: Role[];
  locale?: string;
  currency?: string;
  timezone?: string;
};

export function requireOrg(ctx: TenantContext): string {
  if (!ctx.organizationId) throw new Error('organizationId is required');
  return ctx.organizationId;
}

export function requireProject(ctx: TenantContext): string {
  if (!ctx.projectId) throw new Error('projectId is required');
  return ctx.projectId;
}

export function requireUser(ctx: TenantContext): string {
  if (!ctx.userId) throw new Error('userId is required');
  return ctx.userId;
}
