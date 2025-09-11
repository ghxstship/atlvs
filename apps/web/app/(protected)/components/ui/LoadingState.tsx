'use client';

import { Skeleton } from '@ghxstship/ui';
import { cn } from '@ghxstship/ui/system';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  variant?: 'card' | 'table' | 'list' | 'grid' | 'button' | 'inline' | 'spinner';
  count?: number;
  className?: string;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ 
  variant = 'card', 
  count = 3, 
  className,
  text,
  size = 'md'
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-6 w-6'
  };

  if (variant === 'spinner') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        <Loader2 className={cn('animate-spin', sizeClasses[size])} />
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Loader2 className={cn('animate-spin', sizeClasses[size])} />
        <span className="text-sm text-muted-foreground">{text || 'Loading...'}</span>
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Loader2 className={cn('animate-spin', sizeClasses[size])} />
        <span>{text || 'Loading...'}</span>
      </div>
    );
  }

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="p-6 border rounded-lg space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'table':
        return (
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex space-x-4 p-4 border rounded">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        );
      
      case 'list':
        return (
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border rounded">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'grid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        );
      
      default:
        return <Skeleton className="h-4 w-full" />;
    }
  };

  return (
    <div className={cn('animate-pulse', className)}>
      {renderSkeleton()}
    </div>
  );
}

export default LoadingState;
