/**
 * Input Component — Text Input Field
 * Modern input with variants and states
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input variant */
  variant?: 'default' | 'error' | 'success';
  
  /** Input size */
  inputSize?: 'sm' | 'md' | 'lg';
  
  /** Icon (left) */
  icon?: LucideIcon;
  
  /** Icon (right) */
  iconRight?: LucideIcon;
  
  /** Error message */
  error?: string;
  
  /** Helper text */
  helperText?: string;
  
  /** Label */
  label?: string;
  
  /** Required indicator */
  showRequired?: boolean;
}

/**
 * Input Component
 * 
 * @example
 * ```tsx
 * <Input label="Email" type="email" placeholder="you@example.com" />
 * <Input icon={Search} placeholder="Search..." />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      inputSize = 'md',
      icon: Icon,
      iconRight: IconRight,
      error,
      helperText,
      label,
      showRequired = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = !!error || variant === 'error';
    const hasSuccess = variant === 'success';
    
    const baseClasses = `
      w-full
      rounded-md
      border
      bg-background
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
      placeholder:text-muted-foreground
    `;
    
    const variantClasses = {
      default: `
        border-border
        focus:border-primary
        focus:ring-primary
      `,
      error: `
        border-destructive
        focus:border-destructive
        focus:ring-[var(--color-error)]
      `,
      success: `
        border-[var(--color-success)]
        focus:border-[var(--color-success)]
        focus:ring-[var(--color-success)]
      `,
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    };
    
    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };
    
    const paddingWithIcon = {
      sm: Icon ? 'pl-9' : IconRight ? 'pr-9' : '',
      md: Icon ? 'pl-10' : IconRight ? 'pr-10' : '',
      lg: Icon ? 'pl-11' : IconRight ? 'pr-11' : '',
    };
    
    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium mb-1.5">
            {label}
            {showRequired && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        
        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Icon className={iconSizeClasses[inputSize]} />
            </div>
          )}
          
          {/* Input */}
          <input
            ref={ref}
            disabled={disabled}
            className={`
              ${baseClasses}
              ${variantClasses[hasError ? 'error' : hasSuccess ? 'success' : 'default']}
              ${sizeClasses[inputSize]}
              ${paddingWithIcon[inputSize]}
              ${className}
            `}
            {...props}
          />
          
          {/* Right icon */}
          {IconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <IconRight className={iconSizeClasses[inputSize]} />
            </div>
          )}
        </div>
        
        {/* Helper text or error */}
        {(error || helperText) && (
          <p
            className={`
              mt-1.5 text-sm
              ${error ? 'text-destructive' : 'text-muted-foreground'}
            `}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
