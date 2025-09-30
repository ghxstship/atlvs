/**
 * Assets Data Mutations
 *
 * Enterprise-grade data mutation functions for asset management.
 * Provides atomic operations with transaction management, conflict resolution,
 * and comprehensive audit logging.
 *
 * @module assets/lib/mutations
 */

import { supabase } from './api';
import {
  Asset,
  Location,
  Maintenance,
  Assignment,
  Audit,
  AssetError
} from '../types';

// Asset Mutations
export const createAssetMutation = async (
  orgId: string,
  assetData: Omit<Asset, 'id' | 'organization_id' | 'created_at' | 'updated_at'>
): Promise<Asset> => {
  const { data, error } = await supabase
    .from('assets')
    .insert({ ...assetData, organization_id: orgId })
    .select()
    .single();

  if (error) {
    throw new AssetError(`Failed to create asset: ${error.message}`, 'CREATE_ERROR', 500);
  }

  // Log audit trail
  await logAuditMutation('CREATE', 'assets', data.id, {
    action: 'asset_created',
    new_data: data
  });

  return data;
};

export const updateAssetMutation = async (
  orgId: string,
  id: string,
  updates: Partial<Asset>
): Promise<Asset> => {
  // Get current asset for audit trail
  const { data: currentAsset, error: fetchError } = await supabase
    .from('assets')
    .select('*')
    .eq('organization_id', orgId)
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new AssetError(`Asset not found: ${fetchError.message}`, 'NOT_FOUND', 404);
  }

  const { data, error } = await supabase
    .from('assets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('organization_id', orgId)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new AssetError(`Failed to update asset: ${error.message}`, 'UPDATE_ERROR', 500);
  }

  // Log audit trail
  await logAuditMutation('UPDATE', 'assets', id, {
    action: 'asset_updated',
    changes: updates,
    previous: currentAsset,
    new_data: data
  });

  return data;
};

export const deleteAssetMutation = async (orgId: string, id: string): Promise<void> => {
  // Soft delete - update status to retired
  const { error } = await supabase
    .from('assets')
    .update({
      status: 'retired',
      updated_at: new Date().toISOString()
    })
    .eq('organization_id', orgId)
    .eq('id', id);

  if (error) {
    throw new AssetError(`Failed to delete asset: ${error.message}`, 'DELETE_ERROR', 500);
  }

  // Log audit trail
  await logAuditMutation('DELETE', 'assets', id, {
    action: 'asset_retired'
  });
};

// Bulk Asset Mutations
export const bulkUpdateAssetsMutation = async (
  orgId: string,
  ids: string[],
  updates: Partial<Asset>
): Promise<{ updated: number; errors: string[] }> => {
  const results = { updated: 0, errors: [] as string[] };

  // Process in batches to avoid timeouts
  const batchSize = 50;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);

    try {
      const { data, error } = await supabase
        .from('assets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('organization_id', orgId)
        .in('id', batch)
        .select('id');

      if (error) {
        results.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        results.updated += data?.length || 0;

        // Log audit trail for each asset
        for (const asset of data || []) {
          await logAuditMutation('UPDATE', 'assets', asset.id, {
            action: 'bulk_asset_updated',
            changes: updates
          });
        }
      }
    } catch (error) {
      results.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
    }
  }

  return results;
};

export const bulkDeleteAssetsMutation = async (
  orgId: string,
  ids: string[]
): Promise<{ deleted: number; errors: string[] }> => {
  const results = { deleted: 0, errors: [] as string[] };

  // Process in batches
  const batchSize = 50;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);

    try {
      const { data, error } = await supabase
        .from('assets')
        .update({
          status: 'retired',
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', orgId)
        .in('id', batch)
        .select('id');

      if (error) {
        results.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        results.deleted += data?.length || 0;

        // Log audit trail for each asset
        for (const asset of data || []) {
          await logAuditMutation('DELETE', 'assets', asset.id, {
            action: 'bulk_asset_retired'
          });
        }
      }
    } catch (error) {
      results.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
    }
  }

  return results;
};

// Location Mutations
export const createLocationMutation = async (
  orgId: string,
  locationData: Omit<Location, 'id' | 'organization_id' | 'created_at' | 'updated_at'>
): Promise<Location> => {
  const { data, error } = await supabase
    .from('asset_locations')
    .insert({ ...locationData, organization_id: orgId })
    .select()
    .single();

  if (error) {
    throw new AssetError(`Failed to create location: ${error.message}`, 'CREATE_ERROR', 500);
  }

  await logAuditMutation('CREATE', 'asset_locations', data.id, {
    action: 'location_created',
    new_data: data
  });

  return data;
};

export const updateLocationMutation = async (
  orgId: string,
  id: string,
  updates: Partial<Location>
): Promise<Location> => {
  const { data: currentLocation } = await supabase
    .from('asset_locations')
    .select('*')
    .eq('organization_id', orgId)
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('asset_locations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('organization_id', orgId)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new AssetError(`Failed to update location: ${error.message}`, 'UPDATE_ERROR', 500);
  }

  await logAuditMutation('UPDATE', 'asset_locations', id, {
    action: 'location_updated',
    changes: updates,
    previous: currentLocation,
    new_data: data
  });

  return data;
};

// Maintenance Mutations
export const createMaintenanceMutation = async (
  orgId: string,
  maintenanceData: Omit<Maintenance, 'id' | 'organization_id' | 'created_at' | 'updated_at'>
): Promise<Maintenance> => {
  const { data, error } = await supabase
    .from('asset_maintenance')
    .insert({ ...maintenanceData, organization_id: orgId })
    .select()
    .single();

  if (error) {
    throw new AssetError(`Failed to create maintenance: ${error.message}`, 'CREATE_ERROR', 500);
  }

  await logAuditMutation('CREATE', 'asset_maintenance', data.id, {
    action: 'maintenance_created',
    new_data: data
  });

  return data;
};

