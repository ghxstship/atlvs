/**
 * Project Mapper
 * Maps between Domain entities and DTOs
 */

import { Project } from '@ghxstship/domain';
import { ProjectDTO } from '../dtos/projects';

export class ProjectMapper {
  public static toDTO(project: Project): ProjectDTO {
    return {
      id: project.id.toString(),
      organizationId: project.organizationId,
      name: project.name,
      status: project.status,
      progress: project.progress,
      description: project.props.description,
      priority: project.props.priority,
      type: project.props.type,
      isArchived: project.props.isArchived,
      createdAt: project.props.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: project.props.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  public static toDomain(dto: Partial<ProjectDTO>): Project {
    return Project.create({
      organizationId: dto.organizationId!,
      name: dto.name!,
      description: dto.description,
      status: dto.status as any,
      priority: dto.priority as any,
      type: dto.type as any,
      progress: dto.progress || 0,
      isArchived: dto.isArchived || false,
      visibility: 'team',
    });
  }
}
