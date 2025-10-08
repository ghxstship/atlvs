/**
 * Radio Component — Radio Button Input
 * Modern radio button with label support
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Radio label */
  label?: string;
  
  /** Helper text */
  helperText?: string;
  
  /** Size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Radio Component
 * 
 * @example
 * ```tsx
 * <Radio name="plan" value="free" label="Free Plan" />
 * <Radio name="plan" value="pro" label="Pro Plan" />
 * ```
 */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      helperText,
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
    
    const dotSizeClasses = {
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
    };
    
    return (
      <div className="flex items-start gap-2">
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="radio"
            disabled={disabled}
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`
              ${sizeClasses[size]}
              rounded-full
              border-2
              flex items-center justify-center
              transition-all duration-200
              cursor-pointer
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${checked
                ? 'border-primary bg-background'
                : 'border-border peer-focus:border-primary peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2'
              }
            `}
          >
            {checked && (
              <div className={`${dotSizeClasses[size]} rounded-full bg-primary`} />
            )}
          </div>
        </div>
        
        {(label || helperText) && (
          <div className="flex-1">
            {label && (
              <label className={`block text-sm font-medium cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
                {label}
              </label>
            )}
            {helperText && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
