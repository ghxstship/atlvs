import type {
  Resource,
  ResourceFilters,
  ResourceRepository,
  ResourceCategory,
  ResourceCategoryRepository,
  ResourceAccess,
  ResourceAccessRepository,
  ResourceComment,
  ResourceCommentRepository,
  ResourceTemplate,
  ResourceTemplateRepository,
  TrainingModule,
  TrainingModuleRepository,
  TrainingProgress,
  TrainingProgressRepository
} from '@ghxstship/domain';

export class ResourcesService {
  constructor(
    private resourceRepo: ResourceRepository,
    private categoryRepo: ResourceCategoryRepository,
    private accessRepo: ResourceAccessRepository,
    private commentRepo: ResourceCommentRepository,
    private templateRepo: ResourceTemplateRepository,
    private trainingModuleRepo: TrainingModuleRepository,
    private trainingProgressRepo: TrainingProgressRepository,
    private auditLogger: any, // TODO: Replace with proper AuditLogger interface
    private eventBus: any // TODO: Replace with proper EventBus interface
  ) {}

  // Resource CRUD
  async getResources(orgId: string, filters?: ResourceFilters, pagination?: { limit?: number; offset?: number }): Promise<Resource[]> {
    return this.resourceRepo.list(orgId, filters, pagination);
  }

  async getResourceById(id: string, orgId: string): Promise<Resource | null> {
    const resource = await this.resourceRepo.findById(id, orgId);
    if (resource) {
      await this.resourceRepo.incrementViewCount(id);
    }
    return resource;
  }

  async getResourcesByType(orgId: string, type: string, filters?: ResourceFilters): Promise<Resource[]> {
    return this.resourceRepo.listByType(orgId, type, filters);
  }

  async getFeaturedResources(orgId: string, limit?: number): Promise<Resource[]> {
    return this.resourceRepo.listFeatured(orgId, limit);
  }

  async searchResources(orgId: string, query: string, filters?: ResourceFilters): Promise<Resource[]> {
    return this.resourceRepo.search(orgId, query, filters);
  }

