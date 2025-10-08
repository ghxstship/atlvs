/**
 * Checkbox Component — Checkbox Input
 * Modern checkbox with label support
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Checkbox label */
  label?: string;
  
  /** Helper text */
  helperText?: string;
  
  /** Error message */
  error?: string;
  
  /** Size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Checkbox Component
 * 
 * @example
 * ```tsx
 * <Checkbox label="Accept terms" />
 * <Checkbox label="Subscribe" helperText="Get updates" />
 * ```
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      className = '',
      disabled,
      checked,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };
    
    const iconSizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };
    
    return (
      <div className="flex items-start gap-2">
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`
              ${sizeClasses[size]}
              rounded
              border-2
              flex items-center justify-center
              transition-all duration-200
              cursor-pointer
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${error
                ? 'border-[var(--color-error)]'
                : 'border-[var(--color-border)] peer-focus:border-[var(--color-primary)] peer-focus:ring-2 peer-focus:ring-[var(--color-primary)] peer-focus:ring-offset-2'
              }
              ${checked ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'bg-[var(--color-background)]'}
            `}
          >
            {checked && (
              <Check className={`${iconSizeClasses[size]} text-[var(--color-primary-foreground)]`} />
            )}
          </div>
        </div>
        
        {(label || helperText || error) && (
          <div className="flex-1">
            {label && (
              <label className={`block text-sm font-medium cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
                {label}
              </label>
            )}
            {(helperText || error) && (
              <p className={`text-sm mt-0.5 ${error ? 'text-[var(--color-error)]' : 'text-[var(--color-foreground-secondary)]'}`}>
                {error || helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
