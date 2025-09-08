import type { 
  PipelineRepository, 
  PipelineStage, 
  TenantContext, 
  AuditLogger, 
  EventBus,
  ManningRepository,
  ManningSlot,
  AdvancingRepository,
  AdvancingItem,
  OnboardingRepository,
  OnboardingTask,
  TrainingRepository,
  Training,
  ContractingRepository,
  Contract
} from '@ghxstship/domain';

export class PipelineService {
  constructor(
    private readonly repos: { 
      pipeline: PipelineRepository;
      manning: ManningRepository;
      advancing: AdvancingRepository;
      onboarding: OnboardingRepository;
      training: TrainingRepository;
      contracting: ContractingRepository;
    }, 
    private readonly audit: AuditLogger, 
    private readonly bus: EventBus
  ) {}

  // Pipeline Stages
  async listStages(ctx: TenantContext) {
    return this.repos.pipeline.listStages(ctx.organizationId);
  }

  async createStage(ctx: TenantContext, stage: PipelineStage) {
    const created = await this.repos.pipeline.createStage({ ...stage, organizationId: ctx.organizationId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'create', entity: { type: 'pipeline_stage', id: created.id }, meta: created });
    return created;
  }

  // Manning
  async listManningSlots(ctx: TenantContext, projectId: string) {
    const slots = await this.repos.manning.listSlots(projectId);
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'read', entity: { type: 'manning_slots', id: projectId }, meta: { count: slots.length } });
    return slots;
  }

  async createManningSlot(ctx: TenantContext, slot: ManningSlot) {
    const created = await this.repos.manning.createSlot(slot);
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'create', entity: { type: 'manning_slot', id: created.id }, meta: created });
    return created;
  }

  // Advancing
  async listAdvancingItems(ctx: TenantContext, projectId: string) {
    const items = await this.repos.advancing.listItems(projectId);
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'read', entity: { type: 'advancing_items', id: projectId }, meta: { count: items.length } });
    return items;
  }

  async createAdvancingItem(ctx: TenantContext, item: AdvancingItem) {
    const created = await this.repos.advancing.createItem(item);
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'create', entity: { type: 'advancing_item', id: created.id }, meta: created });
    return created;
  }

  // Onboarding
  async listOnboardingTasks(ctx: TenantContext) {
    const tasks = await this.repos.onboarding.listTasks(ctx.organizationId);
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'read', entity: { type: 'onboarding_tasks', id: ctx.organizationId }, meta: { count: tasks.length } });
    return tasks;
  }

  async createOnboardingTask(ctx: TenantContext, task: OnboardingTask) {
    const created = await this.repos.onboarding.createTask(task);
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'create', entity: { type: 'onboarding_task', id: created.id }, meta: created });
    return created;
  }

  // Training
  async listTrainings(ctx: TenantContext) {
    const trainings = await this.repos.training.listTrainings(ctx.organizationId);
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'read', entity: { type: 'trainings', id: ctx.organizationId }, meta: { count: trainings.length } });
    return trainings;
  }

  async createTraining(ctx: TenantContext, training: Training) {
    const created = await this.repos.training.createTraining(training);
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'create', entity: { type: 'training', id: created.id }, meta: created });
    return created;
  }

  // Contracting
  async listContracts(ctx: TenantContext, projectId?: string) {
    const contracts = await this.repos.contracting.listContracts(ctx.organizationId, projectId);
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'read', entity: { type: 'contracts', id: ctx.organizationId }, meta: { count: contracts.length, projectId } });
    return contracts;
  }

  async createContract(ctx: TenantContext, contract: Contract) {
    const created = await this.repos.contracting.createContract(contract);
    await this.audit.record({ occurredAt: new Date().toISOString(), actor: { userId: ctx.userId }, tenant: { organizationId: ctx.organizationId }, action: 'create', entity: { type: 'contract', id: created.id }, meta: created });
    return created;
  }
}
