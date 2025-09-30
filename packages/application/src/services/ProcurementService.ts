import type { PurchaseOrderRepository, PurchaseOrder, TenantContext, AuditLogger, EventBus } from '@ghxstship/domain';

export class ProcurementService {
  constructor(private readonly repos: { purchaseOrders: PurchaseOrderRepository }, private readonly audit: AuditLogger, private readonly bus: EventBus) {}

  async list(ctx: TenantContext, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) {
    return this.repos.purchaseOrders.list(ctx.organizationId, limit, offset);
  }

  async create(ctx: TenantContext, input: PurchaseOrder) {
    const created = await this.repos.purchaseOrders.create({ ...input, organizationId: ctx.organizationId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'create', entity: { type: 'purchase_order', id: created.id }, meta: created });
    return created;
  }
}
