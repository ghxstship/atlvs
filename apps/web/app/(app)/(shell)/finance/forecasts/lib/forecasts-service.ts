import { createBrowserClient } from '@ghxstship/auth';
import type { 
  Forecast, 
  CreateForecastData, 
  UpdateForecastData, 
  ForecastFilters, 
  ForecastStatistics,
  ForecastExportData,
  ForecastWorkflowActions
} from '../types';

export class ForecastsService implements ForecastWorkflowActions {
  private supabase = createBrowserClient();

  // CRUD Operations
  async getForecasts(orgId: string, filters?: ForecastFilters): Promise<Forecast[]> {
    try {
      let query = this.supabase
        .from('forecasts')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.forecast_type?.length) {
        query = query.in('forecast_type', filters.forecast_type);
      }
      if (filters?.period_type?.length) {
        query = query.in('period_type', filters.period_type);
      }
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.confidence_level?.length) {
        query = query.in('confidence_level', filters.confidence_level);
      }
      if (filters?.category?.length) {
        query = query.in('category', filters.category);
      }
      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }
      if (filters?.amount_min !== undefined) {
        query = query.gte('projected_amount', filters.amount_min);
      }
      if (filters?.amount_max !== undefined) {
        query = query.lte('projected_amount', filters.amount_max);
      }
      if (filters?.date_from) {
        query = query.gte('start_date', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('end_date', filters.date_to);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,methodology.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching forecasts:', error);
      throw error;
    }
  }

  async getForecast(orgId: string, forecastId: string): Promise<Forecast | null> {
    try {
      const { data, error } = await this.supabase
        .from('forecasts')
        .select('*')
        .eq('organization_id', orgId)
        .eq('id', forecastId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  }

  async createForecast(orgId: string, forecastData: CreateForecastData, userId: string): Promise<Forecast> {
    try {
      const { data, error } = await this.supabase
        .from('forecasts')
        .insert({
          ...forecastData,
          organization_id: orgId,
          created_by: userId,
          status: 'draft',
          currency: forecastData.currency || 'USD',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating forecast:', error);
      throw error;
    }
  }

  async updateForecast(orgId: string, forecastId: string, updates: UpdateForecastData): Promise<Forecast> {
    try {
      // Recalculate variance if actual amount is updated
      const updateData: unknown = { ...updates };
      if (updates.actual_amount !== undefined) {
        const current = await this.getForecast(orgId, forecastId);
        if (current) {
          const variance = updates.actual_amount - current.projected_amount;
          const variancePercentage = current.projected_amount !== 0 
            ? (variance / current.projected_amount) * 100 
            : 0;
          
          updateData.variance_amount = variance;
          updateData.variance_percentage = variancePercentage;
        }
      }

      const { data, error } = await this.supabase
        .from('forecasts')
        .update(updateData)
        .eq('organization_id', orgId)
        .eq('id', forecastId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating forecast:', error);
      throw error;
    }
  }

  async deleteForecast(orgId: string, forecastId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('forecasts')
        .delete()
        .eq('organization_id', orgId)
        .eq('id', forecastId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting forecast:', error);
      throw error;
    }
  }

  // Workflow Actions
  async activate(forecastId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('forecasts')
        .update({ status: 'active' })
        .eq('id', forecastId);

      if (error) throw error;
    } catch (error) {
      console.error('Error activating forecast:', error);
      throw error;
    }
  }

  async complete(forecastId: string, actualAmount: number): Promise<void> {
    try {
      // Get current forecast to calculate variance
      const { data: forecast, error: fetchError } = await this.supabase
        .from('forecasts')
        .select('projected_amount')
        .eq('id', forecastId)
        .single();

      if (fetchError) throw fetchError;

      const variance = actualAmount - forecast.projected_amount;
      const variancePercentage = forecast.projected_amount !== 0 
        ? (variance / forecast.projected_amount) * 100 
        : 0;

      const { error } = await this.supabase
        .from('forecasts')
        .update({ 
          status: 'completed',
          actual_amount: actualAmount,
          variance_amount: variance,
          variance_percentage: variancePercentage
        })
        .eq('id', forecastId);

      if (error) throw error;
    } catch (error) {
      console.error('Error completing forecast:', error);
      throw error;
    }
  }

  async archive(forecastId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('forecasts')
        .update({ status: 'archived' })
        .eq('id', forecastId);

      if (error) throw error;
    } catch (error) {
      console.error('Error archiving forecast:', error);
      throw error;
    }
  }

  async updateActuals(forecastId: string, actualAmount: number): Promise<void> {
    try {
      await this.updateForecast('', forecastId, { actual_amount: actualAmount });
    } catch (error) {
      console.error('Error updating actuals:', error);
      throw error;
    }
  }

  async recalculateVariance(forecastId: string): Promise<void> {
    try {
      const forecast = await this.getForecast('', forecastId);
      if (forecast && forecast.actual_amount !== undefined) {
        const variance = forecast.actual_amount - forecast.projected_amount;
        const variancePercentage = forecast.projected_amount !== 0 
          ? (variance / forecast.projected_amount) * 100 
          : 0;

        await this.supabase
          .from('forecasts')
          .update({
            variance_amount: variance,
            variance_percentage: variancePercentage
          })
          .eq('id', forecastId);
      }
    } catch (error) {
      console.error('Error recalculating variance:', error);
      throw error;
    }
  }

  // Statistics
  async getForecastStatistics(orgId: string): Promise<ForecastStatistics> {
    try {
      const { data: forecasts, error } = await this.supabase
        .from('forecasts')
        .select('*')
        .eq('organization_id', orgId);

      if (error) throw error;

      const totalForecasts = forecasts?.length || 0;
      const activeForecasts = forecasts?.filter(f => f.status === 'active').length || 0;
      const completedForecasts = forecasts?.filter(f => f.status === 'completed').length || 0;
      const totalProjectedAmount = forecasts?.reduce((sum, f) => sum + f.projected_amount, 0) || 0;
      const totalActualAmount = forecasts?.filter(f => f.actual_amount !== null)
        .reduce((sum, f) => sum + (f.actual_amount || 0), 0) || 0;

      // Calculate average accuracy for completed forecasts
      const completedWithActuals = forecasts?.filter(f => f.status === 'completed' && f.actual_amount !== null) || [];
      const averageAccuracy = completedWithActuals.length ? 
        completedWithActuals.reduce((sum, f) => {
          const accuracy = f.projected_amount !== 0 ? 
            100 - Math.abs((f.variance_percentage || 0)) : 0;
          return sum + accuracy;
        }, 0) / completedWithActuals.length : 0;

      const averageVariance = completedWithActuals.length ?
        completedWithActuals.reduce((sum, f) => sum + Math.abs(f.variance_percentage || 0), 0) / completedWithActuals.length : 0;

      // Calculate forecasts by type
      const typeMap = new Map();
      forecasts?.forEach(forecast => {
        const type = forecast.forecast_type;
        if (!typeMap.has(type)) {
          typeMap.set(type, { count: 0, projected_amount: 0, actual_amount: 0, accuracy: 0 });
        }
        const current = typeMap.get(type);
        current.count += 1;
        current.projected_amount += forecast.projected_amount;
        current.actual_amount += forecast.actual_amount || 0;
        
        if (forecast.status === 'completed' && forecast.actual_amount !== null) {
          const accuracy = forecast.projected_amount !== 0 ? 
            100 - Math.abs((forecast.variance_percentage || 0)) : 0;
          current.accuracy = (current.accuracy * (current.count - 1) + accuracy) / current.count;
        }
      });

      const forecastsByType = Array.from(typeMap.entries())
        .map(([type, data]) => ({ type, ...data }));

      // Calculate confidence level breakdown
      const confidenceMap = new Map();
      forecasts?.forEach(forecast => {
        const level = forecast.confidence_level;
        if (!confidenceMap.has(level)) {
          confidenceMap.set(level, { count: 0, accuracy: 0 });
        }
        const current = confidenceMap.get(level);
        current.count += 1;
        
        if (forecast.status === 'completed' && forecast.actual_amount !== null) {
          const accuracy = forecast.projected_amount !== 0 ? 
            100 - Math.abs((forecast.variance_percentage || 0)) : 0;
          current.accuracy = (current.accuracy * (current.count - 1) + accuracy) / current.count;
        }
      });

      const confidenceLevelBreakdown = Array.from(confidenceMap.entries())
        .map(([level, data]) => ({ level, ...data }));

      // Calculate monthly accuracy trend
      const monthlyAccuracy = this.calculateMonthlyAccuracy(forecasts || []);

      // Calculate top performing categories
      const categoryMap = new Map();
      forecasts?.forEach(forecast => {
        const category = forecast.category || 'Uncategorized';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { count: 0, accuracy: 0 });
        }
        const current = categoryMap.get(category);
        current.count += 1;
        
        if (forecast.status === 'completed' && forecast.actual_amount !== null) {
          const accuracy = forecast.projected_amount !== 0 ? 
            100 - Math.abs((forecast.variance_percentage || 0)) : 0;
          current.accuracy = (current.accuracy * (current.count - 1) + accuracy) / current.count;
        }
      });

      const topPerformingCategories = Array.from(categoryMap.entries())
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.accuracy - a.accuracy)
        .slice(0, 5);

      return {
        totalForecasts,
        activeForecasts,
        completedForecasts,
        totalProjectedAmount,
        totalActualAmount,
        averageAccuracy,
        averageVariance,
        forecastsByType,
        confidenceLevelBreakdown,
        monthlyAccuracy,
        topPerformingCategories
      };
    } catch (error) {
      console.error('Error fetching forecast statistics:', error);
      throw error;
    }
  }

  // Export functionality
  async exportForecasts(orgId: string, format: 'csv' | 'json', filters?: ForecastFilters): Promise<string> {
    try {
      const forecasts = await this.getForecasts(orgId, filters);
      
      if (format === 'json') {
        return JSON.stringify(forecasts, null, 2);
      }

      // CSV format
      const exportData: ForecastExportData[] = forecasts.map(forecast => ({
        title: forecast.title,
        description: forecast.description || '',
        forecast_type: forecast.forecast_type,
        period_type: forecast.period_type,
        start_date: forecast.start_date,
        end_date: forecast.end_date,
        status: forecast.status,
        currency: forecast.currency,
        projected_amount: forecast.projected_amount.toString(),
        actual_amount: (forecast.actual_amount || 0).toString(),
        variance_amount: (forecast.variance_amount || 0).toString(),
        variance_percentage: (forecast.variance_percentage || 0).toString(),
        confidence_level: forecast.confidence_level,
        methodology: forecast.methodology || '',
        assumptions: forecast.assumptions?.join('; ') || '',
        risk_factors: forecast.risk_factors?.join('; ') || '',
        project_id: forecast.project_id || '',
        category: forecast.category || '',
        tags: forecast.tags?.join(', ') || '',
        notes: forecast.notes || ''
      }));

      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => `"${(row as unknown)[header] || ''}"`).join(',')
        )
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting forecasts:', error);
      throw error;
    }
  }

  // Utility methods
  formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  private calculateMonthlyAccuracy(forecasts: Forecast[]) {
    const monthlyData = new Map();
    const now = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(key, { 
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), 
        accuracy: 0, 
        forecast_count: 0 
      });
    }

    // Aggregate forecast accuracy data
    forecasts.forEach(forecast => {
      if (forecast.status === 'completed' && forecast.actual_amount !== null) {
        const date = new Date(forecast.end_date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData.has(key)) {
          const current = monthlyData.get(key);
          const accuracy = forecast.projected_amount !== 0 ? 
            100 - Math.abs((forecast.variance_percentage || 0)) : 0;
          current.accuracy = (current.accuracy * current.forecast_count + accuracy) / (current.forecast_count + 1);
          current.forecast_count += 1;
        }
      }
    });

    return Array.from(monthlyData.values());
  }
}
