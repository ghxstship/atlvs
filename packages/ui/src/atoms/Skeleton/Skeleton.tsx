/**
 * Skeleton Component — Loading Placeholder
 * Animated skeleton for loading states
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width */
  width?: string | number;
  
  /** Height */
  height?: string | number;
  
  /** Shape */
  shape?: 'rectangle' | 'circle' | 'text';
  
  /** Disable animation */
  noAnimation?: boolean;
}

/**
 * Skeleton Component
 * 
 * @example
 * ```tsx
 * <Skeleton width="100%" height="20px" />
 * <Skeleton shape="circle" width="40px" height="40px" />
 * ```
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      width = '100%',
      height = '1rem',
      shape = 'rectangle',
      noAnimation = false,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const shapeClasses = {
      rectangle: 'rounded-md',
      circle: 'rounded-full',
      text: 'rounded',
    };
    
    return (
      <div
        ref={ref}
        className={`
          bg-muted
          ${shapeClasses[shape]}
          ${noAnimation ? '' : 'animate-pulse'}
          ${className}
        `}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          ...style,
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';
