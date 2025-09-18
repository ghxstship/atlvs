'use client';

import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface EnhancedUniversalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showOverlay?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

const sizeClasses = {
  sm: {
    left: 'w-80',
    right: 'w-80',
    top: 'h-80',
    bottom: 'h-80',
  },
  md: {
    left: 'w-96',
    right: 'w-96',
    top: 'h-96',
    bottom: 'h-96',
  },
  lg: {
    left: 'w-[32rem]',
    right: 'w-[32rem]',
    top: 'h-[32rem]',
    bottom: 'h-[32rem]',
  },
  xl: {
    left: 'w-[48rem]',
    right: 'w-[48rem]',
    top: 'h-[48rem]',
    bottom: 'h-[48rem]',
  },
  full: {
    left: 'w-full',
    right: 'w-full',
    top: 'h-full',
    bottom: 'h-full',
  },
};

const positionClasses = {
  left: 'left-0 top-0 h-full',
  right: 'right-0 top-0 h-full',
  top: 'top-0 left-0 w-full',
  bottom: 'bottom-0 left-0 w-full',
};

const transformClasses = {
  left: {
    closed: '-translate-x-full',
    open: 'translate-x-0',
  },
  right: {
    closed: 'translate-x-full',
    open: 'translate-x-0',
  },
  top: {
    closed: '-translate-y-full',
    open: 'translate-y-0',
  },
  bottom: {
    closed: 'translate-y-full',
    open: 'translate-y-0',
  },
};

export const EnhancedUniversalDrawer: React.FC<EnhancedUniversalDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
  showOverlay = true,
  closeOnOverlayClick = true,
  className,
  headerClassName,
  contentClassName,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      {showOverlay && (
        <div
          className={twMerge(
            'absolute inset-0 bg-black/50 transition-opacity duration-300',
            isOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={handleOverlayClick}
        />
      )}

      {/* Drawer */}
      <div
        className={twMerge(
          'absolute bg-background border shadow-lg transition-transform duration-300 ease-in-out',
          positionClasses[position],
          sizeClasses[size][position],
          transformClasses[position][isOpen ? 'open' : 'closed'],
          position === 'left' && 'border-r',
          position === 'right' && 'border-l',
          position === 'top' && 'border-b',
          position === 'bottom' && 'border-t',
          className
        )}
      >
        {/* Header */}
        {title && (
          <div
            className={twMerge(
              'flex items-center justify-between p-md border-b',
              headerClassName
            )}
          >
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div
          className={twMerge(
            'flex-1 overflow-auto',
            title ? 'h-[calc(100%-4rem)]' : 'h-full',
            contentClassName
          )}
        >
          {children}
        </div>

        {/* Close button when no title */}
        {!title && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 h-8 w-8 p-0 z-10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnhancedUniversalDrawer;
