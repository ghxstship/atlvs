'use client';

import React from 'react';
import { Card } from '@ghxstship/ui';
import { BarChart3, TrendingUp, Info } from 'lucide-react';

interface ChartViewProps {
  data?: unknown[];
  config?: {
    chartType?: 'bar' | 'line' | 'pie' | 'area';
    xAxis?: string;
    yAxis?: string;
    title?: string;
  };
}

export default function ChartView({ data = [], config }: ChartViewProps) {
  const chartType = config?.chartType || 'bar';
  const title = config?.title || 'Analytics Chart';

  return (
    <Card className="h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <BarChart3 className="h-5 w-5" />
          {title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
        </div>
      </div>
      
      <div className="relative h-64 bg-muted/30 rounded-lg flex items-center justify-center">
        <div className="text-center space-y-2">
          <Info className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            Chart visualization would render here
          </p>
          <p className="text-xs text-muted-foreground">
            Integrate with recharts, chart.js, or similar library
          </p>
        </div>
      </div>
      
      {data && Array.isArray(data) && data.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          {data.length} data points
        </div>
      )}
    </Card>
  );
}
