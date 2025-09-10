import { createClient } from '@supabase/supabase-js';
import { 
  Asset, 
  AssetRepository, 
  AssetFilters
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
    const { data, error } = await (this.supabase as any)
      .from('assets')
      .insert(this.mapFromAsset(asset))
      .select()
      .single();

    if (error) throw error;
    return this.mapToAsset(data);
  }

  async update(id: string, organizationId: string, updates: Partial<Asset>): Promise<Asset> {
    const { data, error } = await (this.supabase as any)
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

