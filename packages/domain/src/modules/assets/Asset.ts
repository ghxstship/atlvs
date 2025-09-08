export interface Asset {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  category: AssetCategory;
  type: AssetType;
  status: AssetStatus;
  sku?: string;
  serialNumber?: string;
  currentValue?: number;
  purchaseValue?: number;
  purchaseDate?: Date;
  location?: string;
  assignedTo?: string;
  assignedToType?: 'user' | 'project' | 'vendor' | 'partner';
  condition?: AssetCondition;
  warrantyExpiry?: Date;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export type AssetCategory = 
  | 'site_infrastructure'
  | 'site_assets' 
  | 'site_vehicles'
  | 'site_services'
  | 'heavy_machinery'
  | 'it_communication'
  | 'office_admin'
  | 'access_credentials'
  | 'parking'
  | 'travel_lodging'
  | 'artist_technical'
  | 'artist_hospitality'
  | 'artist_travel';

export type AssetType = 'fixed' | 'rentable' | 'service';

export type AssetStatus = 
  | 'available'
  | 'in_use'
  | 'under_maintenance'
  | 'damaged'
  | 'missing'
  | 'retired';

export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';

export interface AssetRepository {
  findById(id: string, organizationId: string): Promise<Asset | null>;
  findByOrganization(organizationId: string, filters?: AssetFilters): Promise<Asset[]>;
  create(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset>;
  update(id: string, organizationId: string, updates: Partial<Asset>): Promise<Asset>;
  delete(id: string, organizationId: string): Promise<void>;
  findByCategory(organizationId: string, category: AssetCategory): Promise<Asset[]>;
  findByStatus(organizationId: string, status: AssetStatus): Promise<Asset[]>;
  findByAssignee(organizationId: string, assignedTo: string): Promise<Asset[]>;
  search(organizationId: string, query: string): Promise<Asset[]>;
}

export interface AssetFilters {
  category?: AssetCategory;
  type?: AssetType;
  status?: AssetStatus;
  condition?: AssetCondition;
  assignedTo?: string;
  location?: string;
  tags?: string[];
  search?: string;
}
