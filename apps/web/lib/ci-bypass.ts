import type { NextRequest } from 'next/server';
import type { TenantContext } from '@ghxstship/domain';

export function getCiBypassContext(req: NextRequest): TenantContext | null {
  const token = process.env.CI_BYPASS_TOKEN;
  const hdr = req.headers.get('x-ci-bypass');
  if (token && hdr && hdr === token) {
    const organizationId = req.headers.get('x-org-id') || 'ci-org';
    return {
      organizationId,
      projectId: undefined,
      userId: 'ci',
      roles: ['admin'] as any
    };
  }
  return null;
}
