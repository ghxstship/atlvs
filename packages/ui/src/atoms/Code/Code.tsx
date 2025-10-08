/**
 * Code Component — Inline Code Display
 * Display inline code snippets
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  /** Size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Code Component
 * 
 * @example
 * ```tsx
 * <Code>const value = true</Code>
 * <Code size="lg">npm install</Code>
 * ```
 */
export const Code = React.forwardRef<HTMLElement, CodeProps>(
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
      md: 'px-1.5 py-0.5 text-sm',
      lg: 'px-2 py-1 text-base',
    };
    
    return (
      <code
        ref={ref}
        className={`
          inline-flex items-center
          font-mono
          rounded
          bg-muted
          text-foreground
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </code>
    );
  }
);

Code.displayName = 'Code';
