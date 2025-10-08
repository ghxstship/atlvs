/**
 * Switch Component — Toggle Switch
 * Modern toggle switch for boolean states
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Switch label */
  label?: string;
  
  /** Size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Switch Component
 * 
 * @example
 * ```tsx
 * <Switch label="Enable notifications" />
 * <Switch checked={enabled} onChange={setEnabled} />
 * ```
 */
export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      size = 'md',
      className = '',
      disabled,
      checked,
      ...props
    },
    ref
  ) => {
    const switchSizeClasses = {
      sm: 'w-8 h-5',
      md: 'w-11 h-6',
      lg: 'w-14 h-7',
    };
    
    const thumbSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };
    
    const translateClasses = {
      sm: checked ? 'translate-x-3' : 'translate-x-0.5',
      md: checked ? 'translate-x-5' : 'translate-x-0.5',
      lg: checked ? 'translate-x-7' : 'translate-x-0.5',
    };
    
    return (
      <label className={`inline-flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="relative">
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
              ${switchSizeClasses[size]}
              rounded-full
              transition-colors duration-200
              ${checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-muted)]'}
              peer-focus:ring-2 peer-focus:ring-[var(--color-primary)] peer-focus:ring-offset-2
            `}
          >
            <div
              className={`
                ${thumbSizeClasses[size]}
                ${translateClasses[size]}
                absolute top-0.5
                rounded-full
                bg-white
                shadow-sm
                transition-transform duration-200
              `}
            />
          </div>
        </div>
        {label && <span className="text-sm font-medium">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = 'Switch';
