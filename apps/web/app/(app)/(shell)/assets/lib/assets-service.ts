/**
 * Assets Service Layer
 * Centralized business logic for Assets module operations
 */

import { createBrowserClient } from '@ghxstship/auth';

const supabase = createBrowserClient();

export interface Asset {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  category: string;
  type: 'fixed' | 'rentable' | 'service';
  status: 'available' | 'in_use' | 'under_maintenance' | 'damaged' | 'missing' | 'retired';
  sku?: string;
  current_value?: number;
  location?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetStats {
  totalAssets: number;
  activeAssignments: number;
  maintenanceRequired: number;
  totalValue: number;
}

export class AssetsService {
  /**
   * Get all assets for an organization
   */
  async getAssets(organizationId: string, filters?: {
    category?: string;
    status?: string;
    type?: string;
  }): Promise<Asset[]> {
    try {
      let query = supabase
        .from('assets')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as Asset[]) || [];
    } catch (error) {
      console.error('Error fetching assets:', error);
      return [];
    }
  }

  /**
   * Get asset statistics
   */
  async getStats(organizationId: string): Promise<AssetStats> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('status, current_value')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const assets = data || [];
      const totalAssets = assets.length;
      const activeAssignments = assets.filter(a => a.status === 'in_use').length;
      const maintenanceRequired = assets.filter(
        a => a.status === 'under_maintenance' || a.status === 'damaged'
      ).length;
      const totalValue = assets.reduce((sum, a) => sum + (a.current_value || 0), 0);

      return {
        totalAssets,
        activeAssignments,
        maintenanceRequired,
        totalValue
      };
    } catch (error) {
      console.error('Error fetching asset stats:', error);
      return {
        totalAssets: 0,
        activeAssignments: 0,
        maintenanceRequired: 0,
        totalValue: 0
      };
    }
  }

  /**
   * Create a new asset
   */
  async createAsset(organizationId: string, userId: string, asset: Partial<Asset>): Promise<Asset | null> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .insert({
          ...asset,
          organization_id: organizationId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as Asset;
    } catch (error) {
      console.error('Error creating asset:', error);
      return null;
    }
  }

  /**
   * Update an asset
   */
  async updateAsset(assetId: string, organizationId: string, updates: Partial<Asset>): Promise<Asset | null> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', assetId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) throw error;
      return data as Asset;
    } catch (error) {
      console.error('Error updating asset:', error);
      return null;
    }
  }

  /**
   * Delete an asset
   */
  async deleteAsset(assetId: string, organizationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId)
        .eq('organization_id', organizationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting asset:', error);
      return false;
    }
  }

  /**
   * Assign asset to user
   */
  async assignAsset(assetId: string, organizationId: string, assignedTo: string): Promise<Asset | null> {
    return this.updateAsset(assetId, organizationId, {
      assigned_to: assignedTo,
      status: 'in_use'
    });
  }

  /**
   * Mark asset as available
   */
  async makeAvailable(assetId: string, organizationId: string): Promise<Asset | null> {
    return this.updateAsset(assetId, organizationId, {
      assigned_to: undefined,
      status: 'available'
    });
  }

  /**
   * Mark asset for maintenance
   */
  async markForMaintenance(assetId: string, organizationId: string): Promise<Asset | null> {
    return this.updateAsset(assetId, organizationId, {
      status: 'under_maintenance'
    });
  }
}

// Export singleton instance
export const assetsService = new AssetsService();
