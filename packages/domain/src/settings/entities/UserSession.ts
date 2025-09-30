export interface UserSession {
  id: string;
  userId: string;
  organizationId?: string;
  tokenHash: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: Record<string, any>;
  location?: {
    country?: string;
    city?: string;
    region?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  isActive: boolean;
  expiresAt: Date;
  lastActivityAt: Date;
  createdAt: Date;
}

export interface UserSessionCreate {
  userId: string;
  organizationId?: string;
  tokenHash: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: Record<string, any>;
  location?: UserSession['location'];
  expiresAt: Date;
}

export interface UserSessionUpdate {
  isActive?: boolean;
  lastActivityAt?: Date;
  location?: UserSession['location'];
}

export interface UserSessionFilter {
  userId?: string;
  organizationId?: string;
  isActive?: boolean;
  ipAddress?: string;
}
