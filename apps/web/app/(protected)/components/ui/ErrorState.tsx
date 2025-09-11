'use client';

import { Button } from '@ghxstship/ui';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@ghxstship/ui/system';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  variant?: 'default' | 'minimal';
}

export function ErrorState({ 
  title = 'Something went wrong',
  message = 'An error occurred while loading the data. Please try again.',
  onRetry,
  className,
  variant = 'default'
}: ErrorStateProps) {
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-center p-4 text-muted-foreground', className)}>
        <AlertCircle className="h-4 w-4 mr-2" />
        <span className="text-sm">{message}</span>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="ml-2 group transition-all duration-200 hover:scale-105"
          >
            <RefreshCw className="h-3 w-3 mr-1 transition-transform group-hover:rotate-180" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center', className)}>
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="group transition-all duration-200 hover:scale-105"
        >
          <RefreshCw className="h-4 w-4 mr-2 transition-transform group-hover:rotate-180" />
          Try Again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
