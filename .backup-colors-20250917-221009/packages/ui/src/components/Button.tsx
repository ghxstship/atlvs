import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import React from 'react';
import { Loader2 } from 'lucide-react';

const button = cva('btn font-body uppercase whitespace-nowrap', {
  variants: {
    variant: {
      // Alias: treat "default" as primary for backwards compatibility
      default: 'btn-primary',
      primary: 'btn-primary',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      destructive: 'btn-destructive',
      success: 'bg-success text-success-foreground hover:bg-success/90 shadow-success',
      warning: 'bg-warning text-warning-foreground hover:bg-warning/90 shadow-warning',
      info: 'bg-info text-info-foreground hover:bg-info/90 shadow-info',
      // Subway-style variants
      'subway-red': 'bg-subway-red text-subway-red-foreground hover:bg-subway-red/90 shadow-subway-red/20',
      'subway-blue': 'bg-subway-blue text-subway-blue-foreground hover:bg-subway-blue/90 shadow-subway-blue/20',
      'subway-green': 'bg-subway-green text-subway-green-foreground hover:bg-subway-green/90 shadow-subway-green/20',
      'subway-orange': 'bg-subway-orange text-subway-orange-foreground hover:bg-subway-orange/90 shadow-subway-orange/20',
      'subway-purple': 'bg-subway-purple text-subway-purple-foreground hover:bg-subway-purple/90 shadow-subway-purple/20',
      'subway-grey': 'bg-subway-grey text-subway-grey-foreground hover:bg-subway-grey/90 shadow-subway-grey/20',
    },
    size: {
      xs: 'h-7 px-sm text-xs rounded-md',
      sm: 'h-8 px-sm text-xs rounded-md',
      md: 'h-10 px-md text-sm rounded-lg',
      lg: 'h-12 px-lg text-base rounded-lg',
      xl: 'h-14 px-xl text-lg rounded-xl',
      icon: 'h-10 w-10 rounded-lg',
      'icon-sm': 'h-8 w-8 rounded-md',
      'icon-lg': 'h-12 w-12 rounded-lg',
    },
    loading: {
      true: 'cursor-wait',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    loading: false,
  },
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning' | 'info' | 
           'subway-red' | 'subway-blue' | 'subway-green' | 'subway-orange' | 'subway-purple' | 'subway-grey';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg';
  loading?: boolean;
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, leftIcon, rightIcon, ...props }, ref) => {
    const iconSize = size === 'xs' || size === 'sm' ? 'h-3 w-3' : size === 'lg' || size === 'xl' ? 'h-5 w-5' : 'h-4 w-4';
    
    return (
      <button 
        ref={ref} 
        className={twMerge(clsx(button({ variant, size, loading }), 'group relative overflow-hidden', className))} 
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {/* Ripple effect overlay */}
        <span className="absolute inset-0 bg-foreground/15 scale-0 group-active:scale-100 transition-transform duration-200 rounded-inherit" />
        
        {/* Content wrapper */}
        <span className="relative flex items-center justify-center gap-sm">
          {loading ? (
            <Loader2 className={clsx('animate-spin', iconSize)} />
          ) : (
            leftIcon && <span className={iconSize}>{leftIcon}</span>
          )}
          {children}
          {!loading && rightIcon && <span className={iconSize}>{rightIcon}</span>}
        </span>
      </button>
    );
  }
);
Button.displayName = 'Button';

// Enhanced button variants for specific use cases
export const SubmitButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, loading, ...props }, ref) => (
    <Button 
      ref={ref} 
      type="submit" 
      loading={loading}
      leftIcon={!loading ? undefined : undefined}
      {...props}
    >
      {children || (loading ? 'Saving...' : 'Save')}
    </Button>
  )
);
SubmitButton.displayName = 'SubmitButton';

export const CancelButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <Button ref={ref} variant="outline" {...props}>
      {children || 'Cancel'}
    </Button>
  )
);
CancelButton.displayName = 'CancelButton';

export const DeleteButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <Button ref={ref} variant="destructive" {...props}>
      {children || 'Delete'}
    </Button>
  )
);
DeleteButton.displayName = 'DeleteButton';

// Icon Button variant
export const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = 'icon', ...props }, ref) => (
    <Button ref={ref} size={size} className={clsx('shrink-0', className)} {...props} />
  )
);
IconButton.displayName = 'IconButton';

// Floating Action Button
export const FloatingButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <Button 
      ref={ref} 
      size="icon-lg" 
      className={clsx(
        'fixed bottom-6 right-6 z-50 rounded-full shadow-2xl',
        'hover:scale-110 active:scale-95 transition-all duration-200',
        'bg-gradient-to-r from-primary to-primary/80',
        className
      )} 
      {...props} 
    />
  )
);
FloatingButton.displayName = 'FloatingButton';

// Button Group
export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, className, orientation = 'horizontal' }, ref) => {
    return (
      <div 
        ref={ref}
        className={clsx(
          'inline-flex',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          '[&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg',
          orientation === 'vertical' && '[&>button:first-child]:rounded-t-lg [&>button:first-child]:rounded-l-none [&>button:last-child]:rounded-b-lg [&>button:last-child]:rounded-r-none',
          '[&>button:not(:first-child)]:border-l-0',
          orientation === 'vertical' && '[&>button:not(:first-child)]:border-l [&>button:not(:first-child)]:border-t-0',
          className
        )}
      >
        {children}
      </div>
    );
  }
);
ButtonGroup.displayName = 'ButtonGroup';
