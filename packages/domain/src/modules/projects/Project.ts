import type { UUID } from '../../core/Identifier';
import { AggregateRoot } from '../../shared/kernel/AggregateRoot';
import { UniqueEntityID } from '../../core/Identifier';
import { Result } from '../../core/Result';
import { randomUUID } from 'crypto';

export type CurrencyCode = string; // ISO 4217

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type ProjectType = 'internal' | 'client' | 'maintenance' | 'research' | 'development';
export type ProjectVisibility = 'public' | 'private' | 'team' | 'client';

// Data structure interface (for persistence/DTOs)
export interface IProject {
  id: UUID;
  organizationId: UUID;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  type: ProjectType;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  actualStartDate?: string;
  actualEndDate?: string;
  budget?: number;
  budgetCurrency?: CurrencyCode;
  actualCost?: number;
  progress: number; // 0-100
  clientId?: UUID;
  managerId?: UUID;
  teamMembers?: UUID[];
  tags?: string[];
  location?: string;
  coordinates?: { lat: number; lng: number };
  isArchived: boolean;
  visibility: ProjectVisibility;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy?: UUID;
  updatedBy?: UUID;
}

// Props for creating/updating a Project entity
export interface ProjectProps {
  organizationId: UUID;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  type: ProjectType;
  startDate?: string;
  endDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  budget?: number;
  budgetCurrency?: CurrencyCode;
  actualCost?: number;
  progress: number;
  clientId?: UUID;
  managerId?: UUID;
  teamMembers?: UUID[];
  tags?: string[];
  location?: string;
  coordinates?: { lat: number; lng: number };
  isArchived: boolean;
  visibility: ProjectVisibility;
  meta?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: UUID;
  updatedBy?: UUID;
}

/**
 * Project Domain Entity
 * Aggregate Root for the Projects bounded context
 */
export class Project extends AggregateRoot<ProjectProps> {
  private constructor(id: UniqueEntityID, props: ProjectProps) {
    super(id, props);
  }

  /**
   * Factory method to create or rehydrate a Project aggregate
   */
  public static create(props: ProjectProps, id?: UUID): Result<Project, string> {
    // Validation
    if (!props.name || props.name.trim().length === 0) {
      return Result.err('Project name is required');
    }

    if (!props.organizationId) {
      return Result.err('Organization ID is required');
    }

    if (props.progress < 0 || props.progress > 100) {
      return Result.err('Progress must be between 0 and 100');
    }

    const projectId = id ? new UniqueEntityID(id) : new UniqueEntityID(randomUUID());
    const now = new Date();

    const projectProps: ProjectProps = {
      ...props,
      name: props.name.trim(),
      progress: props.progress ?? 0,
      status: props.status ?? 'planning',
      priority: props.priority ?? 'medium',
      type: props.type ?? 'internal',
      visibility: props.visibility ?? 'team',
      isArchived: props.isArchived ?? false,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    };

    const project = new Project(projectId, projectProps);
    return Result.ok(project);
  }

