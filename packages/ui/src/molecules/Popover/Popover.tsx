/**
 * Popover Component — Floating Content Panel
 * Display floating content relative to trigger
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';

export interface PopoverProps {
  /** Trigger element */
  trigger: React.ReactNode;
  
  /** Popover content */
  content: React.ReactNode;
  
  /** Position */
  position?: 'top' | 'bottom' | 'left' | 'right';
  
  /** Align */
  align?: 'start' | 'center' | 'end';
  
  /** Open state (controlled) */
  open?: boolean;
  
  /** Open change handler */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Popover Component
 * 
 * @example
 * ```tsx
 * <Popover
 *   trigger={<Button>Open</Button>}
 *   content={<div>Popover content</div>}
 * />
 * ```
 */
export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  position = 'bottom',
  align = 'center',
  open: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  
  const open = controlledOpen ?? internalOpen;
  
  const handleToggle = () => {
    const newOpen = !open;
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };
  
  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        if (controlledOpen === undefined) {
          setInternalOpen(false);
        }
        onOpenChange?.(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, controlledOpen, onOpenChange]);
  
  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };
  
  const alignClasses = {
    start: position === 'top' || position === 'bottom' ? 'left-0' : 'top-0',
    center: position === 'top' || position === 'bottom' ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2',
    end: position === 'top' || position === 'bottom' ? 'right-0' : 'bottom-0',
  };
  
  return (
    <div ref={popoverRef} className="relative inline-block">
      <div onClick={handleToggle}>
        {trigger}
      </div>
      
      {open && (
        <div
          className={`
            absolute z-50
            ${positionClasses[position]}
            ${alignClasses[align]}
            min-w-[200px]
            rounded-lg border border-[var(--color-border)]
            bg-[var(--color-surface)]
            shadow-lg
            p-4
            animate-in fade-in-0 zoom-in-95
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
};

Popover.displayName = 'Popover';
