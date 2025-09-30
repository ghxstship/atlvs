'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown, Check, Circle, Minus } from 'lucide-react';

const dropdownVariants = cva(
  'relative inline-block text-left',
  {
    variants: {
      size: {
        sm: 'text-sm',
        default: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const menuVariants = cva(
  'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-xs text-popover-foreground shadow-elevated animate-in fade-in-0 zoom-in-95',
  {
    variants: {
      align: {
        start: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        end: 'right-0',
      },
      side: {
        top: 'bottom-full mb-xs',
        bottom: 'top-full mt-xs',
        left: 'right-full mr-xs top-0',
        right: 'left-full ml-xs top-0',
      },
      size: {
        sm: 'min-w-[6rem]',
        default: 'min-w-[8rem]',
        lg: 'min-w-[12rem]',
        xl: 'min-w-[16rem]',
      },
    },
    defaultVariants: {
      align: 'start',
      side: 'bottom',
      size: 'default',
    },
  }
);

const itemVariants = cva(
  'relative flex cursor-default select-none items-center rounded-sm px-sm py-xs.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  {
    variants: {
      variant: {
        default: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'text-destructive hover:bg-destructive/10 hover:text-destructive',
      },
      inset: {
        true: 'pl-xl',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      inset: false,
    },
  }
);

export interface DropdownItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
  onClick?: () => void;
  href?: string;
  target?: string;
  shortcut?: string;
  type?: 'item' | 'separator' | 'label' | 'checkbox' | 'radio';
  checked?: boolean;
  value?: string;
}

export interface DropdownProps extends VariantProps<typeof dropdownVariants> {
  trigger: React.ReactNode;
  items: DropdownItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: VariantProps<typeof menuVariants>['align'];
  side?: VariantProps<typeof menuVariants>['side'];
  menuSize?: VariantProps<typeof menuVariants>['size'];
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
  modal?: boolean;
  onSelect?: (item: DropdownItem) => void;
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  multiple?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  open: controlledOpen,
  onOpenChange,
  align,
  side,
  menuSize,
  size,
  className,
  menuClassName,
  disabled = false,
  modal = false,
  onSelect,
  value,
  onValueChange,
  multiple = false,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Filter out separators and labels for keyboard navigation
  const navigableItems = items.filter(item => 
    item.type !== 'separator' && item.type !== 'label' && !item.disabled
  );

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setIsOpen(!isOpen);
  }, [disabled, isOpen, setIsOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  }, [setIsOpen]);

  const handleItemClick = useCallback((item: DropdownItem, index: number) => {
    if (item.disabled) return;

    if (item.type === 'checkbox' || item.type === 'radio') {
      const currentValue = Array.isArray(value) ? value : value ? [value] : [];
      let newValue: string | string[];

      if (item.type === 'checkbox' && multiple) {
        if (currentValue.includes(item.value || item.key)) {
          newValue = currentValue.filter(v => v !== (item.value || item.key));
        } else {
          newValue = [...currentValue, item.value || item.key];
        }
      } else {
        newValue = item.value || item.key;
      }

      onValueChange?.(newValue);
    }

    item.onClick?.();
    onSelect?.(item);

    if (item.type !== 'checkbox' || !multiple) {
      handleClose();
    }
  }, [value, onValueChange, onSelect, multiple, handleClose]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        handleClose();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => 
          prev < navigableItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : navigableItems.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < navigableItems.length) {
          const item = navigableItems[focusedIndex];
          const originalIndex = items.findIndex(i => i.key === item.key);
          handleItemClick(item, originalIndex);
        }
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(navigableItems.length - 1);
        break;
    }
  }, [isOpen, focusedIndex, navigableItems, items, setIsOpen, handleClose, handleItemClick]);

  // Focus management
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const focusedItem = navigableItems[focusedIndex];
      if (focusedItem) {
        const itemIndex = items.findIndex(i => i.key === focusedItem.key);
        itemRefs.current[itemIndex]?.focus();
      }
    }
  }, [isOpen, focusedIndex, navigableItems, items]);

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  const renderItem = (item: DropdownItem, index: number) => {
    if (item.type === 'separator') {
      return <div key={item.key} className="h-px bg-border my-xs" />;
    }

    if (item.type === 'label') {
      return (
        <div key={item.key} className="px-sm py-xs.5 text-sm font-semibold text-muted-foreground">
          {item.label}
        </div>
      );
    }

    const isSelected = item.type === 'checkbox' || item.type === 'radio' 
      ? Array.isArray(value) 
        ? value.includes(item.value || item.key)
        : value === (item.value || item.key)
      : false;

    const isFocused = navigableItems.findIndex(navItem => navItem.key === item.key) === focusedIndex;

    const ItemComponent = item.href ? 'a' : 'div';

    return (
      <ItemComponent
        key={item.key}
        ref={(el: any) => (itemRefs.current[index] = el)}
        className={twMerge(
          itemVariants({ 
            variant: item.variant, 
            inset: Boolean(item.icon) 
          }),
          isFocused && 'bg-accent text-accent-foreground',
          className
        )}
        data-disabled={item.disabled}
        tabIndex={-1}
        role="menuitem"
        aria-disabled={item.disabled}
        href={item.href}
        target={item.target}
        onClick={() => !item.disabled && handleItemClick(item, index)}
        onMouseEnter={() => {
          const navIndex = navigableItems.findIndex(navItem => navItem.key === item.key);
          if (navIndex >= 0) setFocusedIndex(navIndex);
        }}
      >
        {item.type === 'checkbox' && (
          <div className="mr-sm flex h-3.5 w-3.5 items-center justify-center">
            {isSelected && <Check className="h-3 w-3" />}
          </div>
        )}
        {item.type === 'radio' && (
          <div className="mr-sm flex h-3.5 w-3.5 items-center justify-center">
            {isSelected ? <Circle className="h-2 w-2 fill-current" /> : <Circle className="h-3 w-3" />}
          </div>
        )}
        {item.icon && <div className="mr-sm h-4 w-4">{item.icon}</div>}
        <span className="flex-1">{item.label}</span>
        {item.shortcut && (
          <span className="ml-auto text-xs tracking-widest text-muted-foreground">
            {item.shortcut}
          </span>
        )}
      </ItemComponent>
    );
  };

  const menu = isOpen && (
    <div
      ref={menuRef}
      className={twMerge(
        menuVariants({ align, side, size: menuSize }),
        menuClassName
      )}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="dropdown-trigger"
    >
      {items.map(renderItem)}
    </div>
  );

  return (
    <div className={twMerge(dropdownVariants({ size }), className)}>
      <button
        ref={triggerRef}
        id="dropdown-trigger"
        className="inline-flex items-center justify-center"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {trigger}
      </button>
      {modal ? createPortal(menu, document.body) : menu}
    </div>
  );
};

