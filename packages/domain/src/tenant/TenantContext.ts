export interface TenantContext {
  organizationId: string;
  userId: string;
  roles: string[];
  permissions: string[];
}

export class TenantContextManager {
  private static instance: TenantContextManager;
  private context: TenantContext | null = null;

  static getInstance(): TenantContextManager {
    if (!TenantContextManager.instance) {
      TenantContextManager.instance = new TenantContextManager();
    }
    return TenantContextManager.instance;
  }

  setContext(context: TenantContext): void {
    this.context = context;
  }

  getContext(): TenantContext | null {
    return this.context;
  }

  clearContext(): void {
    this.context = null;
  }
}
