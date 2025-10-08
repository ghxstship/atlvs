/**
 * Dialog Component — Modal Dialog
 * Accessible modal dialog with overlay
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  /** Is dialog open */
  open: boolean;
  
  /** Close handler */
  onClose: () => void;
  
  /** Dialog title */
  title?: string;
  
  /** Dialog description */
  description?: string;
  
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
  
  /** Close on escape */
  closeOnEscape?: boolean;
  
  /** Size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /** Children */
  children: React.ReactNode;
}

/**
 * Dialog Component
 * 
 * @example
 * ```tsx
 * <Dialog open={isOpen} onClose={() => setIsOpen(false)} title="Confirm">
 *   <p>Are you sure?</p>
 *   <DialogFooter>
 *     <Button onClick={() => setIsOpen(false)}>Cancel</Button>
 *     <Button variant="primary">Confirm</Button>
 *   </DialogFooter>
 * </Dialog>
 * ```
 */
export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  size = 'md',
  children,
}) => {
  // Handle escape key
  React.useEffect(() => {
    if (!open || !closeOnEscape) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose]);
  
  // Lock body scroll
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  
  if (!open) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full m-4',
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        aria-describedby={description ? 'dialog-description' : undefined}
        className={`
          relative w-full ${sizeClasses[size]}
          bg-[var(--color-surface)]
          border border-[var(--color-border)]
          rounded-lg shadow-xl
          max-h-[90vh] overflow-auto
        `}
      >
        {/* Header */}
        {(title || description) && (
          <div className="p-6 border-b border-[var(--color-border)]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {title && (
                  <h2 id="dialog-title" className="text-lg font-semibold">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="dialog-description" className="text-sm text-[var(--color-foreground-secondary)] mt-1">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="
                  ml-4 p-2 rounded
                  hover:bg-[var(--color-muted)]
                  transition-colors
                  flex-shrink-0
                "
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

Dialog.displayName = 'Dialog';

export const DialogFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-end gap-2 mt-6 ${className}`}>
      {children}
    </div>
  );
};

DialogFooter.displayName = 'DialogFooter';
