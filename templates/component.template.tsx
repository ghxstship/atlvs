/**
 * {{COMPONENT_NAME}} Component — {{COMPONENT_DESCRIPTION}}
 * {{DETAILED_DESCRIPTION}}
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { cn } from '../../lib/utils';

export interface {{COMPONENT_NAME}}Props extends React.HTMLAttributes<HTMLElement> {
  /** Component variant */
  variant?: 'default' | 'primary' | 'secondary';
  
  /** Component size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Custom className */
  className?: string;
}

/**
 * {{COMPONENT_NAME}} Component
 * 
 * @example
 * ```tsx
 * <{{COMPONENT_NAME}} variant="primary" size="md">
 *   Content
 * </{{COMPONENT_NAME}}>
 * ```
 */
export const {{COMPONENT_NAME}} = React.forwardRef<HTMLElement, {{COMPONENT_NAME}}Props>(
  (
    {
      variant = 'default',
      size = 'md',
      disabled = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: 'bg-background text-foreground',
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
    };

    const sizeClasses = {
      sm: 'text-sm p-sm',
      md: 'text-base p-md',
      lg: 'text-lg p-lg',
    };

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(
          'inline-flex items-center justify-center',
          'rounded-md font-medium',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          variantClasses[variant],
          sizeClasses[size],
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </div>
    );
  }
);

{{COMPONENT_NAME}}.displayName = '{{COMPONENT_NAME}}';
