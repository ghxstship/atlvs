export interface AssetMaintenance {
  id: string;
  organizationId: string;
  assetId: string;
  type: AssetMaintenanceType;
  priority: AssetMaintenancePriority;
  status: AssetMaintenanceStatus;
  title: string;
  description?: string;
  scheduledDate: Date;
  completedDate?: Date;
  estimatedDuration?: number; // in hours
  actualDuration?: number; // in hours
  estimatedCost?: number;
  actualCost?: number;
  performedBy?: string;
  vendorId?: string;
  location?: string;
  partsUsed?: AssetMaintenancePart[];
  workPerformed?: string;
  nextMaintenanceDate?: Date;
  warrantyImpact?: boolean;
  downtime?: number; // in hours
  attachments?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export type AssetMaintenanceType = 
  | 'preventive'
  | 'corrective'
  | 'predictive'
  | 'emergency'
  | 'calibration'
  | 'inspection'
  | 'cleaning'
  | 'upgrade';

export type AssetMaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

export type AssetMaintenanceStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'overdue'
  | 'on_hold';

export interface AssetMaintenancePart {
  id: string;
  name: string;
  partNumber?: string;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  vendor?: string;
}

export interface AssetMaintenanceRepository {
  findById(id: string, organizationId: string): Promise<AssetMaintenance | null>;
  findByOrganization(organizationId: string, filters?: AssetMaintenanceFilters): Promise<AssetMaintenance[]>;
  create(maintenance: Omit<AssetMaintenance, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetMaintenance>;
  update(id: string, organizationId: string, updates: Partial<AssetMaintenance>): Promise<AssetMaintenance>;
  delete(id: string, organizationId: string): Promise<void>;
  findByAsset(organizationId: string, assetId: string): Promise<AssetMaintenance[]>;
  findByStatus(organizationId: string, status: AssetMaintenanceStatus): Promise<AssetMaintenance[]>;
  findByType(organizationId: string, type: AssetMaintenanceType): Promise<AssetMaintenance[]>;
  findOverdue(organizationId: string): Promise<AssetMaintenance[]>;
  findUpcoming(organizationId: string, days: number): Promise<AssetMaintenance[]>;
  findByPerformer(organizationId: string, performedBy: string): Promise<AssetMaintenance[]>;
}

export interface AssetMaintenanceFilters {
  assetId?: string;
  type?: AssetMaintenanceType;
  priority?: AssetMaintenancePriority;
  status?: AssetMaintenanceStatus;
  performedBy?: string;
  vendorId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  overdue?: boolean;
  search?: string;
}
