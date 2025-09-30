export interface SecuritySetting {
  id: string;
  organizationId: string;
  twoFactorRequired: boolean;
  twoFactorMethods: string[];
  ssoEnabled: boolean;
  ssoProvider?: string;
  ssoConfig?: Record<string, any>;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecial: boolean;
    maxAgeDays?: number;
    historyCount?: number;
  };
  sessionTimeoutMinutes: number;
  ipWhitelist: string[];
  auditRetentionDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecuritySettingCreate {
  organizationId: string;
  twoFactorRequired?: boolean;
  twoFactorMethods?: string[];
  ssoEnabled?: boolean;
  ssoProvider?: string;
  ssoConfig?: Record<string, any>;
  passwordPolicy?: Partial<SecuritySetting['passwordPolicy']>;
  sessionTimeoutMinutes?: number;
  ipWhitelist?: string[];
  auditRetentionDays?: number;
}

export interface SecuritySettingUpdate {
  twoFactorRequired?: boolean;
  twoFactorMethods?: string[];
  ssoEnabled?: boolean;
  ssoProvider?: string;
  ssoConfig?: Record<string, any>;
  passwordPolicy?: Partial<SecuritySetting['passwordPolicy']>;
  sessionTimeoutMinutes?: number;
  ipWhitelist?: string[];
  auditRetentionDays?: number;
}

export interface SecuritySettingFilter {
  organizationId?: string;
  twoFactorRequired?: boolean;
  ssoEnabled?: boolean;
}