  async createResource(resource: Resource, userId: string): Promise<Resource> {
    const created = await this.resourceRepo.create(resource);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: resource.organizationId },
      action: 'create',
      entity: { type: 'resource', id: created.id },
      meta: { title: created.title, type: created.type, category: created.category }
    });

    await this.eventBus.publish({
      type: 'resource.created',
      organizationId: resource.organizationId,
      data: created
    });

    return created;
  }

  async updateResource(id: string, patch: Partial<Resource>, userId: string, orgId: string): Promise<Resource> {
    const updated = await this.resourceRepo.update(id, patch);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: orgId },
      action: 'update',
      entity: { type: 'resource', id },
      meta: patch
    });

    await this.eventBus.publish({
      type: 'resource.updated',
      organizationId: orgId,
      data: { id, changes: patch }
    });

    return updated;
  }

  async deleteResource(id: string, orgId: string, userId: string): Promise<void> {
    const resource = await this.resourceRepo.findById(id, orgId);
    if (!resource) throw new Error('Resource not found');

    await this.resourceRepo.delete(id, orgId);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: orgId },
      action: 'delete',
      entity: { type: 'resource', id },
      meta: { title: resource.title, type: resource.type }
    });

    await this.eventBus.publish({
      type: 'resource.deleted',
      organizationId: orgId,
      data: { id, title: resource.title, type: resource.type }
    });
  }

  async downloadResource(id: string, orgId: string, userId: string): Promise<void> {
    await this.resourceRepo.incrementDownloadCount(id);

    // Record access
    const access: ResourceAccess = {
      id: '', // Will be generated
      resourceId: id,
      organizationId: orgId,
      userId,
      accessType: 'download',
      accessedAt: new Date().toISOString()
    };

    await this.accessRepo.create(access);

    await this.eventBus.publish({
      type: 'resource.downloaded',
      organizationId: orgId,
      data: { resourceId: id, userId }
    });
  }

  // Category Management
  async getCategories(orgId: string, type?: string): Promise<ResourceCategory[]> {
    return this.categoryRepo.list(orgId, type);
  }

  async createCategory(category: ResourceCategory, userId: string): Promise<ResourceCategory> {
    const created = await this.categoryRepo.create(category);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: category.organizationId },
      action: 'create',
      entity: { type: 'resource_category', id: created.id },
      meta: { name: created.name, type: created.type }
    });

    return created;
  }

  // Access Tracking
  async recordAccess(access: ResourceAccess): Promise<ResourceAccess> {
    return this.accessRepo.create(access);
  }

  async getAccessStats(resourceId: string, orgId: string): Promise<{
    totalViews: number;
    totalDownloads: number;
    uniqueUsers: number;
    avgDuration: number;
  }> {
    return this.accessRepo.getAccessStats(resourceId, orgId);
  }

  // Comments
  async getResourceComments(resourceId: string, orgId: string): Promise<ResourceComment[]> {
    return this.commentRepo.findByResourceId(resourceId, orgId);
  }

  async addComment(comment: ResourceComment, userId: string): Promise<ResourceComment> {
    const created = await this.commentRepo.create(comment);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: comment.organizationId },
      action: 'create',
      entity: { type: 'resource_comment', id: created.id },
      meta: { resourceId: comment.resourceId }
    });

    await this.eventBus.publish({
      type: 'resource.comment.added',
      organizationId: comment.organizationId,
      data: created
    });

    return created;
  }

  async resolveComment(id: string, resolvedBy: string, orgId: string): Promise<ResourceComment> {
    const resolved = await this.commentRepo.markResolved(id, resolvedBy);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: resolvedBy },
      tenant: { organizationId: orgId },
      action: 'resolve',
      entity: { type: 'resource_comment', id },
      meta: {}
    });

    return resolved;
  }

  // Templates
  async getTemplates(orgId: string, templateType?: string): Promise<ResourceTemplate[]> {
    return this.templateRepo.list(orgId, templateType);
  }

  async createTemplate(template: ResourceTemplate, userId: string): Promise<ResourceTemplate> {
    const created = await this.templateRepo.create(template);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: template.organizationId },
      action: 'create',
      entity: { type: 'resource_template', id: created.id },
      meta: { name: created.name, templateType: created.templateType }
    });

    return created;
  }

  async useTemplate(id: string, orgId: string, userId: string): Promise<void> {
    await this.templateRepo.incrementUsage(id);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: orgId },
      action: 'use',
      entity: { type: 'resource_template', id },
      meta: {}
    });

    await this.eventBus.publish({
      type: 'resource.template.used',
      organizationId: orgId,
      data: { templateId: id, userId }
    });
  }

  // Training Modules
  async getTrainingModules(orgId: string, filters?: { category?: string; difficulty?: string; isRequired?: boolean }): Promise<TrainingModule[]> {
    return this.trainingModuleRepo.list(orgId, filters);
  }

  async createTrainingModule(module: TrainingModule, userId: string): Promise<TrainingModule> {
    const created = await this.trainingModuleRepo.create(module);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: module.organizationId },
      action: 'create',
      entity: { type: 'training_module', id: created.id },
      meta: { title: created.title, type: created.type, difficulty: created.difficulty }
    });

    return created;
  }

  // Training Progress
  async getUserTrainingProgress(userId: string, orgId: string): Promise<TrainingProgress[]> {
    return this.trainingProgressRepo.findByUserId(userId, orgId);
  }

  async getModuleProgress(moduleId: string, orgId: string): Promise<TrainingProgress[]> {
    return this.trainingProgressRepo.findByModuleId(moduleId, orgId);
  }

  async startTraining(moduleId: string, userId: string, orgId: string): Promise<TrainingProgress> {
    const progress: TrainingProgress = {
      id: '', // Will be generated
      trainingModuleId: moduleId,
      organizationId: orgId,
      userId,
      status: 'in_progress',
      progress: 0,
      startedAt: new Date().toISOString(),
      attempts: 1,
      timeSpent: 0
    };

    const created = await this.trainingProgressRepo.create(progress);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: orgId },
      action: 'start',
      entity: { type: 'training_progress', id: created.id },
      meta: { moduleId }
    });

    return created;
  }

  async updateTrainingProgress(id: string, progress: number, timeSpent: number, userId: string, orgId: string): Promise<TrainingProgress> {
    const updated = await this.trainingProgressRepo.updateProgress(id, progress, timeSpent);

    await this.eventBus.publish({
      type: 'training.progress.updated',
      organizationId: orgId,
      data: { id, progress, timeSpent, userId }
    });

    return updated;
  }

  async completeTraining(id: string, score: number, userId: string, orgId: string, certificateUrl?: string): Promise<TrainingProgress> {
    const completed = await this.trainingProgressRepo.markCompleted(id, score, certificateUrl);

    await this.auditLogger.record({
      occurredAt: new Date().toISOString(),
      actor: { userId },
      tenant: { organizationId: orgId },
      action: 'complete',
      entity: { type: 'training_progress', id },
      meta: { score, certificateUrl }
    });

    await this.eventBus.publish({
      type: 'training.completed',
      organizationId: orgId,
      data: { id, score, userId, certificateUrl }
    });

    return completed;
  }
}
