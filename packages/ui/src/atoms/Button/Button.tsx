/**
 * Button Component — Primary Interactive Element
 * Modern button with variants, sizes, and states
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'link';
  
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Loading state */
  loading?: boolean;
  
  /** Icon (left) */
  icon?: LucideIcon;
  
  /** Icon (right) */
  iconRight?: LucideIcon;
  
  /** Full width */
  fullWidth?: boolean;
}

/**
 * Button Component
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="ghost" icon={Plus}>Add Item</Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon: Icon,
      iconRight: IconRight,
      fullWidth = false,
      children,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      inline-flex items-center justify-center gap-2
      font-medium
      rounded-md
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
    `;
    
    const variantClasses = {
      primary: `
        bg-primary
        text-primary-foreground
        hover:opacity-90
        focus:ring-primary
      `,
      secondary: `
        bg-secondary
        text-secondary-foreground
        hover:opacity-90
        focus:ring-[var(--color-secondary)]
      `,
      ghost: `
        bg-transparent
        text-foreground
        hover:bg-muted
        focus:ring-primary
      `,
      destructive: `
        bg-destructive
        text-destructive-foreground
        hover:opacity-90
        focus:ring-[var(--color-error)]
      `,
      outline: `
        bg-transparent
        border border-border
        text-foreground
        hover:bg-muted
        focus:ring-primary
      `,
      link: `
        bg-transparent
        text-primary
        hover:underline
        focus:ring-primary
        p-0
      `,
    };
    
    const sizeClasses = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
      xl: 'px-6 py-3 text-base',
    };
    
    const iconSizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      xl: 'w-5 h-5',
    };
    
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${variant !== 'link' ? sizeClasses[size] : ''}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <svg
            className={`animate-spin ${iconSizeClasses[size]}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && Icon && <Icon className={iconSizeClasses[size]} />}
        {children}
        {!loading && IconRight && <IconRight className={iconSizeClasses[size]} />}
      </button>
    );
  }
);

Button.displayName = 'Button';
