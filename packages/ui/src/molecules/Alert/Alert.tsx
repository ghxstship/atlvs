/**
 * Alert Component — Alert/Notice Box
 * Display important messages with variants
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Alert variant */
  variant?: 'info' | 'success' | 'warning' | 'error';
  
  /** Alert title */
  title?: string;
  
  /** Dismissible */
  dismissible?: boolean;
  
  /** Dismiss handler */
  onDismiss?: () => void;
}

/**
 * Alert Component
 * 
 * @example
 * ```tsx
 * <Alert variant="success" title="Success!">
 *   Your changes have been saved.
 * </Alert>
 * ```
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'info',
      title,
      dismissible = false,
      onDismiss,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const [dismissed, setDismissed] = React.useState(false);
    
    const handleDismiss = () => {
      setDismissed(true);
      onDismiss?.();
    };
    
    if (dismissed) return null;
    
    const icons = {
      info: Info,
      success: CheckCircle2,
      warning: AlertTriangle,
      error: AlertCircle,
    };
    
    const variantClasses = {
      info: 'bg-[var(--color-info-background)] border-[var(--color-info)] text-[var(--color-info-foreground)]',
      success: 'bg-[var(--color-success-background)] border-[var(--color-success)] text-[var(--color-success-foreground)]',
      warning: 'bg-[var(--color-warning-background)] border-[var(--color-warning)] text-[var(--color-warning-foreground)]',
      error: 'bg-[var(--color-error-background)] border-[var(--color-error)] text-[var(--color-error-foreground)]',
    };
    
    const Icon = icons[variant];
    
    return (
      <div
        ref={ref}
        role="alert"
        className={`
          flex gap-3 p-4
          rounded-lg border-l-4
          ${variantClasses[variant]}
          ${className}
        `}
        {...props}
      >
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-semibold mb-1">{title}</div>
          )}
          {children && (
            <div className="text-sm">{children}</div>
          )}
        </div>
        
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="
              p-1 rounded
              hover:opacity-70
              transition-opacity
              flex-shrink-0
            "
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
