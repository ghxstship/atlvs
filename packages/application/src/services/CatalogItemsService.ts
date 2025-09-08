import type { CatalogItem, CatalogItemRepository, TenantContext, AuditLogger, EventBus } from '@ghxstship/domain';

export class CatalogItemsService {
  constructor(
    private readonly repos: { catalogItems: CatalogItemRepository },
    private readonly audit: AuditLogger,
    private readonly bus: EventBus
  ) {}

  async list(ctx: TenantContext, params: { vendorId?: string; limit?: number; offset?: number }) {
    const { vendorId, limit = 20, offset = 0 } = params ?? {} as any;
    return this.repos.catalogItems.list(ctx.organizationId, vendorId, limit, offset);
  }

  async create(ctx: TenantContext, input: CatalogItem) {
    const title = (input.title || '').trim();
    if (!title) throw new Error('Catalog item title is required');
    const unitPrice = Number(input.unitPrice);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error('Unit price must be a non-negative number');
    const currency = (input.currency || '').trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Currency must be a valid 3-letter code');
    const allowed: CatalogItem['status'][] = ['draft', 'active', 'archived'];
    const status = (input.status || 'draft') as CatalogItem['status'];
    if (!allowed.includes(status)) throw new Error('Invalid catalog item status');

    const now = new Date().toISOString();
    const sanitized: CatalogItem = {
      ...input,
      title,
      unitPrice,
      currency,
      status,
      organizationId: ctx.organizationId,
      createdAt: now,
      updatedAt: now
    };
    const created = await this.repos.catalogItems.create(sanitized);
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'create',
      entity: { type: 'catalogItem', id: created.id },
      meta: created
    });
    await this.bus.publish({
      name: 'marketplace.catalogItem.created',
      occurredAt: new Date().toISOString(),
      tenant: { organizationId: ctx.organizationId, projectId: ctx.projectId },
      actor: { userId: ctx.userId },
      payload: created
    });
    return created;
  }

  async update(ctx: TenantContext, id: string, patch: Partial<CatalogItem>) {
    const updated = await this.repos.catalogItems.update(id, patch);
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'update',
      entity: { type: 'catalogItem', id },
      meta: patch
    });
    await this.bus.publish({
      name: 'marketplace.catalogItem.updated',
      occurredAt: new Date().toISOString(),
      tenant: { organizationId: ctx.organizationId, projectId: ctx.projectId },
      actor: { userId: ctx.userId },
      payload: { id, patch }
    });
    return updated;
  }

  async delete(ctx: TenantContext, id: string) {
    // @ts-ignore optional delete method
    if (typeof (this.repos.catalogItems as any).delete === 'function') {
      // @ts-ignore
      await (this.repos.catalogItems as any).delete(id);
    }
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'delete',
      entity: { type: 'catalogItem', id }
    });
    await this.bus.publish({
      name: 'marketplace.catalogItem.deleted',
      occurredAt: new Date().toISOString(),
      tenant: { organizationId: ctx.organizationId, projectId: ctx.projectId },
      actor: { userId: ctx.userId },
      payload: { id }
    });
    return true;
  }
}
