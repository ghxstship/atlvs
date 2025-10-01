/**
 * GHXSTSHIP ColorPicker Component
 * Atomic-level color input with accessibility
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const colorPickerVariants = cva(
  [
    'h-icon-xl',
    'w-full',
    'rounded-md',
    'border',
    'cursor-pointer',
    'transition-all',
    'duration-150',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        default: ['border-input', 'hover:border-ring/50'],
        error: ['border-destructive', 'focus-visible:ring-destructive'],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ColorPickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>,
    VariantProps<typeof colorPickerVariants> {
  label?: string;
  description?: string;
  error?: string;
  showValue?: boolean;
  presets?: string[];
}

const ColorPicker = React.forwardRef<HTMLInputElement, ColorPickerProps>(
  (
    {
      className,
      variant,
      label,
      description,
      error,
      showValue = true,
      presets,
      id,
      disabled,
      required,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<string>(
      (value as string) || (defaultValue as string) || 'hsl(0 0% 0%)'
    );
    const colorId = id || React.useId();
    const descriptionId = description ? `${colorId}-description` : undefined;
    const errorId = error ? `${colorId}-error` : undefined;
    const colorVariant = error ? 'error' : variant;

    const currentValue = value !== undefined ? (value as string) : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handlePresetClick = (color: string) => {
      setInternalValue(color);
      const syntheticEvent = {
        target: { value: color },
        currentTarget: { value: color },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
    };

    const colorInput = (
      <div className="flex gap-xs">
        <input
          type="color"
          className={cn(colorPickerVariants({ variant: colorVariant }), 'flex-shrink-0 w-component-lg', className)}
          ref={ref}
          id={colorId}
          disabled={disabled}
          required={required}
          value={currentValue}
          onChange={handleChange}
          aria-describedby={cn(descriptionId, errorId)}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        {showValue && (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => {
              const color = e.target.value;
              if (/^#[0-9A-F]{6}$/i.test(color)) {
                setInternalValue(color);
                onChange?.(e as unknown as React.ChangeEvent<HTMLInputElement>);
              }
            }}
            className={cn(
              'flex-1 h-icon-xl px-3 rounded-md border border-input bg-background',
              'text-sm font-mono uppercase',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            disabled={disabled}
            placeholder="hsl(0 0% 0%)"
            maxLength={7}
          />
        )}
      </div>
    );

    if (!label && !description && !error && !presets) {
      return colorInput;
    }

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={colorId}
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

        {colorInput}

        {presets && presets.length > 0 && (
          <div className="flex flex-wrap gap-xs">
            <span className="text-xs text-muted-foreground">Presets:</span>
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  'w-icon-lg h-icon-lg rounded-md border-2 transition-all',
                  currentValue.toLowerCase() === preset.toLowerCase()
                    ? 'border-ring scale-110'
                    : 'border-transparent hover:border-ring/50 hover:scale-105',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                style={{ backgroundColor: preset }}
                disabled={disabled}
                aria-label={`Select color ${preset}`}
              />
            ))}
          </div>
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
    );
  }
);

ColorPicker.displayName = 'ColorPicker';

export { ColorPicker, colorPickerVariants };
