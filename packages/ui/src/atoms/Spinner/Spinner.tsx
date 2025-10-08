/**
 * Spinner Component — Loading Spinner
 * Animated loading indicator
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Spinner size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Color variant */
  variant?: 'default' | 'primary' | 'white';
}

/**
 * Spinner Component
 * 
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" variant="primary" />
 * ```
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size = 'md',
      variant = 'default',
      className = '',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      xs: 'w-3 h-3 border',
      sm: 'w-4 h-4 border-2',
      md: 'w-6 h-6 border-2',
      lg: 'w-8 h-8 border-2',
      xl: 'w-12 h-12 border-3',
    };
    
    const variantClasses = {
      default: 'border-[var(--color-border)] border-t-[var(--color-foreground)]',
      primary: 'border-[var(--color-primary)]/20 border-t-[var(--color-primary)]',
      white: 'border-white/20 border-t-white',
    };
    
    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          rounded-full
          animate-spin
          ${className}
        `}
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';
