'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppError, createAppError, reportError } from '../utils/error-handling';

interface Props {
  children: ReactNode;
  fallback?: (error: AppError) => ReactNode;
  onError?: (error: AppError) => void;
}

interface State {
  hasError: boolean;
  error?: AppError;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    const appError = createAppError(
      'COMPONENT_ERROR',
      error.message,
      { stack: error.stack }
    );

    return {
      hasError: true,
      error: appError,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const appError = createAppError(
      'COMPONENT_ERROR',
      error.message,
      { 
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      }
    );

    // Report error to monitoring service
    reportError(appError);

    // Call custom error handler if provided
    this.props.onError?.(appError);
  }

  public render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-lg border border-destructive/20 rounded-lg bg-destructive/5">
          <div className="text-destructive text-lg font-semibold mb-sm">
            Something went wrong
          </div>
          <div className="text-muted-foreground text-sm mb-md max-w-md text-center">
            {this.state.error.message}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-md py-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: AppError) => ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};
