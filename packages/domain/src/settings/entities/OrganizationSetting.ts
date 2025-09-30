export interface OrganizationSetting {
  id: string;
  organizationId: string;
  key: string;
  value: any;
  category: 'general' | 'branding' | 'locale' | 'features' | 'limits';
  description?: string;
  isPublic: boolean;
  isEditable: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface OrganizationSettingCreate {
  organizationId: string;
  key: string;
  value: any;
  category: 'general' | 'branding' | 'locale' | 'features' | 'limits';
  description?: string;
  isPublic?: boolean;
  isEditable?: boolean;
  createdBy?: string;
}

export interface OrganizationSettingUpdate {
  value?: any;
  description?: string;
  isPublic?: boolean;
  isEditable?: boolean;
  updatedBy?: string;
}

export interface OrganizationSettingFilter {
  organizationId?: string;
  category?: string;
  isPublic?: boolean;
  isEditable?: boolean;
  search?: string;
}
