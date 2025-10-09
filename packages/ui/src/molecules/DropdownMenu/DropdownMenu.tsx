/**
 * DropdownMenu - Radix UI compatible compound components
 * Wraps the existing Dropdown component with Radix UI-style API
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Dropdown, DropdownProps } from '../Dropdown/Dropdown';

// Re-export types
export type { DropdownItem } from '../Dropdown/Dropdown';

// DropdownMenu Context
interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: React.ReactNode;
  setTrigger: (trigger: React.ReactNode) => void;
  items: React.ReactNode[];
  addItem: (item: React.ReactNode) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

const useDropdownMenu = () => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenu components must be used within DropdownMenu');
  }
  return context;
};

// Root component
export interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  open: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [trigger, setTrigger] = React.useState<React.ReactNode>(null);
  const [items, setItems] = React.useState<React.ReactNode[]>([]);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const setOpen = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const addItem = (item: React.ReactNode) => {
    setItems(prev => [...prev, item]);
  };

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, trigger, setTrigger, items, addItem }}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

// Trigger component
export interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
}) => {
  const { setTrigger } = useDropdownMenu();
  
  React.useEffect(() => {
    setTrigger(children);
  }, [children, setTrigger]);
  
  return null;
};

// Content component
export interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
}) => {
  return <>{children}</>;
};

// Item component
export interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  onClick,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
};

// Separator component
export const DropdownMenuSeparator: React.FC = () => {
  return <div className="h-px bg-border my-1" />;
};

// Label component
export interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({
  children,
}) => {
  return (
    <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
      {children}
    </div>
  );
};

// Group component
export interface DropdownMenuGroupProps {
  children: React.ReactNode;
}

export const DropdownMenuGroup: React.FC<DropdownMenuGroupProps> = ({
  children,
}) => {
  return <>{children}</>;
};
