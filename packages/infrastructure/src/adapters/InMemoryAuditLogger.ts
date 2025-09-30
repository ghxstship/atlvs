import type { AuditLogger, AuditRecord } from '@ghxstship/domain';

export class InMemoryAuditLogger implements AuditLogger {
  public records: AuditRecord[] = [];
  async record(entry: AuditRecord): Promise<void> {
    this.records.push({ ...entry, id: String(this.records.length + 1) });
  }
}
