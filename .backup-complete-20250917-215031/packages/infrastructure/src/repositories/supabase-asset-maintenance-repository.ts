import { createClient } from '@supabase/supabase-js';
import { 
  AssetMaintenance,
  AssetMaintenanceRepository,
  AssetMaintenanceFilters
} from '@ghxstship/domain';

export class SupabaseAssetMaintenanceRepository implements AssetMaintenanceRepository {
  constructor(private readonly supabase: ReturnType<typeof createClient>) {}

  async findById(id: string, organizationId: string): Promise<AssetMaintenance | null> {
    const { data, error } = await this.supabase
      .from('asset_maintenance')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) throw error;
    return data ? this.mapToAssetMaintenance(data) : null;
  }

  async findByOrganization(organizationId: string, filters?: AssetMaintenanceFilters): Promise<AssetMaintenance[]> {
    let query = this.supabase
      .from('asset_maintenance')
      .select('*')
      .eq('organization_id', organizationId);

    if (filters?.assetId) query = query.eq('asset_id', filters.assetId);
    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.priority) query = query.eq('priority', filters.priority);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.performedBy) query = query.eq('performed_by', filters.performedBy);
    if (filters?.vendorId) query = query.eq('vendor_id', filters.vendorId);
    if (filters?.dateRange) {
      query = query
        .gte('scheduled_date', filters.dateRange.start.toISOString())
        .lte('scheduled_date', filters.dateRange.end.toISOString());
    }
    if (filters?.overdue) {
      query = query.lt('scheduled_date', new Date().toISOString()).neq('status', 'completed');
    }

    const { data, error } = await query.order('scheduled_date', { ascending: true });
    if (error) throw error;
    return data?.map(this.mapToAssetMaintenance) || [];
  }

  async create(maintenance: Omit<AssetMaintenance, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetMaintenance> {
    const { data, error } = await (this.supabase as any)
      .from('asset_maintenance')
      .insert(this.mapFromAssetMaintenance(maintenance))
      .select()
      .single();

    if (error) throw error;
    return this.mapToAssetMaintenance(data);
  }

  async update(id: string, organizationId: string, updates: Partial<AssetMaintenance>): Promise<AssetMaintenance> {
    const { data, error } = await (this.supabase as any)
      .from('asset_maintenance')
      .update(this.mapFromAssetMaintenance(updates))
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return this.mapToAssetMaintenance(data);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('asset_maintenance')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) throw error;
  }

  async findByAsset(organizationId: string, assetId: string): Promise<AssetMaintenance[]> {
    const { data, error } = await this.supabase
      .from('asset_maintenance')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('asset_id', assetId)
      .order('scheduled_date', { ascending: false });

    if (error) throw error;
    return data?.map(this.mapToAssetMaintenance) || [];
  }

  async findByStatus(organizationId: string, status: any): Promise<AssetMaintenance[]> {
    const { data, error } = await this.supabase
      .from('asset_maintenance')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', status);

    if (error) throw error;
    return data?.map(this.mapToAssetMaintenance) || [];
  }

  async findByType(organizationId: string, type: any): Promise<AssetMaintenance[]> {
    const { data, error } = await this.supabase
      .from('asset_maintenance')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('type', type);

    if (error) throw error;
    return data?.map(this.mapToAssetMaintenance) || [];
  }

  async findOverdue(organizationId: string): Promise<AssetMaintenance[]> {
    const { data, error } = await this.supabase
      .from('asset_maintenance')
      .select('*')
      .eq('organization_id', organizationId)
      .lt('scheduled_date', new Date().toISOString())
      .neq('status', 'completed');

    if (error) throw error;
    return data?.map(this.mapToAssetMaintenance) || [];
  }

  async findUpcoming(organizationId: string, days: number): Promise<AssetMaintenance[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await this.supabase
      .from('asset_maintenance')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('scheduled_date', new Date().toISOString())
      .lte('scheduled_date', futureDate.toISOString())
      .neq('status', 'completed');

    if (error) throw error;
    return data?.map(this.mapToAssetMaintenance) || [];
  }

  async findByPerformer(organizationId: string, performedBy: string): Promise<AssetMaintenance[]> {
    const { data, error } = await this.supabase
      .from('asset_maintenance')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('performed_by', performedBy);

    if (error) throw error;
    return data?.map(this.mapToAssetMaintenance) || [];
  }

  private mapToAssetMaintenance(data: any): AssetMaintenance {
    return {
      id: data.id,
      organizationId: data.organization_id,
      assetId: data.asset_id,
      type: data.type,
      priority: data.priority,
      status: data.status,
      title: data.title,
      description: data.description,
      scheduledDate: new Date(data.scheduled_date),
      completedDate: data.completed_date ? new Date(data.completed_date) : undefined,
      estimatedDuration: data.estimated_duration,
      actualDuration: data.actual_duration,
      estimatedCost: data.estimated_cost,
      actualCost: data.actual_cost,
      performedBy: data.performed_by,
      vendorId: data.vendor_id,
      location: data.location,
      partsUsed: data.parts_used,
      workPerformed: data.work_performed,
      nextMaintenanceDate: data.next_maintenance_date ? new Date(data.next_maintenance_date) : undefined,
      warrantyImpact: data.warranty_impact,
      downtime: data.downtime,
      attachments: data.attachments,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
      updatedBy: data.updated_by
    };
  }

  private mapFromAssetMaintenance(maintenance: Partial<AssetMaintenance>): any {
    return {
      organization_id: maintenance.organizationId,
      asset_id: maintenance.assetId,
      type: maintenance.type,
      priority: maintenance.priority,
      status: maintenance.status,
      title: maintenance.title,
      description: maintenance.description,
      scheduled_date: maintenance.scheduledDate?.toISOString(),
      completed_date: maintenance.completedDate?.toISOString(),
      estimated_duration: maintenance.estimatedDuration,
      actual_duration: maintenance.actualDuration,
      estimated_cost: maintenance.estimatedCost,
      actual_cost: maintenance.actualCost,
      performed_by: maintenance.performedBy,
      vendor_id: maintenance.vendorId,
      location: maintenance.location,
      parts_used: maintenance.partsUsed,
      work_performed: maintenance.workPerformed,
      next_maintenance_date: maintenance.nextMaintenanceDate?.toISOString(),
      warranty_impact: maintenance.warrantyImpact,
      downtime: maintenance.downtime,
      attachments: maintenance.attachments,
      notes: maintenance.notes,
      created_by: maintenance.createdBy,
      updated_by: maintenance.updatedBy
    };
  }
}
