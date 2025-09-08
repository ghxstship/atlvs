import { createClient } from '@supabase/supabase-js';
import { 
  Asset, 
  AssetRepository, 
  AssetFilters,
  AssetAdvancing,
  AssetAdvancingRepository,
  AssetAdvancingFilters,
  AssetAssignment,
  AssetAssignmentRepository,
  AssetAssignmentFilters,
  AssetTracking,
  AssetTrackingRepository,
  AssetTrackingFilters,
  AssetMaintenance,
  AssetMaintenanceRepository,
  AssetMaintenanceFilters,
  AssetReport,
  AssetReportRepository,
  AssetReportFilters,
  AssetAnalytics,
  AssetReportParameters
} from '@ghxstship/domain';

export class SupabaseAssetsRepository implements AssetRepository {
  constructor(private readonly supabase: ReturnType<typeof createClient>) {}

  async findById(id: string, organizationId: string): Promise<Asset | null> {
    const { data, error } = await this.supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) throw error;
    return data ? this.mapToAsset(data) : null;
  }

  async findByOrganization(organizationId: string, filters?: AssetFilters): Promise<Asset[]> {
    let query = this.supabase
      .from('assets')
      .select('*')
      .eq('organization_id', organizationId);

    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.condition) query = query.eq('condition', filters.condition);
    if (filters?.assignedTo) query = query.eq('assigned_to', filters.assignedTo);
    if (filters?.location) query = query.eq('location', filters.location);
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data?.map(this.mapToAsset) || [];
  }

  async create(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> {
    const { data, error } = await this.supabase
      .from('assets')
      .insert(this.mapFromAsset(asset))
      .select()
      .single();

    if (error) throw error;
    return this.mapToAsset(data);
  }

  async update(id: string, organizationId: string, updates: Partial<Asset>): Promise<Asset> {
    const { data, error } = await this.supabase
      .from('assets')
      .update(this.mapFromAsset(updates))
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return this.mapToAsset(data);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('assets')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) throw error;
  }

  async findByCategory(organizationId: string, category: any): Promise<Asset[]> {
    const { data, error } = await this.supabase
      .from('assets')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('category', category);

    if (error) throw error;
    return data?.map(this.mapToAsset) || [];
  }

  async findByStatus(organizationId: string, status: any): Promise<Asset[]> {
    const { data, error } = await this.supabase
      .from('assets')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', status);

    if (error) throw error;
    return data?.map(this.mapToAsset) || [];
  }

  async findByAssignee(organizationId: string, assignedTo: string): Promise<Asset[]> {
    const { data, error } = await this.supabase
      .from('assets')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('assigned_to', assignedTo);

    if (error) throw error;
    return data?.map(this.mapToAsset) || [];
  }

  async search(organizationId: string, query: string): Promise<Asset[]> {
    const { data, error } = await this.supabase
      .from('assets')
      .select('*')
      .eq('organization_id', organizationId)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%`);

    if (error) throw error;
    return data?.map(this.mapToAsset) || [];
  }

  private mapToAsset(data: any): Asset {
    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      description: data.description,
      category: data.category,
      type: data.type,
      status: data.status,
      sku: data.sku,
      serialNumber: data.serial_number,
      currentValue: data.current_value,
      purchaseValue: data.purchase_value,
      purchaseDate: data.purchase_date ? new Date(data.purchase_date) : undefined,
      location: data.location,
      assignedTo: data.assigned_to,
      assignedToType: data.assigned_to_type,
      condition: data.condition,
      warrantyExpiry: data.warranty_expiry ? new Date(data.warranty_expiry) : undefined,
      lastMaintenanceDate: data.last_maintenance_date ? new Date(data.last_maintenance_date) : undefined,
      nextMaintenanceDate: data.next_maintenance_date ? new Date(data.next_maintenance_date) : undefined,
      tags: data.tags,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
      updatedBy: data.updated_by
    };
  }

  private mapFromAsset(asset: Partial<Asset>): any {
    return {
      organization_id: asset.organizationId,
      name: asset.name,
      description: asset.description,
      category: asset.category,
      type: asset.type,
      status: asset.status,
      sku: asset.sku,
      serial_number: asset.serialNumber,
      current_value: asset.currentValue,
      purchase_value: asset.purchaseValue,
      purchase_date: asset.purchaseDate?.toISOString(),
      location: asset.location,
      assigned_to: asset.assignedTo,
      assigned_to_type: asset.assignedToType,
      condition: asset.condition,
      warranty_expiry: asset.warrantyExpiry?.toISOString(),
      last_maintenance_date: asset.lastMaintenanceDate?.toISOString(),
      next_maintenance_date: asset.nextMaintenanceDate?.toISOString(),
      tags: asset.tags,
      notes: asset.notes,
      created_by: asset.createdBy,
      updated_by: asset.updatedBy
    };
  }
}

export class SupabaseAssetAdvancingRepository implements AssetAdvancingRepository {
  constructor(private readonly supabase: ReturnType<typeof createClient>) {}

  async findById(id: string, organizationId: string): Promise<AssetAdvancing | null> {
    const { data, error } = await this.supabase
      .from('asset_advancing')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) throw error;
    return data ? this.mapToAssetAdvancing(data) : null;
  }

  async findByOrganization(organizationId: string, filters?: AssetAdvancingFilters): Promise<AssetAdvancing[]> {
    let query = this.supabase
      .from('asset_advancing')
      .select('*')
      .eq('organization_id', organizationId);

    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.priority) query = query.eq('priority', filters.priority);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.projectId) query = query.eq('project_id', filters.projectId);
    if (filters?.assignedTo) query = query.eq('assigned_to', filters.assignedTo);
    if (filters?.requestedBy) query = query.eq('requested_by', filters.requestedBy);
    if (filters?.vendorId) query = query.eq('vendor_id', filters.vendorId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data?.map(this.mapToAssetAdvancing) || [];
  }

  async create(advancing: Omit<AssetAdvancing, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetAdvancing> {
    const { data, error } = await this.supabase
      .from('asset_advancing')
      .insert(this.mapFromAssetAdvancing(advancing))
      .select()
      .single();

    if (error) throw error;
    return this.mapToAssetAdvancing(data);
  }

  async update(id: string, organizationId: string, updates: Partial<AssetAdvancing>): Promise<AssetAdvancing> {
    const { data, error } = await this.supabase
      .from('asset_advancing')
      .update(this.mapFromAssetAdvancing(updates))
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return this.mapToAssetAdvancing(data);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('asset_advancing')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) throw error;
  }

  async findByProject(organizationId: string, projectId: string): Promise<AssetAdvancing[]> {
    const { data, error } = await this.supabase
      .from('asset_advancing')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('project_id', projectId);

    if (error) throw error;
    return data?.map(this.mapToAssetAdvancing) || [];
  }

  async findByStatus(organizationId: string, status: any): Promise<AssetAdvancing[]> {
    const { data, error } = await this.supabase
      .from('asset_advancing')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', status);

    if (error) throw error;
    return data?.map(this.mapToAssetAdvancing) || [];
  }

  async findByAssignee(organizationId: string, assignedTo: string): Promise<AssetAdvancing[]> {
    const { data, error } = await this.supabase
      .from('asset_advancing')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('assigned_to', assignedTo);

    if (error) throw error;
    return data?.map(this.mapToAssetAdvancing) || [];
  }

  async search(organizationId: string, query: string): Promise<AssetAdvancing[]> {
    const { data, error } = await this.supabase
      .from('asset_advancing')
      .select('*')
      .eq('organization_id', organizationId)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

    if (error) throw error;
    return data?.map(this.mapToAssetAdvancing) || [];
  }

  private mapToAssetAdvancing(data: any): AssetAdvancing {
    return {
      id: data.id,
      organizationId: data.organization_id,
      projectId: data.project_id,
      assetId: data.asset_id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: data.status,
      requestedBy: data.requested_by,
      assignedTo: data.assigned_to,
      vendorId: data.vendor_id,
      estimatedCost: data.estimated_cost,
      actualCost: data.actual_cost,
      requestedDate: new Date(data.requested_date),
      requiredDate: data.required_date ? new Date(data.required_date) : undefined,
      completedDate: data.completed_date ? new Date(data.completed_date) : undefined,
      location: data.location,
      specifications: data.specifications,
      attachments: data.attachments,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
      updatedBy: data.updated_by
    };
  }

  private mapFromAssetAdvancing(advancing: Partial<AssetAdvancing>): any {
    return {
      organization_id: advancing.organizationId,
      project_id: advancing.projectId,
      asset_id: advancing.assetId,
      title: advancing.title,
      description: advancing.description,
      category: advancing.category,
      priority: advancing.priority,
      status: advancing.status,
      requested_by: advancing.requestedBy,
      assigned_to: advancing.assignedTo,
      vendor_id: advancing.vendorId,
      estimated_cost: advancing.estimatedCost,
      actual_cost: advancing.actualCost,
      requested_date: advancing.requestedDate?.toISOString(),
      required_date: advancing.requiredDate?.toISOString(),
      completed_date: advancing.completedDate?.toISOString(),
      location: advancing.location,
      specifications: advancing.specifications,
      attachments: advancing.attachments,
      notes: advancing.notes,
      created_by: advancing.createdBy,
      updated_by: advancing.updatedBy
    };
  }
}
