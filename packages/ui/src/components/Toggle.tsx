'use client';

import React, { forwardRef } from 'react';
import { cn } from '../system';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  error?: string;
  loading?: boolean;
}

const toggleVariants = {
  variant: {
    default: {
      track: 'bg-muted peer-checked:bg-primary peer-focus:ring-primary/30',
      thumb: 'bg-background',
    },
    success: {
      track: 'bg-muted peer-checked:bg-success peer-focus:ring-success/30',
      thumb: 'bg-background',
    },
    warning: {
      track: 'bg-muted peer-checked:bg-warning peer-focus:ring-warning/30',
      thumb: 'bg-background',
    },
    danger: {
      track: 'bg-muted peer-checked:bg-destructive peer-focus:ring-destructive/30',
      thumb: 'bg-background',
    },
  },
  size: {
    sm: {
      track: 'w-9 h-5',
      thumb: 'w-4 h-4 peer-checked:translate-x-4',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5 peer-checked:translate-x-5',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6 peer-checked:translate-x-7',
    },
  },
};

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md',
    label,
    description,
    error,
    loading = false,
    disabled,
    ...props 
  }, ref) => {
    const trackClasses = cn(
      'peer sr-only',
    );

    const trackVisualClasses = cn(
      'relative rounded-full transition-colors duration-200 ease-in-out',
      'peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-offset-background',
      'cursor-pointer',
      toggleVariants.variant[variant].track,
      toggleVariants.size[size].track,
      (disabled || loading) && 'opacity-50 cursor-not-allowed',
      error && 'ring-2 ring-destructive'
    );

    const thumbClasses = cn(
      'absolute top-0.5 left-0.5 rounded-full transition-transform duration-200 ease-in-out',
      'pointer-events-none shadow-sm',
      toggleVariants.variant[variant].thumb,
      toggleVariants.size[size].thumb,
      loading && 'animate-pulse'
    );

    const toggle = (
      <div className="relative inline-flex items-center">
        <input
          ref={ref}
          type="checkbox"
          className={trackClasses}
          disabled={disabled || loading}
          {...props}
        />
        <div className={trackVisualClasses}>
          <div className={thumbClasses} />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    );

    if (label || description) {
      return (
        <div className={cn('flex items-start gap-3', className)}>
          {toggle}
          <div className="flex-1 min-w-0">
            {label && (
              <label 
                className={cn(
                  'text-sm font-medium text-foreground cursor-pointer',
                  (disabled || loading) && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => !disabled && !loading && ref && 'current' in ref && ref.current?.click()}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
            {error && (
              <p className="text-sm text-destructive mt-1">
                {error}
              </p>
            )}
          </div>
        </div>
      );
    }

    return <div className={className}>{toggle}</div>;
  }
);

Toggle.displayName = 'Toggle';
