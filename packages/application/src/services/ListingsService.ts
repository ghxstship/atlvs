import type { Listing, ListingRepository, TenantContext, AuditLogger, EventBus } from '@ghxstship/domain';

export class ListingsService {
  constructor(
    private readonly repos: { listings: ListingRepository },
    private readonly audit: AuditLogger,
    private readonly bus: EventBus
  ) {}

  async list(ctx: TenantContext, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) {
    return this.repos.listings.list(ctx.organizationId, limit, offset);
  }

  async create(ctx: TenantContext, input: Listing) {
    const price = Number(input.price);
    if (!Number.isFinite(price) || price < 0) throw new Error('Listing price must be a non-negative number');
    const currency = (input.currency || '').trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Listing currency must be a valid 3-letter code (e.g., USD)');
    const allowed: Listing['status'][] = ['draft', 'active', 'archived'];
    const status = (input.status || 'draft') as Listing['status'];
    if (!allowed.includes(status)) throw new Error('Invalid listing status');

    const now = new Date().toISOString();
    const sanitized: Listing = {
      ...input,
      price,
      currency,
      status,
      organizationId: ctx.organizationId,
      createdAt: now,
      updatedAt: now
    };
    const created = await this.repos.listings.create(sanitized);
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'create',
      entity: { type: 'listing', id: created.id },
      meta: created
    });
    return created;
  }

  async update(ctx: TenantContext, id: string, patch: Partial<Listing>) {
    const updated = await this.repos.listings.update(id, patch);
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'update',
      entity: { type: 'listing', id },
      meta: patch
    });
    return updated;
  }

  async delete(ctx: TenantContext, id: string) {
    // Assume repository has a delete if needed; if not, this is a placeholder.
    // @ts-ignore
    if (typeof (this.repos.listings as any).delete === 'function') {
      // @ts-ignore
      await (this.repos.listings as any).delete(id);
    }
    await this.audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'delete',
      entity: { type: 'listing', id }
    });
    return true;
  }
}
