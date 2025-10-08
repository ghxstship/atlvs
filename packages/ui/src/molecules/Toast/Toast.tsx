/**
 * Toast Component — Toast Notification
 * Temporary notification messages
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastProps {
  /** Toast ID */
  id: string;
  
  /** Toast variant */
  variant?: 'info' | 'success' | 'warning' | 'error';
  
  /** Toast title */
  title?: string;
  
  /** Toast message */
  message: string;
  
  /** Duration (ms) */
  duration?: number;
  
  /** Dismiss handler */
  onDismiss?: (id: string) => void;
}

/**
 * Toast Component
 * 
 * @example
 * ```tsx
 * <Toast
 *   id="1"
 *   variant="success"
 *   message="Changes saved successfully"
 *   onDismiss={handleDismiss}
 * />
 * ```
 */
export const Toast: React.FC<ToastProps> = ({
  id,
  variant = 'info',
  title,
  message,
  duration = 5000,
  onDismiss,
}) => {
  React.useEffect(() => {
    if (duration && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);
  
  const icons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
  };
  
  const variantClasses = {
    info: 'bg-info text-info-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    error: 'bg-destructive text-destructive-foreground',
  };
  
  const Icon = icons[variant];
  
  return (
    <div
      className={`
        flex items-start gap-3 p-4
        rounded-lg shadow-lg
        ${variantClasses[variant]}
        animate-in slide-in-from-top-2
      `}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div className="text-sm">{message}</div>
      </div>
      
      {onDismiss && (
        <button
          onClick={() => onDismiss(id)}
          className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

Toast.displayName = 'Toast';

/**
 * ToastContainer Component
 * Container for managing multiple toasts
 */
export interface ToastContainerProps {
  /** Position */
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  
  /** Toasts */
  toasts: ToastProps[];
  
  /** Dismiss handler */
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  toasts,
  onDismiss,
}) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };
  
  return (
    <div className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-2 pointer-events-none`}>
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};

ToastContainer.displayName = 'ToastContainer';
