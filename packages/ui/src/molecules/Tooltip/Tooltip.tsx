'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../system';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'default' | 'dark' | 'light' | 'error' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
  delay?: number;
  disabled?: boolean;
  arrow?: boolean;
  className?: string;
  maxWidth?: number;
}

const tooltipVariants = {
  variant: {
    default: 'bg-popover text-popover-foreground border-border',
    dark: 'bg-foreground text-background border-border',
    light: 'bg-background text-foreground border-border shadow-floating',
    error: 'bg-destructive text-destructive-foreground border-destructive',
    warning: 'bg-warning text-warning-foreground border-warning',
    success: 'bg-success text-success-foreground border-success',
  },
  size: {
    sm: 'px-sm py-xs text-xs',
    md: 'px-sm py-sm text-sm',
    lg: 'px-md py-sm text-base',
  },
};

export function Tooltip({
  content,
  children,
  placement = 'top',
  variant = 'default',
  size = 'md',
  delay = 500,
  disabled = false,
  arrow = true,
  className = '',
  maxWidth = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let x = 0;
    let y = 0;

    switch (placement) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + 8;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
    }

    // Adjust for viewport boundaries
    if (x < 8) x = 8;
    if (x + tooltipRect.width > viewport.width - 8) {
      x = viewport.width - tooltipRect.width - 8;
    }
    if (y < 8) y = 8;
    if (y + tooltipRect.height > viewport.height - 8) {
      y = viewport.height - tooltipRect.height - 8;
    }

    setPosition({ x, y });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      
      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const tooltipClasses = cn(
    'fixed z-50 rounded-md border font-medium pointer-events-none',
    'transition-all duration-200 ease-out',
    'animate-in fade-in-0 zoom-in-95',
    tooltipVariants.variant[variant],
    tooltipVariants.size[size],
    className
  );

  const arrowClasses = cn(
    'absolute w-2 h-2 rotate-45 border',
    tooltipVariants.variant[variant],
    placement === 'top' && 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-b-0 border-r-0',
    placement === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-t-0 border-l-0',
    placement === 'left' && 'right-full top-1/2 translate-x-1/2 -translate-y-1/2 border-l-0 border-b-0',
    placement === 'right' && 'left-full top-1/2 -translate-x-1/2 -translate-y-1/2 border-r-0 border-t-0'
  );

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && typeof document !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          className={tooltipClasses}
          style={{
            left: position.x,
            top: position.y,
            maxWidth,
          }}
          role="tooltip"
          aria-hidden={!isVisible}
        >
          {content}
          {arrow && <div className={arrowClasses} />}
        </div>,
        document.body
      )}
    </>
  );
}
