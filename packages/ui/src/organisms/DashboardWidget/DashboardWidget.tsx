'use client';

import { MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '../../components/atomic/Button';
import { Badge } from '../../components/Badge';

export interface DashboardWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon?: React.ReactNode;
  onAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function DashboardWidget({
  title,
  value,
  subtitle,
  trend,
  icon,
  onAction,
  className = '',
  children,
}: DashboardWidgetProps) {
  return (
    <div className={`bg-card border rounded-lg p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-primary/10 rounded-lg">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          </div>
        </div>
        {onAction && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onAction}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold">{value}</span>
          {trend && (
            <Badge
              variant={trend.direction === 'up' ? 'default' : 'destructive'}
              className="mb-1"
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(trend.value)}%
            </Badge>
          )}
        </div>

        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {children && (
        <div className="mt-4 pt-4 border-t">
          {children}
        </div>
      )}
    </div>
  );
}
