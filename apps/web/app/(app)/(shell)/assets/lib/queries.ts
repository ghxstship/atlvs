/**
 * Assets Database Queries
 *
 * Enterprise-grade database query functions for asset management.
 * Provides optimized queries with proper indexing, caching, and analytics.
 *
 * @module assets/lib/queries
 */

import { supabase } from './api';
import {
  Asset,
  Location,
  Maintenance,
  Assignment,
  Audit,
  AssetFilters,
  AssetSort,
  AssetPagination,
  AssetAnalytics
} from '../types';

// Query optimization helpers
const applyFilters = (query: unknown, filters: AssetFilters, orgId: string) => {
  query = query.eq('organization_id', orgId);

  if (filters.category?.length) {
    query = query.in('category', filters.category);
  }
  if (filters.status?.length) {
    query = query.in('status', filters.status);
  }
  if (filters.condition?.length) {
    query = query.in('condition', filters.condition);
  }
  if (filters.location_id?.length) {
    query = query.in('location_id', filters.location_id);
  }
  if (filters.assigned_to?.length) {
    query = query.in('assigned_to', filters.assigned_to);
  }
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,asset_tag.ilike.%${filters.search}%`);
  }

  return query;
};

const applySorting = (query: unknown, sort: AssetSort) => {
  return query.order(sort.field, { ascending: sort.direction === 'asc' });
};

const applyPagination = (query: unknown, pagination: AssetPagination) => {
  const from = (pagination.page - 1) * pagination.pageSize;
  const to = from + pagination.pageSize - 1;
  return query.range(from, to);
};

// Asset Queries
export const getAssetsQuery = async (
  orgId: string,
  filters: AssetFilters = {},
  sort: AssetSort = { field: 'name', direction: 'asc' },
  pagination: AssetPagination = { page: 1, pageSize: 50 }
): Promise<{ data: Asset[]; count: number }> => {
  let query = supabase
    .from('assets')
    .select(`
      *,
      location:asset_locations(name),
      assigned_to:users(name,avatar),
      supplier:companies(name)
    `, { count: 'exact' });

  query = applyFilters(query, filters, orgId);
  query = applySorting(query, sort);
  query = applyPagination(query, pagination);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0
  };
};

export const getAssetByIdQuery = async (orgId: string, id: string): Promise<Asset | null> => {
  const { data, error } = await supabase
    .from('assets')
    .select(`
      *,
      location:asset_locations(name),
      assigned_to:users(name,avatar),
      supplier:companies(name)
    `)
    .eq('organization_id', orgId)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
};

export const getAssetsByIdsQuery = async (orgId: string, ids: string[]): Promise<Asset[]> => {
  const { data, error } = await supabase
    .from('assets')
    .select(`
      *,
      location:asset_locations(name),
      assigned_to:users(name,avatar),
      supplier:companies(name)
    `)
    .eq('organization_id', orgId)
    .in('id', ids);

  if (error) throw error;

  return data || [];
};

// Location Queries
export const getLocationsQuery = async (
  orgId: string,
  filters: { search?: string; type?: string[] } = {},
  sort: { field: string; direction: 'asc' | 'desc' } = { field: 'name', direction: 'asc' },
  pagination: AssetPagination = { page: 1, pageSize: 50 }
): Promise<{ data: Location[]; count: number }> => {
  let query = supabase
    .from('asset_locations')
    .select(`
      *,
      parent_location:asset_locations(name),
      manager:users(name)
    `, { count: 'exact' })
    .eq('organization_id', orgId);

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  if (filters.type?.length) {
    query = query.in('type', filters.type);
  }

  query = query.order(sort.field, { ascending: sort.direction === 'asc' });
  query = applyPagination(query, pagination);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0
  };
};

// Maintenance Queries
export const getMaintenanceQuery = async (
  orgId: string,
  filters: {
    asset_id?: string;
    status?: string[];
    priority?: string[];
    assigned_to?: string[];
    search?: string;
  } = {},
  sort: AssetSort = { field: 'scheduled_date', direction: 'asc' },
  pagination: AssetPagination = { page: 1, pageSize: 50 }
): Promise<{ data: Maintenance[]; count: number }> => {
  let query = supabase
    .from('asset_maintenance')
    .select(`
      *,
      asset:assets(name,asset_tag),
      assigned_to:users(name)
    `, { count: 'exact' })
    .eq('organization_id', orgId);

  if (filters.asset_id) {
    query = query.eq('asset_id', filters.asset_id);
  }
  if (filters.status?.length) {
    query = query.in('status', filters.status);
  }
  if (filters.priority?.length) {
    query = query.in('priority', filters.priority);
  }
  if (filters.assigned_to?.length) {
    query = query.in('assigned_to', filters.assigned_to);
  }
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  query = applySorting(query, sort);
  query = applyPagination(query, pagination);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0
  };
};

// Assignment Queries
export const getAssignmentsQuery = async (
  orgId: string,
  filters: {
    asset_id?: string;
    assigned_to?: string[];
    status?: string[];
    search?: string;
  } = {},
  sort: AssetSort = { field: 'assignment_date', direction: 'desc' },
  pagination: AssetPagination = { page: 1, pageSize: 50 }
): Promise<{ data: Assignment[]; count: number }> => {
  let query = supabase
    .from('asset_assignments')
    .select(`
      *,
      asset:assets(name,asset_tag),
      assigned_to:users(name,avatar),
      assigned_by:users(name),
      location:asset_locations(name)
    `, { count: 'exact' })
    .eq('organization_id', orgId);

  if (filters.asset_id) {
    query = query.eq('asset_id', filters.asset_id);
  }
  if (filters.assigned_to?.length) {
    query = query.in('assigned_to', filters.assigned_to);
  }
  if (filters.status?.length) {
    query = query.in('status', filters.status);
  }
  if (filters.search) {
    query = query.ilike('purpose', `%${filters.search}%`);
  }

  query = applySorting(query, sort);
  query = applyPagination(query, pagination);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0
  };
};

// Audit Queries
export const getAuditsQuery = async (
  orgId: string,
  filters: {
    auditor_id?: string;
    status?: string[];
    search?: string;
  } = {},
  sort: AssetSort = { field: 'audit_date', direction: 'desc' },
  pagination: AssetPagination = { page: 1, pageSize: 50 }
): Promise<{ data: Audit[]; count: number }> => {
  let query = supabase
    .from('asset_audits')
    .select(`
      *,
      auditor:users(name)
    `, { count: 'exact' })
    .eq('organization_id', orgId);

  if (filters.auditor_id) {
    query = query.eq('auditor_id', filters.auditor_id);
  }
  if (filters.status?.length) {
    query = query.in('status', filters.status);
  }
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  query = applySorting(query, sort);
  query = applyPagination(query, pagination);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0
  };
};

// Analytics Queries
export const getAssetAnalyticsQuery = async (orgId: string): Promise<AssetAnalytics> => {
  // Get total assets count
  const { count: totalAssets } = await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId);

  // Get status breakdown
  const { data: statusData } = await supabase
    .from('assets')
    .select('status')
    .eq('organization_id', orgId);

  // Get category breakdown
  const { data: categoryData } = await supabase
    .from('assets')
    .select('category')
    .eq('organization_id', orgId);

  // Get location breakdown
  const { data: locationData } = await supabase
    .from('assets')
    .select('location_id')
    .eq('organization_id', orgId);

  // Calculate breakdowns
  const statusBreakdown = statusData?.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const categoryBreakdown = categoryData?.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const locationBreakdown = locationData?.reduce((acc, item) => {
    const loc = item.location_id || 'unassigned';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Get maintenance due
  const { count: maintenanceDue } = await supabase
    .from('asset_maintenance')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('status', 'scheduled')
    .lte('scheduled_date', new Date().toISOString());

  // Get overdue maintenance
  const { count: overdueMaintenance } = await supabase
    .from('asset_maintenance')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('status', 'overdue');

  // Get total value
  const { data: valueData } = await supabase
    .from('assets')
    .select('current_value')
    .eq('organization_id', orgId)
    .not('current_value', 'is', null);

  const totalValue = valueData?.reduce((sum, asset) => sum + (asset.current_value || 0), 0) || 0;
  const averageValue = valueData?.length ? totalValue / valueData.length : 0;
  const utilizationRate = totalAssets ? ((statusBreakdown.in_use || 0) / totalAssets) * 100 : 0;

  return {
    totalAssets: totalAssets || 0,
    availableAssets: statusBreakdown.available || 0,
    inUseAssets: statusBreakdown.in_use || 0,
    maintenanceAssets: statusBreakdown.maintenance || 0,
    retiredAssets: statusBreakdown.retired || 0,
    totalValue,
    averageValue,
    utilizationRate,
    maintenanceDue: maintenanceDue || 0,
    overdueMaintenance: overdueMaintenance || 0,
    categoryBreakdown,
    statusBreakdown,
    locationBreakdown
  };
};

// Search Queries
export const searchAssetsQuery = async (
  orgId: string,
  query: string,
  limit: number = 20
): Promise<Asset[]> => {
  const { data, error } = await supabase
    .from('assets')
    .select(`
      *,
      location:asset_locations(name),
      assigned_to:users(name,avatar),
      supplier:companies(name)
    `)
    .eq('organization_id', orgId)
    .or(`name.ilike.%${query}%,asset_tag.ilike.%${query}%,serial_number.ilike.%${query}%`)
    .limit(limit);

  if (error) throw error;

  return data || [];
};

// Validation Queries
export const validateAssetTagQuery = async (
  orgId: string,
  assetTag: string,
  excludeId?: string
): Promise<boolean> => {
  let query = supabase
    .from('assets')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('asset_tag', assetTag);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { count, error } = await query;

  if (error) throw error;

  return (count || 0) === 0;
};

export const validateSerialNumberQuery = async (
  orgId: string,
  serialNumber: string,
  excludeId?: string
): Promise<boolean> => {
  if (!serialNumber) return true; // Optional field

  let query = supabase
    .from('assets')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('serial_number', serialNumber);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { count, error } = await query;

  if (error) throw error;

  return (count || 0) === 0;
};
