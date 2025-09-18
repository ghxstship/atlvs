import * as Sentry from '@sentry/nextjs';
import React from 'react';
import { telemetry } from './telemetry';

export interface ErrorContext {
  userId?: string;
  organizationId?: string;
  module?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class SentryService {
  private isInitialized = false;

  initialize(dsn?: string) {
    if (this.isInitialized || !dsn) return;

    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: process.env.NODE_ENV === 'development',
      
      beforeSend(event, hint) {
        // Filter out certain errors in development
        if (process.env.NODE_ENV === 'development') {
          const error = hint.originalException;
          if (error instanceof Error) {
            // Skip common development errors
            if (error.message.includes('ResizeObserver loop limit exceeded')) {
              return null;
            }
            if (error.message.includes('Non-Error promise rejection captured')) {
              return null;
            }
          }
        }

        return event;
      },

      beforeBreadcrumb(breadcrumb) {
        // Filter out noisy breadcrumbs
        if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
          return null;
        }
        return breadcrumb;
      }
    });

    this.isInitialized = true;
  }

  captureError(error: Error, context: ErrorContext = {}) {
    // Set user context
    if (context.userId || context.organizationId) {
      Sentry.setUser({
        id: context.userId,
        organizationId: context.organizationId
      });
    }

    // Set tags for filtering
    if (context.module) {
      Sentry.setTag('module', context.module);
    }
    if (context.action) {
      Sentry.setTag('action', context.action);
    }

    // Set extra context
    if (context.metadata) {
      Sentry.setContext('metadata', context.metadata);
    }

    // Capture the error
    const eventId = Sentry.captureException(error);

    // Also track in telemetry
    telemetry.error(error, {
      sentryEventId: eventId,
      ...context
    });

    return eventId;
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context: ErrorContext = {}) {
    // Set context similar to captureError
    if (context.userId || context.organizationId) {
      Sentry.setUser({
        id: context.userId,
        organizationId: context.organizationId
      });
    }

    if (context.module) {
      Sentry.setTag('module', context.module);
    }
    if (context.action) {
      Sentry.setTag('action', context.action);
    }

    if (context.metadata) {
      Sentry.setContext('metadata', context.metadata);
    }

    return Sentry.captureMessage(message, level);
  }

  addBreadcrumb(message: string, category: string = 'custom', level: Sentry.SeverityLevel = 'info', data?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000
    });
  }

  setUserContext(userId: string, organizationId?: string, email?: string) {
    Sentry.setUser({
      id: userId,
      email,
      organizationId
    });
  }

  clearUserContext() {
    Sentry.setUser(null);
  }

  startSpan<T>(name: string, operation: () => T | Promise<T>, op: string = 'function'): Promise<T> {
    return Sentry.startSpan(
      {
        name,
        op,
      },
      async () => {
        const startTime = Date.now();
        try {
          const result = await operation();
          const duration = Date.now() - startTime;
          
          // Track performance in telemetry
          telemetry.trackPerformance(name, duration);
          
          return result;
        } catch (error) {
          throw error;
        }
      }
    );
  }

  // Performance monitoring
  measurePerformance<T>(name: string, operation: () => T | Promise<T>): Promise<T> {
    return this.startSpan(name, operation, 'function');
  }
}

// Global Sentry service instance
export const sentry = new SentryService();

// React error boundary component
export function withSentryErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
    beforeCapture?: (scope: Sentry.Scope, error: unknown, componentStack: string | undefined) => void;
  }
) {
  return Sentry.withErrorBoundary(Component, {
    fallback: (options?.fallback || DefaultErrorFallback) as any,
    beforeCapture: options?.beforeCapture
  });
}

// Default error fallback component
function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return React.createElement('div', {
    className: 'min-h-screen flex items-center justify-center bg-surface'
  }, React.createElement('div', {
    className: 'max-w-md w-full bg-elevated shadow-floating rounded-lg p-lg'
  }, [
    React.createElement('div', {
      key: 'icon',
      className: 'flex items-center justify-center w-12 h-12 mx-auto bg-destructive/10 rounded-full'
    }, React.createElement('svg', {
      className: 'w-6 h-6 text-destructive',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, React.createElement('path', {
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: 2,
      d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
    }))),
    React.createElement('div', {
      key: 'content',
      className: 'mt-md text-center'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-lg font-medium text-foreground'
      }, 'Something went wrong'),
      React.createElement('p', {
        key: 'description',
        className: 'mt-sm text-sm text-muted-foreground'
      }, "We've been notified of this error and are working to fix it."),
      React.createElement('button', {
        key: 'button',
        onClick: resetError,
        className: 'mt-md inline-flex items-center px-md py-sm border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
      }, 'Try again')
    ])
  ]));
}

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    sentry.captureError(new Error(`Unhandled promise rejection: ${event.reason}`), {
      metadata: {
        reason: event.reason,
        promise: event.promise
      }
    });
  });

  // Global error handler for uncaught errors
  window.addEventListener('error', (event) => {
    sentry.captureError(event.error || new Error(event.message), {
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });
}

// Utility functions for common error scenarios
export const captureModuleError = (module: string, action: string, error: Error, metadata: Record<string, any> = {}) => {
  return sentry.captureError(error, {
    module,
    action,
    metadata
  });
};

export const captureFormError = (form: string, error: Error, formData: Record<string, any> = {}) => {
  return sentry.captureError(error, {
    module: 'forms',
    action: 'submission_failed',
    metadata: {
      form,
      formData: Object.keys(formData) // Don't log actual form data for privacy
    }
  });
};

export const captureApiError = (endpoint: string, method: string, error: Error, requestData: Record<string, any> = {}) => {
  return sentry.captureError(error, {
    module: 'api',
    action: 'request_failed',
    metadata: {
      endpoint,
      method,
      requestData: Object.keys(requestData) // Don't log actual request data for privacy
    }
  });
};

export const captureSupabaseError = (operation: string, table: string, error: Error, metadata: Record<string, any> = {}) => {
  return sentry.captureError(error, {
    module: 'supabase',
    action: operation,
    metadata: {
      table,
      ...metadata
    }
  });
};
