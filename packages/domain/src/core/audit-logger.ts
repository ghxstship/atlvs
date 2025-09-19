import { TenantContext } from '../tenant/TenantContext';

export class AuditLogger {
  async log(action: string, data: any, context: TenantContext): Promise<void> {
    console.log(`[AUDIT] ${action}:`, data, `(org: ${context.organizationId})`);
  }
}
