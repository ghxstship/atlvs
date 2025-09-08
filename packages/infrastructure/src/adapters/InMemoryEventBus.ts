import type { DomainEvent, EventBus, EventHandler } from '@ghxstship/domain';

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    const set = this.handlers.get(event.name);
    if (!set) return;
    for (const h of set) {
      await Promise.resolve(h(event));
    }
  }

  subscribe(eventName: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventName)) this.handlers.set(eventName, new Set());
    this.handlers.get(eventName)!.add(handler);
    return () => this.handlers.get(eventName)?.delete(handler);
  }
}
