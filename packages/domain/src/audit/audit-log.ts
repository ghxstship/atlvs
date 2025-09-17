export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'read'
  | 'workflow.execute'
  | 'auth.login'
  | 'auth.logout';

export interface AuditRecord {
  id?: string;
  occurredAt: string; // ISO 8601
  actor: { userId: string };
  tenant: { organizationId: string; projectId?: string };
  action: AuditAction;
  entity?: { type: string; id?: string };
  meta?: Record<string, any>;
}

export interface AuditLogger {
  record(entry: AuditRecord): Promise<void>;
}
