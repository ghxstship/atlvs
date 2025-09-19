/**
 * GHXSTSHIP Unified Button Component
 * Enterprise-Grade Button with Full Accessibility & Performance
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// ==========================================
// BUTTON VARIANTS (CVA)
// ==========================================

const buttonVariants = cva(
  // Base styles
  [
    'inline-flex',
    'items-center',
    'justify-center',
    'whitespace-nowrap',
    'rounded-md',
    'text-sm',
    'font-medium',
    'transition-all',
    'duration-150',
    'ease-in-out',
    'cursor-pointer',
    'border',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-offset-2',
    'disabled:pointer-events-none',
    'disabled:opacity-50',
    'select-none',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-primary',
          'text-primary-foreground',
          'border-transparent',
          'hover:bg-primary/90',
          'focus-visible:ring-primary',
        ],
        destructive: [
          'bg-destructive',
          'text-destructive-foreground',
          'border-transparent',
          'hover:bg-destructive/90',
          'focus-visible:ring-destructive',
        ],
        outline: [
          'border-input',
          'bg-background',
          'text-foreground',
          'hover:bg-accent',
          'hover:text-accent-foreground',
          'focus-visible:ring-ring',
        ],
        secondary: [
          'bg-secondary',
          'text-secondary-foreground',
          'border-transparent',
          'hover:bg-secondary/80',
          'focus-visible:ring-secondary',
        ],
        ghost: [
          'border-transparent',
          'text-foreground',
          'hover:bg-accent',
          'hover:text-accent-foreground',
          'focus-visible:ring-ring',
        ],
        link: [
          'text-primary',
          'underline-offset-4',
          'hover:underline',
          'border-transparent',
          'focus-visible:ring-primary',
        ],
        pop: [
          'bg-accent',
          'text-accent-foreground',
          'border-2',
          'border-black',
          'font-bold',
          'uppercase',
          'tracking-wide',
          'shadow-pop-base',
          'hover:shadow-pop-md',
          'hover:-translate-x-0.5',
          'hover:-translate-y-0.5',
          'active:shadow-pop-sm',
          'active:translate-x-0.5',
          'active:translate-y-0.5',
          'focus-visible:ring-accent',
        ],
      },
      size: {
        default: ['h-10', 'px-4', 'py-2'],
        sm: ['h-9', 'rounded-md', 'px-3'],
        lg: ['h-11', 'rounded-md', 'px-8'],
        xl: ['h-12', 'rounded-lg', 'px-10', 'text-base'],
        icon: ['h-10', 'w-10', 'p-0'],
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// ==========================================
// COMPONENT TYPES
// ==========================================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ==========================================
// COMPONENT IMPLEMENTATION
// ==========================================

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const buttonContent = (
      <>
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && (
          <span className="mr-2 flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className="ml-2 flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </>
    );

    if (asChild) {
      return (
        <span
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
          {...props}
        >
          {buttonContent}
        </span>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ==========================================
// COMPOUND COMPONENTS
// ==========================================

const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'horizontal' | 'vertical';
    attached?: boolean;
  }
>(({ className, orientation = 'horizontal', attached = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        attached && orientation === 'horizontal' && '[&>*:not(:first-child)]:ml-0 [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none',
        attached && orientation === 'vertical' && '[&>*:not(:first-child)]:mt-0 [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none',
        !attached && orientation === 'horizontal' && 'gap-2',
        !attached && orientation === 'vertical' && 'gap-2',
        className
      )}
      role="group"
      {...props}
    />
  );
});

ButtonGroup.displayName = 'ButtonGroup';

// ==========================================
// EXPORTS
// ==========================================

export { Button, ButtonGroup, buttonVariants };
export type { ButtonProps };
