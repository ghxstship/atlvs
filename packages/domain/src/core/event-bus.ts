export class EventBus {
  async publish(event: string, data: any): Promise<void> {
    console.log(`[EVENT] ${event}:`, data);
  }
}