// Specialized dropdown components
export interface MenuButtonProps extends Omit<DropdownProps, 'trigger'> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  showChevron?: boolean;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
  children,
  variant = 'outline',
  showChevron = true,
  ...props
}) => {
  const buttonClass = clsx(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    {
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-md py-sm': variant === 'outline',
      'bg-accent text-accent-foreground hover:bg-accent/90 h-10 px-md py-sm': variant === 'default',
      'hover:bg-accent hover:text-accent-foreground h-10 px-md py-sm': variant === 'ghost',
    }
  );

  return (
    <Dropdown
      {...props}
      trigger={
        <div className={buttonClass}>
          {children}
          {showChevron && <ChevronDown className="ml-sm h-4 w-4" />}
        </div>
      }
    />
  );
};

export interface ContextMenuProps extends Omit<DropdownProps, 'trigger' | 'open' | 'onOpenChange'> {
  children: React.ReactNode;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  children,
  items,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setPosition({ x: event.clientX, y: event.clientY });
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = () => handleClose();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  return (
    <>
      <div ref={triggerRef} onContextMenu={handleContextMenu}>
        {children}
      </div>
      {isOpen && createPortal(
        <div
          className="fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-xs text-popover-foreground shadow-elevated animate-in fade-in-0 zoom-in-95"
          style={{ left: position.x, top: position.y }}
          role="menu"
        >
          {items.map((item, index) => {
            if (item.type === 'separator') {
              return <div key={item.key} className="h-px bg-border my-xs" />;
            }
            
            return (
              <div
                key={item.key}
                className={twMerge(
                  itemVariants({ variant: item.variant }),
                  item.disabled && 'pointer-events-none opacity-50'
                )}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.();
                    handleClose();
                  }
                }}
              >
                {item.icon && <div className="mr-sm h-4 w-4">{item.icon}</div>}
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.shortcut}
                  </span>
                )}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
};

// Hook for dropdown state management
export const useDropdown = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);
  
  return {
    isOpen,
    open,
    close,
    toggle,
  };
};
