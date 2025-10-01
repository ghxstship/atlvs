'use client';


import React, { useState, useEffect } from 'react';
import { Card } from '@ghxstship/ui';
import { MoreHorizontal, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartWidgetProps {
  id: string;
  title: string;
  config: {
    chartType: 'line' | 'bar' | 'pie' | 'doughnut';
    dataSource: string;
    xAxis: string;
    yAxis: string | string[];
    groupBy?: string;
    aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max';
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    timeframe?: string;
  };
  organizationId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ChartWidget({ 
  id, 
  title, 
  config, 
  organizationId, 
  onEdit, 
  onDelete 
}: ChartWidgetProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const supabase = createClient();

  const defaultColors = [
    'hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--info))',
    'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--border))', 'hsl(var(--ring))'
  ];

  useEffect(() => {
    async function fetchChartData() {
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
          case 'jobs':
            query = supabase
              .from('jobs')
              .select('*')
              .eq('organization_id', organizationId);
            break;
          default:
            throw new Error(`Unsupported data source: ${config.dataSource}`);
        }

        const { data: rawData, error } = await query;
        
        if (error) throw error;

        // Process data for chart
        const processedData = processChartData(rawData || []);
        setChartData(processedData);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchChartData();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`chart-widget-${id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: config.dataSource,
          filter: `organization_id=eq.${organizationId}`
        }, 
        () => {
          fetchChartData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id, config, organizationId, supabase]);

  const processChartData = (rawData: any[]) => {
    if (!rawData.length) return null;

    const colors = config.colors || defaultColors;

    if (config.groupBy) {
      // Group data by specified field
      const grouped = rawData.reduce((acc, item) => {
        const key = item[config.groupBy!] || 'Unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});

      const labels = Object.keys(grouped);
      const values = labels.map(label => {
        const items = grouped[label];
        switch (config.aggregation) {
          case 'count':
            return items.length;
          case 'sum':
            return items.reduce((sum: number, item) => sum + (item[config.yAxis as string] || 0), 0);
          case 'avg':
            const total = items.reduce((sum: number, item) => sum + (item[config.yAxis as string] || 0), 0);
            return total / items.length;
          default:
            return items.length;
        }
      });

      return {
        labels,
        datasets: [{
          label: title,
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length),
          borderWidth: 2,
          fill: false,
        }]
      };
    } else {
      // Time series or simple data
      const labels = rawData.map(item => item[config.xAxis] || 'Unknown');
      const values = rawData.map(item => item[config.yAxis as string] || 0);

      return {
        labels,
        datasets: [{
          label: title,
          data: values,
          backgroundColor: colors[0] + '80',
          borderColor: colors[0],
          borderWidth: 2,
          fill: config.chartType === 'line' ? false : true,
        }]
      };
    }
  };

  const getChartOptions = (): ChartOptions<any> => {
    const baseOptions: ChartOptions<any> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: config.showLegend !== false,
          position: 'top' as const,
        },
        title: {
          display: false,
        },
      },
    };

    if (config.chartType === 'line' || config.chartType === 'bar') {
      return {
        ...baseOptions,
        scales: {
          x: {
            display: true,
            grid: {
              display: config.showGrid !== false,
            },
          },
          y: {
            display: true,
            grid: {
              display: config.showGrid !== false,
            },
          },
        },
      };
    }

    return baseOptions;
  };

  const renderChart = () => {
    if (!chartData) return null;

    const options = getChartOptions();

    switch (config.chartType) {
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  if (loading) {
    return (
      <Card className="p-lg h-full">
        <div className="animate-pulse">
          <div className="h-icon-xs bg-secondary/50 rounded w-3/4 mb-md"></div>
          <div className="h-container-sm bg-secondary/50 rounded"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-lg h-full">
        <div className="text-center">
          <p className="text-body-sm color-destructive mb-sm">Error loading chart</p>
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
        <div className="flex items-center cluster-sm">
          <button
            onClick={() => window.location.reload()}
            className="p-xs color-muted hover:color-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Refresh chart"
          >
            <RefreshCw className="h-icon-xs w-icon-xs" />
          </button>
          {(onEdit || onDelete) && (
            <button
              onClick={onEdit}
              className="p-xs color-muted hover:color-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Edit widget"
            >
              <MoreHorizontal className="h-icon-xs w-icon-xs" />
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-container-sm mb-md">
        {chartData ? renderChart() : (
          <div className="flex items-center justify-center h-full color-muted">
            No data available
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-body-sm color-muted">
        <span>
          Data source: {config.dataSource}
        </span>
        <span>
          Updated: {lastUpdated.toLocaleTimeString()}
        </span>
      </div>
    </Card>
  );
}
