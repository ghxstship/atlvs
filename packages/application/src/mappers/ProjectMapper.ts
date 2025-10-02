/**
 * Project Mapper
 * Maps between Domain entities and DTOs
 */

import { Project, type ProjectStatus, type ProjectPriority, type ProjectType } from '@ghxstship/domain';
import { ProjectDTO } from '../dtos/projects';

export class ProjectMapper {
  public static toDTO(project: Project): ProjectDTO {
    return {
      id: project.id.toString(),
      organizationId: project.organizationId,
      name: project.name,
      status: project.status,
      progress: project.progress,
      description: project['props'].description,
      priority: project.priority,
      type: project.type,
      isArchived: project.isArchived,
      createdAt: project['props'].createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: project['props'].updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  public static toDomain(dto: Partial<ProjectDTO>, id?: string): Project {
    const result = Project.create({
      organizationId: dto.organizationId!,
      name: dto.name!,
      description: dto.description,
      status: (dto.status || 'planning') as ProjectStatus,
      priority: (dto.priority || 'medium') as ProjectPriority,
      type: (dto.type || 'internal') as ProjectType,
      progress: dto.progress || 0,
      isArchived: dto.isArchived || false,
      visibility: 'team',
    }, id);

    if (!result.ok) {
      throw new Error(`Failed to create Project domain entity: ${result.error}`);
    }

    return result.value;
  }
}
