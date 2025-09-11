'use client';

import { cn } from '@ghxstship/ui/system';

interface ProgressBarProps {
  percentage: number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export function ProgressBar({ 
  percentage, 
  variant = 'default', 
  size = 'md',
  className,
  showLabel = false,
  animated = true
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2', 
    lg: 'h-3'
  };
  
  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-destructive',
    info: 'bg-primary'
  };

  const safePercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{Math.round(safePercentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-muted rounded-full', sizeClasses[size])}>
        <div 
          className={cn(
            variantClasses[variant], 
            sizeClasses[size], 
            'rounded-full',
            animated && 'transition-all duration-300 ease-out'
          )}
          style={{ width: `${safePercentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
