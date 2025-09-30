/**
 * Domain Event - DDD Pattern
 * Something that happened in the domain
 */

export interface DomainEvent {
  dateTimeOccurred: Date;
  getAggregateId(): string;
}

export abstract class BaseDomainEvent implements DomainEvent {
  public dateTimeOccurred: Date;
  
  constructor() {
    this.dateTimeOccurred = new Date();
  }
  
  abstract getAggregateId(): string;
}
