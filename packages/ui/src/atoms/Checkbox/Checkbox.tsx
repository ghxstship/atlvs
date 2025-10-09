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

  /** Convenience callback fired with the checked state */
  onCheckedChange?: (checked: boolean) => void;
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
      defaultChecked,
      onChange,
      onCheckedChange,
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
      <div className={`flex items-start gap-2 ${className}`}>
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            checked={checked}
            defaultChecked={defaultChecked}
            className="sr-only peer"
            onChange={(event) => {
              if (disabled) {
                onChange?.(event);
                return;
              }

              onChange?.(event);
              onCheckedChange?.(event.target.checked);
            }}
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
                ? 'border-destructive'
                : 'border-border peer-focus:border-primary peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2'
              }
              ${checked ? 'bg-primary border-primary' : 'bg-background'}
            `}
          >
            {checked && (
              <Check className={`${iconSizeClasses[size]} text-primary-foreground`} />
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
              <p className={`text-sm mt-0.5 ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
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
