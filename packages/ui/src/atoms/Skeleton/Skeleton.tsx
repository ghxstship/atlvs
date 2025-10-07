'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

// Skeleton variants for different shapes
const skeletonVariants = cva(
  'animate-pulse rounded-md bg-muted',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        circle: 'rounded-full',
        rectangle: 'rounded-none',
        text: 'h-4 w-full rounded-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /**
   * Width of the skeleton (CSS value)
   */
  width?: string | number;
  /**
   * Height of the skeleton (CSS value)
   */
  height?: string | number;
  /**
   * Whether to show the skeleton animation
   */
  animate?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, width, height, animate = true, style, ...props }, ref) => {
    const baseClasses = skeletonVariants({ variant });

    // Handle animation override
    const animationClass = animate ? 'animate-pulse' : '';

    // Merge all classes
    const mergedClasses = twMerge(
      baseClasses,
      animationClass,
      className
    );

    // Handle width and height
    const skeletonStyle: React.CSSProperties = {
      ...style,
      ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
      ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
    };

    return (
      <div
        ref={ref}
        className={mergedClasses}
        style={skeletonStyle}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Predefined skeleton components for common use cases
const SkeletonText = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  ({ className, height = '1rem', ...props }, ref) => (
    <Skeleton
      ref={ref}
      variant="text"
      height={height}
      className={twMerge('w-full', className)}
      {...props}
    />
  )
);

SkeletonText.displayName = 'SkeletonText';

const SkeletonCircle = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  ({ className, width = '2.5rem', height = '2.5rem', ...props }, ref) => (
    <Skeleton
      ref={ref}
      variant="circle"
      width={width}
      height={height}
      className={className}
      {...props}
    />
  )
);

SkeletonCircle.displayName = 'SkeletonCircle';

const SkeletonRectangle = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  ({ className, width = '100%', height = '100%', ...props }, ref) => (
    <Skeleton
      ref={ref}
      variant="rectangle"
      width={width}
      height={height}
      className={className}
      {...props}
    />
  )
);

SkeletonRectangle.displayName = 'SkeletonRectangle';

export { Skeleton, SkeletonText, SkeletonCircle, SkeletonRectangle };
export type { SkeletonProps };
