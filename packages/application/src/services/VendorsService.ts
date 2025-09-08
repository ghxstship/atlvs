import type { Vendor, VendorRepository, TenantContext, AuditLogger, EventBus } from '@ghxstship/domain';

export class VendorsService {
  constructor(
    private readonly repos: { vendors: VendorRepository },
    private readonly audit: AuditLogger,
    private readonly bus: EventBus
  ) {}

  async list(ctx: TenantContext, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) {
    return this.repos.vendors.list(ctx.organizationId, limit, offset);
  }

  async create(ctx: TenantContext, input: Vendor) {
    const name = (input.name || '').trim();
    if (!name) throw new Error('Vendor name is required');
    const status = (input.status || 'draft') as Vendor['status'];
    const allowed: Vendor['status'][] = ['draft', 'active', 'suspended'];
    if (!allowed.includes(status)) throw new Error('Invalid vendor status');

    const now = new Date().toISOString();
    const sanitized: Vendor = {
      ...input,
      name,
      status,
      organizationId: ctx.organizationId,
      createdAt: now,
      updatedAt: now
    };
    const created = await this.repos.vendors.create(sanitized);
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'create',
      entity: { type: 'vendor', id: created.id },
      meta: created
    });
    await this.bus.publish({
      name: 'marketplace.vendor.created',
      occurredAt: new Date().toISOString(),
      tenant: { organizationId: ctx.organizationId, projectId: ctx.projectId },
      actor: { userId: ctx.userId },
      payload: created
    });
    return created;
  }

  async update(ctx: TenantContext, id: string, patch: Partial<Vendor>) {
    const updated = await this.repos.vendors.update(id, patch);
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'update',
      entity: { type: 'vendor', id },
      meta: patch
    });
    await this.bus.publish({
      name: 'marketplace.vendor.updated',
      occurredAt: new Date().toISOString(),
      tenant: { organizationId: ctx.organizationId, projectId: ctx.projectId },
      actor: { userId: ctx.userId },
      payload: { id, patch }
    });
    return updated;
  }

  async delete(ctx: TenantContext, id: string) {
    // @ts-ignore optional delete in repo
    if (typeof (this.repos.vendors as any).delete === 'function') {
      // @ts-ignore
      await (this.repos.vendors as any).delete(id);
    }
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'delete',
      entity: { type: 'vendor', id }
    });
    await this.bus.publish({
      name: 'marketplace.vendor.deleted',
      occurredAt: new Date().toISOString(),
      tenant: { organizationId: ctx.organizationId, projectId: ctx.projectId },
      actor: { userId: ctx.userId },
      payload: { id }
    });
    return true;
  }
}
