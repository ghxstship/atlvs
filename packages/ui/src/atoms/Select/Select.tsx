/**
 * Select Component — Select Dropdown
 * Native select dropdown with styling
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Select options */
  options: SelectOption[];
  
  /** Placeholder */
  placeholder?: string;
  
  /** Label */
  label?: string;
  
  /** Error message */
  error?: string;
  
  /** Helper text */
  helperText?: string;
  
  /** Size */
  selectSize?: 'sm' | 'md' | 'lg';
}

/**
 * Select Component
 * 
 * @example
 * ```tsx
 * <Select
 *   label="Country"
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'uk', label: 'United Kingdom' },
 *   ]}
 * />
 * ```
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      placeholder,
      label,
      error,
      helperText,
      selectSize = 'md',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      w-full
      appearance-none
      rounded-md
      border
      bg-background
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
      pr-10
    `;
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    };
    
    const variantClasses = error
      ? 'border-destructive focus:border-destructive focus:ring-[var(--color-error)]'
      : 'border-border focus:border-primary focus:ring-primary';
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1.5">
            {label}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={`
              ${baseClasses}
              ${sizeClasses[selectSize]}
              ${variantClasses}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        
        {(error || helperText) && (
          <p className={`mt-1.5 text-sm ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
