/**
 * Aggregate Root - DDD Pattern
 * Cluster of entities with clear boundaries
 */

import { Entity } from './Entity';
import { DomainEvent } from './DomainEvent';
import { Identifier } from '../../core/Identifier';

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];
  
  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }
  
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
  
  public clearEvents(): void {
    this._domainEvents = [];
  }
}
