import { User } from '@supabase/supabase-js';

// Base forecast interface
export interface Forecast {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  forecast_type: 'revenue' | 'expense' | 'budget' | 'cashflow';
  period_type: 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  currency: string;
  projected_amount: number;
  actual_amount?: number;
  variance_amount?: number;
  variance_percentage?: number;
  confidence_level: 'low' | 'medium' | 'high';
  methodology?: string;
  assumptions?: string[];
  risk_factors?: string[];
  project_id?: string;
  category?: string;
  tags?: string[];
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Forecast data point for detailed forecasting
export interface ForecastDataPoint {
  id: string;
  forecast_id: string;
  period_start: string;
  period_end: string;
  projected_value: number;
  actual_value?: number;
  variance?: number;
  notes?: string;
}

// Create forecast data
export interface CreateForecastData {
  title: string;
  description?: string;
  forecast_type: 'revenue' | 'expense' | 'budget' | 'cashflow';
  period_type: 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  currency?: string;
  projected_amount: number;
  confidence_level: 'low' | 'medium' | 'high';
  methodology?: string;
  assumptions?: string[];
  risk_factors?: string[];
  project_id?: string;
  category?: string;
  tags?: string[];
  notes?: string;
  data_points?: Omit<ForecastDataPoint, 'id' | 'forecast_id'>[];
}

// Update forecast data
export interface UpdateForecastData extends Partial<CreateForecastData> {
  status?: 'draft' | 'active' | 'completed' | 'archived';
  actual_amount?: number;
  variance_amount?: number;
  variance_percentage?: number;
}

// Forecast filters
export interface ForecastFilters {
  forecast_type?: ('revenue' | 'expense' | 'budget' | 'cashflow')[];
  period_type?: ('monthly' | 'quarterly' | 'yearly')[];
  status?: string[];
  confidence_level?: ('low' | 'medium' | 'high')[];
  category?: string[];
  project_id?: string;
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// Forecast statistics
export interface ForecastStatistics {
  totalForecasts: number;
  activeForecasts: number;
  completedForecasts: number;
  totalProjectedAmount: number;
  totalActualAmount: number;
  averageAccuracy: number;
  averageVariance: number;
  forecastsByType: Array<{
    type: string;
    count: number;
    projected_amount: number;
    actual_amount: number;
    accuracy: number;
  }>;
  confidenceLevelBreakdown: Array<{
    level: string;
    count: number;
    accuracy: number;
  }>;
  monthlyAccuracy: Array<{
    month: string;
    accuracy: number;
    forecast_count: number;
  }>;
  topPerformingCategories: Array<{
    category: string;
    accuracy: number;
    count: number;
  }>;
}

// Component props
export interface ForecastsClientProps {
  user: User;
  orgId: string;
  translations: unknown;
}

export interface CreateForecastClientProps {
  user: User;
  orgId: string;
  onSuccess?: (forecast: Forecast) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateForecastData>;
}

export interface ForecastDrawerProps {
  forecast?: Forecast;
  mode: 'create' | 'edit' | 'view';
  onSave?: (forecast: Forecast) => void;
  onCancel?: () => void;
  user: User;
  orgId: string;
}

// Forecast workflow actions
export interface ForecastWorkflowActions {
  activate: (forecastId: string) => Promise<void>;
  complete: (forecastId: string, actualAmount: number) => Promise<void>;
  archive: (forecastId: string) => Promise<void>;
  updateActuals: (forecastId: string, actualAmount: number) => Promise<void>;
  recalculateVariance: (forecastId: string) => Promise<void>;
}

// Export/import types
export interface ForecastExportData {
  title: string;
  description: string;
  forecast_type: string;
  period_type: string;
  start_date: string;
  end_date: string;
  status: string;
  currency: string;
  projected_amount: string;
  actual_amount: string;
  variance_amount: string;
  variance_percentage: string;
  confidence_level: string;
  methodology: string;
  assumptions: string;
  risk_factors: string;
  project_id: string;
  category: string;
  tags: string;
  notes: string;
}

export interface ForecastImportData {
  title: string;
  description?: string;
  forecast_type: 'revenue' | 'expense' | 'budget' | 'cashflow';
  period_type: 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  currency?: string;
  projected_amount: number;
  confidence_level: 'low' | 'medium' | 'high';
  methodology?: string;
  assumptions?: string;
  risk_factors?: string;
  project_id?: string;
  category?: string;
  tags?: string;
  notes?: string;
}
