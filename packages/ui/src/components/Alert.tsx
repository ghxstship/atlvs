'use client';

import React from 'react';
import { Button } from './Button';
import { cn } from '../system';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X,
  ExternalLink
} from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  }>;
  className?: string;
}

const alertVariants = {
  variant: {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    neutral: 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200',
  },
  size: {
    sm: 'p-3 text-sm',
    md: 'p-4 text-sm',
    lg: 'p-6 text-base',
  },
};

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  neutral: Info,
};

export function Alert({
  variant = 'info',
  size = 'md',
  title,
  children,
  icon,
  dismissible = false,
  onDismiss,
  actions,
  className = '',
}: AlertProps) {
  const IconComponent = iconMap[variant];
  const displayIcon = icon !== undefined ? icon : <IconComponent className="h-5 w-5" />;

  const alertClasses = cn(
    'border rounded-lg flex gap-3 transition-all duration-200',
    alertVariants.variant[variant],
    alertVariants.size[size],
    className
  );

  return (
    <div className={alertClasses} role="alert">
      {/* Icon */}
      {displayIcon && (
        <div className="flex-shrink-0 mt-0.5">
          {displayIcon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <div className="font-semibold mb-1">
            {title}
          </div>
        )}
        <div className="text-sm">
          {children}
        </div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex gap-2 mt-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant === 'secondary' ? 'outline' : (action.variant || 'ghost')}
                size="sm"
                onClick={action.onClick}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Dismiss Button */}
      {dismissible && (
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="p-1 h-auto text-current hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      )}
    </div>
  );
}

// Convenience components
export const InfoAlert = (props: Omit<AlertProps, 'variant'>) => 
  <Alert {...props} variant="info" />;

export const SuccessAlert = (props: Omit<AlertProps, 'variant'>) => 
  <Alert {...props} variant="success" />;

export const WarningAlert = (props: Omit<AlertProps, 'variant'>) => 
  <Alert {...props} variant="warning" />;

export const ErrorAlert = (props: Omit<AlertProps, 'variant'>) => 
  <Alert {...props} variant="error" />;
