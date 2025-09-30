import type { InvoiceRepository, Invoice, TenantContext, AuditLogger, EventBus } from '@ghxstship/domain';

export class FinanceService {
  constructor(private readonly repos: { invoices: InvoiceRepository }, private readonly audit: AuditLogger, private readonly bus: EventBus) {}

  async list(ctx: TenantContext, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) {
    return this.repos.invoices.list(ctx.organizationId, limit, offset);
  }

  async create(ctx: TenantContext, input: Invoice) {
    const created = await this.repos.invoices.create({ ...input, organizationId: ctx.organizationId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'create', entity: { type: 'invoice', id: created.id }, meta: created });
    return created;
  }
}
