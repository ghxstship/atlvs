export interface Resource {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  content: string;
  type: 'policy' | 'guide' | 'training' | 'template' | 'procedure' | 'featured';
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived' | 'under_review';
  visibility: 'public' | 'private' | 'team' | 'role_based';
  allowedRoles?: string[];
  allowedTeams?: string[];
  version: string;
  language: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  thumbnailUrl?: string;
  downloadCount: number;
  viewCount: number;
  isFeatured: boolean;
  isPinned: boolean;
  expiryDate?: string;
  lastReviewedAt?: string;
  reviewedBy?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ResourceFilters {
  type?: string;
  category?: string;
  status?: string;
  visibility?: string;
  tags?: string[];
  language?: string;
  isFeatured?: boolean;
  isPinned?: boolean;
  search?: string;
}

export interface ResourceRepository {
  findById(id: string, orgId: string): Promise<Resource | null>;
  list(orgId: string, filters?: ResourceFilters, pagination?: { limit?: number; offset?: number }): Promise<Resource[]>;
  listByType(orgId: string, type: string, filters?: ResourceFilters): Promise<Resource[]>;
  listFeatured(orgId: string, limit?: number): Promise<Resource[]>;
  search(orgId: string, query: string, filters?: ResourceFilters): Promise<Resource[]>;
  create(entity: Resource): Promise<Resource>;
  update(id: string, patch: Partial<Resource>): Promise<Resource>;
  delete(id: string, orgId: string): Promise<void>;
  incrementViewCount(id: string): Promise<void>;
  incrementDownloadCount(id: string): Promise<void>;
}

export interface ResourceCategory {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: 'policy' | 'guide' | 'training' | 'template' | 'procedure' | 'featured';
  color?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceCategoryRepository {
  findById(id: string, orgId: string): Promise<ResourceCategory | null>;
  list(orgId: string, type?: string): Promise<ResourceCategory[]>;
  create(entity: ResourceCategory): Promise<ResourceCategory>;
  update(id: string, patch: Partial<ResourceCategory>): Promise<ResourceCategory>;
  delete(id: string, orgId: string): Promise<void>;
}

export interface ResourceAccess {
  id: string;
  resourceId: string;
  organizationId: string;
  userId: string;
  accessType: 'view' | 'download' | 'edit' | 'admin';
  accessedAt: string;
  ipAddress?: string;
  userAgent?: string;
  duration?: number; // in seconds
}

export interface ResourceAccessRepository {
  findByResourceId(resourceId: string, orgId: string): Promise<ResourceAccess[]>;
  findByUserId(userId: string, orgId: string): Promise<ResourceAccess[]>;
  create(entity: ResourceAccess): Promise<ResourceAccess>;
  getAccessStats(resourceId: string, orgId: string): Promise<{
    totalViews: number;
    totalDownloads: number;
    uniqueUsers: number;
    avgDuration: number;
  }>;
}

export interface ResourceComment {
  id: string;
  resourceId: string;
  organizationId: string;
  userId: string;
  parentId?: string; // for nested comments
  content: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceCommentRepository {
  findByResourceId(resourceId: string, orgId: string): Promise<ResourceComment[]>;
  create(entity: ResourceComment): Promise<ResourceComment>;
  update(id: string, patch: Partial<ResourceComment>): Promise<ResourceComment>;
  delete(id: string, orgId: string): Promise<void>;
  markResolved(id: string, resolvedBy: string): Promise<ResourceComment>;
}

export interface ResourceTemplate {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  templateType: 'document' | 'form' | 'checklist' | 'workflow' | 'report';
  content: string;
  variables: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'select';
    required: boolean;
    defaultValue?: any;
    options?: string[];
  }>;
  category: string;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  rating: number;
  ratingCount: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface ResourceTemplateRepository {
  findById(id: string, orgId: string): Promise<ResourceTemplate | null>;
  list(orgId: string, templateType?: string): Promise<ResourceTemplate[]>;
  create(entity: ResourceTemplate): Promise<ResourceTemplate>;
  update(id: string, patch: Partial<ResourceTemplate>): Promise<ResourceTemplate>;
  delete(id: string, orgId: string): Promise<void>;
  incrementUsage(id: string): Promise<void>;
  addRating(id: string, rating: number): Promise<void>;
}

export interface TrainingModule {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  content: string;
  type: 'video' | 'document' | 'interactive' | 'quiz' | 'presentation';
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  learningObjectives: string[];
  category: string;
  tags: string[];
  isRequired: boolean;
  completionCriteria: {
    minScore?: number;
    watchTime?: number;
    interactions?: number;
  };
  certificateTemplate?: string;
  validityPeriod?: number; // in days
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface TrainingModuleRepository {
  findById(id: string, orgId: string): Promise<TrainingModule | null>;
  list(orgId: string, filters?: { category?: string; difficulty?: string; isRequired?: boolean }): Promise<TrainingModule[]>;
  create(entity: TrainingModule): Promise<TrainingModule>;
  update(id: string, patch: Partial<TrainingModule>): Promise<TrainingModule>;
  delete(id: string, orgId: string): Promise<void>;
}

export interface TrainingProgress {
  id: string;
  trainingModuleId: string;
  organizationId: string;
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'expired';
  progress: number; // 0-100
  score?: number;
  startedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  certificateUrl?: string;
  attempts: number;
  timeSpent: number; // in minutes
  lastAccessedAt?: string;
}

export interface TrainingProgressRepository {
  findByModuleAndUser(moduleId: string, userId: string, orgId: string): Promise<TrainingProgress | null>;
  findByUserId(userId: string, orgId: string): Promise<TrainingProgress[]>;
  findByModuleId(moduleId: string, orgId: string): Promise<TrainingProgress[]>;
  create(entity: TrainingProgress): Promise<TrainingProgress>;
  update(id: string, patch: Partial<TrainingProgress>): Promise<TrainingProgress>;
  updateProgress(id: string, progress: number, timeSpent: number): Promise<TrainingProgress>;
  markCompleted(id: string, score?: number, certificateUrl?: string): Promise<TrainingProgress>;
}
