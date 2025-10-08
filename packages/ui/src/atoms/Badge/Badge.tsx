/**
 * Badge Component — Status/Label Badge
 * Small badge for status indicators and labels
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Badge variant */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Show dot indicator */
  dot?: boolean;
}

/**
 * Badge Component
 * 
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="error" dot>Offline</Badge>
 * ```
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      dot = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      inline-flex items-center gap-1.5
      font-medium
      rounded-full
      transition-colors
    `;
    
    const variantClasses = {
      default: 'bg-[var(--color-muted)] text-[var(--color-foreground)]',
      primary: 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]',
      secondary: 'bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]',
      success: 'bg-[var(--color-success)] text-[var(--color-success-foreground)]',
      warning: 'bg-[var(--color-warning)] text-[var(--color-warning-foreground)]',
      error: 'bg-[var(--color-error)] text-[var(--color-error-foreground)]',
      info: 'bg-[var(--color-info)] text-[var(--color-info-foreground)]',
    };
    
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
      lg: 'px-3 py-1 text-sm',
    };
    
    const dotSizeClasses = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2 h-2',
    };
    
    return (
      <span
        ref={ref}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {dot && (
          <span
            className={`
              rounded-full bg-current
              ${dotSizeClasses[size]}
            `}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
