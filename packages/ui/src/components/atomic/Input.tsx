/**
 * GHXSTSHIP Unified Input Component
 * Enterprise-Grade Input with Full Accessibility & Validation
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// ==========================================
// INPUT VARIANTS (CVA)
// ==========================================

const inputVariants = cva(
  [
    'flex',
    'w-full',
    'rounded-md',
    'border',
    'bg-background',
    'px-3',
    'py-2',
    'text-sm',
    'ring-offset-background',
    'file:border-0',
    'file:bg-transparent',
    'file:text-sm',
    'file:font-medium',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
    'transition-all',
    'duration-150',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-input',
          'hover:border-ring/50',
        ],
        error: [
          'border-destructive',
          'focus-visible:ring-destructive',
          'text-destructive',
        ],
        success: [
          'border-success',
          'focus-visible:ring-success',
        ],
        ghost: [
          'border-transparent',
          'bg-transparent',
          'hover:bg-accent/50',
          'focus-visible:bg-background',
        ],
      },
      size: {
        sm: ['h-8', 'px-2', 'text-xs'],
        default: ['h-10', 'px-3'],
        lg: ['h-12', 'px-4', 'text-base'],
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

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  description?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  loading?: boolean;
}

// ==========================================
// COMPONENT IMPLEMENTATION
// ==========================================

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      type = 'text',
      label,
      description,
      error,
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      loading,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const isDisabled = disabled || loading;
    const inputVariant = error ? 'error' : variant;

    const inputElement = (
      <div className="relative">
        {leftAddon && (
          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none">
            <span className="text-muted-foreground text-sm">{leftAddon}</span>
          </div>
        )}
        
        {leftIcon && !leftAddon && (
          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none">
            <span className="text-muted-foreground h-4 w-4">{leftIcon}</span>
          </div>
        )}

        <input
          type={type}
          className={cn(
            inputVariants({ variant: inputVariant, size }),
            leftIcon || leftAddon ? 'pl-10' : '',
            rightIcon || rightAddon || loading ? 'pr-10' : '',
            className
          )}
          ref={ref}
          id={inputId}
          disabled={isDisabled}
          required={required}
          aria-describedby={cn(descriptionId, errorId)}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />

        {loading && (
          <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3">
            <svg
              className="h-4 w-4 animate-spin text-muted-foreground"
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
          </div>
        )}

        {!loading && (rightIcon || rightAddon) && (
          <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3 pointer-events-none">
            {rightAddon ? (
              <span className="text-muted-foreground text-sm">{rightAddon}</span>
            ) : (
              <span className="text-muted-foreground h-4 w-4">{rightIcon}</span>
            )}
          </div>
        )}
      </div>
    );

    if (!label && !description && !error) {
      return inputElement;
    }

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              error && 'text-destructive'
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        
        {inputElement}
        
        {description && !error && (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
        
        {error && (
          <p id={errorId} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ==========================================
// COMPOUND COMPONENTS
// ==========================================

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'horizontal' | 'vertical';
  }
>(({ className, orientation = 'vertical', children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row gap-4' : 'flex-col gap-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

InputGroup.displayName = 'InputGroup';

// Search Input Variant
const SearchInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ leftIcon, ...props }, ref) => {
    const searchIcon = leftIcon || (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    );

    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={searchIcon}
        placeholder="Search..."
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

// Password Input Variant
const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ rightIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const toggleIcon = (
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    );

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          rightIcon={rightIcon}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-auto">
          {toggleIcon}
        </div>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

// ==========================================
// EXPORTS
// ==========================================

export { Input, InputGroup, SearchInput, PasswordInput, inputVariants };
