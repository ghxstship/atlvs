export interface UserSetting {
  id: string;
  userId: string;
  key: string;
  value: any;
  category: 'preferences' | 'display' | 'privacy' | 'accessibility';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettingCreate {
  userId: string;
  key: string;
  value: any;
  category: 'preferences' | 'display' | 'privacy' | 'accessibility';
}

export interface UserSettingUpdate {
  value?: any;
}

export interface UserSettingFilter {
  userId?: string;
  category?: string;
  search?: string;
}
