/**
 * Query Pattern - CQRS
 * Represents read operations
 */

import { Result } from '@ghxstship/domain';

export interface IQuery {
  readonly userId: string;
  readonly organizationId: string;
}

export interface IQueryHandler<TQuery extends IQuery, TResult> {
  execute(query: TQuery): Promise<Result<TResult>>;
}
