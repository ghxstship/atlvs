import { z } from 'zod';
import type { 
  AuditLogger, 
  EventBus, 
  ProjectRepository, 
  TaskRepository,
  RiskRepository,
  FileRepository,
  InspectionRepository,
  ActivationRepository,
  TimeEntryRepository,
  TenantContext 
} from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';

const CreateProjectSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  type: z.enum(['internal', 'client', 'maintenance', 'research', 'development']).default('internal'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().optional(),
  budgetCurrency: z.string().length(3).optional(),
  clientId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  teamMembers: z.array(z.string().uuid()).default([]),
  tags: z.array(z.string()).default([]),
  location: z.string().optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  visibility: z.enum(['public', 'private', 'team', 'client']).default('team'),
  metadata: z.record(z.any()).optional()
});

const UpdateProjectSchema = CreateProjectSchema.partial().omit({ id: true, organizationId: true });

const CreateTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  type: z.enum(['task', 'bug', 'feature', 'improvement', 'research']).default('task'),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().optional(),
  progress: z.number().min(0).max(100).default(0),
  parentTaskId: z.string().uuid().optional(),
  milestoneId: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional()
});

const CreateRiskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.enum(['technical', 'financial', 'operational', 'strategic', 'compliance', 'external']),
  probability: z.enum(['very_low', 'low', 'medium', 'high', 'very_high']),
  impact: z.enum(['very_low', 'low', 'medium', 'high', 'very_high']),
  status: z.enum(['identified', 'assessed', 'mitigated', 'accepted', 'closed']).default('identified'),
  ownerId: z.string().uuid().optional(),
  mitigationPlan: z.string().optional(),
  contingencyPlan: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional()
});

