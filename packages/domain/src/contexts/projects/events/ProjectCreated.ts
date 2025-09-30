/**
 * ProjectCreated Domain Event
 */

import { BaseDomainEvent } from '../../../shared/kernel/DomainEvent';
import type { Project } from '../domain/entities/Project';

export class ProjectCreated extends BaseDomainEvent {
  constructor(public readonly project: Project) {
    super();
  }

  getAggregateId(): string {
    return this.project.id.toString();
  }
}
