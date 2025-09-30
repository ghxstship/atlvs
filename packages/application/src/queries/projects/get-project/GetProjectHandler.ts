/**
 * GetProject Query Handler
 */

import { IQueryHandler } from '../../../types';
import { GetProjectQuery } from './GetProjectQuery';
import { Result } from '@ghxstship/domain';

export interface ProjectDTO {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
}

export class GetProjectHandler implements IQueryHandler<GetProjectQuery, ProjectDTO> {
  async execute(query: GetProjectQuery): Promise<Result<ProjectDTO>> {
    try {
      // In real implementation, fetch from repository
      // const project = await this.projectRepository.findById(query.projectId);
      
      // Mock response
      const projectDTO: ProjectDTO = {
        id: query.projectId,
        name: 'Sample Project',
        description: 'Sample description',
        status: 'active',
        progress: 50,
      };

      return Result.ok(projectDTO);
    } catch (error) {
      return Result.fail(error.message);
    }
  }
}
