import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { IconButton } from './Button';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading';
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ 
    id,
    title, 
    description, 
    type = 'info', 
    duration = 5000, 
    persistent = false,
    action,
    onClose 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const [isExiting, setIsExiting] = React.useState(false);

    const typeConfig = {
      success: {
        icon: CheckCircle,
        className: 'border-success/20 bg-success/10 text-success',
        iconClassName: 'text-success'
      },
      error: {
        icon: AlertCircle,
        className: 'border-destructive/20 bg-destructive/10 text-destructive',
        iconClassName: 'text-destructive'
      },
      warning: {
        icon: AlertTriangle,
        className: 'border-warning/20 bg-warning/10 text-warning',
        iconClassName: 'text-warning'
      },
      info: {
        icon: Info,
        className: 'border-primary/20 bg-accent/10 text-accent',
        iconClassName: 'text-accent'
      },
      loading: {
        icon: Loader2,
        className: 'border-border bg-background text-foreground',
        iconClassName: 'text-accent animate-spin'
      }
    };

    const config = typeConfig[type];
    const Icon = config.icon;

    React.useEffect(() => {
      if (!persistent && duration > 0 && type !== 'loading') {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [duration, persistent, type]);

    const handleClose = () => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 200);
    };

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'relative flex items-start gap-sm p-md rounded-lg border shadow-floating backdrop-blur-sm transition-all duration-200 font-body',
            config.className,
            isExiting ? 'animate-out slide-out-to-right-full' : 'animate-in slide-in-from-right-full',
            'max-w-md w-full'
          )
        )}
        role="alert"
        aria-live={type === 'error' ? 'assertive' : 'polite'}
      >
        {/* Icon */}
        <div className="shrink-0 mt-0.5">
          <Icon className={clsx('h-5 w-5', config.iconClassName)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-medium text-sm mb-xs">{title}</div>
          )}
          {description && (
            <div className="text-sm opacity-90 leading-relaxed">{description}</div>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-sm text-sm font-medium underline hover:no-underline transition-all"
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        {!persistent && type !== 'loading' && (
          <IconButton
            variant="ghost"
            size="icon-sm"
            onClick={handleClose}
            className="shrink-0 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </IconButton>
        )}

        {/* Progress Bar for timed toasts */}
        {!persistent && duration > 0 && type !== 'loading' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/20 rounded-b-lg overflow-hidden">
            <div 
              className="h-full bg-current opacity-30 transition-all ease-linear"
              style={{
                animation: `toast-progress ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    );
  }
);
Toast.displayName = 'Toast';

// Toast Container
export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

export const ToastContainer = React.forwardRef<HTMLDivElement, ToastContainerProps>(
  ({ toasts, position = 'top-right', maxToasts = 5 }, ref) => {
    const positionClasses = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
    };

    const visibleToasts = toasts.slice(0, maxToasts);

    if (visibleToasts.length === 0) return null;

    return (
      <div
        ref={ref}
        className={clsx(
          'fixed z-50 flex flex-col gap-sm',
          positionClasses[position]
        )}
        aria-live="polite"
        aria-label="Notifications"
      >
        {visibleToasts.map((toast: any) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    );
  }
);
ToastContainer.displayName = 'ToastContainer';

// Toast Hook for managing toasts
export interface ToastState {
  toasts: ToastProps[];
}

export interface ToastActions {
  addToast: (toast: Omit<ToastProps, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  updateToast: (id: string, updates: Partial<ToastProps>) => void;
}

export const useToast = (): ToastState & ToastActions => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: () => {
        removeToast(id);
        toast.onClose?.();
      }
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  const updateToast = React.useCallback((id: string, updates: Partial<ToastProps>) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    updateToast
  };
};

// Convenience functions for common toast types
export const createToastHelpers = (addToast: ToastActions['addToast']) => ({
  success: (title: string, description?: string, options?: Partial<ToastProps>) =>
    addToast({ type: 'success', title, description, ...options }),
  
  error: (title: string, description?: string, options?: Partial<ToastProps>) =>
    addToast({ type: 'error', title, description, persistent: true, ...options }),
  
  warning: (title: string, description?: string, options?: Partial<ToastProps>) =>
    addToast({ type: 'warning', title, description, ...options }),
  
  info: (title: string, description?: string, options?: Partial<ToastProps>) =>
    addToast({ type: 'info', title, description, ...options }),
  
  loading: (title: string, description?: string, options?: Partial<ToastProps>) =>
    addToast({ type: 'loading', title, description, persistent: true, ...options })
});

// Toast Provider Context
export interface ToastContextValue extends ToastState, ToastActions {
  toast: ReturnType<typeof createToastHelpers>;
}

export const ToastContext = React.createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastContainerProps['position'];
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  position = 'top-right',
  maxToasts = 5 
}) => {
  const toastState = useToast();
  const toast = React.useMemo(
    () => createToastHelpers(toastState.addToast),
    [toastState.addToast]
  );

  const contextValue: ToastContextValue = {
    ...toastState,
    toast
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer 
        toasts={toastState.toasts} 
        position={position}
        maxToasts={maxToasts}
      />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

// CSS Animation for progress bar
const toastProgressKeyframes = `
@keyframes toast-progress {
  from { width: 100%; }
  to { width: 0%; }
}
`;

// Inject CSS if not already present
if (typeof document !== 'undefined' && !document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = toastProgressKeyframes;
  document.head.appendChild(style);
}
