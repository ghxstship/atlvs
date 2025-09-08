import type { AuditLogger, AuditRecord } from '@ghxstship/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseAuditLogger implements AuditLogger {
  constructor(private readonly sb: SupabaseClient) {}
  async record(entry: AuditRecord): Promise<void> {
    try {
      await this.sb.from('audit_logs').insert({
        occurred_at: entry.occurredAt,
        actor_user_id: entry.actor.userId,
        organization_id: entry.tenant.organizationId,
        project_id: entry.tenant.projectId ?? null,
        action: entry.action,
        entity_type: entry.entity?.type ?? null,
        entity_id: entry.entity?.id ?? null,
        meta: entry.meta ?? null
      });
    } catch (e) {
      console.error('Audit log insert failed', e);
    }
  }
}
