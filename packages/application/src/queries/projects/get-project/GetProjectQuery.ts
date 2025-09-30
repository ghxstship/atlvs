/**
 * GetProject Query
 */

import { IQuery } from '../../../types';

export class GetProjectQuery implements IQuery {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
    public readonly organizationId: string
  ) {}
}
