import { z as zod } from 'zod';
import type {
  UniformSizing,
  UniformSizingFilters,
  UniformSizingStats,
  UniformSizingAnalytics,
  RecentActivity,
} from '../types';
import { 
  createEmptyUniformSizingStats, 
  createEmptyUniformSizingAnalytics,
  calculateBMI,
  calculateSizeCompleteness
} from '../types';

export const uniformSizingFilterSchema = zod.object({
  search: zod.string().optional(),
  size_category: zod.enum(['clothing', 'measurements', 'equipment', 'all']).optional(),
  completeness_range: zod.object({
    min: zod.number().min(0).max(100),
    max: zod.number().min(0).max(100),
  }).optional(),
  has_measurements: zod.boolean().optional(),
  has_clothing_sizes: zod.boolean().optional(),
  has_equipment_preferences: zod.boolean().optional(),
  date_from: zod.string().datetime().optional(),
  date_to: zod.string().datetime().optional(),
  bmi_range: zod.object({
    min: zod.number().min(10).max(50),
    max: zod.number().min(10).max(50),
  }).optional(),
  limit: zod.number().min(1).max(100).default(50),
  offset: zod.number().min(0).default(0),
});

export const uniformSizingUpdateSchema = zod.object({
  shirt_size: zod.string().optional(),
  pants_size: zod.string().optional(),
  jacket_size: zod.string().optional(),
  dress_size: zod.string().optional(),
  shoe_size: zod.string().optional(),
  hat_size: zod.string().optional(),
  height_cm: zod.number().min(100).max(250).optional(),
  weight_kg: zod.number().min(30).max(300).optional(),
  chest_cm: zod.number().min(60).max(200).optional(),
  waist_cm: zod.number().min(50).max(180).optional(),
  inseam_cm: zod.number().min(60).max(120).optional(),
  equipment_preferences: zod.record(zod.any()).default({}),
  special_requirements: zod.string().max(500).optional(),
});

export const analyticsFilterSchema = zod.object({
  period: zod.enum(['7d', '30d', '90d', '1y']).default('30d'),
  granularity: zod.enum(['day', 'week', 'month']).default('day'),
});

export const bulkActionSchema = zod.object({
  action: zod.enum(['export', 'update-measurements', 'clear-data']),
  sizing_ids: zod.array(zod.string().uuid()),
  data: zod.record(zod.any()).optional(),
});

export const exportSchema = zod.object({
  format: zod.enum(['csv', 'xlsx', 'json', 'pdf']),
  sizing_ids: zod.array(zod.string().uuid()).optional(),
  filters: uniformSizingFilterSchema.optional(),
  fields: zod.array(zod.string()).optional(),
  include_calculations: zod.boolean().default(true),
});

type SupabaseClient = ReturnType<typeof import('@ghxstship/auth').createServerClient>;

export function getPeriodDates(period: string) {
  const now = new Date();
  const periodMap: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365,
  };

  const days = periodMap[period] ?? 30;
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { startDate, endDate: now };
}

export async function fetchUniformSizing(
  supabase: SupabaseClient,
  orgId: string,
  userId: string
): Promise<UniformSizing | null> {
  try {
    const { data, error } = await supabase
      .from('user_uniform_sizing')
      .select(`
        *,
        user:users!user_id(id, full_name, email, avatar_url)
      `)
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    // Transform and enrich the data
    const sizing: UniformSizing = {
      ...data,
      user_name: data.user?.full_name || 'Unknown User',
      user_email: data.user?.email || '',
      user_avatar: data.user?.avatar_url,
      bmi: calculateBMI(data.height_cm, data.weight_kg),
      size_completeness_percentage: calculateSizeCompleteness(data),
    };

    return sizing;
  } catch (error) {
    console.error('Error fetching uniform sizing:', error);
    return null;
  }
}

