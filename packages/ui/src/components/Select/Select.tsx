'use client';

import React, { useState, createContext, useContext } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown, Check } from 'lucide-react';

// Context for Select state management
interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select');
  }
  return context;
};

// Select Root Component
export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  value,
  defaultValue,
  onValueChange,
  children,
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [open, setOpen] = useState(false);

  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        open,
        setOpen: disabled ? () => {} : setOpen,
      }}
    >
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

// Select Trigger Component
const selectTriggerVariants = cva(
  'flex h-icon-xl w-full items-center justify-between rounded-md border border-input bg-background px-sm py-sm text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-border hover:border-border/80',
        outline: 'border-border hover:border-border/80',
      },
      size: {
        default: 'h-icon-xl px-sm py-sm',
        sm: 'h-9 px-sm py-xs text-sm',
        lg: 'h-11 px-md py-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof selectTriggerVariants> {
  children: React.ReactNode;
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    const { open, setOpen } = useSelectContext();

    return (
      <button
        ref={ref}
        type="button"
        role="combobox"
        aria-expanded={open}
        className={twMerge(selectTriggerVariants({ variant, size }), className)}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <ChevronDown className={clsx(
          'h-icon-xs w-icon-xs opacity-50 transition-transform duration-200',
          open && 'rotate-180'
        )} />
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

// Select Value Component
export interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder, className }) => {
  const { value } = useSelectContext();
  
  return (
    <span className={twMerge('block truncate', className)}>
      {value || placeholder}
    </span>
  );
};

// Select Content Component
export interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom';
}

export const SelectContent: React.FC<SelectContentProps> = ({ 
  children, 
  className,
  position = 'bottom' 
}) => {
  const { open } = useSelectContext();

  if (!open) return null;

  return (
    <div
      className={twMerge(
        'absolute z-50 w-full rounded-md border bg-popover p-xs text-popover-foreground shadow-elevated animate-in fade-in-0 zoom-in-95',
        position === 'top' ? 'bottom-full mb-xs' : 'top-full mt-xs',
        className
      )}
    >
      <div className="max-h-60 overflow-auto">
        {children}
      </div>
    </div>
  );
};

// Select Item Component
export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const SelectItem: React.FC<SelectItemProps> = ({ 
  value, 
  children, 
  className,
  disabled = false 
}) => {
  const { value: selectedValue, onValueChange } = useSelectContext();
  const isSelected = selectedValue === value;

  return (
    <div
      className={twMerge(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-xs.5 pl-xl pr-sm text-sm outline-none transition-colors',
        disabled 
          ? 'pointer-events-none opacity-50' 
          : 'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer',
        isSelected && 'bg-accent text-accent-foreground',
        className
      )}
      onClick={disabled ? undefined : () => onValueChange(value)}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-icon-xs w-icon-xs" />}
      </span>
      {children}
    </div>
  );
};

// Select Group Component
export interface SelectGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectGroup: React.FC<SelectGroupProps> = ({ children, className }) => {
  return (
    <div className={twMerge('py-xs', className)}>
      {children}
    </div>
  );
};

// Select Label Component
export interface SelectLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectLabel: React.FC<SelectLabelProps> = ({ children, className }) => {
  return (
    <div className={twMerge('py-xs.5 pl-xl pr-sm text-sm font-semibold', className)}>
      {children}
    </div>
  );
};

// Select Separator Component
export interface SelectSeparatorProps {
  className?: string;
}

export const SelectSeparator: React.FC<SelectSeparatorProps> = ({ className }) => {
  return (
    <div className={twMerge('-mx-xs my-xs h-px bg-muted', className)} />
  );
};
