/**
 * Label Component — Form Label
 * Accessible form label component
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Required indicator */
  required?: boolean;
  
  /** Size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Label Component
 * 
 * @example
 * ```tsx
 * <Label htmlFor="email">Email</Label>
 * <Label required>Password</Label>
 * ```
 */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      required = false,
      size = 'md',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };
    
    return (
      <label
        ref={ref}
        className={`
          block font-medium
          text-[var(--color-foreground)]
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {children}
        {required && <span className="text-[var(--color-error)] ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';
