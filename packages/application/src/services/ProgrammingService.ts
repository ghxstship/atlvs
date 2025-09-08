import { z } from 'zod';
import type { 
  AuditLogger, 
  EventBus, 
  TenantContext,
  EventRepository,
  LineupRepository,
  RiderRepository,
  CallSheetRepository,
  SpaceRepository,
  ItineraryRepository
} from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';

const CreateEventSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1).max(200),
  kind: z.enum(['performance', 'activation', 'workshop']).default('performance'),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional()
});

const CreateSpaceSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(200),
  kind: z.enum(['room', 'green_room', 'dressing_room', 'meeting_room', 'classroom', 'other']).default('room'),
  capacity: z.number().int().positive().optional()
});

const CreateLineupSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  performer: z.string().min(1).max(200),
  stage: z.string().max(100).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional()
});

const CreateRiderSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  kind: z.enum(['technical', 'hospitality', 'stage_plot']).default('technical'),
  details: z.record(z.any()).optional()
});

const CreateCallSheetSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  callDate: z.string().date(),
  details: z.record(z.any()).optional()
});

export class ProgrammingService {
  constructor(
    private readonly repos: {
      events: EventRepository;
      lineups: LineupRepository;
      riders: RiderRepository;
      callSheets: CallSheetRepository;
      spaces: SpaceRepository;
    },
    private readonly audit: AuditLogger,
    private readonly events: EventBus
  ) {}

