/**
 * Progress Component — Progress Indicator
 * Visual progress bar or circle
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Progress value (0-100) */
  value: number;
  
  /** Maximum value */
  max?: number;
  
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Color variant */
  variant?: 'primary' | 'success' | 'warning' | 'error';
  
  /** Show label */
  showLabel?: boolean;
}

/**
 * Progress Component
 * 
 * @example
 * ```tsx
 * <Progress value={60} />
 * <Progress value={80} variant="success" showLabel />
 * ```
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      size = 'md',
      variant = 'primary',
      showLabel = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };
    
    const variantClasses = {
      primary: 'bg-[var(--color-primary)]',
      success: 'bg-[var(--color-success)]',
      warning: 'bg-[var(--color-warning)]',
      error: 'bg-[var(--color-error)]',
    };
    
    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        {showLabel && (
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">{percentage.toFixed(0)}%</span>
          </div>
        )}
        <div
          className={`
            w-full
            ${sizeClasses[size]}
            bg-[var(--color-muted)]
            rounded-full
            overflow-hidden
          `}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={`
              h-full
              ${variantClasses[variant]}
              rounded-full
              transition-all duration-300
            `}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';
