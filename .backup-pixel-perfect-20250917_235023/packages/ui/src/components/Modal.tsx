'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Button } from './Button';

const modalVariants = cva(
  'relative bg-background border border-border shadow-floating rounded-lg',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        default: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        full: 'max-w-full mx-md',
      },
      variant: {
        default: 'bg-background',
        destructive: 'bg-background border-destructive/20',
        success: 'bg-background border-success/20',
        warning: 'bg-background border-warning/20',
        info: 'bg-background border-primary/20',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

const overlayVariants = cva(
  'fixed inset-0 z-50 flex items-center justify-center p-md',
  {
    variants: {
      blur: {
        none: 'bg-foreground/30',
        sm: 'bg-foreground/30 backdrop-blur-sm',
        default: 'bg-foreground/30 backdrop-blur',
        lg: 'bg-foreground/30 backdrop-blur-lg',
      },
    },
    defaultVariants: {
      blur: 'default',
    },
  }
);

export interface ModalProps extends VariantProps<typeof modalVariants> {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  blur?: VariantProps<typeof overlayVariants>['blur'];
  preventScroll?: boolean;
  focusTrap?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  restoreFocus?: boolean;
  role?: 'dialog' | 'alertdialog';
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  overlayClassName,
  size,
  variant,
  blur,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  preventScroll = true,
  focusTrap = true,
  initialFocus,
  restoreFocus = true,
  role = 'dialog',
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = `modal-description-${Math.random().toString(36).substr(2, 9)}`;

  // Handle open/close animations
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsAnimating(true);
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Prevent body scroll
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }
      
      // Focus management
      setTimeout(() => {
        if (initialFocus?.current) {
          initialFocus.current.focus();
        } else if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement;
          firstFocusable?.focus();
        }
        setIsAnimating(false);
      }, 150);
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
        
        // Restore body scroll
        if (preventScroll) {
          document.body.style.overflow = '';
        }
        
        // Restore focus
        if (restoreFocus && previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      }, 150);
    }
  }, [open, preventScroll, initialFocus, restoreFocus]);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !open) return;
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, open, onClose]);

  // Focus trap
  useEffect(() => {
    if (!focusTrap || !open || !modalRef.current) return;
    
    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [focusTrap, open]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isVisible) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className={twMerge(
        overlayVariants({ blur }),
        overlayClassName,
        // Animation classes
        isAnimating && open && 'animate-in fade-in-0 duration-150',
        isAnimating && !open && 'animate-out fade-out-0 duration-150'
      )}
      onClick={handleOverlayClick}
      aria-hidden={!open}
    >
      <div
        ref={modalRef}
        className={twMerge(
          modalVariants({ size, variant }),
          className,
          // Animation classes
          isAnimating && open && 'animate-in zoom-in-95 slide-in-from-bottom-2 duration-150',
          isAnimating && !open && 'animate-out zoom-out-95 slide-out-to-bottom-2 duration-150'
        )}
        role={role}
        aria-modal="true"
        aria-labelledby={ariaLabelledBy || (title ? titleId : undefined)}
        aria-describedby={ariaDescribedBy || (description ? descriptionId : undefined)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-lg pb-md">
            <div className="flex-1">
              {title && (
                <h2 id={titleId} className="text-lg font-semibold leading-none tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="text-sm text-muted-foreground mt-xs">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 ml-md"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        {children && (
          <div className={clsx('px-lg', !(title || showCloseButton) && 'pt-lg', !footer && 'pb-lg')}>
            {children}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-sm p-lg pt-md border-t">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Specialized modal components
export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <AlertTriangle className="h-6 w-6 text-destructive" />;
      default:
        return <Info className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      variant={variant}
      role="alertdialog"
    >
      <div className="flex items-start gap-md">
        {getIcon()}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-sm">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-sm mt-lg">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'primary'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  buttonText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  open,
  onClose,
  title,
  description,
  type = 'info',
  buttonText = 'OK',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-warning" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-destructive" />;
      default:
        return <Info className="h-6 w-6 text-primary" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive' as const;
      case 'success':
        return 'success' as const;
      case 'warning':
        return 'warning' as const;
      default:
        return 'info' as const;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      variant={getVariant()}
      role="alertdialog"
    >
      <div className="flex items-start gap-md">
        {getIcon()}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-sm">{description}</p>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-lg">
        <Button onClick={onClose}>
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
};

// Hook for modal state management
export const useModal = (initialOpen = false) => {
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