export async function fetchUniformSizings(
  supabase: SupabaseClient,
  orgId: string,
  filters: zod.infer<typeof uniformSizingFilterSchema>
): Promise<{
  sizings: UniformSizing[];
  total: number;
}> {
  try {
    let query = supabase
      .from('user_uniform_sizing')
      .select(`
        *,
        user:users!user_id(id, full_name, email, avatar_url)
      `, { count: 'exact' })
      .eq('organization_id', orgId);

    // Apply filters
    if (filters.search) {
      // Search in user names and special requirements
      query = query.or(`
        special_requirements.ilike.%${filters.search}%
      `);
    }

    if (filters.has_measurements) {
      if (filters.has_measurements) {
        query = query.not('height_cm', 'is', null).not('weight_kg', 'is', null);
      } else {
        query = query.or('height_cm.is.null,weight_kg.is.null');
      }
    }

    if (filters.has_clothing_sizes) {
      if (filters.has_clothing_sizes) {
        query = query.or(`
          shirt_size.neq.'',
          pants_size.neq.'',
          jacket_size.neq.'',
          shoe_size.neq.''
        `);
      }
    }

    if (filters.date_from) {
      query = query.gte('updated_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('updated_at', filters.date_to);
    }

    // Apply pagination and ordering
    const { data, error, count } = await query
      .order('updated_at', { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1);

    if (error) throw error;

    // Transform and enrich the data
    const sizings: UniformSizing[] = (data || []).map(item => ({
      ...item,
      user_name: item.user?.full_name || 'Unknown User',
      user_email: item.user?.email || '',
      user_avatar: item.user?.avatar_url,
      bmi: calculateBMI(item.height_cm, item.weight_kg),
      size_completeness_percentage: calculateSizeCompleteness(item),
    }));

    return {
      sizings,
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching uniform sizings:', error);
    return {
      sizings: [],
      total: 0,
    };
  }
}

export async function updateUniformSizing(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  sizingData: zod.infer<typeof uniformSizingUpdateSchema>,
  updatedBy: string
): Promise<UniformSizing | null> {
  try {
    const { data, error } = await supabase
      .from('user_uniform_sizing')
      .upsert({
        user_id: userId,
        organization_id: orgId,
        ...sizingData,
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        user:users!user_id(id, full_name, email, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Create activity log entry
    await supabase
      .from('user_profile_activity')
      .insert({
        user_id: userId,
        organization_id: orgId,
        activity_type: 'uniform_sizing_updated',
        activity_description: 'Uniform sizing information was updated',
        metadata: {
          fields_updated: Object.keys(sizingData),
          updated_by: updatedBy,
        },
        performed_by: updatedBy,
      });

    // Transform and enrich the data
    const sizing: UniformSizing = {
      ...data,
      user_name: data.user?.full_name || 'Unknown User',
      user_email: data.user?.email || '',
      user_avatar: data.user?.avatar_url,
      bmi: calculateBMI(data.height_cm, data.weight_kg),
      size_completeness_percentage: calculateSizeCompleteness(data),
    };

    return sizing;
  } catch (error) {
    console.error('Error updating uniform sizing:', error);
    return null;
  }
}

export async function fetchUniformSizingStats(
  supabase: SupabaseClient,
  orgId: string
): Promise<UniformSizingStats> {
  try {
    // Get basic counts
    const [totalResult, recentResult] = await Promise.all([
      supabase
        .from('user_uniform_sizing')
        .select('*', { count: 'exact' })
        .eq('organization_id', orgId),
      
      supabase
        .from('user_uniform_sizing')
        .select('id', { count: 'exact' })
        .eq('organization_id', orgId)
        .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const { data: sizingData } = await supabase
      .from('user_uniform_sizing')
      .select('*')
      .eq('organization_id', orgId);

    const sizings = sizingData || [];
    const totalRecords = totalResult.count || 0;
    const recentUpdates = recentResult.count || 0;

    // Calculate completeness
    const completenessScores = sizings.map(sizing => calculateSizeCompleteness(sizing));
    const completedRecords = completenessScores.filter(score => score >= 80).length;
    const averageCompleteness = completenessScores.length > 0
      ? completenessScores.reduce((sum, score) => sum + score, 0) / completenessScores.length
      : 0;

    // Analyze clothing sizes
    const clothingSizes: Record<string, number> = {};
    sizings.forEach(sizing => {
      if (sizing.shirt_size) clothingSizes[`Shirt ${sizing.shirt_size}`] = (clothingSizes[`Shirt ${sizing.shirt_size}`] || 0) + 1;
      if (sizing.pants_size) clothingSizes[`Pants ${sizing.pants_size}`] = (clothingSizes[`Pants ${sizing.pants_size}`] || 0) + 1;
      if (sizing.shoe_size) clothingSizes[`Shoes ${sizing.shoe_size}`] = (clothingSizes[`Shoes ${sizing.shoe_size}`] || 0) + 1;
    });

    const sizeDistribution = Object.entries(clothingSizes)
      .map(([size, count]) => ({
        size,
        count,
        percentage: totalRecords > 0 ? (count / totalRecords) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate measurement statistics
    const measurements = sizings.filter(s => s.height_cm && s.weight_kg);
    const heights = measurements.map(s => s.height_cm!);
    const weights = measurements.map(s => s.weight_kg!);
    const bmis = measurements.map(s => calculateBMI(s.height_cm, s.weight_kg)!);

    const measurementStats = {
      averageHeight: heights.length > 0 ? Math.round(heights.reduce((sum, h) => sum + h, 0) / heights.length) : 0,
      averageWeight: weights.length > 0 ? Math.round(weights.reduce((sum, w) => sum + w, 0) / weights.length) : 0,
      averageBMI: bmis.length > 0 ? Math.round((bmis.reduce((sum, b) => sum + b, 0) / bmis.length) * 10) / 10 : 0,
      heightRange: {
        min: heights.length > 0 ? Math.min(...heights) : 0,
        max: heights.length > 0 ? Math.max(...heights) : 0,
      },
      weightRange: {
        min: weights.length > 0 ? Math.min(...weights) : 0,
        max: weights.length > 0 ? Math.max(...weights) : 0,
      },
    };

    // Analyze equipment preferences
    const equipmentCounts: Record<string, number> = {};
    sizings.forEach(sizing => {
      if (sizing.equipment_preferences && typeof sizing.equipment_preferences === 'object') {
        Object.keys(sizing.equipment_preferences).forEach(equipment => {
          equipmentCounts[equipment] = (equipmentCounts[equipment] || 0) + 1;
        });
      }
    });

    const equipmentPreferences = Object.entries(equipmentCounts)
      .map(([preference, count]) => ({
        preference,
        count,
        percentage: totalRecords > 0 ? (count / totalRecords) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRecords,
      completedRecords,
      averageCompleteness: Math.round(averageCompleteness),
      recentUpdates,
      sizeDistribution: {
        clothing: sizeDistribution,
        measurements: measurementStats,
      },
      equipmentPreferences,
    };
  } catch (error) {
    console.error('Error fetching uniform sizing stats:', error);
    return createEmptyUniformSizingStats();
  }
}

export async function fetchUniformSizingAnalytics(
  supabase: SupabaseClient,
  orgId: string,
  filters: zod.infer<typeof analyticsFilterSchema>
): Promise<UniformSizingAnalytics> {
  try {
    const { startDate, endDate } = getPeriodDates(filters.period);

    // Get completion trends from activity log
    const { data: activityData } = await supabase
      .from('user_profile_activity')
      .select('created_at, metadata, user_id')
      .eq('organization_id', orgId)
      .eq('activity_type', 'uniform_sizing_updated')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    // Process completion trends
    const dailyUpdates = (activityData || []).reduce((acc, activity) => {
      const date = new Date(activity.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { recordsUpdated: 0, userIds: new Set() };
      }
      acc[date].recordsUpdated++;
      acc[date].userIds.add(activity.user_id);
      return acc;
    }, {} as Record<string, unknown>);

    const completionTrends = Object.entries(dailyUpdates).map(([date, data]) => ({
      date,
      averageCompleteness: 0, // Would need to calculate from actual data
      recordsUpdated: data.recordsUpdated,
    }));

    // Get current sizing data for analysis
    const { data: sizingData } = await supabase
      .from('user_uniform_sizing')
      .select('*')
      .eq('organization_id', orgId);

    const sizings = sizingData || [];

    // Analyze clothing sizes by category
    const clothingSizeCategories = [
      { category: 'Shirts', field: 'shirt_size' },
      { category: 'Pants', field: 'pants_size' },
      { category: 'Jackets', field: 'jacket_size' },
      { category: 'Shoes', field: 'shoe_size' },
    ];

    const clothingSizes = clothingSizeCategories.map(({ category, field }) => {
      const sizeCounts: Record<string, number> = {};
      sizings.forEach(sizing => {
        const size = sizing[field as keyof typeof sizing] as string;
        if (size && size.trim()) {
          sizeCounts[size] = (sizeCounts[size] || 0) + 1;
        }
      });

      const sizes = Object.entries(sizeCounts)
        .map(([size, count]) => ({
          size,
          count,
          percentage: sizings.length > 0 ? (count / sizings.length) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      return { category, sizes };
    });

    // Mock measurement trends (would need historical data)
    const measurementTrends = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        averageHeight: 170 + Math.random() * 10,
        averageWeight: 70 + Math.random() * 20,
        averageBMI: 22 + Math.random() * 4,
      };
    }).reverse();

    // Analyze equipment preferences
    const equipmentTypes = ['Safety Helmet', 'Safety Vest', 'Work Boots', 'Gloves', 'Eye Protection'];
    const equipmentAnalysis = equipmentTypes.map(equipment => {
      const preferences: Record<string, number> = {};
      sizings.forEach(sizing => {
        if (sizing.equipment_preferences && typeof sizing.equipment_preferences === 'object') {
          const pref = sizing.equipment_preferences[equipment];
          if (pref) {
            const prefStr = String(pref);
            preferences[prefStr] = (preferences[prefStr] || 0) + 1;
          }
        }
      });

      const prefArray = Object.entries(preferences)
        .map(([preference, count]) => ({
          preference,
          count,
          percentage: sizings.length > 0 ? (count / sizings.length) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      return { equipment, preferences: prefArray };
    });

    return {
      completionTrends,
      sizeAnalysis: {
        clothingSizes,
        measurementTrends,
      },
      equipmentAnalysis,
    };
  } catch (error) {
    console.error('Error fetching uniform sizing analytics:', error);
    return createEmptyUniformSizingAnalytics();
  }
}

export async function fetchRecentActivity(
  supabase: SupabaseClient,
  orgId: string,
  limit: number = 10
): Promise<RecentActivity[]> {
  try {
    const { data, error } = await supabase
      .from('user_profile_activity')
      .select(`
        *,
        user:users!user_id(full_name, avatar_url)
      `)
      .eq('organization_id', orgId)
      .eq('activity_type', 'uniform_sizing_updated')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(activity => ({
      ...activity,
      user_name: activity.user?.full_name || 'Unknown User',
      user_avatar: activity.user?.avatar_url,
    }));
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

export async function performBulkAction(
  supabase: SupabaseClient,
  orgId: string,
  action: zod.infer<typeof bulkActionSchema>,
  performedBy: string
): Promise<{ success: boolean; affectedCount: number; errors?: string[] }> {
  try {
    const { action: actionType, sizing_ids, data } = action;
    let affectedCount = 0;

    switch (actionType) {
      case 'update-measurements':
        if (data && data.measurements) {
          const result = await supabase
            .from('user_uniform_sizing')
            .update({
              ...data.measurements,
              updated_at: new Date().toISOString(),
            })
            .eq('organization_id', orgId)
            .in('id', sizing_ids);

          if (result.error) throw result.error;
          affectedCount = sizing_ids.length;
        }
        break;

      case 'clear-data':
        const result = await supabase
          .from('user_uniform_sizing')
          .update({
            shirt_size: null,
            pants_size: null,
            jacket_size: null,
            dress_size: null,
            shoe_size: null,
            hat_size: null,
            height_cm: null,
            weight_kg: null,
            chest_cm: null,
            waist_cm: null,
            inseam_cm: null,
            equipment_preferences: {},
            special_requirements: null,
            updated_at: new Date().toISOString(),
          })
          .eq('organization_id', orgId)
          .in('id', sizing_ids);

        if (result.error) throw result.error;
        affectedCount = sizing_ids.length;
        break;

      case 'export':
        // Export is handled separately
        affectedCount = sizing_ids.length;
        break;

      default:
        throw new Error(`Unknown action: ${actionType}`);
    }

    // Log the bulk action
    await supabase
      .from('user_profile_activity')
      .insert(
        sizing_ids.map(sizingId => ({
          user_id: sizingId, // This would need to be mapped to actual user_id
          organization_id: orgId,
          activity_type: 'uniform_sizing_updated',
          activity_description: `Uniform sizing ${actionType} via bulk action`,
          metadata: {
            bulk_action: actionType,
            performed_by: performedBy,
          },
          performed_by: performedBy,
        }))
      );

    return { success: true, affectedCount };
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return { 
      success: false, 
      affectedCount: 0, 
      errors: [error instanceof Error ? error.message : 'Unknown error'] 
    };
  }
}

export async function exportUniformSizings(
  supabase: SupabaseClient,
  orgId: string,
  exportConfig: zod.infer<typeof exportSchema>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const { format, sizing_ids, filters, fields, include_calculations } = exportConfig;

    // Fetch the data to export
    let sizings: UniformSizing[];
    
    if (sizing_ids && sizing_ids.length > 0) {
      // Export specific sizings
      const { data, error } = await supabase
        .from('user_uniform_sizing')
        .select(`
          *,
          user:users!user_id(id, full_name, email, avatar_url)
        `)
        .eq('organization_id', orgId)
        .in('id', sizing_ids);

      if (error) throw error;

      sizings = (data || []).map(item => ({
        ...item,
        user_name: item.user?.full_name || 'Unknown User',
        user_email: item.user?.email || '',
        user_avatar: item.user?.avatar_url,
        bmi: calculateBMI(item.height_cm, item.weight_kg),
        size_completeness_percentage: calculateSizeCompleteness(item),
      }));
    } else if (filters) {
      // Export based on filters
      const result = await fetchUniformSizings(supabase, orgId, filters);
      sizings = result.sizings;
    } else {
      // Export all sizings
      const result = await fetchUniformSizings(supabase, orgId, { limit: 1000, offset: 0 });
      sizings = result.sizings;
    }

    // Filter fields if specified
    let exportData = sizings;
    if (fields && fields.length > 0) {
      exportData = sizings.map(sizing => {
        const filteredSizing: unknown = {};
        fields.forEach(field => {
          if (field in sizing) {
            filteredSizing[field] = sizing[field as keyof UniformSizing];
          }
        });
        return filteredSizing;
      });
    }

    // Add calculations if requested
    if (include_calculations) {
      exportData = exportData.map(sizing => ({
        ...sizing,
        bmi_calculated: calculateBMI(sizing.height_cm, sizing.weight_kg),
        completeness_calculated: calculateSizeCompleteness(sizing),
      }));
    }

    // Format data based on export format
    switch (format) {
      case 'json':
        return { success: true, data: JSON.stringify(exportData, null, 2) };
      
      case 'csv':
        if (exportData.length === 0) {
          return { success: true, data: '' };
        }
        
        const headers = Object.keys(exportData[0]).join(',');
        const rows = exportData.map(item => 
          Object.values(item).map(value => 
            typeof value === 'string' && value.includes(',') 
              ? `"${value.replace(/"/g, '""')}"` 
              : value
          ).join(',')
        );
        
        return { success: true, data: [headers, ...rows].join('\n') };
      
      case 'xlsx':
      case 'pdf':
        // These would require additional libraries like xlsx or jsPDF
        // For now, return JSON format
        return { success: true, data: JSON.stringify(exportData, null, 2) };
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error exporting uniform sizings:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Export failed' 
    };
  }
}
