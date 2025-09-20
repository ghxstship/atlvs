'use client';

import React, { forwardRef } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '../system';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  indeterminate?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  error?: string;
}

const checkboxVariants = {
  variant: {
    default: 'border-border text-accent focus:ring-primary',
    primary: 'border-primary/30 text-accent focus:ring-primary',
    success: 'border-success/30 text-success focus:ring-success',
    warning: 'border-warning/30 text-warning focus:ring-warning',
    danger: 'border-destructive/30 text-destructive focus:ring-destructive',
  },
  size: {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  },
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    className, 
    indeterminate = false, 
    variant = 'default', 
    size = 'md',
    label,
    description,
    error,
    disabled,
    ...props 
  }, ref) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);
    
    React.useImperativeHandle(ref, () => checkboxRef.current!);

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const baseClasses = `
      rounded border-2 bg-background 
      focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200
      relative cursor-pointer
    `;

    const variantClasses = checkboxVariants.variant[variant];
    const sizeClasses = checkboxVariants.size[size];

    const checkboxClasses = cn(
      baseClasses,
      variantClasses,
      sizeClasses,
      error && 'border-destructive focus:ring-destructive',
      className
    );

    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

    const checkbox = (
      <div className="relative inline-flex items-center">
        <input
          ref={checkboxRef}
          type="checkbox"
          className={cn(checkboxClasses, 'peer sr-only')}
          disabled={disabled}
          {...props}
        />
        <div className={cn(
          'flex items-center justify-center',
          baseClasses,
          variantClasses,
          sizeClasses,
          error && 'border-destructive',
          'peer-checked:bg-current peer-checked:border-current',
          'peer-indeterminate:bg-current peer-indeterminate:border-current',
          disabled && 'opacity-50 cursor-not-allowed'
        )}>
          {indeterminate ? (
            <Minus 
              className="text-accent-foreground" 
              size={iconSize}
            />
          ) : (
            <Check 
              className="text-accent-foreground opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
              size={iconSize}
            />
          )}
        </div>
      </div>
    );

    if (label || description) {
      return (
        <div className="flex items-start gap-sm">
          {checkbox}
          <div className="flex-1 min-w-0">
            {label && (
              <label 
                className={cn(
                  'text-sm font-medium text-foreground cursor-pointer',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => !disabled && checkboxRef.current?.click()}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-xs">
                {description}
              </p>
            )}
            {error && (
              <p className="text-sm text-destructive mt-xs">
                {error}
              </p>
            )}
          </div>
        </div>
      );
    }

    return checkbox;
  }
);

Checkbox.displayName = 'Checkbox';
