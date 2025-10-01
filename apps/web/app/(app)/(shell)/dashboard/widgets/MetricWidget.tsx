'use client';


import React, { useState, useEffect } from 'react';
import { Card, Badge } from '@ghxstship/ui';
import { StatusBadge } from "../../../../_components/ui"
import { TrendingUp, TrendingDown, Minus, MoreHorizontal } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Utility function to calculate percentage change
const calculateChange = (current: number, previous: number): number => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

interface MetricWidgetProps {
  id: string;
  title: string;
  config: {
    metrics: Array<{
      key: string;
      label: string;
      format: 'number' | 'currency' | 'percentage';
      color?: string;
      icon?: string;
    }>;
    dataSource: string;
    timeframe?: string;
    showTrend?: boolean;
    showComparison?: boolean;
  };
  organizationId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function MetricWidget({ 
  id, 
  title, 
  config, 
  organizationId, 
  onEdit, 
  onDelete 
}: MetricWidgetProps) {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchMetricData() {
      try {
        setLoading(true);
        
        // Fetch data based on data source
        let query;
        switch (config.dataSource) {
          case 'projects':
            query = supabase
              .from('projects')
              .select('*')
              .eq('organization_id', organizationId);
            break;
          case 'people':
            query = supabase
              .from('people')
              .select('*')
              .eq('organization_id', organizationId);
            break;
          case 'finance':
            query = supabase
              .from('budgets')
              .select('*')
              .eq('organization_id', organizationId);
            break;
          default:
            throw new Error(`Unsupported data source: ${config.dataSource}`);
        }

        const { data: rawData, error } = await query;
        
        if (error) throw error;

        // Process data for metrics
        const processedData: Record<string, any> = {};
        
        for (const metric of config.metrics) {
          switch (metric.key) {
            case 'total_count':
              processedData[metric.key] = rawData?.length || 0;
              break;
            case 'active_count':
              processedData[metric.key] = rawData?.filter(item => item.status === 'active').length || 0;
              break;
            case 'total_budget':
              processedData[metric.key] = rawData?.reduce((sum, item) => sum + (item.budget || item.amount || 0), 0) || 0;
              break;
            case 'total_spent':
              processedData[metric.key] = rawData?.reduce((sum, item) => sum + (item.spent || 0), 0) || 0;
              break;
            default:
              processedData[metric.key] = 0;
          }
        }

        setData(processedData);
      } catch (err) {
        console.error('Error fetching metric data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchMetricData();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`metric-widget-${id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: config.dataSource,
          filter: `organization_id=eq.${organizationId}`
        }, 
        () => {
          fetchMetricData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id, config, organizationId, supabase]);

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-icon-xs w-icon-xs color-success" />;
    if (change < 0) return <TrendingDown className="h-icon-xs w-icon-xs color-destructive" />;
    return <Minus className="h-icon-xs w-icon-xs color-muted" />;
  };

  if (loading) {
    return (
      <Card className="p-lg h-full">
        <div className="animate-pulse">
          <div className="h-icon-xs bg-secondary/50 rounded w-3/4 mb-md"></div>
          <div className="stack-sm">
            {config.metrics.map((_, index) => (
              <div key={index} className="stack-sm">
                <div className="h-3 bg-secondary/50 rounded w-1/2"></div>
                <div className="h-icon-lg bg-secondary/50 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-lg h-full">
        <div className="text-center">
          <p className="text-body-sm color-destructive mb-sm">Error loading data</p>
          <p className="text-body-sm color-muted">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-lg h-full relative group">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-md">
        <h3 className="text-body text-heading-4">{title}</h3>
        {(onEdit || onDelete) && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-xs color-muted hover:color-foreground rounded"
              aria-label="Edit widget"
            >
              <MoreHorizontal className="h-icon-xs w-icon-xs" />
            </button>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="stack-md">
        {config.metrics.map((metric, index) => {
          const value = data[metric.key] || 0;
          const previousValue = data.previous?.[metric.key] || 0;
          const change = calculateChange(value, previousValue);
          
          return (
            <div key={index} className="stack-xs">
              <div className="flex items-center justify-between">
                <p className="text-body-sm form-label color-muted">{metric.label}</p>
                {config.showTrend && (
                  <div className="flex items-center cluster-xs">
                    {getTrendIcon(change)}
                    <span className={`text-body-sm ${
                      change > 0 ? 'color-success' : 
                      change < 0 ? 'color-destructive' : 'color-muted'
                    }`}>
                      {change !== 0 && `${change > 0 ? '+' : ''}${change}%`}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-baseline cluster-sm">
                <p className="text-heading-3 text-heading-3">
                  {formatValue(value, metric.format)}
                </p>
                {metric.color && (
                  <Badge variant="outline">
                    {metric.label}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {config.timeframe && (
        <div className="mt-md pt-md border-t border-border">
          <p className="text-body-sm color-muted">
            Data for {config.timeframe}
          </p>
        </div>
      )}
    </Card>
  );
}
