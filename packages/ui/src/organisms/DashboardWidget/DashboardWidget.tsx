/**
 * DashboardWidget Component
 * Widget component for dashboard displays
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { MoreVertical } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../../molecules/Card/Card';

export interface DashboardWidgetProps {
  /** Widget title */
  title: string;
  
  /** Widget value/metric */
  value?: string | number;
  
  /** Widget description */
  description?: string;
  
  /** Icon */
  icon?: LucideIcon;
  
  /** Trend indicator */
  trend?: {
    value: number;
    label?: string;
  };
  
  /** Action menu */
  onMenuClick?: () => void;
  
  /** Widget content */
  children?: React.ReactNode;
  
  /** Loading state */
  loading?: boolean;
}

/**
 * DashboardWidget Component
 */
export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  onMenuClick,
  children,
  loading = false,
}) => {
  return (
    <Card className="relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              {title}
            </h3>
          </div>
        </div>
        
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
      
      {/* Content */}
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-24 mb-2" />
          <div className="h-4 bg-muted rounded w-32" />
        </div>
      ) : (
        <>
          {value !== undefined && (
            <div className="mb-2">
              <div className="text-3xl font-bold text-foreground">
                {value}
              </div>
            </div>
          )}
          
          {(description || trend) && (
            <div className="flex items-center gap-2 text-sm">
              {trend && (
                <span
                  className={
                    trend.value >= 0
                      ? 'text-success'
                      : 'text-destructive'
                  }
                >
                  {trend.value >= 0 ? '+' : ''}
                  {trend.value}%
                </span>
              )}
              {description && (
                <span className="text-muted-foreground">
                  {description}
                </span>
              )}
              {trend?.label && (
                <span className="text-muted-foreground">
                  {trend.label}
                </span>
              )}
            </div>
          )}
          
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </>
      )}
    </Card>
  );
};

DashboardWidget.displayName = 'DashboardWidget';
