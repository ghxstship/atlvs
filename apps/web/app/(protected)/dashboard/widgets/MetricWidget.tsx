'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge } from '@ghxstship/ui';
import { ColoredBadge } from '../../components/ui/ColoredBadge';
import { TrendingUp, TrendingDown, Minus, MoreHorizontal } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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
    if (change > 0) return <TrendingUp className="h-4 w-4 text-success" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <Card className="p-6 h-full">
        <div className="animate-pulse">
          <div className="h-4 bg-muted/50 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {config.metrics.map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-3 bg-muted/50 rounded w-1/2"></div>
                <div className="h-8 bg-muted/50 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 h-full">
        <div className="text-center">
          <p className="text-sm text-destructive mb-2">Error loading data</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 h-full relative group">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {(onEdit || onDelete) && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1 text-muted-foreground hover:text-foreground rounded"
              aria-label="Edit widget"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="space-y-4">
        {config.metrics.map((metric, index) => {
          const value = data[metric.key] || 0;
          const change = 0; // TODO: Calculate actual change based on timeframe
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                {config.showTrend && (
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(change)}
                    <span className={`text-xs ${
                      change > 0 ? 'text-success' : 
                      change < 0 ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {change !== 0 && `${change > 0 ? '+' : ''}${change}%`}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-bold">
                  {formatValue(value, metric.format)}
                </p>
                {metric.color && (
                  <ColoredBadge
                    color={metric.color}
                    variant="subtle"
                    className="text-xs"
                  >
                    {metric.label}
                  </ColoredBadge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {config.timeframe && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Data for {config.timeframe}
          </p>
        </div>
      )}
    </Card>
  );
}
