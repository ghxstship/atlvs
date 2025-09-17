import { createClient } from '@supabase/supabase-js';
import { 
  AssetReport,
  AssetReportRepository,
  AssetReportFilters,
  AssetAnalytics,
  AssetReportParameters
} from '@ghxstship/domain';

export class SupabaseAssetReportRepository implements AssetReportRepository {
  constructor(private readonly supabase: ReturnType<typeof createClient>) {}

  async findById(id: string, organizationId: string): Promise<AssetReport | null> {
    const { data, error } = await this.supabase
      .from('asset_reports')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) throw error;
    return data ? this.mapToAssetReport(data) : null;
  }

  async findByOrganization(organizationId: string, filters?: AssetReportFilters): Promise<AssetReport[]> {
    let query = this.supabase
      .from('asset_reports')
      .select('*')
      .eq('organization_id', organizationId);

    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.generatedBy) query = query.eq('generated_by', filters.generatedBy);
    if (filters?.dateRange) {
      query = query
        .gte('generated_at', filters.dateRange.start.toISOString())
        .lte('generated_at', filters.dateRange.end.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data?.map(this.mapToAssetReport) || [];
  }

  async create(report: Omit<AssetReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetReport> {
    const { data, error } = await (this.supabase as any)
      .from('asset_reports')
      .insert(this.mapFromAssetReport(report))
      .select()
      .single();

    if (error) throw error;
    return this.mapToAssetReport(data);
  }

  async update(id: string, organizationId: string, updates: Partial<AssetReport>): Promise<AssetReport> {
    const { data, error } = await (this.supabase as any)
      .from('asset_reports')
      .update(this.mapFromAssetReport(updates))
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return this.mapToAssetReport(data);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('asset_reports')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) throw error;
  }

  async findByType(organizationId: string, type: any): Promise<AssetReport[]> {
    const { data, error } = await this.supabase
      .from('asset_reports')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('type', type);

    if (error) throw error;
    return data?.map(this.mapToAssetReport) || [];
  }

  async findByStatus(organizationId: string, status: any): Promise<AssetReport[]> {
    const { data, error } = await this.supabase
      .from('asset_reports')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', status);

    if (error) throw error;
    return data?.map(this.mapToAssetReport) || [];
  }

  async findScheduled(organizationId: string): Promise<AssetReport[]> {
    const { data, error } = await this.supabase
      .from('asset_reports')
      .select('*')
      .eq('organization_id', organizationId)
      .not('scheduled_generation', 'is', null);

    if (error) throw error;
    return data?.map(this.mapToAssetReport) || [];
  }

  async generateAnalytics(organizationId: string, parameters: AssetReportParameters): Promise<AssetAnalytics> {
    // This would typically involve complex queries across multiple tables
    // For now, returning mock analytics data structure
    const { data: assets } = await this.supabase
      .from('assets')
      .select('*')
      .eq('organization_id', organizationId);

    const { data: assignments } = await this.supabase
      .from('asset_assignments')
      .select('*')
      .eq('organization_id', organizationId);

    const { data: maintenance } = await this.supabase
      .from('asset_maintenance')
      .select('*')
      .eq('organization_id', organizationId);

    const assetsArr = (assets ?? []) as any[];
    const assignmentsArr = (assignments ?? []) as any[];
    const maintenanceArr = (maintenance ?? []) as any[];

    const totalAssets = assetsArr.length || 0;
    const totalValue = assetsArr.reduce((sum: number, asset: any) => sum + (asset.current_value || 0), 0) || 0;
    const activeAssignments = assignmentsArr.filter((a: any) => a.status === 'active').length || 0;
    const utilizationRate = totalAssets > 0 ? (activeAssignments / totalAssets) * 100 : 0;
    const maintenanceCosts = maintenanceArr.reduce((sum: number, m: any) => sum + (m.actual_cost || m.estimated_cost || 0), 0) || 0;

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    assetsArr.forEach((asset: any) => {
      categoryBreakdown[asset.category] = (categoryBreakdown[asset.category] || 0) + 1;
    });

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    assetsArr.forEach((asset: any) => {
      statusBreakdown[asset.status] = (statusBreakdown[asset.status] || 0) + 1;
    });

    // Location breakdown
    const locationBreakdown: Record<string, number> = {};
    assetsArr.forEach((asset: any) => {
      if (asset.location) {
        locationBreakdown[asset.location] = (locationBreakdown[asset.location] || 0) + 1;
      }
    });

    return {
      totalAssets,
      totalValue,
      utilizationRate,
      maintenanceCosts,
      depreciationRate: 5.0, // Mock value
      categoryBreakdown,
      statusBreakdown,
      locationBreakdown,
      trends: [] // Mock empty trends for now
    };
  }

  private mapToAssetReport(data: any): AssetReport {
    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      description: data.description,
      type: data.type,
      format: data.format,
      status: data.status,
      parameters: data.parameters,
      generatedAt: data.generated_at ? new Date(data.generated_at) : undefined,
      generatedBy: data.generated_by,
      fileUrl: data.file_url,
      fileSize: data.file_size,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      scheduledGeneration: data.scheduled_generation,
      recipients: data.recipients,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
      updatedBy: data.updated_by
    };
  }

  private mapFromAssetReport(report: Partial<AssetReport>): any {
    return {
      organization_id: report.organizationId,
      name: report.name,
      description: report.description,
      type: report.type,
      format: report.format,
      status: report.status,
      parameters: report.parameters,
      generated_at: report.generatedAt?.toISOString(),
      generated_by: report.generatedBy,
      file_url: report.fileUrl,
      file_size: report.fileSize,
      expires_at: report.expiresAt?.toISOString(),
      scheduled_generation: report.scheduledGeneration,
      recipients: report.recipients,
      created_by: report.createdBy,
      updated_by: report.updatedBy
    };
  }
}
