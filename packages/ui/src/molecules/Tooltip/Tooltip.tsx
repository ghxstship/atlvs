/**
 * Tooltip Component — Hover Tooltip
 * Display contextual information on hover
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';

export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  
  /** Position */
  position?: 'top' | 'bottom' | 'left' | 'right';
  
  /** Delay before showing (ms) */
  delay?: number;
  
  /** Children (trigger element) */
  children: React.ReactNode;
}

/**
 * Tooltip Component
 * 
 * @example
 * ```tsx
 * <Tooltip content="Click to copy">
 *   <Button>Copy</Button>
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  delay = 200,
  children,
}) => {
  const [visible, setVisible] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  
  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  };
  
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(false);
  };
  
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--color-foreground)] border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--color-foreground)] border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--color-foreground)] border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--color-foreground)] border-y-transparent border-l-transparent',
  };
  
  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {visible && (
        <div
          role="tooltip"
          className={`
            absolute z-50
            ${positionClasses[position]}
            px-2 py-1
            rounded
            bg-foreground
            text-background
            text-xs
            whitespace-nowrap
            pointer-events-none
            animate-in fade-in-0 zoom-in-95
          `}
        >
          {content}
          <div
            className={`
              absolute w-0 h-0
              border-4
              ${arrowClasses[position]}
            `}
          />
        </div>
      )}
    </div>
  );
};

Tooltip.displayName = 'Tooltip';
