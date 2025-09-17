export interface AssetAdvancing {
  id: string;
  organizationId: string;
  projectId?: string;
  assetId?: string;
  title: string;
  description?: string;
  category: AssetAdvancingCategory;
  priority: AssetAdvancingPriority;
  status: AssetAdvancingStatus;
  requestedBy: string;
  assignedTo?: string;
  vendorId?: string;
  estimatedCost?: number;
  actualCost?: number;
  requestedDate: Date;
  requiredDate?: Date;
  completedDate?: Date;
  location?: string;
  specifications?: Record<string, any>;
  attachments?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export type AssetAdvancingCategory = 
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

export type AssetAdvancingPriority = 'low' | 'medium' | 'high' | 'urgent';

export type AssetAdvancingStatus = 
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface AssetAdvancingRepository {
  findById(id: string, organizationId: string): Promise<AssetAdvancing | null>;
  findByOrganization(organizationId: string, filters?: AssetAdvancingFilters): Promise<AssetAdvancing[]>;
  create(advancing: Omit<AssetAdvancing, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetAdvancing>;
  update(id: string, organizationId: string, updates: Partial<AssetAdvancing>): Promise<AssetAdvancing>;
  delete(id: string, organizationId: string): Promise<void>;
  findByProject(organizationId: string, projectId: string): Promise<AssetAdvancing[]>;
  findByStatus(organizationId: string, status: AssetAdvancingStatus): Promise<AssetAdvancing[]>;
  findByAssignee(organizationId: string, assignedTo: string): Promise<AssetAdvancing[]>;
  search(organizationId: string, query: string): Promise<AssetAdvancing[]>;
}

export interface AssetAdvancingFilters {
  category?: AssetAdvancingCategory;
  priority?: AssetAdvancingPriority;
  status?: AssetAdvancingStatus;
  projectId?: string;
  assignedTo?: string;
  requestedBy?: string;
  vendorId?: string;
  search?: string;
}
