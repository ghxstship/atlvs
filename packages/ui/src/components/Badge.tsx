import React from 'react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        primary: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-success text-success-foreground hover:bg-success/80',
        warning: 'border-transparent bg-warning text-warning-foreground hover:bg-warning/80',
        info: 'border-transparent bg-info text-info-foreground hover:bg-info/80',
        muted: 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        // Subway-style variants
        'subway-red': 'border-transparent bg-subway-red text-subway-red-foreground hover:bg-subway-red/80',
        'subway-blue': 'border-transparent bg-subway-blue text-subway-blue-foreground hover:bg-subway-blue/80',
        'subway-green': 'border-transparent bg-subway-green text-subway-green-foreground hover:bg-subway-green/80',
        'subway-orange': 'border-transparent bg-subway-orange text-subway-orange-foreground hover:bg-subway-orange/80',
        'subway-purple': 'border-transparent bg-subway-purple text-subway-purple-foreground hover:bg-subway-purple/80',
        'subway-grey': 'border-transparent bg-subway-grey text-subway-grey-foreground hover:bg-subway-grey/80',
      },
      size: {
        xs: 'text-xs px-1.5 py-0.5 h-5',
        sm: 'text-xs px-2 py-0.5 h-6',
        md: 'text-sm px-2.5 py-0.5 h-7',
        lg: 'text-sm px-3 py-1 h-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'muted' | 'ghost' |
           'subway-red' | 'subway-blue' | 'subway-green' | 'subway-orange' | 'subway-purple' | 'subway-grey';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, dot, removable, onRemove, children, ...props }, ref) => (
    <div 
      ref={ref} 
      className={twMerge(
        clsx(
          badgeVariants({ variant, size }),
          dot && 'pl-1.5',
          className
        )
      )} 
      {...props}
    >
      {dot && (
        <div className={clsx(
          'w-2 h-2 rounded-full',
          variant === 'success' && 'bg-success',
          variant === 'warning' && 'bg-warning',
          variant === 'destructive' && 'bg-destructive',
          variant === 'info' && 'bg-primary',
          variant === 'muted' && 'bg-muted-foreground',
          (!variant || variant === 'default') && 'bg-muted-foreground'
        )} />
      )}
      {children}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-muted rounded-full p-0.5 transition-colors"
          type="button"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  )
);
Badge.displayName = 'Badge';

// Status Badge for common status indicators
export const StatusBadge = React.forwardRef<HTMLDivElement, Omit<BadgeProps, 'variant'> & {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'failed' | 'draft' | 'published' | 'archived';
}>(
  ({ status, ...props }, ref) => {
    const statusVariants = {
      active: { variant: 'success' as const, children: 'Active' },
      inactive: { variant: 'default' as const, children: 'Inactive' },
      pending: { variant: 'warning' as const, children: 'Pending' },
      completed: { variant: 'success' as const, children: 'Completed' },
      failed: { variant: 'destructive' as const, children: 'Failed' },
      draft: { variant: 'outline' as const, children: 'Draft' },
      published: { variant: 'default' as const, children: 'Published' },
      archived: { variant: 'secondary' as const, children: 'Archived' },
    };

    const config = statusVariants[status];
    
    return (
      <Badge 
        ref={ref} 
        variant={config.variant} 
        dot
        {...props}
      >
        {config.children}
      </Badge>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';
