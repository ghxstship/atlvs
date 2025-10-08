/**
 * Dropdown Component — Dropdown Menu
 * Accessible dropdown menu with items
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
  onClick?: () => void;
  separator?: boolean;
}

export interface DropdownProps {
  /** Trigger element */
  trigger: React.ReactNode;
  
  /** Dropdown items */
  items: DropdownItem[];
  
  /** Align */
  align?: 'start' | 'center' | 'end';
  
  /** Selected item ID */
  selected?: string;
}

/**
 * Dropdown Component
 * 
 * @example
 * ```tsx
 * <Dropdown
 *   trigger={<Button>Menu</Button>}
 *   items={[
 *     { id: '1', label: 'Item 1', onClick: () => {} },
 *     { id: '2', label: 'Item 2', onClick: () => {} },
 *   ]}
 * />
 * ```
 */
export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'end',
  selected,
}) => {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);
  
  // Close on escape
  React.useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);
  
  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };
  
  return (
    <div ref={dropdownRef} className="relative inline-block">
      <div onClick={() => setOpen(!open)}>
        {trigger}
      </div>
      
      {open && (
        <div
          className={`
            absolute ${alignClasses[align]} top-full mt-2
            min-w-[12rem]
            rounded-lg border border-border
            bg-card
            shadow-lg
            py-1
            z-50
          `}
        >
          {items.map((item) => {
            if (item.separator) {
              return (
                <div
                  key={item.id}
                  className="h-px bg-border my-1"
                />
              );
            }
            
            const isSelected = selected === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.();
                    setOpen(false);
                  }
                }}
                disabled={item.disabled}
                className="
                  w-full flex items-center gap-2 px-3 py-2
                  text-sm text-left
                  hover:bg-muted
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span className="flex-1">{item.label}</span>
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

Dropdown.displayName = 'Dropdown';
