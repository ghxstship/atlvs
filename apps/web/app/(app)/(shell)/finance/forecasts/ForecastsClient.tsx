'use client';


import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Button, Badge, Skeleton, Drawer, type DataRecord } from '@ghxstship/ui';
import { 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Target,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  PieChart
} from 'lucide-react';

interface ForecastsClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface Forecast {
  id: string;
  name: string;
  description?: string;
  type: 'revenue' | 'expense' | 'budget' | 'cash_flow';
  period: 'monthly' | 'quarterly' | 'annually';
  start_date: string;
  end_date: string;
  projected_amount: number;
  actual_amount?: number;
  currency: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  assumptions?: string;
  confidence_level: 'low' | 'medium' | 'high';
  variance?: number;
  created_at: string;
  updated_at: string;
  organization_id: string;
  created_by: string;
}

export default function ForecastsClient({ user, orgId, translations }: ForecastsClientProps) {
  const [loading, setLoading] = useState(true);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [selectedForecast, setSelectedForecast] = useState<Forecast | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  const supabase = createBrowserClient();

  useEffect(() => {
    loadForecasts();
  }, [orgId, typeFilter, periodFilter]);

  const loadForecasts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('forecasts')
        .select('*')
        .eq('organization_id', orgId);

      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }

      if (periodFilter !== 'all') {
        query = query.eq('period', periodFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setForecasts(data || []);
    } catch (error) {
      console.error('Error loading forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForecast = () => {
    setSelectedForecast(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditForecast = (forecast: Forecast) => {
    setSelectedForecast(forecast);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewForecast = (forecast: Forecast) => {
    setSelectedForecast(forecast);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleDeleteForecast = async (forecastId: string) => {
    if (!confirm('Are you sure you want to delete this forecast?')) return;

    try {
      const { error } = await supabase
        .from('forecasts')
        .delete()
        .eq('id', forecastId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadForecasts();
    } catch (error) {
      console.error('Error deleting forecast:', error);
    }
  };

  const handleUpdateActuals = async (forecastId: string, actualAmount: number) => {
    try {
      const forecast = forecasts.find(f => f.id === forecastId);
      if (!forecast) return;

      const variance = ((actualAmount - forecast.projected_amount) / forecast.projected_amount) * 100;

      const { error } = await supabase
        .from('forecasts')
        .update({
          actual_amount: actualAmount,
          variance: variance,
          status: 'completed'
        })
        .eq('id', forecastId)
        .eq('organization_id', orgId);

      if (error) throw error;
      await loadForecasts();
    } catch (error) {
      console.error('Error updating actuals:', error);
    }
  };

  const handleSaveForecast = async (forecastData: Partial<Forecast>) => {
    try {
      if (drawerMode === 'create') {
        const { error } = await supabase
          .from('forecasts')
          .insert({
            ...forecastData,
            organization_id: orgId,
            created_by: user.id,
            status: 'draft'
          });

        if (error) throw error;
      } else if (drawerMode === 'edit' && selectedForecast) {
        const { error } = await supabase
          .from('forecasts')
          .update(forecastData)
          .eq('id', selectedForecast.id)
          .eq('organization_id', orgId);

        if (error) throw error;
      }

      setDrawerOpen(false);
      await loadForecasts();
    } catch (error) {
      console.error('Error saving forecast:', error);
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getVarianceColor = (variance?: number) => {
    if (!variance) return 'color-foreground/70';
    if (Math.abs(variance) <= 5) return 'color-success';
    if (Math.abs(variance) <= 15) return 'color-warning';
    return 'color-destructive';
  };

  const getConfidenceBadge = (level: string) => {
    const config = {
      low: { variant: 'destructive' as const, label: 'Low Confidence' },
      medium: { variant: 'secondary' as const, label: 'Medium Confidence' },
      high: { variant: 'default' as const, label: 'High Confidence' }
    };
    
    const conf = config[level as keyof typeof config] || config.medium;
    return <Badge variant={conf.variant}>{conf.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'revenue':
        return <TrendingUp className="h-5 w-5 color-success" />;
      case 'expense':
        return <TrendingUp className="h-5 w-5 color-destructive rotate-180" />;
      case 'budget':
        return <Target className="h-5 w-5 color-primary" />;
      case 'cash_flow':
        return <Activity className="h-5 w-5 color-secondary" />;
      default:
        return <BarChart3 className="h-5 w-5 color-muted" />;
    }
  };

  const fieldConfigs: FieldConfig[] = [
    {
      key: 'name',
      label: 'Forecast Name',
      type: 'text',
      required: true
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea'
    },
    {
      key: 'type',
      label: 'Forecast Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Revenue Forecast', value: 'revenue' },
        { label: 'Expense Forecast', value: 'expense' },
        { label: 'Budget Forecast', value: 'budget' },
        { label: 'Cash Flow Forecast', value: 'cash_flow' }
      ]
    },
    {
      key: 'period',
      label: 'Forecast Period',
      type: 'select',
      required: true,
      options: [
        { label: 'Monthly', value: 'monthly' },
        { label: 'Quarterly', value: 'quarterly' },
        { label: 'Annually', value: 'annually' }
      ]
    },
    {
      key: 'projected_amount',
      label: 'Projected Amount',
      type: 'number',
      required: true
    },
    {
      key: 'currency',
      label: 'Currency',
      type: 'select',
      required: true,
      defaultValue: 'USD',
      options: [
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' }
      ]
    },
    {
      key: 'start_date',
      label: 'Start Date',
      type: 'date',
      required: true
    },
    {
      key: 'end_date',
      label: 'End Date',
      type: 'date',
      required: true
    },
    {
      key: 'confidence_level',
      label: 'Confidence Level',
      type: 'select',
      required: true,
      defaultValue: 'medium',
      options: [
        { label: 'Low Confidence', value: 'low' },
        { label: 'Medium Confidence', value: 'medium' },
        { label: 'High Confidence', value: 'high' }
      ]
    },
    {
      key: 'assumptions',
      label: 'Key Assumptions',
      type: 'textarea'
    }
  ];

  const forecastRecords: DataRecord[] = forecasts.map(forecast => ({
    id: forecast.id,
    name: forecast.name,
    description: forecast.description,
    type: forecast.type,
    period: forecast.period,
    projected_amount: forecast.projected_amount,
    actual_amount: forecast.actual_amount,
    currency: forecast.currency,
    confidence_level: forecast.confidence_level,
    variance: forecast.variance,
    start_date: forecast.start_date,
    end_date: forecast.end_date,
    created_at: forecast.created_at
  }));

  const typeCounts = {
    all: forecasts.length,
    revenue: forecasts.filter(f => f.type === 'revenue').length,
    expense: forecasts.filter(f => f.type === 'expense').length,
    budget: forecasts.filter(f => f.type === 'budget').length,
    cash_flow: forecasts.filter(f => f.type === 'cash_flow').length
  };

  const periodCounts = {
    all: forecasts.length,
    monthly: forecasts.filter(f => f.period === 'monthly').length,
    quarterly: forecasts.filter(f => f.period === 'quarterly').length,
    annually: forecasts.filter(f => f.period === 'annually').length
  };

  const analytics = {
    totalProjected: forecasts.reduce((sum, f) => sum + f.projected_amount, 0),
    totalActual: forecasts.reduce((sum, f) => sum + (f.actual_amount || 0), 0),
    completedForecasts: forecasts.filter(f => f.actual_amount !== null).length,
    averageAccuracy: forecasts.filter(f => f.variance !== null).length > 0 
      ? forecasts.filter(f => f.variance !== null).reduce((sum, f) => sum + Math.abs(f.variance!), 0) / forecasts.filter(f => f.variance !== null).length
      : 0
  };

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-lg">
              <Skeleton className="h-4 w-32 mb-sm" />
              <Skeleton className="h-6 w-24 mb-md" />
              <Skeleton className="h-4 w-20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <StateManagerProvider>
      <div className="stack-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-3 text-heading-3 color-foreground">{translations.title}</h1>
            <p className="text-body-sm color-foreground/70 mt-xs">{translations.subtitle}</p>
          </div>
          <div className="flex items-center cluster-sm">
            <ViewSwitcher />
            <Button onClick={handleCreateForecast}>
              <Plus className="h-4 w-4 mr-sm" />
              Create Forecast
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-md">
          {/* Type Filter */}
          <div className="flex cluster-xs bg-secondary p-xs rounded-lg">
            {Object.entries(typeCounts).map(([type, count]) => (
              <Button
                key={type}
                variant={typeFilter === type ? 'primary' : 'ghost'}
               
                onClick={() => setTypeFilter(type)}
                className="capitalize"
              >
                {type.replace('_', ' ')} ({count})
              </Button>
            ))}
          </div>

          {/* Period Filter */}
          <div className="flex cluster-xs bg-secondary p-xs rounded-lg">
            {Object.entries(periodCounts).map(([period, count]) => (
              <Button
                key={period}
                variant={periodFilter === period ? 'primary' : 'ghost'}
               
                onClick={() => setPeriodFilter(period)}
                className="capitalize"
              >
                {period} ({count})
              </Button>
            ))}
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          <Card className="p-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm color-foreground/70">Total Forecasts</p>
                <p className="text-heading-3 text-heading-3 color-foreground">{forecasts.length}</p>
                <p className="text-body-sm color-foreground/60">{analytics.completedForecasts} completed</p>
              </div>
              <BarChart3 className="h-8 w-8 color-primary" />
            </div>
          </Card>
          
          <Card className="p-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm color-foreground/70">Total Projected</p>
                <p className="text-heading-3 text-heading-3 color-primary">
                  {formatCurrency(analytics.totalProjected)}
                </p>
              </div>
              <Target className="h-8 w-8 color-primary" />
            </div>
          </Card>
          
          <Card className="p-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm color-foreground/70">Total Actual</p>
                <p className="text-heading-3 text-heading-3 color-success">
                  {formatCurrency(analytics.totalActual)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 color-success" />
            </div>
          </Card>
          
          <Card className="p-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm color-foreground/70">Avg Accuracy</p>
                <p className="text-heading-3 text-heading-3 color-secondary">
                  {analytics.averageAccuracy > 0 ? `${(100 - analytics.averageAccuracy).toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-body-sm color-foreground/60">forecast accuracy</p>
              </div>
              <PieChart className="h-8 w-8 color-secondary" />
            </div>
          </Card>
        </div>

        {/* Forecast Grid/List View */}
        {currentView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {forecasts.map((forecast: any) => (
              <Card key={forecast.id} className="p-lg hover:shadow-elevated transition-shadow cursor-pointer" onClick={() => handleViewForecast(forecast)}>
                <div className="flex items-start justify-between mb-md">
                  <div className="flex items-center cluster-sm">
                    {getTypeIcon(forecast.type)}
                    <div>
                      <h3 className="text-heading-4 color-foreground">{forecast.name}</h3>
                      <p className="text-body-sm color-foreground/70 capitalize">{forecast.type.replace('_', ' ')} • {forecast.period}</p>
                    </div>
                  </div>
                  {getConfidenceBadge(forecast.confidence_level)}
                </div>
                
                <div className="stack-sm mb-md">
                  <div className="flex justify-between text-body-sm">
                    <span className="color-foreground/70">Projected</span>
                    <span className="form-label color-primary">{formatCurrency(forecast.projected_amount, forecast.currency)}</span>
                  </div>
                  
                  {forecast.actual_amount !== null && (
                    <div className="flex justify-between text-body-sm">
                      <span className="color-foreground/70">Actual</span>
                      <span className="form-label color-success">{formatCurrency(forecast.actual_amount || 0, forecast.currency)}</span>
                    </div>
                  )}
                  
                  {forecast.variance !== null && (
                    <div className="flex justify-between text-body-sm">
                      <span className="color-foreground/70">Variance</span>
                      <span className={`form-label ${getVarianceColor(forecast.variance)}`}>
                        {formatPercentage(forecast.variance || 0)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-body-sm">
                    <span className="color-foreground/70">Period</span>
                    <span className="form-label">{formatDate(forecast.start_date)} - {formatDate(forecast.end_date)}</span>
                  </div>
                  
                  {forecast.assumptions && (
                    <div className="text-body-sm color-foreground/70">
                      <span className="form-label">Assumptions:</span> {forecast.assumptions.length > 100 
                        ? `${forecast.assumptions.substring(0, 100)}...`
                        : forecast.assumptions
                      }
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-md border-t border-border">
                  <div className="flex cluster-sm">
                    {!forecast.actual_amount && (
                      <Button
                        variant="ghost"
                       
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          const actual = prompt('Enter actual amount:');
                          if (actual !== null && !isNaN(Number(actual))) {
                            handleUpdateActuals(forecast.id, Number(actual));
                          }
                        }}
                      >
                        Add Actuals
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex cluster-sm">
                    <Button
                      variant="ghost"
                     
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleEditForecast(forecast);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                     
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleDeleteForecast(forecast.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-lg">
            <DataGrid />
          </Card>
        )}

        {/* Empty State */}
        {forecasts.length === 0 && (
          <Card className="p-2xl text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-md color-foreground/30" />
            <h3 className="text-body text-heading-4 color-foreground mb-sm">No forecasts found</h3>
            <p className="color-foreground/70 mb-md">Create your first financial forecast to start planning</p>
            <Button onClick={handleCreateForecast}>
              <Plus className="h-4 w-4 mr-sm" />
              Create Forecast
            </Button>
          </Card>
        )}

        {/* Universal Drawer for CRUD operations */}
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Create New Forecast"
        >
          <div className="p-md">
            <p>Forecast creation form will be implemented here.</p>
          </div>
        </Drawer>

      </div>
    </StateManagerProvider>
  );
}
