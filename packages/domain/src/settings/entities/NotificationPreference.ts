export interface NotificationPreference {
  id: string;
  userId: string;
  organizationId?: string;
  channel: 'email' | 'push' | 'in_app' | 'sms' | 'slack';
  category: string;
  enabled: boolean;
  frequency?: 'instant' | 'hourly' | 'daily' | 'weekly' | 'never';
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferenceCreate {
  userId: string;
  organizationId?: string;
  channel: 'email' | 'push' | 'in_app' | 'sms' | 'slack';
  category: string;
  enabled?: boolean;
  frequency?: 'instant' | 'hourly' | 'daily' | 'weekly' | 'never';
  settings?: Record<string, any>;
}

export interface NotificationPreferenceUpdate {
  enabled?: boolean;
  frequency?: 'instant' | 'hourly' | 'daily' | 'weekly' | 'never';
  settings?: Record<string, any>;
}

export interface NotificationPreferenceFilter {
  userId?: string;
  organizationId?: string;
  channel?: string;
  category?: string;
  enabled?: boolean;
}
