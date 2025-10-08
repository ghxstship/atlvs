/**
 * Tag Component — Removable Tag/Chip
 * Interactive tag with remove option
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Tag variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Removable */
  removable?: boolean;
  
  /** Remove handler */
  onRemove?: () => void;
}

/**
 * Tag Component
 * 
 * @example
 * ```tsx
 * <Tag>React</Tag>
 * <Tag variant="primary" removable onRemove={() => {}}>TypeScript</Tag>
 * ```
 */
export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      variant = 'default',
      size = 'md',
      removable = false,
      onRemove,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      inline-flex items-center gap-1
      font-medium
      rounded-md
      transition-colors
    `;
    
    const variantClasses = {
      default: 'bg-muted text-foreground',
      primary: 'bg-primary/10 text-primary',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      error: 'bg-destructive/10 text-destructive',
    };
    
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-sm',
    };
    
    const iconSizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-3.5 h-3.5',
      lg: 'w-4 h-4',
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
        {children}
        {removable && onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="
              hover:opacity-70
              transition-opacity
              focus:outline-none focus:ring-2 focus:ring-offset-1
              rounded-sm
            "
            aria-label="Remove tag"
          >
            <X className={iconSizeClasses[size]} />
          </button>
        )}
      </span>
    );
  }
);

Tag.displayName = 'Tag';
