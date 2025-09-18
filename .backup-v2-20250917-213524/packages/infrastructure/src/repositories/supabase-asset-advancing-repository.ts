import { createClient } from '@supabase/supabase-js';
import { 
  AssetAdvancing,
  AssetAdvancingRepository,
  AssetAdvancingFilters
} from '@ghxstship/domain';

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
    const { data, error } = await (this.supabase as any)
      .from('asset_advancing')
      .insert(this.mapFromAssetAdvancing(advancing))
      .select()
      .single();

    if (error) throw error;
    return this.mapToAssetAdvancing(data);
  }

  async update(id: string, organizationId: string, updates: Partial<AssetAdvancing>): Promise<AssetAdvancing> {
    const { data, error } = await (this.supabase as any)
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
