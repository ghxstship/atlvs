'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a mock implementation if not in provider
    // This allows components to work without the provider
    return {
      toasts: [],
      toast: (toast: Omit<Toast, 'id'>) => {
        console.log('Toast:', toast);
      },
      dismiss: (id: string) => {
        console.log('Dismiss toast:', id);
      },
      dismissAll: () => {
        console.log('Dismiss all toasts');
      }
    };
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((newToast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const toastWithId = { ...newToast, id };
    
    setToasts(prev => [...prev, toastWithId]);
    
    // Auto dismiss after duration (default 5 seconds)
    const duration = newToast.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
};

// Simple toast container component
const ToastContainer: React.FC<{ toasts: Toast[]; dismiss: (id: string) => void }> = ({ 
  toasts, 
  dismiss 
}) => {
  if (toasts.length === 0) return null;

  const variantClasses = {
    default: 'bg-background border',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            p-md rounded-lg shadow-lg min-w-content-medium max-w-sidebar-wide
            ${variantClasses[toast.variant || 'default']}
            animate-in slide-in-from-bottom-2
          `}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="text-sm mt-xs opacity-90">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="ml-md text-current opacity-50 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default useToast;