  // Event Management
  async createEvent(ctx: TenantContext, input: z.infer<typeof CreateEventSchema>) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'programming:write') === 'deny') {
      throw new Error('Forbidden: missing permission programming:write');
    }

    const data = CreateEventSchema.parse(input);
    const now = new Date().toISOString();

    const event = await this.repos.events.create(
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
      tenant: { organizationId: ctx.organizationId, projectId: event.projectId },
      action: 'create',
      entity: { type: 'event', id: event.id },
      meta: { name: event.name, kind: event.kind }
    });

    await this.events.publish({
      name: 'event.created',
      occurredAt: now,
      tenant: { organizationId: ctx.organizationId, projectId: event.projectId },
      actor: { userId: ctx.userId },
      payload: { id: event.id, name: event.name }
    });

    return event;
  }

  async listEvents(ctx: TenantContext, opts: { limit?: number; offset?: number; projectId?: string } = {}) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'programming:read') === 'deny') {
      throw new Error('Forbidden: missing permission programming:read');
    }

    if (opts.projectId) {
      return this.repos.events.findByProjectId(opts.projectId, { organizationId: ctx.organizationId });
    }

    return this.repos.events.findMany({ limit: opts.limit, offset: opts.offset }, { organizationId: ctx.organizationId });
  }

  async getEvent(ctx: TenantContext, eventId: string) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'programming:read') === 'deny') {
      throw new Error('Forbidden: missing permission programming:read');
    }

    return this.repos.events.findById(eventId, { organizationId: ctx.organizationId });
  }

  async updateEvent(ctx: TenantContext, eventId: string, updates: Partial<z.infer<typeof CreateEventSchema>>) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'programming:write') === 'deny') {
      throw new Error('Forbidden: missing permission programming:write');
    }

    const now = new Date().toISOString();
    const event = await this.repos.events.update(eventId, { ...updates, updatedAt: now }, { organizationId: ctx.organizationId });

    await this.audit.record({
      occurredAt: now,
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId, projectId: event.projectId },
      action: 'update',
      entity: { type: 'event', id: event.id },
      meta: { name: event.name }
    });

    return event;
  }

  async deleteEvent(ctx: TenantContext, eventId: string) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'programming:delete') === 'deny') {
      throw new Error('Forbidden: missing permission programming:delete');
    }

    const event = await this.repos.events.findById(eventId, { organizationId: ctx.organizationId });
    if (!event) throw new Error('Event not found');

    await this.repos.events.delete(eventId, { organizationId: ctx.organizationId });

    const now = new Date().toISOString();
    await this.audit.record({
      occurredAt: now,
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId, projectId: event.projectId },
      action: 'delete',
      entity: { type: 'event', id: event.id },
      meta: { name: event.name }
    });

    return { success: true };
  }

  // Space Management
  async createSpace(ctx: TenantContext, input: z.infer<typeof CreateSpaceSchema>) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'programming:write') === 'deny') {
      throw new Error('Forbidden: missing permission programming:write');
    }

    const data = CreateSpaceSchema.parse(input);
    if (data.organizationId !== ctx.organizationId) {
      throw new Error('Cross-tenant write denied: organizationId mismatch');
    }

    const space = await this.repos.spaces.create(data as any, { organizationId: ctx.organizationId });

    const now = new Date().toISOString();
    await this.audit.record({
      occurredAt: now,
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'create',
      entity: { type: 'space', id: space.id },
      meta: { name: space.name, kind: space.kind }
    });

    return space;
  }

  async listSpaces(ctx: TenantContext, opts: { limit?: number; offset?: number } = {}) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'programming:read') === 'deny') {
      throw new Error('Forbidden: missing permission programming:read');
    }

    return this.repos.spaces.findMany({ limit: opts.limit, offset: opts.offset }, { organizationId: ctx.organizationId });
  }

  // Lineup Management
  async createLineup(ctx: TenantContext, input: z.infer<typeof CreateLineupSchema>) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'programming:write') === 'deny') {
      throw new Error('Forbidden: missing permission programming:write');
    }

    const data = CreateLineupSchema.parse(input);
    const lineup = await this.repos.lineups.create(data as any, { organizationId: ctx.organizationId });

    const now = new Date().toISOString();
    await this.audit.record({
      occurredAt: now,
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'create',
      entity: { type: 'lineup', id: lineup.id },
      meta: { performer: lineup.performer, eventId: lineup.eventId }
    });

    return lineup;
  }

  async listLineupsByEvent(ctx: TenantContext, eventId: string) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'programming:read') === 'deny') {
      throw new Error('Forbidden: missing permission programming:read');
    }

    return this.repos.lineups.findByEventId(eventId, { organizationId: ctx.organizationId });
  }

  // Rider Management
  async createRider(ctx: TenantContext, input: z.infer<typeof CreateRiderSchema>) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'programming:write') === 'deny') {
      throw new Error('Forbidden: missing permission programming:write');
    }

    const data = CreateRiderSchema.parse(input);
    const rider = await this.repos.riders.create(data as any, { organizationId: ctx.organizationId });

    const now = new Date().toISOString();
    await this.audit.record({
      occurredAt: now,
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'create',
      entity: { type: 'rider', id: rider.id },
      meta: { kind: rider.kind, eventId: rider.eventId }
    });

    return rider;
  }

  async listRidersByEvent(ctx: TenantContext, eventId: string) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'programming:read') === 'deny') {
      throw new Error('Forbidden: missing permission programming:read');
    }

    return this.repos.riders.findByEventId(eventId, { organizationId: ctx.organizationId });
  }

  // Call Sheet Management
  async createCallSheet(ctx: TenantContext, input: z.infer<typeof CreateCallSheetSchema>) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'programming:write') === 'deny') {
      throw new Error('Forbidden: missing permission programming:write');
    }

    const data = CreateCallSheetSchema.parse(input);
    const callSheet = await this.repos.callSheets.create(data as any, { organizationId: ctx.organizationId });

    const now = new Date().toISOString();
    await this.audit.record({
      occurredAt: now,
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'create',
      entity: { type: 'call_sheet', id: callSheet.id },
      meta: { callDate: callSheet.callDate, eventId: callSheet.eventId }
    });

    return callSheet;
  }

  async listCallSheetsByEvent(ctx: TenantContext, eventId: string) {
    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'programming:read') === 'deny') {
      throw new Error('Forbidden: missing permission programming:read');
    }

    return this.repos.callSheets.findByEventId(eventId, { organizationId: ctx.organizationId });
  }
}
