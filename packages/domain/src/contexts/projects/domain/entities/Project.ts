/**
 * Project Entity - Projects Bounded Context
 * Represents a project in the system
 */

import { AggregateRoot, Identifier } from '../../../../shared/kernel';
import { ProjectCreated } from '../../events/ProjectCreated';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type ProjectType = 'internal' | 'client' | 'maintenance' | 'research' | 'development';
export type ProjectVisibility = 'public' | 'private' | 'team' | 'client';

export interface ProjectProps {
  organizationId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  type: ProjectType;
  startDate?: Date;
  endDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  budget?: number;
  budgetCurrency?: string;
  actualCost?: number;
  progress: number;
  clientId?: string;
  managerId?: string;
  teamMembers?: string[];
  tags?: string[];
  location?: string;
  coordinates?: { lat: number; lng: number };
  isArchived: boolean;
  visibility: ProjectVisibility;
  meta?: Record<string, any>;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Project extends AggregateRoot<ProjectProps> {
  private constructor(id: Identifier, props: ProjectProps) {
    super(id);
    Object.assign(this, { props });
  }

  public static create(props: ProjectProps, id?: Identifier): Project {
    const project = new Project(id || Identifier.create(), {
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
      progress: props.progress || 0,
      isArchived: props.isArchived || false,
      status: props.status || 'planning',
      priority: props.priority || 'medium',
      visibility: props.visibility || 'team',
    });

    if (!id) {
      project.addDomainEvent(new ProjectCreated(project));
    }

    return project;
  }

  // Getters
  get name(): string {
    return this.props.name;
  }

  get status(): ProjectStatus {
    return this.props.status;
  }

  get progress(): number {
    return this.props.progress;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  // Business methods
  public updateProgress(progress: number): void {
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }
    this.props.progress = progress;
    this.props.updatedAt = new Date();
  }

  public updateStatus(status: ProjectStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
    
    if (status === 'completed' && !this.props.actualEndDate) {
      this.props.actualEndDate = new Date();
    }
  }

  public archive(): void {
    this.props.isArchived = true;
    this.props.updatedAt = new Date();
  }

  public unarchive(): void {
    this.props.isArchived = false;
    this.props.updatedAt = new Date();
  }
}
