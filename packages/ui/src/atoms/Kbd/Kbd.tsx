/**
 * Kbd Component — Keyboard Key Display
 * Display keyboard shortcuts
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /** Size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Kbd Component
 * 
 * @example
 * ```tsx
 * <Kbd>⌘</Kbd> <Kbd>K</Kbd>
 * <Kbd>Ctrl</Kbd> + <Kbd>C</Kbd>
 * ```
 */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  (
    {
      size = 'md',
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-1 py-0.5 text-xs',
      md: 'px-1.5 py-0.5 text-xs',
      lg: 'px-2 py-1 text-sm',
    };
    
    return (
      <kbd
        ref={ref}
        className={`
          inline-flex items-center justify-center
          font-mono font-medium
          rounded
          border border-border
          bg-muted
          text-foreground
          shadow-sm
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </kbd>
    );
  }
);

Kbd.displayName = 'Kbd';
