/**
 * GHXSTSHIP Radio Button Component
 * Atomic-level radio input with accessibility
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const radioVariants = cva(
  [
    'h-icon-xs',
    'w-icon-xs',
    'rounded-full',
    'border',
    'border-input',
    'text-accent',
    'focus:ring-2',
    'focus:ring-ring',
    'focus:ring-offset-2',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
    'transition-all',
    'duration-150',
  ],
  {
    variants: {
      variant: {
        default: ['hover:border-ring/50'],
        error: ['border-destructive', 'focus:ring-destructive'],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface RadioButtonProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>,
    VariantProps<typeof radioVariants> {
  label?: string;
  description?: string;
  error?: string;
}

const RadioButton = React.forwardRef<HTMLInputElement, RadioButtonProps>(
  (
    {
      className,
      variant,
      label,
      description,
      error,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const radioId = id || React.useId();
    const descriptionId = description ? `${radioId}-description` : undefined;
    const errorId = error ? `${radioId}-error` : undefined;
    const radioVariant = error ? 'error' : variant;

    const radioElement = (
      <input
        type="radio"
        className={cn(radioVariants({ variant: radioVariant }), className)}
        ref={ref}
        id={radioId}
        disabled={disabled}
        required={required}
        aria-describedby={cn(descriptionId, errorId)}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
    );

    if (!label && !description && !error) {
      return radioElement;
    }

    return (
      <div className="flex items-start gap-xs">
        {radioElement}
        <div className="flex flex-col gap-1">
          {label && (
            <label
              htmlFor={radioId}
              className={cn(
                'text-sm font-medium leading-none cursor-pointer',
                error && 'text-destructive',
                disabled && 'cursor-not-allowed opacity-70'
              )}
            >
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}
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
      </div>
    );
  }
);

RadioButton.displayName = 'RadioButton';

// Radio Group Component
export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      orientation = 'vertical',
      label,
      description,
      error,
      required,
      children,
      ...props
    },
    ref
  ) => {
    const groupId = React.useId();
    const descriptionId = description ? `${groupId}-description` : undefined;
    const errorId = error ? `${groupId}-error` : undefined;

    return (
      <div className="space-y-2">
        {label && (
          <label
            className={cn(
              'text-sm font-medium leading-none',
              error && 'text-destructive'
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div
          ref={ref}
          className={cn(
            'flex',
            orientation === 'horizontal' ? 'flex-row gap-4' : 'flex-col gap-3',
            className
          )}
          role="radiogroup"
          aria-describedby={cn(descriptionId, errorId)}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        >
          {children}
        </div>
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

RadioGroup.displayName = 'RadioGroup';

export { RadioButton, RadioGroup, radioVariants };
