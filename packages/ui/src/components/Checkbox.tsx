'use client';

import React, { forwardRef } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '../system';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  error?: string;
}

const checkboxVariants = {
  variant: {
    default: 'border-gray-300 text-blue-600 focus:ring-blue-500',
    primary: 'border-blue-300 text-blue-600 focus:ring-blue-500',
    success: 'border-green-300 text-green-600 focus:ring-green-500',
    warning: 'border-yellow-300 text-yellow-600 focus:ring-yellow-500',
    danger: 'border-red-300 text-red-600 focus:ring-red-500',
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
      rounded border-2 bg-white dark:bg-gray-800 
      focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
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
      error && 'border-red-500 focus:ring-red-500',
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
          error && 'border-red-500',
          'peer-checked:bg-current peer-checked:border-current',
          'peer-indeterminate:bg-current peer-indeterminate:border-current',
          disabled && 'opacity-50 cursor-not-allowed'
        )}>
          {indeterminate ? (
            <Minus 
              className="text-white dark:text-gray-900" 
              size={iconSize}
            />
          ) : (
            <Check 
              className="text-white dark:text-gray-900 opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
              size={iconSize}
            />
          )}
        </div>
      </div>
    );

    if (label || description) {
      return (
        <div className="flex items-start gap-3">
          {checkbox}
          <div className="flex-1 min-w-0">
            {label && (
              <label 
                className={cn(
                  'text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => !disabled && checkboxRef.current?.click()}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
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
