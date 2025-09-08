import type { UUID } from '../../core/Identifier';

export type CurrencyCode = string; // ISO 4217

export interface Project {
  id: UUID;
  organizationId: UUID;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'internal' | 'client' | 'maintenance' | 'research' | 'development';
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
  visibility: 'public' | 'private' | 'team' | 'client';
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy?: UUID;
  updatedBy?: UUID;
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
import type { BaseRepository } from '../../repositories/BaseRepository';

export interface ProjectRepository extends BaseRepository<Project> {
  findByManager(managerId: UUID, context: { organizationId: UUID }): Promise<Project[]>;
  findByTeamMember(userId: UUID, context: { organizationId: UUID }): Promise<Project[]>;
  findByClient(clientId: UUID, context: { organizationId: UUID }): Promise<Project[]>;
}

export interface TaskRepository extends BaseRepository<ProjectTask> {
  findByProject(projectId: string): Promise<ProjectTask[]>;
  findByAssignee(assigneeId: string): Promise<ProjectTask[]>;
  findByStatus(status: ProjectTask['status']): Promise<ProjectTask[]>;
}

export interface RiskRepository extends BaseRepository<ProjectRisk> {
  findByProject(projectId: string): Promise<ProjectRisk[]>;
  findByCategory(category: ProjectRisk['category']): Promise<ProjectRisk[]>;
  findByOwner(ownerId: string): Promise<ProjectRisk[]>;
}

export interface FileRepository extends BaseRepository<ProjectFile> {
  findByProject(projectId: string): Promise<ProjectFile[]>;
  findByCategory(category: ProjectFile['category']): Promise<ProjectFile[]>;
}

export interface InspectionRepository extends BaseRepository<ProjectInspection> {
  findByProject(projectId: string): Promise<ProjectInspection[]>;
  findByInspector(inspectorId: string): Promise<ProjectInspection[]>;
  findByType(type: ProjectInspection['type']): Promise<ProjectInspection[]>;
}

export interface ActivationRepository extends BaseRepository<ProjectActivation> {
  findByProject(projectId: string): Promise<ProjectActivation[]>;
  findByResponsible(responsibleId: string): Promise<ProjectActivation[]>;
  findByType(type: ProjectActivation['type']): Promise<ProjectActivation[]>;
}

export interface TimeEntryRepository extends BaseRepository<ProjectTimeEntry> {
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
