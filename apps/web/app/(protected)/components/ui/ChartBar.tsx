'use client';

import { cn } from '@ghxstship/ui/system';
import { ProgressBar } from './ProgressBar';

interface ChartBarItem {
  label: string;
  value: number;
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  percentage?: number;
}

interface ChartBarProps {
  data: ChartBarItem[];
  maxValue?: number;
  className?: string;
  showValues?: boolean;
  animated?: boolean;
}

export function ChartBar({ 
  data, 
  maxValue, 
  className,
  showValues = true,
  animated = true 
}: ChartBarProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));
  
  return (
    <div className={cn('space-y-3', className)}>
      {data.map((item, index) => {
        const percentage = item.percentage ?? (max > 0 ? (item.value / max) * 100 : 0);
        
        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">{item.label}</span>
              {showValues && (
                <span className="font-semibold">{item.value}</span>
              )}
            </div>
            <ProgressBar 
              percentage={percentage}
              variant={item.color || 'default'}
              size="md"
              animated={animated}
            />
          </div>
        );
      })}
    </div>
  );
}

export default ChartBar;
