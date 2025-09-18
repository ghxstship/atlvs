import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circular' | 'rectangular' | 'button' | 'avatar' | 'card' | 'table-row';
  lines?: number;
  width?: string | number;
  height?: string | number;
  animated?: boolean;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', lines = 1, width, height, animated = true, ...props }, ref) => {
    const variantClasses = {
      default: 'h-4 w-full',
      text: 'h-4 w-3/4',
      circular: 'h-12 w-12 rounded-full',
      rectangular: 'h-32 w-full',
      button: 'h-10 w-24 rounded-lg',
      avatar: 'h-10 w-10 rounded-full',
      card: 'h-48 w-full rounded-lg',
      'table-row': 'h-12 w-full rounded-md',
    };

    const style = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
    };

    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className={clsx('space-y-sm', className)} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={twMerge(
                clsx(
                  'skeleton h-4',
                  index === lines - 1 ? 'w-2/3' : 'w-full',
                  !animated && 'animate-none'
                )
              )}
              style={style}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'skeleton',
            variantClasses[variant],
            !animated && 'animate-none',
            className
          )
        )}
        style={style}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

// Skeleton Patterns for common UI elements
export const SkeletonCard = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('p-xl space-y-md', className)} {...props}>
      <div className="flex items-center space-x-md">
        <Skeleton variant="avatar" />
        <div className="space-y-sm flex-1">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={120} />
      <div className="space-y-xs">
        <Skeleton variant="text" lines={3} />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton variant="button" width={80} />
        <Skeleton variant="button" width={100} />
      </div>
    </div>
  )
);
SkeletonCard.displayName = 'SkeletonCard';

export const SkeletonTable = React.forwardRef<HTMLDivElement, { rows?: number; columns?: number }>(
  ({ rows = 5, columns = 4 }, ref) => (
    <div ref={ref} className="space-y-sm">
      {/* Header */}
      <div className="flex space-x-md">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" width="100%" height={16} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-md">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width="100%" height={14} />
          ))}
        </div>
      ))}
    </div>
  )
);
SkeletonTable.displayName = 'SkeletonTable';

export const SkeletonList = React.forwardRef<HTMLDivElement, { items?: number }>(
  ({ items = 5 }, ref) => (
    <div ref={ref} className="space-y-md">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-md">
          <Skeleton variant="avatar" />
          <div className="space-y-sm flex-1">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
          </div>
          <Skeleton variant="button" width={60} />
        </div>
      ))}
    </div>
  )
);
SkeletonList.displayName = 'SkeletonList';

export const SkeletonForm = React.forwardRef<HTMLDivElement, { fields?: number }>(
  ({ fields = 4 }, ref) => (
    <div ref={ref} className="space-y-lg">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-xs">
          <Skeleton variant="text" width="25%" height={16} />
          <Skeleton variant="rectangular" height={40} />
        </div>
      ))}
      <div className="flex justify-end space-x-sm pt-md">
        <Skeleton variant="button" width={80} />
        <Skeleton variant="button" width={100} />
      </div>
    </div>
  )
);
SkeletonForm.displayName = 'SkeletonForm';
