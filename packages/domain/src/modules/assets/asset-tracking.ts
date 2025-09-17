export interface AssetTracking {
  id: string;
  organizationId: string;
  assetId: string;
  trackingMethod: AssetTrackingMethod;
  status: AssetTrackingStatus;
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  lastSeenAt: Date;
  lastSeenBy?: string;
  batteryLevel?: number;
  signalStrength?: number;
  temperature?: number;
  humidity?: number;
  notes?: string;
  alerts?: AssetTrackingAlert[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export type AssetTrackingMethod = 
  | 'manual'
  | 'barcode'
  | 'qr_code'
  | 'rfid'
  | 'gps'
  | 'bluetooth'
  | 'wifi';

export type AssetTrackingStatus = 
  | 'active'
  | 'inactive'
  | 'lost_signal'
  | 'low_battery'
  | 'offline';

export interface AssetTrackingAlert {
  id: string;
  type: AssetTrackingAlertType;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export type AssetTrackingAlertType = 
  | 'location_change'
  | 'unauthorized_movement'
  | 'low_battery'
  | 'signal_lost'
  | 'temperature_alert'
  | 'maintenance_due';

export interface AssetTrackingRepository {
  findById(id: string, organizationId: string): Promise<AssetTracking | null>;
  findByOrganization(organizationId: string, filters?: AssetTrackingFilters): Promise<AssetTracking[]>;
  create(tracking: Omit<AssetTracking, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetTracking>;
  update(id: string, organizationId: string, updates: Partial<AssetTracking>): Promise<AssetTracking>;
  delete(id: string, organizationId: string): Promise<void>;
  findByAsset(organizationId: string, assetId: string): Promise<AssetTracking | null>;
  findByLocation(organizationId: string, location: string): Promise<AssetTracking[]>;
  findByStatus(organizationId: string, status: AssetTrackingStatus): Promise<AssetTracking[]>;
  findWithAlerts(organizationId: string): Promise<AssetTracking[]>;
  updateLocation(id: string, organizationId: string, location: string, coordinates?: { latitude: number; longitude: number }): Promise<AssetTracking>;
}

export interface AssetTrackingFilters {
  assetId?: string;
  trackingMethod?: AssetTrackingMethod;
  status?: AssetTrackingStatus;
  location?: string;
  hasAlerts?: boolean;
  search?: string;
}
