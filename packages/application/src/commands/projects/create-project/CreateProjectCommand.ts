/**
 * CreateProject Command
 */

import { ICommand } from '../../../types';

export class CreateProjectCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly organizationId: string,
    public readonly userId: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
