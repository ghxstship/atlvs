/**
 * Separator Component — Divider Line
 * Visual separator between content
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  
  /** Decorative (not semantic) */
  decorative?: boolean;
}

/**
 * Separator Component
 * 
 * @example
 * ```tsx
 * <Separator />
 * <Separator orientation="vertical" />
 * ```
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    {
      orientation = 'horizontal',
      decorative = true,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : orientation}
        className={`
          bg-[var(--color-border)]
          ${orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full'}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';
