'use client';

import React, { useEffect } from 'react';
import { sentry, withSentryErrorBoundary } from '@/lib/sentry';
import { telemetry } from '@/lib/telemetry';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Capture error with Sentry
    sentry.captureError(error, {
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    });

    // Track error in telemetry
    telemetry.error(error, {
      errorBoundary: true,
      componentStack: errorInfo.componentStack
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center bg-muted/30 rounded-lg">
      <div className="max-w-md w-full bg-card shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-destructive/10 rounded-full">
          <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium">Something went wrong</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We've been notified of this error and are working to fix it.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-3 text-left">
              <summary className="text-xs text-muted-foreground cursor-pointer">Error Details</summary>
              <pre className="mt-2 text-xs text-destructive bg-destructive/5 p-2 rounded overflow-auto max-h-32">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>
        <div className="mt-6 space-y-3">
          <button
            onClick={resetError}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-muted text-muted-foreground py-2 px-4 rounded-md hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
          >
            Reload page
          </button>
        </div>
      </div>
    </div>
  );
}

// Main ErrorBoundary component
export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundaryClass {...props} />;
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Module-specific error boundary
export function ModuleErrorBoundary({ 
  children, 
  module 
}: { 
  children: React.ReactNode; 
  module: string; 
}) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    sentry.captureError(error, {
      module,
      metadata: {
        componentStack: errorInfo.componentStack
      }
    });

    telemetry.track('Module Error', {
      module,
      error: error.message,
      componentStack: errorInfo.componentStack
    });
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}

// Async error boundary for handling promise rejections in components
export function AsyncErrorBoundary({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      
      sentry.captureError(error, {
        metadata: {
          unhandledRejection: true,
          reason: event.reason
        }
      });

      telemetry.error(error, {
        unhandledRejection: true
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <ErrorBoundary>{children}</ErrorBoundary>;
}
