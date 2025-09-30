import type { Program, ProgramRepository, TenantContext, AuditLogger, EventBus } from '@ghxstship/domain';

export class ProgramsService {
  constructor(private readonly repos: { programs: ProgramRepository }, private readonly audit: AuditLogger, private readonly bus: EventBus) {}

  async list(ctx: TenantContext, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) {
    return this.repos.programs.list(ctx.organizationId, limit, offset);
  }

  async create(ctx: TenantContext, input: Program) {
    const created = await this.repos.programs.create({ ...input, organizationId: ctx.organizationId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'create', entity: { type: 'program', id: created.id }, meta: created });
    return created;
  }
}
