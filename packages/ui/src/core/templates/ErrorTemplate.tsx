'use client';

import React from 'react';
import { Button } from '../../unified/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../unified/Card';
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ErrorTemplateProps {
  /** Error title */
  title?: string;

  /** Error message/description */
  message?: string;

  /** Error code or status */
  code?: string | number;

  /** Error icon */
  icon?: React.ReactNode;

  /** Recovery actions */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
    icon?: React.ReactNode;
  }>;

  /** Additional content */
  children?: React.ReactNode;

  /** Back navigation */
  backHref?: string;
  onBack?: () => void;

  /** Home navigation */
  homeHref?: string;
  onHome?: () => void;

  /** Show retry button */
  showRetry?: boolean;
  onRetry?: () => void;

  /** Custom className */
  className?: string;

  /** Layout variant */
  variant?: 'centered' | 'full' | 'compact';
}

const variantClasses = {
  centered: 'min-h-screen flex items-center justify-center p-md',
  full: 'min-h-screen p-md',
  compact: 'p-8',
};

export const ErrorTemplate: React.FC<ErrorTemplateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an unexpected error. Please try again.',
  code,
  icon,
  actions = [],
  children,
  backHref,
  onBack,
  homeHref = '/',
  onHome,
  showRetry = false,
  onRetry,
  className,
  variant = 'centered',
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      window.history.back();
    } else {
      window.history.go(-1);
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      window.location.href = homeHref;
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const defaultIcon = (
    <div className="w-component-md h-component-md bg-destructive/10 rounded-full flex items-center justify-center mb-4">
      <AlertTriangle className="w-icon-lg h-icon-lg text-destructive" />
    </div>
  );

  const defaultActions = [
    ...(backHref || onBack ? [{
      label: 'Go Back',
      onClick: handleBack,
      variant: 'outline' as const,
      icon: <ArrowLeft className="w-icon-xs h-icon-xs" />,
    }] : []),
    {
      label: 'Go Home',
      onClick: handleHome,
      variant: 'default' as const,
      icon: <Home className="w-icon-xs h-icon-xs" />,
    },
    ...(showRetry ? [{
      label: 'Try Again',
      onClick: handleRetry,
      variant: 'secondary' as const,
      icon: <RefreshCw className="w-icon-xs h-icon-xs" />,
    }] : []),
  ];

  const allActions = [...defaultActions, ...actions];

  return (
    <div className={cn(variantClasses[variant], className)}>
      <div className="w-full max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader className="pb-2">
            <div className="flex justify-center">
              {icon || defaultIcon}
            </div>
            {code && (
              <div className="text-sm font-mono text-muted-foreground mb-2">
                Error {code}
              </div>
            )}
            <CardTitle className="text-xl font-semibold">
              {title}
            </CardTitle>
            <CardDescription className="text-base">
              {message}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-md">
            {/* Custom content */}
            {children}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-xs justify-center">
              {allActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  onClick={action.onClick}
                  className="flex items-center gap-xs"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>

            {/* Additional help */}
            <div className="text-xs text-muted-foreground mt-6 pt-4 border-t">
              <p>
                If this problem persists, please{' '}
                <Button variant="link" className="p-0 h-auto text-xs underline">
                  contact support
                </Button>
                {' '}or try refreshing the page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Convenience templates for common error types
export const NotFoundTemplate: React.FC<Omit<ErrorTemplateProps, 'title' | 'message' | 'icon'>> = (props) => (
  <ErrorTemplate
    {...props}
    title="Page not found"
    message="The page you're looking for doesn't exist or has been moved."
    code={404}
  />
);

export const UnauthorizedTemplate: React.FC<Omit<ErrorTemplateProps, 'title' | 'message' | 'icon'>> = (props) => (
  <ErrorTemplate
    {...props}
    title="Access denied"
    message="You don't have permission to access this resource."
    code={403}
  />
);

export const ServerErrorTemplate: React.FC<Omit<ErrorTemplateProps, 'title' | 'message' | 'icon'>> = (props) => (
  <ErrorTemplate
    {...props}
    title="Server error"
    message="We're experiencing technical difficulties. Please try again later."
    code={500}
    showRetry
  />
);
