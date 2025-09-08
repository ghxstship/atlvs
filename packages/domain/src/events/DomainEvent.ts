export interface DomainEvent<T = any> {
  name: string;
  occurredAt: string; // ISO 8601
  tenant: {
    organizationId: string;
    projectId?: string;
  };
  actor?: {
    userId: string;
  };
  payload: T;
}
