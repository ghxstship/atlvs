'use client';

import React from 'react';
import { cn } from '../system';

export interface LoaderProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring' | 'skeleton';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const loaderVariants = {
  size: {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  },
  color: {
    primary: 'text-primary border-primary',
    secondary: 'text-muted-foreground/70 border-border',
    white: 'text-background border-white',
    gray: 'text-muted-foreground/50 border-border',
  },
};

const SpinnerLoader = ({ size, color, className }: { size: string; color: string; className?: string }) => (
  <div
    className={cn(
      'animate-spin rounded-full border-2 border-transparent border-t-current',
      size,
      color,
      className
    )}
    role="status"
    aria-label="Loading"
  />
);

const DotsLoader = ({ size, color, className }: { size: string; color: string; className?: string }) => {
  const dotSize = size.includes('w-3') ? 'w-1 h-1' : size.includes('w-4') ? 'w-1.5 h-1.5' : 'w-2 h-2';
  
  return (
    <div className={cn('flex space-x-xs', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full bg-current animate-pulse',
            dotSize,
            color
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
};

const PulseLoader = ({ size, color, className }: { size: string; color: string; className?: string }) => (
  <div
    className={cn(
      'rounded-full bg-current animate-pulse',
      size,
      color,
      className
    )}
    role="status"
    aria-label="Loading"
  />
);

const BarsLoader = ({ size, color, className }: { size: string; color: string; className?: string }) => {
  const barWidth = size.includes('w-3') ? 'w-0.5' : size.includes('w-4') ? 'w-1' : 'w-1.5';
  const barHeight = size.includes('h-3') ? 'h-3' : size.includes('h-4') ? 'h-4' : 'h-6';
  
  return (
    <div className={cn('flex items-end space-x-xs', className)}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-current animate-pulse',
            barWidth,
            barHeight,
            color
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s',
            transform: `scaleY(${0.3 + (i % 2) * 0.7})`,
          }}
        />
      ))}
    </div>
  );
};

const RingLoader = ({ size, color, className }: { size: string; color: string; className?: string }) => (
  <div
    className={cn(
      'animate-spin rounded-full border-4 border-border dark:border-border',
      size,
      className
    )}
    style={{
      borderTopColor: 'currentColor',
    }}
    role="status"
    aria-label="Loading"
  >
    <span className={color} />
  </div>
);

const SkeletonLoader = ({ size, className }: { size: string; className?: string }) => (
  <div
    className={cn(
      'animate-pulse bg-muted/30 dark:bg-muted/80 rounded',
      size,
      className
    )}
    role="status"
    aria-label="Loading"
  />
);

export function Loader({
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  className = '',
  text,
  fullScreen = false,
}: LoaderProps) {
  const sizeClasses = loaderVariants.size[size];
  const colorClasses = loaderVariants.color[color];

  const renderLoader = () => {
    const props = { size: sizeClasses, color: colorClasses, className };
    
    switch (variant) {
      case 'dots':
        return <DotsLoader {...props} />;
      case 'pulse':
        return <PulseLoader {...props} />;
      case 'bars':
        return <BarsLoader {...props} />;
      case 'ring':
        return <RingLoader {...props} />;
      case 'skeleton':
        return <SkeletonLoader size={sizeClasses} className={className} />;
      default:
        return <SpinnerLoader {...props} />;
    }
  };

  const loader = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-sm',
      fullScreen && 'fixed inset-0 bg-background/80 dark:bg-muted/80 backdrop-blur-sm z-50'
    )}>
      {renderLoader()}
      {text && (
        <div className={cn(
          'text-sm font-medium',
          colorClasses.replace('border-', 'text-')
        )}>
          {text}
        </div>
      )}
    </div>
  );

  return loader;
}

// Convenience components
export const SpinnerLoader2 = (props: Omit<LoaderProps, 'variant'>) => 
  <Loader {...props} variant="spinner" />;

export const DotsLoader2 = (props: Omit<LoaderProps, 'variant'>) => 
  <Loader {...props} variant="dots" />;

export const PulseLoader2 = (props: Omit<LoaderProps, 'variant'>) => 
  <Loader {...props} variant="pulse" />;

export const BarsLoader2 = (props: Omit<LoaderProps, 'variant'>) => 
  <Loader {...props} variant="bars" />;

export const RingLoader2 = (props: Omit<LoaderProps, 'variant'>) => 
  <Loader {...props} variant="ring" />;
