/**
 * Base Entity Class - DDD Pattern
 * All domain entities extend this base class
 */

import { Identifier } from '../../core/Identifier';

export abstract class Entity<T> {
  protected readonly _id: Identifier;
  protected readonly props: T;
  
  constructor(id: Identifier, props: T) {
    this._id = id;
    this.props = props;
  }
  
  get id(): Identifier {
    return this._id;
  }
  
  equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }
    
    if (this === entity) {
      return true;
    }
    
    return this._id.equals(entity._id);
  }
}
