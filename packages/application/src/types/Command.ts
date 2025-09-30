/**
 * Command Pattern - CQRS
 * Represents write operations
 */

import { Result } from '@ghxstship/domain';

export interface ICommand {
  readonly timestamp: Date;
  readonly userId: string;
  readonly organizationId: string;
}

export interface ICommandHandler<TCommand extends ICommand, TResult> {
  execute(command: TCommand): Promise<Result<TResult>>;
}
