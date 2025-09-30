export interface PermissionMatrix {
  id: string;
  organizationId: string;
  roleId?: string;
  resource: string;
  action: string;
  allowed: boolean;
  conditions: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionMatrixCreate {
  organizationId: string;
  roleId?: string;
  resource: string;
  action: string;
  allowed: boolean;
  conditions?: Record<string, any>;
}

export interface PermissionMatrixUpdate {
  allowed?: boolean;
  conditions?: Record<string, any>;
}

export interface PermissionMatrixFilter {
  organizationId?: string;
  roleId?: string;
  resource?: string;
  action?: string;
  allowed?: boolean;
}

export interface PermissionCheck {
  userId: string;
  organizationId: string;
  resource: string;
  action: string;
  context?: Record<string, any>;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  appliedRules: string[];
}
