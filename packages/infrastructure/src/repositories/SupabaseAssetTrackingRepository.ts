import { createClient } from '@supabase/supabase-js';
import { 
  AssetTracking,
  AssetTrackingRepository,
  AssetTrackingFilters
} from '@ghxstship/domain';

export class SupabaseAssetTrackingRepository implements AssetTrackingRepository {
  constructor(private readonly supabase: ReturnType<typeof createClient>) {}

  async findById(id: string, organizationId: string): Promise<AssetTracking | null> {
    const { data, error } = await this.supabase
      .from('asset_tracking')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) throw error;
    return data ? this.mapToAssetTracking(data) : null;
  }

  async findByOrganization(organizationId: string, filters?: AssetTrackingFilters): Promise<AssetTracking[]> {
    let query = this.supabase
      .from('asset_tracking')
      .select('*')
      .eq('organization_id', organizationId);

    if (filters?.assetId) query = query.eq('asset_id', filters.assetId);
    if (filters?.trackingMethod) query = query.eq('tracking_method', filters.trackingMethod);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.location) query = query.eq('location', filters.location);
    if (filters?.hasAlerts) query = query.not('alerts', 'is', null);

    const { data, error } = await query.order('last_seen_at', { ascending: false });
    if (error) throw error;
    return data?.map(this.mapToAssetTracking) || [];
  }

  async create(tracking: Omit<AssetTracking, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetTracking> {
    const { data, error } = await this.supabase
      .from('asset_tracking')
      .insert(this.mapFromAssetTracking(tracking))
      .select()
      .single();

    if (error) throw error;
    return this.mapToAssetTracking(data);
  }

  async update(id: string, organizationId: string, updates: Partial<AssetTracking>): Promise<AssetTracking> {
    const { data, error } = await this.supabase
      .from('asset_tracking')
      .update(this.mapFromAssetTracking(updates))
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return this.mapToAssetTracking(data);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('asset_tracking')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) throw error;
  }

  async findByAsset(organizationId: string, assetId: string): Promise<AssetTracking | null> {
    const { data, error } = await this.supabase
      .from('asset_tracking')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('asset_id', assetId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapToAssetTracking(data) : null;
  }

  async findByLocation(organizationId: string, location: string): Promise<AssetTracking[]> {
    const { data, error } = await this.supabase
      .from('asset_tracking')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('location', location);

    if (error) throw error;
    return data?.map(this.mapToAssetTracking) || [];
  }

  async findByStatus(organizationId: string, status: any): Promise<AssetTracking[]> {
    const { data, error } = await this.supabase
      .from('asset_tracking')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', status);

    if (error) throw error;
    return data?.map(this.mapToAssetTracking) || [];
  }

  async findWithAlerts(organizationId: string): Promise<AssetTracking[]> {
    const { data, error } = await this.supabase
      .from('asset_tracking')
      .select('*')
      .eq('organization_id', organizationId)
      .not('alerts', 'is', null);

    if (error) throw error;
    return data?.map(this.mapToAssetTracking) || [];
  }

  async updateLocation(id: string, organizationId: string, location: string, coordinates?: { latitude: number; longitude: number }): Promise<AssetTracking> {
    const updates: any = {
      location,
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (coordinates) {
      updates.coordinates = coordinates;
    }

    const { data, error } = await this.supabase
      .from('asset_tracking')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return this.mapToAssetTracking(data);
  }

  private mapToAssetTracking(data: any): AssetTracking {
    return {
      id: data.id,
      organizationId: data.organization_id,
      assetId: data.asset_id,
      trackingMethod: data.tracking_method,
      status: data.status,
      location: data.location,
      coordinates: data.coordinates,
      lastSeenAt: new Date(data.last_seen_at),
      lastSeenBy: data.last_seen_by,
      batteryLevel: data.battery_level,
      signalStrength: data.signal_strength,
      temperature: data.temperature,
      humidity: data.humidity,
      notes: data.notes,
      alerts: data.alerts,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
      updatedBy: data.updated_by
    };
  }

  private mapFromAssetTracking(tracking: Partial<AssetTracking>): any {
    return {
      organization_id: tracking.organizationId,
      asset_id: tracking.assetId,
      tracking_method: tracking.trackingMethod,
      status: tracking.status,
      location: tracking.location,
      coordinates: tracking.coordinates,
      last_seen_at: tracking.lastSeenAt?.toISOString(),
      last_seen_by: tracking.lastSeenBy,
      battery_level: tracking.batteryLevel,
      signal_strength: tracking.signalStrength,
      temperature: tracking.temperature,
      humidity: tracking.humidity,
      notes: tracking.notes,
      alerts: tracking.alerts,
      created_by: tracking.createdBy,
      updated_by: tracking.updatedBy
    };
  }
}
