/**
 * GHXSTSHIP Range Slider Component
 * Atomic-level range input with accessibility
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const sliderVariants = cva(
  [
    'w-full',
    'h-2',
    'rounded-full',
    'appearance-none',
    'cursor-pointer',
    'bg-muted',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-ring',
    'focus:ring-offset-2',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
    'transition-all',
    'duration-150',
    '[&::-webkit-slider-thumb]:appearance-none',
    '[&::-webkit-slider-thumb]:h-icon-sm',
    '[&::-webkit-slider-thumb]:w-icon-sm',
    '[&::-webkit-slider-thumb]:rounded-full',
    '[&::-webkit-slider-thumb]:bg-accent',
    '[&::-webkit-slider-thumb]:border-2',
    '[&::-webkit-slider-thumb]:border-background',
    '[&::-webkit-slider-thumb]:shadow-md',
    '[&::-webkit-slider-thumb]:transition-all',
    '[&::-webkit-slider-thumb]:hover:scale-110',
    '[&::-moz-range-thumb]:h-icon-sm',
    '[&::-moz-range-thumb]:w-icon-sm',
    '[&::-moz-range-thumb]:rounded-full',
    '[&::-moz-range-thumb]:bg-accent',
    '[&::-moz-range-thumb]:border-2',
    '[&::-moz-range-thumb]:border-background',
    '[&::-moz-range-thumb]:shadow-md',
    '[&::-moz-range-thumb]:transition-all',
    '[&::-moz-range-thumb]:hover:scale-110',
  ],
  {
    variants: {
      variant: {
        default: [],
        error: ['focus:ring-destructive'],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface RangeSliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>,
    VariantProps<typeof sliderVariants> {
  label?: string;
  description?: string;
  error?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
}

const RangeSlider = React.forwardRef<HTMLInputElement, RangeSliderProps>(
  (
    {
      className,
      variant,
      label,
      description,
      error,
      showValue = true,
      valueFormatter,
      id,
      disabled,
      required,
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<number>(
      (value as number) || (defaultValue as number) || Number(min)
    );
    const sliderId = id || React.useId();
    const descriptionId = description ? `${sliderId}-description` : undefined;
    const errorId = error ? `${sliderId}-error` : undefined;
    const sliderVariant = error ? 'error' : variant;

    const currentValue = value !== undefined ? (value as number) : internalValue;
    const displayValue = valueFormatter
      ? valueFormatter(currentValue)
      : currentValue.toString();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      setInternalValue(newValue);
      onChange?.(e);
    };

    const sliderElement = (
      <div className="relative w-full">
        <input
          type="range"
          className={cn(sliderVariants({ variant: sliderVariant }), className)}
          ref={ref}
          id={sliderId}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          aria-describedby={cn(descriptionId, errorId)}
          aria-invalid={error ? 'true' : 'false'}
          aria-valuemin={Number(min)}
          aria-valuemax={Number(max)}
          aria-valuenow={currentValue}
          {...props}
        />
      </div>
    );

    if (!label && !description && !error && !showValue) {
      return sliderElement;
    }

    return (
      <div className="space-y-2">
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <label
                htmlFor={sliderId}
                className={cn(
                  'text-sm font-medium leading-none',
                  error && 'text-destructive',
                  disabled && 'cursor-not-allowed opacity-70'
                )}
              >
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </label>
            )}
            {showValue && (
              <span className="text-sm font-medium text-muted-foreground">
                {displayValue}
              </span>
            )}
          </div>
        )}

        {sliderElement}

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

RangeSlider.displayName = 'RangeSlider';

export { RangeSlider, sliderVariants };