  // Getters
  get organizationId(): UUID {
    return this.props.organizationId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get status(): ProjectStatus {
    return this.props.status;
  }

  get priority(): ProjectPriority {
    return this.props.priority;
  }

  get type(): ProjectType {
    return this.props.type;
  }

  get progress(): number {
    return this.props.progress;
  }

  get isArchived(): boolean {
    return this.props.isArchived;
  }

  get visibility(): ProjectVisibility {
    return this.props.visibility;
  }

  get budget(): number | undefined {
    return this.props.budget;
  }

  get budgetCurrency(): CurrencyCode | undefined {
    return this.props.budgetCurrency;
  }

  get startDate(): string | undefined {
    return this.props.startDate;
  }

  get endDate(): string | undefined {
    return this.props.endDate;
  }

  get actualStartDate(): string | undefined {
    return this.props.actualStartDate;
  }

  get actualEndDate(): string | undefined {
    return this.props.actualEndDate;
  }

  get createdBy(): UUID | undefined {
    return this.props.createdBy;
  }

  get updatedBy(): UUID | undefined {
    return this.props.updatedBy;
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  get tags(): string[] | undefined {
    return this.props.tags;
  }

  get meta(): Record<string, any> | undefined {
    return this.props.meta;
  }

  // Business methods
  public updateProgress(progress: number): Result<void, string> {
    if (progress < 0 || progress > 100) {
      return Result.err('Progress must be between 0 and 100');
    }

    this.props.progress = progress;
    this.props.updatedAt = new Date();

    // Auto-complete if progress reaches 100
    if (progress === 100 && this.props.status !== 'completed') {
      this.props.status = 'completed';
      this.props.actualEndDate = new Date().toISOString();
    }

    return Result.ok(undefined);
  }

  public updateStatus(status: ProjectStatus): Result<void, string> {
    const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      planning: ['active', 'cancelled'],
      active: ['on_hold', 'completed', 'cancelled'],
      on_hold: ['active', 'cancelled'],
      completed: [], // Cannot transition from completed
      cancelled: [], // Cannot transition from cancelled
    };

    if (!validTransitions[this.props.status].includes(status)) {
      return Result.err(`Cannot transition from ${this.props.status} to ${status}`);
    }

    this.props.status = status;
    this.props.updatedAt = new Date();

    if (status === 'active' && !this.props.actualStartDate) {
      this.props.actualStartDate = new Date().toISOString();
    }

    if (status === 'completed' && !this.props.actualEndDate) {
      this.props.actualEndDate = new Date().toISOString();
    }

    return Result.ok(undefined);
  }

  public archive(): void {
    this.props.isArchived = true;
    this.props.updatedAt = new Date();
  }

  public unarchive(): void {
    this.props.isArchived = false;
    this.props.updatedAt = new Date();
  }

  public updateDetails(updates: Partial<Pick<ProjectProps, 'name' | 'description' | 'priority' | 'type'>>): Result<void, string> {
    if (updates.name !== undefined) {
      if (!updates.name || updates.name.trim().length === 0) {
        return Result.err('Project name cannot be empty');
      }
      this.props.name = updates.name.trim();
    }

    if (updates.description !== undefined) {
      this.props.description = updates.description;
    }

    if (updates.priority !== undefined) {
      this.props.priority = updates.priority;
    }

    if (updates.type !== undefined) {
      this.props.type = updates.type;
    }

    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }
}

export interface ProjectTask {
  id: UUID;
  projectId: UUID;
  organizationId: UUID;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeId?: UUID;
  reporterId?: UUID;
  parentTaskId?: UUID;
  estimatedHours?: number;
  actualHours?: number;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  tags?: string[];
  dependencies?: UUID[];
  attachments?: string[];
  comments?: ProjectTaskComment[];
  position: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: UUID;
  updatedBy?: UUID;
}

export interface ProjectTaskComment {
  id: UUID;
  taskId: UUID;
  organizationId: UUID;
  content: string;
  authorId: UUID;
  parentCommentId?: UUID;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMilestone {
  id: UUID;
  projectId: UUID;
  organizationId: UUID;
  title: string;
  description?: string;
  dueDate: string;
  completedAt?: string;
  status: 'pending' | 'completed' | 'overdue';
  progress: number;
  dependencies?: UUID[];
  createdAt: string;
  updatedAt: string;
  createdBy?: UUID;
  updatedBy?: UUID;
}

export interface ProjectRisk {
  id: UUID;
  projectId: UUID;
  organizationId: UUID;
  title: string;
  description: string;
  category: 'technical' | 'financial' | 'operational' | 'legal' | 'environmental' | 'safety';
  probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  impact: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  riskScore: number; // calculated from probability * impact
  status: 'identified' | 'assessed' | 'mitigated' | 'closed';
  ownerId?: UUID;
  mitigationPlan?: string;
  contingencyPlan?: string;
  identifiedDate: string;
  reviewDate?: string;
  closedDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: UUID;
  updatedBy?: UUID;
}

export interface ProjectFile {
  id: UUID;
  projectId: UUID;
  organizationId: UUID;
  name: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  category: 'document' | 'image' | 'video' | 'audio' | 'drawing' | 'specification' | 'report' | 'other';
  version: string;
  isLatest: boolean;
  uploadedBy: UUID;
  tags?: string[];
  accessLevel: 'public' | 'team' | 'restricted';
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInspection {
  id: UUID;
  projectId: UUID;
  organizationId: UUID;
  title: string;
  description?: string;
  type: 'safety' | 'quality' | 'compliance' | 'progress' | 'final';
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  scheduledDate: string;
  completedDate?: string;
  inspectorId: UUID;
  location?: string;
  findings?: string;
  recommendations?: string;
  score?: number;
  isPassed: boolean;
  followUpRequired: boolean;
  followUpDate?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: UUID;
  updatedBy?: UUID;
}

export interface ProjectActivation {
  id: UUID;
  projectId: UUID;
  organizationId: UUID;
  title: string;
  description?: string;
  type: 'kickoff' | 'phase_start' | 'milestone' | 'delivery' | 'closure';
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  scheduledDate: string;
  actualDate?: string;
  duration?: number; // in minutes
  location?: string;
  attendees?: UUID[];
  agenda?: string;
  notes?: string;
  outcomes?: string;
  actionItems?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: UUID;
  updatedBy?: UUID;
}

export interface ProjectTimeEntry {
  id: UUID;
  projectId: UUID;
  taskId?: UUID;
  organizationId: UUID;
  userId: UUID;
  description?: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  billableRate?: number;
  isBillable: boolean;
  isApproved: boolean;
  approvedBy?: UUID;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Repository Interfaces
// import type { BaseRepository } from '../../repositories/BaseRepository';

export interface ProjectRepository {
  findByManager(managerId: UUID, context: { organizationId: UUID }): Promise<Project[]>;
  findByTeamMember(userId: UUID, context: { organizationId: UUID }): Promise<Project[]>;
  findByClient(clientId: UUID, context: { organizationId: UUID }): Promise<Project[]>;
}

export interface TaskRepository {
  findByProject(projectId: string): Promise<ProjectTask[]>;
  findByAssignee(assigneeId: string): Promise<ProjectTask[]>;
  findByStatus(status: ProjectTask['status']): Promise<ProjectTask[]>;
}

export interface TimeEntryRepository {
  findByProject(projectId: string): Promise<ProjectTimeEntry[]>;
  findByUser(userId: string): Promise<ProjectTimeEntry[]>;
  findByDateRange(startDate: string, endDate: string): Promise<ProjectTimeEntry[]>;
}

export interface ProjectTaskRepository {
  create(task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>, context: { organizationId: UUID }): Promise<ProjectTask>;
  findById(id: UUID, context: { organizationId: UUID }): Promise<ProjectTask | null>;
  findByProject(projectId: UUID, context: { organizationId: UUID }): Promise<ProjectTask[]>;
  findByAssignee(assigneeId: UUID, context: { organizationId: UUID }): Promise<ProjectTask[]>;
  update(id: UUID, updates: Partial<ProjectTask>, context: { organizationId: UUID }): Promise<ProjectTask>;
  delete(id: UUID, context: { organizationId: UUID }): Promise<void>;
  updatePosition(id: UUID, position: number, context: { organizationId: UUID }): Promise<void>;
  findSubtasks(parentTaskId: UUID, context: { organizationId: UUID }): Promise<ProjectTask[]>;
}

export interface ProjectMilestoneRepository {
  create(milestone: Omit<ProjectMilestone, 'id' | 'createdAt' | 'updatedAt'>, context: { organizationId: UUID }): Promise<ProjectMilestone>;
  findById(id: UUID, context: { organizationId: UUID }): Promise<ProjectMilestone | null>;
  findByProject(projectId: UUID, context: { organizationId: UUID }): Promise<ProjectMilestone[]>;
  update(id: UUID, updates: Partial<ProjectMilestone>, context: { organizationId: UUID }): Promise<ProjectMilestone>;
  delete(id: UUID, context: { organizationId: UUID }): Promise<void>;
  findUpcoming(context: { organizationId: UUID }): Promise<ProjectMilestone[]>;
}

export interface ProjectRiskRepository {
  create(risk: Omit<ProjectRisk, 'id' | 'createdAt' | 'updatedAt'>, context: { organizationId: UUID }): Promise<ProjectRisk>;
  findById(id: UUID, context: { organizationId: UUID }): Promise<ProjectRisk | null>;
  findByProject(projectId: UUID, context: { organizationId: UUID }): Promise<ProjectRisk[]>;
  update(id: UUID, updates: Partial<ProjectRisk>, context: { organizationId: UUID }): Promise<ProjectRisk>;
  delete(id: UUID, context: { organizationId: UUID }): Promise<void>;
  findByStatus(status: ProjectRisk['status'], context: { organizationId: UUID }): Promise<ProjectRisk[]>;
  findHighRisk(context: { organizationId: UUID }): Promise<ProjectRisk[]>;
}

export interface ProjectFileRepository {
  create(file: Omit<ProjectFile, 'id' | 'createdAt' | 'updatedAt'>, context: { organizationId: UUID }): Promise<ProjectFile>;
  findById(id: UUID, context: { organizationId: UUID }): Promise<ProjectFile | null>;
  findByProject(projectId: UUID, context: { organizationId: UUID }): Promise<ProjectFile[]>;
  update(id: UUID, updates: Partial<ProjectFile>, context: { organizationId: UUID }): Promise<ProjectFile>;
  delete(id: UUID, context: { organizationId: UUID }): Promise<void>;
  findByCategory(category: ProjectFile['category'], context: { organizationId: UUID }): Promise<ProjectFile[]>;
}

export interface ProjectInspectionRepository {
  create(inspection: Omit<ProjectInspection, 'id' | 'createdAt' | 'updatedAt'>, context: { organizationId: UUID }): Promise<ProjectInspection>;
  findById(id: UUID, context: { organizationId: UUID }): Promise<ProjectInspection | null>;
  findByProject(projectId: UUID, context: { organizationId: UUID }): Promise<ProjectInspection[]>;
  update(id: UUID, updates: Partial<ProjectInspection>, context: { organizationId: UUID }): Promise<ProjectInspection>;
  delete(id: UUID, context: { organizationId: UUID }): Promise<void>;
  findByInspector(inspectorId: UUID, context: { organizationId: UUID }): Promise<ProjectInspection[]>;
  findUpcoming(context: { organizationId: UUID }): Promise<ProjectInspection[]>;
}

export interface ProjectActivationRepository {
  create(activation: Omit<ProjectActivation, 'id' | 'createdAt' | 'updatedAt'>, context: { organizationId: UUID }): Promise<ProjectActivation>;
  findById(id: UUID, context: { organizationId: UUID }): Promise<ProjectActivation | null>;
  findByProject(projectId: UUID, context: { organizationId: UUID }): Promise<ProjectActivation[]>;
  update(id: UUID, updates: Partial<ProjectActivation>, context: { organizationId: UUID }): Promise<ProjectActivation>;
  delete(id: UUID, context: { organizationId: UUID }): Promise<void>;
  findUpcoming(context: { organizationId: UUID }): Promise<ProjectActivation[]>;
}

export interface ProjectTimeEntryRepository {
  create(entry: Omit<ProjectTimeEntry, 'id' | 'createdAt' | 'updatedAt'>, context: { organizationId: UUID }): Promise<ProjectTimeEntry>;
  findById(id: UUID, context: { organizationId: UUID }): Promise<ProjectTimeEntry | null>;
  findByProject(projectId: UUID, context: { organizationId: UUID }): Promise<ProjectTimeEntry[]>;
  findByUser(userId: UUID, context: { organizationId: UUID }): Promise<ProjectTimeEntry[]>;
  update(id: UUID, updates: Partial<ProjectTimeEntry>, context: { organizationId: UUID }): Promise<ProjectTimeEntry>;
  delete(id: UUID, context: { organizationId: UUID }): Promise<void>;
  findByDateRange(startDate: string, endDate: string, context: { organizationId: UUID }): Promise<ProjectTimeEntry[]>;
}
