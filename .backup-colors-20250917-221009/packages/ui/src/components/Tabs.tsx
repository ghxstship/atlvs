import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

export const Tabs = ({ defaultValue, value, onValueChange, children, className }: TabsProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }: TabsListProps) => (
  <div className={twMerge(clsx('tab-list', className))} role="tablist">
    {children}
  </div>
);

export const TabsTrigger = ({ value, children, className, disabled }: TabsTriggerProps) => {
  const { value: currentValue, onValueChange } = React.useContext(TabsContext);
  const isActive = currentValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      disabled={disabled}
      className={twMerge(clsx('tab-trigger', className))}
      onClick={() => !disabled && onValueChange?.(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className }: TabsContentProps) => {
  const { value: currentValue } = React.useContext(TabsContext);
  
  if (currentValue !== value) {
    return null;
  }

  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  );
};
