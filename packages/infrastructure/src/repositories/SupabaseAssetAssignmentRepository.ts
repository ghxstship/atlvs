import { createClient } from '@supabase/supabase-js';
import { 
  AssetAssignment,
  AssetAssignmentRepository,
  AssetAssignmentFilters
} from '@ghxstship/domain';

export class SupabaseAssetAssignmentRepository implements AssetAssignmentRepository {
  constructor(private readonly supabase: ReturnType<typeof createClient>) {}

  async findById(id: string, organizationId: string): Promise<AssetAssignment | null> {
    const { data, error } = await this.supabase
      .from('asset_assignments')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) throw error;
    return data ? this.mapToAssetAssignment(data) : null;
  }

  async findByOrganization(organizationId: string, filters?: AssetAssignmentFilters): Promise<AssetAssignment[]> {
    let query = this.supabase
      .from('asset_assignments')
      .select('*')
      .eq('organization_id', organizationId);

    if (filters?.assetId) query = query.eq('asset_id', filters.assetId);
    if (filters?.assignedTo) query = query.eq('assigned_to', filters.assignedTo);
    if (filters?.assignedToType) query = query.eq('assigned_to_type', filters.assignedToType);
    if (filters?.projectId) query = query.eq('project_id', filters.projectId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.condition) query = query.eq('condition', filters.condition);
    if (filters?.overdue) {
      query = query.lt('expected_return_date', new Date().toISOString()).eq('status', 'active');
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data?.map(this.mapToAssetAssignment) || [];
  }

  async create(assignment: Omit<AssetAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetAssignment> {
    const { data, error } = await this.supabase
      .from('asset_assignments')
      .insert(this.mapFromAssetAssignment(assignment))
      .select()
      .single();

    if (error) throw error;
    return this.mapToAssetAssignment(data);
  }

  async update(id: string, organizationId: string, updates: Partial<AssetAssignment>): Promise<AssetAssignment> {
    const { data, error } = await this.supabase
      .from('asset_assignments')
      .update(this.mapFromAssetAssignment(updates))
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return this.mapToAssetAssignment(data);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('asset_assignments')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) throw error;
  }

  async findByAsset(organizationId: string, assetId: string): Promise<AssetAssignment[]> {
    const { data, error } = await this.supabase
      .from('asset_assignments')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('asset_id', assetId);

    if (error) throw error;
    return data?.map(this.mapToAssetAssignment) || [];
  }

  async findByAssignee(organizationId: string, assignedTo: string): Promise<AssetAssignment[]> {
    const { data, error } = await this.supabase
      .from('asset_assignments')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('assigned_to', assignedTo);

    if (error) throw error;
    return data?.map(this.mapToAssetAssignment) || [];
  }

  async findByProject(organizationId: string, projectId: string): Promise<AssetAssignment[]> {
    const { data, error } = await this.supabase
      .from('asset_assignments')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('project_id', projectId);

    if (error) throw error;
    return data?.map(this.mapToAssetAssignment) || [];
  }

  async findByStatus(organizationId: string, status: any): Promise<AssetAssignment[]> {
    const { data, error } = await this.supabase
      .from('asset_assignments')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', status);

    if (error) throw error;
    return data?.map(this.mapToAssetAssignment) || [];
  }

  async findOverdue(organizationId: string): Promise<AssetAssignment[]> {
    const { data, error } = await this.supabase
      .from('asset_assignments')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .lt('expected_return_date', new Date().toISOString());

    if (error) throw error;
    return data?.map(this.mapToAssetAssignment) || [];
  }

  private mapToAssetAssignment(data: any): AssetAssignment {
    return {
      id: data.id,
      organizationId: data.organization_id,
      assetId: data.asset_id,
      assignedTo: data.assigned_to,
      assignedToType: data.assigned_to_type,
      assignedBy: data.assigned_by,
      projectId: data.project_id,
      status: data.status,
      condition: data.condition,
      assignedDate: new Date(data.assigned_date),
      expectedReturnDate: data.expected_return_date ? new Date(data.expected_return_date) : undefined,
      actualReturnDate: data.actual_return_date ? new Date(data.actual_return_date) : undefined,
      location: data.location,
      purpose: data.purpose,
      notes: data.notes,
      checkoutNotes: data.checkout_notes,
      checkinNotes: data.checkin_notes,
      damageReported: data.damage_reported,
      damageDescription: data.damage_description,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
      updatedBy: data.updated_by
    };
  }

  private mapFromAssetAssignment(assignment: Partial<AssetAssignment>): any {
    return {
      organization_id: assignment.organizationId,
      asset_id: assignment.assetId,
      assigned_to: assignment.assignedTo,
      assigned_to_type: assignment.assignedToType,
      assigned_by: assignment.assignedBy,
      project_id: assignment.projectId,
      status: assignment.status,
      condition: assignment.condition,
      assigned_date: assignment.assignedDate?.toISOString(),
      expected_return_date: assignment.expectedReturnDate?.toISOString(),
      actual_return_date: assignment.actualReturnDate?.toISOString(),
      location: assignment.location,
      purpose: assignment.purpose,
      notes: assignment.notes,
      checkout_notes: assignment.checkoutNotes,
      checkin_notes: assignment.checkinNotes,
      damage_reported: assignment.damageReported,
      damage_description: assignment.damageDescription,
      created_by: assignment.createdBy,
      updated_by: assignment.updatedBy
    };
  }
}
