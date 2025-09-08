import { DomainEvent } from './DomainEvent';

export type EventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void;

export interface EventBus {
  publish<T = any>(event: DomainEvent<T>): Promise<void>;
  subscribe(eventName: string, handler: EventHandler): () => void;
}
