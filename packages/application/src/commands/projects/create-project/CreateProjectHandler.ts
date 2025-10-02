/**
 * CreateProject Command Handler
 */

import { ICommandHandler } from '../../../types';
import { CreateProjectCommand } from './CreateProjectCommand';
import { Project } from '@ghxstship/domain';
import { Result } from '@ghxstship/domain';

export class CreateProjectHandler implements ICommandHandler<CreateProjectCommand, string> {
  async execute(command: CreateProjectCommand): Promise<Result<string, Error>> {
    // Create domain entity using factory method
    const projectResult = Project.create({
      name: command.name,
      description: command.description,
      organizationId: command.organizationId,
      status: 'planning',
      priority: 'medium',
      type: 'internal',
      progress: 0,
      isArchived: false,
      visibility: 'team',
      createdBy: command.userId,
    });

    if (!projectResult.ok) {
      return Result.err(new Error(projectResult.error));
    }

    const project = projectResult.value;

    // In real implementation, save to repository
    // await this.projectRepository.save(project);

    return Result.ok(project.id.toString());
  }
}
