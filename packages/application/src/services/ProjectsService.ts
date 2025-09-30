import { z } from 'zod';
import type { AuditLogger, EventBus, ProjectRepository, TenantContext } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';

const CreateProjectSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(200),
  status: z.enum(['planned', 'active', 'on_hold', 'completed', 'cancelled']).default('planned'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budgetCurrency: z.string().length(3).optional(),
  meta: z.record(z.any()).optional()
});

export class ProjectsService {
  constructor(
    private readonly repos: { projects: ProjectRepository },
    private readonly audit: AuditLogger,
    private readonly events: EventBus
  ) {}

  async create(ctx: TenantContext, input: z.infer<typeof CreateProjectSchema>) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'projects:write') === 'deny') {
      throw new Error('Forbidden: missing permission projects:write');
    }

    const data = CreateProjectSchema.parse(input);

    if (data.organizationId !== ctx.organizationId) {
      throw new Error('Cross-tenant write denied: organizationId mismatch');
    }

    const now = new Date().toISOString();
    const project = await this.repos.projects.create(
      {
        ...data,
        createdAt: now,
        updatedAt: now
      } as any,
      { organizationId: ctx.organizationId }
    );

    await this.audit.record({
      occurredAt: now,
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId, projectId: project.id },
      action: 'create',
      entity: { type: 'project', id: project.id },
      meta: { name: project.name }
    });

    await this.events.publish({
      name: 'project.created',
      occurredAt: now,
      tenant: { organizationId: ctx.organizationId, projectId: project.id },
      actor: { userId: ctx.userId },
      payload: { id: project.id }
    });

    return project;
  }

  async list(ctx: TenantContext, opts: { limit?: number; offset?: number } = {}) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'projects:read') === 'deny') {
      throw new Error('Forbidden: missing permission projects:read');
    }
    return this.repos.projects.findMany({ limit: opts.limit, offset: opts.offset }, { organizationId: ctx.organizationId });
  }
}