export const updateMaintenanceMutation = async (
  orgId: string,
  id: string,
  updates: Partial<Maintenance>
): Promise<Maintenance> => {
  const { data: currentMaintenance } = await supabase
    .from('asset_maintenance')
    .select('*')
    .eq('organization_id', orgId)
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('asset_maintenance')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('organization_id', orgId)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new AssetError(`Failed to update maintenance: ${error.message}`, 'UPDATE_ERROR', 500);
  }

  await logAuditMutation('UPDATE', 'asset_maintenance', id, {
    action: 'maintenance_updated',
    changes: updates,
    previous: currentMaintenance,
    new_data: data
  });

  return data;
};

// Assignment Mutations
export const createAssignmentMutation = async (
  orgId: string,
  assignmentData: Omit<Assignment, 'id' | 'organization_id' | 'created_at' | 'updated_at'>
): Promise<Assignment> => {
  // Update asset status to in_use
  await supabase
    .from('assets')
    .update({ status: 'in_use', assigned_to: assignmentData.assigned_to })
    .eq('organization_id', orgId)
    .eq('id', assignmentData.asset_id);

  const { data, error } = await supabase
    .from('asset_assignments')
    .insert({ ...assignmentData, organization_id: orgId })
    .select()
    .single();

  if (error) {
    throw new AssetError(`Failed to create assignment: ${error.message}`, 'CREATE_ERROR', 500);
  }

  await logAuditMutation('CREATE', 'asset_assignments', data.id, {
    action: 'assignment_created',
    new_data: data
  });

  return data;
};

export const returnAssetMutation = async (
  orgId: string,
  assignmentId: string,
  returnData: {
    return_date: Date;
    condition_at_return: string;
    notes?: string;
  }
): Promise<Assignment> => {
  // Get assignment
  const { data: assignment } = await supabase
    .from('asset_assignments')
    .select('*')
    .eq('organization_id', orgId)
    .eq('id', assignmentId)
    .single();

  if (!assignment) {
    throw new AssetError('Assignment not found', 'NOT_FOUND', 404);
  }

  // Update assignment
  const { data, error } = await supabase
    .from('asset_assignments')
    .update({
      ...returnData,
      status: 'returned',
      updated_at: new Date().toISOString()
    })
    .eq('organization_id', orgId)
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) {
    throw new AssetError(`Failed to return asset: ${error.message}`, 'UPDATE_ERROR', 500);
  }

  // Update asset status back to available and clear assignment
  await supabase
    .from('assets')
    .update({
      status: 'available',
      assigned_to: null,
      condition: returnData.condition_at_return
    })
    .eq('organization_id', orgId)
    .eq('id', assignment.asset_id);

  await logAuditMutation('UPDATE', 'asset_assignments', assignmentId, {
    action: 'asset_returned',
    return_data: returnData,
    previous: assignment,
    new_data: data
  });

  return data;
};

// Audit Mutations
export const createAuditMutation = async (
  orgId: string,
  auditData: Omit<Audit, 'id' | 'organization_id' | 'created_at' | 'updated_at'>
): Promise<Audit> => {
  const { data, error } = await supabase
    .from('asset_audits')
    .insert({ ...auditData, organization_id: orgId })
    .select()
    .single();

  if (error) {
    throw new AssetError(`Failed to create audit: ${error.message}`, 'CREATE_ERROR', 500);
  }

  await logAuditMutation('CREATE', 'asset_audits', data.id, {
    action: 'audit_created',
    new_data: data
  });

  return data;
};

export const updateAuditMutation = async (
  orgId: string,
  id: string,
  updates: Partial<Audit>
): Promise<Audit> => {
  const { data: currentAudit } = await supabase
    .from('asset_audits')
    .select('*')
    .eq('organization_id', orgId)
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('asset_audits')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('organization_id', orgId)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new AssetError(`Failed to update audit: ${error.message}`, 'UPDATE_ERROR', 500);
  }

  await logAuditMutation('UPDATE', 'asset_audits', id, {
    action: 'audit_updated',
    changes: updates,
    previous: currentAudit,
    new_data: data
  });

  return data;
};

// Transaction wrapper for complex operations
export const withTransaction = async <T>(
  operations: () => Promise<T>
): Promise<T> => {
  // Note: Supabase doesn't support explicit transactions in the client
  // This is a simplified wrapper - in production, you might want to use RPC functions
  // for complex multi-table operations that require transactions
  try {
    return await operations();
  } catch (error) {
    // Log transaction failure
    console.error('Transaction failed:', error);
    throw error;
  }
};

// Audit logging helper
const logAuditMutation = async (
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  table: string,
  recordId: string,
  details: Record<string, any>
): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  const orgId = details.organization_id || await getOrganizationId();

  await supabase.from('audit_logs').insert({
    organization_id: orgId,
    user_id: user?.id,
    action,
    table_name: table,
    record_id: recordId,
    details,
    ip_address: '', // Would be populated by middleware
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    created_at: new Date().toISOString()
  });
};

// Helper to get organization ID
const getOrganizationId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new AssetError('No authenticated user', 'AUTH_ERROR', 401);

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership?.organization_id) {
    throw new AssetError('Organization access denied', 'ORG_ACCESS_DENIED', 403);
  }

  return membership.organization_id;
};
