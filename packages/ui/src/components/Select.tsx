'use client';

import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';

const selectVariants = cva(
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 appearance-none pr-10',
  {
    variants: {
      variant: {
        default: 'border-border hover:border-border/80',
        success: 'border-green-500 focus-visible:ring-green-500',
        error: 'border-red-500 focus-visible:ring-red-500',
      },
      size: {
        default: 'h-10 px-3 py-2',
        sm: 'h-9 px-3 py-1 text-sm',
        lg: 'h-11 px-4 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface SelectProps 
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  error?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  success?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    variant, 
    size, 
    error, 
    success, 
    loading, 
    label, 
    description, 
    id, 
    placeholder, 
    leftIcon,
    rightIcon,
    children, 
    onFocus,
    onBlur,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    
    const currentVariant = error ? 'error' : success ? 'success' : variant;
    
    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={selectId}
            className={clsx(
              'text-sm font-medium leading-none transition-colors duration-200',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              isFocused && 'text-primary',
              error && 'text-red-600',
              success && 'text-green-600'
            )}
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
              {leftIcon}
            </div>
          )}
          <select
            id={selectId}
            className={twMerge(
              selectVariants({ variant: currentVariant, size }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-16',
              'group-hover:shadow-sm',
              isFocused && 'shadow-md',
              className
            )}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${selectId}-error` : description ? `${selectId}-description` : undefined
            }
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          
          {/* Right side icons */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            {loading && (
              <div className="animate-spin h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full" />
            )}
            {success && !loading && (
              <Check className="h-4 w-4 text-green-500" />
            )}
            {error && !loading && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            {rightIcon && !loading && !success && !error && rightIcon}
            <ChevronDown className={clsx(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              isFocused && 'rotate-180'
            )} />
          </div>
        </div>
        {description && !error && (
          <p id={`${selectId}-description`} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {error && (
          <p id={`${selectId}-error`} className="text-sm text-red-600 flex items-center gap-1" role="alert">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        {success && !error && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Valid selection
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
