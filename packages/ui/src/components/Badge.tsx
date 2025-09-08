import React from 'react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const badge = cva('badge font-body', {
  variants: {
    variant: {
      default: 'bg-muted text-muted-foreground border-muted',
      success: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      warning: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
      error: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
      info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
      destructive: 'bg-destructive text-destructive-foreground border-destructive',
      outline: 'border-border bg-transparent text-foreground hover:bg-muted',
      secondary: 'bg-secondary text-secondary-foreground border-secondary',
      primary: 'bg-primary text-primary-foreground border-primary',
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
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'destructive' | 'outline' | 'secondary' | 'primary';
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
          badge({ variant, size }),
          'inline-flex items-center gap-1 rounded-full border transition-colors',
          dot && 'pl-1.5',
          className
        )
      )} 
      {...props}
    >
      {dot && (
        <div className={clsx(
          'w-2 h-2 rounded-full',
          variant === 'success' && 'bg-green-500',
          variant === 'warning' && 'bg-amber-500',
          variant === 'error' && 'bg-red-500',
          variant === 'info' && 'bg-blue-500',
          variant === 'destructive' && 'bg-destructive-foreground',
          (!variant || variant === 'default') && 'bg-muted-foreground'
        )} />
      )}
      {children}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
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
      failed: { variant: 'error' as const, children: 'Failed' },
      draft: { variant: 'outline' as const, children: 'Draft' },
      published: { variant: 'primary' as const, children: 'Published' },
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