export class ProjectsService {
  constructor(
    private readonly repos: { 
      projects: ProjectRepository;
      tasks: TaskRepository;
      risks: RiskRepository;
      files: FileRepository;
      inspections: InspectionRepository;
      activations: ActivationRepository;
      timeEntries: TimeEntryRepository;
    },
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

  async list(ctx: TenantContext, opts: { limit?: number; offset?: number; status?: string; type?: string } = {}) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'projects:read') === 'deny') {
      throw new Error('Forbidden: missing permission projects:read');
    }
    return this.repos.projects.findMany({ 
      limit: opts.limit, 
      offset: opts.offset,
      filter: {
        ...(opts.status && { status: opts.status }),
        ...(opts.type && { type: opts.type })
      }
    }, { organizationId: ctx.organizationId });
  }

  async findById(ctx: TenantContext, projectId: string) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'projects:read') === 'deny') {
      throw new Error('Forbidden: missing permission projects:read');
    }
    
    const project = await this.repos.projects.findById(projectId, { organizationId: ctx.organizationId });
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  async update(ctx: TenantContext, projectId: string, input: z.infer<typeof UpdateProjectSchema>) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'projects:write') === 'deny') {
      throw new Error('Forbidden: missing permission projects:write');
    }

    const data = UpdateProjectSchema.parse(input);
    const now = new Date().toISOString();
    
    const project = await this.repos.projects.update(
      projectId,
      { ...data, updatedAt: now } as any,
      { organizationId: ctx.organizationId }
    );

    await this.audit.record({
      occurredAt: now,
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId, projectId },
      action: 'update',
      entity: { type: 'project', id: projectId },
      meta: { changes: Object.keys(data) }
    });

    await this.events.publish({
      name: 'project.updated',
      occurredAt: now,
      tenant: { organizationId: ctx.organizationId, projectId },
      actor: { userId: ctx.userId },
      payload: { id: projectId, changes: Object.keys(data) }
    });

    return project;
  }

  async delete(ctx: TenantContext, projectId: string) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'projects:delete') === 'deny') {
      throw new Error('Forbidden: missing permission projects:delete');
    }

    const now = new Date().toISOString();
    
    await this.repos.projects.delete(projectId, { organizationId: ctx.organizationId });

    await this.audit.record({
      occurredAt: now,
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId, projectId },
      action: 'delete',
      entity: { type: 'project', id: projectId },
      meta: {}
    });

    await this.events.publish({
      name: 'project.deleted',
      occurredAt: now,
      tenant: { organizationId: ctx.organizationId, projectId },
      actor: { userId: ctx.userId },
      payload: { id: projectId }
    });
  }

  // Task Management
  async createTask(ctx: TenantContext, input: z.infer<typeof CreateTaskSchema>) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'projects:tasks:write') === 'deny') {
      throw new Error('Forbidden: missing permission projects:tasks:write');
    }

    const data = CreateTaskSchema.parse(input);
    
    // Verify project exists and user has access
    await this.findById(ctx, data.projectId);

    const now = new Date().toISOString();
    const task = await this.repos.tasks.create(
      {
        ...data,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId
      } as any,
      { organizationId: ctx.organizationId }
    );

    await this.audit.record({
      occurredAt: now,
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId, projectId: data.projectId },
      action: 'create',
      entity: { type: 'task', id: task.id },
      meta: { title: task.title, projectId: data.projectId }
    });

    await this.events.publish({
      name: 'task.created',
      occurredAt: now,
      tenant: { organizationId: ctx.organizationId, projectId: data.projectId },
      actor: { userId: ctx.userId },
      payload: { id: task.id, projectId: data.projectId }
    });

    return task;
  }

  async listTasks(ctx: TenantContext, projectId: string, opts: { limit?: number; offset?: number; status?: string } = {}) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'projects:tasks:read') === 'deny') {
      throw new Error('Forbidden: missing permission projects:tasks:read');
    }
    
    // Verify project access
    await this.findById(ctx, projectId);
    
    return this.repos.tasks.findMany({
      limit: opts.limit,
      offset: opts.offset,
      filter: {
        projectId,
        ...(opts.status && { status: opts.status })
      }
    }, { organizationId: ctx.organizationId });
  }

  // Risk Management
  async createRisk(ctx: TenantContext, input: z.infer<typeof CreateRiskSchema>) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'projects:risks:write') === 'deny') {
      throw new Error('Forbidden: missing permission projects:risks:write');
    }

    const data = CreateRiskSchema.parse(input);
    
    // Verify project exists and user has access
    await this.findById(ctx, data.projectId);

    const now = new Date().toISOString();
    const risk = await this.repos.risks.create(
      {
        ...data,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId
      } as any,
      { organizationId: ctx.organizationId }
    );

    await this.audit.record({
      occurredAt: now,
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId, projectId: data.projectId },
      action: 'create',
      entity: { type: 'risk', id: risk.id },
      meta: { title: risk.title, category: risk.category, projectId: data.projectId }
    });

    await this.events.publish({
      name: 'risk.created',
      occurredAt: now,
      tenant: { organizationId: ctx.organizationId, projectId: data.projectId },
      actor: { userId: ctx.userId },
      payload: { id: risk.id, projectId: data.projectId }
    });

    return risk;
  }

  async listRisks(ctx: TenantContext, projectId: string, opts: { limit?: number; offset?: number; category?: string } = {}) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'projects:risks:read') === 'deny') {
      throw new Error('Forbidden: missing permission projects:risks:read');
    }
    
    // Verify project access
    await this.findById(ctx, projectId);
    
    return this.repos.risks.findMany({
      limit: opts.limit,
      offset: opts.offset,
      filter: {
        projectId,
        ...(opts.category && { category: opts.category })
      }
    }, { organizationId: ctx.organizationId });
  }

  // Time Tracking
  async createTimeEntry(ctx: TenantContext, projectId: string, input: {
    description: string;
    duration: number;
    date: string;
    taskId?: string;
    isBillable?: boolean;
    hourlyRate?: number;
  }) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'projects:time:write') === 'deny') {
      throw new Error('Forbidden: missing permission projects:time:write');
    }
    
    // Verify project access
    await this.findById(ctx, projectId);

    const now = new Date().toISOString();
    const timeEntry = await this.repos.timeEntries.create(
      {
        ...input,
        projectId,
        userId: ctx.userId,
        createdAt: now
      } as any,
      { organizationId: ctx.organizationId }
    );

    await this.audit.record({
      occurredAt: now,
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId, projectId },
      action: 'create',
      entity: { type: 'time_entry', id: timeEntry.id },
      meta: { duration: input.duration, projectId }
    });

    return timeEntry;
  }

  async getProjectStats(ctx: TenantContext, projectId: string) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'projects:read') === 'deny') {
      throw new Error('Forbidden: missing permission projects:read');
    }
    
    // Verify project access
    const project = await this.findById(ctx, projectId);
    
    const [tasks, risks, timeEntries] = await Promise.all([
      this.repos.tasks.findMany({ filter: { projectId } }, { organizationId: ctx.organizationId }),
      this.repos.risks.findMany({ filter: { projectId } }, { organizationId: ctx.organizationId }),
      this.repos.timeEntries.findMany({ filter: { projectId } }, { organizationId: ctx.organizationId })
    ]);

    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      blocked: tasks.filter(t => t.status === 'blocked').length
    };

    const riskStats = {
      total: risks.length,
      high: risks.filter(r => r.impact === 'high' || r.impact === 'very_high').length,
      open: risks.filter(r => !['mitigated', 'accepted', 'closed'].includes(r.status)).length
    };

    const timeStats = {
      totalHours: timeEntries.reduce((sum, entry) => sum + entry.duration, 0),
      billableHours: timeEntries.filter(entry => entry.isBillable).reduce((sum, entry) => sum + entry.duration, 0)
    };

    return {
      project,
      tasks: taskStats,
      risks: riskStats,
      time: timeStats
    };
  }
}
