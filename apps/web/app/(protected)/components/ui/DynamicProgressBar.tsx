'use client';

import { cn } from '@ghxstship/ui/system';
import { designTokens } from './DesignTokens';

interface DynamicProgressBarProps {
  percentage: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function DynamicProgressBar({
  percentage,
  variant = 'default',
  size = 'md',
  animated = true,
  showLabel = false,
  label,
  className
}: DynamicProgressBarProps) {
  const safePercentage = Math.min(Math.max(percentage, 0), 100);

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning', 
    error: 'bg-destructive',
    info: 'bg-info'
  };

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2', 
    lg: 'h-3'
  };

  const backgroundClasses = {
    default: 'bg-muted',
    success: 'bg-success/20',
    warning: 'bg-warning/20',
    error: 'bg-destructive/20', 
    info: 'bg-info/20'
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">
            {label}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(safePercentage)}%
          </span>
        </div>
      )}
      
      <div className={cn(
        'w-full rounded-full overflow-hidden',
        backgroundClasses[variant],
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            variantClasses[variant],
            animated && 'transition-all duration-300 ease-out'
          )}
          style={{ width: `${safePercentage}%` }}
        />
      </div>
    </div>
  );
}

// Utility component for budget utilization specifically
interface BudgetUtilizationBarProps {
  utilized: number;
  total: number;
  className?: string;
}

export function BudgetUtilizationBar({ utilized, total, className }: BudgetUtilizationBarProps) {
  const percentage = total > 0 ? (utilized / total) * 100 : 0;
  
  const getVariant = (pct: number) => {
    if (pct >= 90) return 'error';
    if (pct >= 75) return 'warning';
    return 'success';
  };

  return (
    <DynamicProgressBar
      percentage={percentage}
      variant={getVariant(percentage)}
      size="sm"
      showLabel={true}
      label="Budget Utilization"
      className={className}
    />
  );
}

// Utility component for completion tracking
interface CompletionBarProps {
  completed: number;
  total: number;
  label?: string;
  className?: string;
}

export function CompletionBar({ completed, total, label, className }: CompletionBarProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
  return (
    <DynamicProgressBar
      percentage={percentage}
      variant="success"
      size="sm"
      showLabel={!!label}
      label={label}
      className={className}
    />
  );
}
