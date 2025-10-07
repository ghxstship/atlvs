'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { ChevronDown, Check } from 'lucide-react';
import { DESIGN_TOKENS } from '../../tokens/unified-design-tokens';

// Select variants for different use cases
const selectVariants = cva(
  'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
  {
    variants: {
      variant: {
        default: 'border-input',
        destructive: 'border-destructive focus:ring-destructive',
        success: 'border-success focus:ring-success',
      },
      size: {
        sm: 'h-8 px-2 py-1 text-xs',
        default: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Option item component
const SelectOption = forwardRef<
  HTMLDivElement,
  {
    value: string;
    label: string;
    selected?: boolean;
    disabled?: boolean;
    onSelect: (value: string) => void;
  }
>(({ value, label, selected, disabled, onSelect }, ref) => (
  <div
    ref={ref}
    className={clsx(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
      selected && 'bg-accent text-accent-foreground',
      disabled && 'pointer-events-none opacity-50',
      !disabled && 'focus:bg-accent focus:text-accent-foreground'
    )}
    onClick={() => !disabled && onSelect(value)}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {selected && <Check className="h-4 w-4" />}
    </span>
    {label}
  </div>
));

SelectOption.displayName = 'SelectOption';

// Main Select component
export interface SelectProps extends VariantProps<typeof selectVariants> {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  onValueChange?: (value: string) => void;
  className?: string;
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      value,
      placeholder = 'Select an option',
      disabled = false,
      required = false,
      error = false,
      options,
      onValueChange,
      variant,
      size,
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<string>('');
    const buttonRef = useRef<HTMLButtonElement>(null);
    const listboxRef = useRef<HTMLDivElement>(null);

    // Update selected label when value changes
    useEffect(() => {
      if (value) {
        const option = options.find(opt => opt.value === value);
        setSelectedLabel(option?.label || '');
      } else {
        setSelectedLabel('');
      }
    }, [value, options]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          setIsOpen(!isOpen);
          break;
        case 'Escape':
          setIsOpen(false);
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) setIsOpen(true);
          break;
      }
    }, [disabled, isOpen]);

    // Handle option selection
    const handleOptionSelect = useCallback((optionValue: string) => {
      onValueChange?.(optionValue);
      setIsOpen(false);
      buttonRef.current?.focus();
    }, [onValueChange]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          buttonRef.current &&
          !buttonRef.current.contains(event.target as Node) &&
          listboxRef.current &&
          !listboxRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Handle ARIA attributes
    const buttonId = `select-button-${Math.random().toString(36).substr(2, 9)}`;
    const listboxId = `select-listbox-${buttonId}`;

    return (
      <div className="relative">
        <button
          ref={ref || buttonRef}
          type="button"
          id={buttonId}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={buttonId}
          aria-describedby={error ? `${buttonId}-error` : undefined}
          aria-required={required}
          disabled={disabled}
          className={twMerge(
            selectVariants({
              variant: error ? 'destructive' : variant,
              size,
              className
            })
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
        >
          <span className={selectedLabel ? '' : 'text-muted-foreground'}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDown className={clsx(
            'h-4 w-4 opacity-50 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} />
        </button>

        {isOpen && (
          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={buttonId}
            className="absolute z-50 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
            style={{
              top: 'calc(100% + 0.5rem)',
            }}
          >
            {options.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <SelectOption
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  selected={value === option.value}
                  disabled={option.disabled}
                  onSelect={handleOptionSelect}
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select, SelectOption };
export type { SelectProps };
