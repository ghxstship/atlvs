export interface CustomRole {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  permissions: Record<string, string[]>;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface CustomRoleCreate {
  organizationId: string;
  name: string;
  description?: string;
  permissions: Record<string, string[]>;
  createdBy?: string;
}

export interface CustomRoleUpdate {
  name?: string;
  description?: string;
  permissions?: Record<string, string[]>;
}

export interface CustomRoleFilter {
  organizationId?: string;
  isSystem?: boolean;
  search?: string;
}
