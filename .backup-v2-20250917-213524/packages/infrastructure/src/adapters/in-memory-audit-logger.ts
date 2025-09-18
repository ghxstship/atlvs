// Placeholder audit logger - will be implemented in future release

export class InMemoryAuditLogger {
  public records: any[] = [];
  
  async record(entry: any): Promise<void> {
    this.records.push({ ...entry, id: String(this.records.length + 1) });
  }
}
