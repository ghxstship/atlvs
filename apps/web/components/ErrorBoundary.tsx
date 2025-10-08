/**
 * Enhanced Error Boundaries with Context-Rich Error Reporting
 * Comprehensive error handling with user context, component stack, and recovery options
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { sentryService } from './sentry';
import { alertingService } from './alerting';

export interface ErrorContext {
  userId?: string;
  organizationId?: string;
  sessionId?: string;
  componentStack?: string;
  errorBoundary?: string;
  route?: string;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
  timestamp: string;
  lastAction?: string;
  breadcrumbs?: Breadcrumb[];
  metadata?: Record<string, unknown>;
}

export interface Breadcrumb {
  timestamp: string;
  category: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}

export interface RecoveryOption {
  label: string;
  action: () => void;
  primary?: boolean;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, context: ErrorContext) => void;
  enableRecovery?: boolean;
  recoveryOptions?: RecoveryOption[];
  errorBoundaryName?: string;
  enableAlerting?: boolean;
}

export interface ErrorFallbackProps {
  error: Error;
  context: ErrorContext;
  resetError: () => void;
  recoveryOptions?: RecoveryOption[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  context: ErrorContext | null;
  retryCount: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 50;
  private lastAction = '';
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      context: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const context = this.buildErrorContext(error, errorInfo);

    this.setState({ context });

    // Report to Sentry
    sentryService.reportError(error, context);

    // Send alert if enabled
    if (this.props.enableAlerting) {
      this.alertError(error, context);
    }

    // Call custom error handler
    this.props.onError?.(error, context);

    // Add error breadcrumb
    this.addBreadcrumb('error', `Error caught by ${this.props.errorBoundaryName || 'ErrorBoundary'}`, 'error', {
      error: error.message,
      componentStack: errorInfo.componentStack
    });

    console.error('Error caught by ErrorBoundary:', error, context);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state when children change (navigation)
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.resetError();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private buildErrorContext(error: Error, errorInfo: ErrorInfo): ErrorContext {
    return {
      userId: this.getUserId(),
      organizationId: this.getOrganizationId(),
      sessionId: this.getSessionId(),
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.errorBoundaryName,
      route: typeof window !== 'undefined' ? window.location.pathname : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      viewport: typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight
      } : undefined,
      timestamp: new Date().toISOString(),
      lastAction: this.lastAction,
      breadcrumbs: [...this.breadcrumbs],
      metadata: {
        retryCount: this.state.retryCount,
        errorId: this.state.errorId,
        userRole: this.getUserRole(),
        organizationPlan: this.getOrganizationPlan()
      }
    };
  }

  private async alertError(error: Error, context: ErrorContext): Promise<void> {
    await alertingService.triggerAlert(
      'error',
      'high',
      `Application Error: ${error.name}`,
      error.message,
      {
        errorId: this.state.errorId,
        userId: context.userId,
        organizationId: context.organizationId,
        componentStack: context.componentStack,
        route: context.route,
        error: error.stack
      }
    );
  }

  private addBreadcrumb(category: string, message: string, level: Breadcrumb['level'] = 'info', data?: Record<string, unknown>) {
    const breadcrumb: Breadcrumb = {
      timestamp: new Date().toISOString(),
      category,
      message,
      level,
      data
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep only the most recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  public addBreadcrumb = (category: string, message: string, level?: Breadcrumb['level'], data?: Record<string, unknown>) => {
    this.addBreadcrumb(category, message, level, data);
  };

  public setLastAction = (action: string) => {
    this.lastAction = action;
    this.addBreadcrumb('user_action', action, 'info');
  };

  private getUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return (window as any).userId || localStorage.getItem('userId') || undefined;
  }

  private getOrganizationId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return (window as any).organizationId || localStorage.getItem('organizationId') || undefined;
  }

  private getSessionId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return (window as any).sessionId || sessionStorage.getItem('sessionId') || undefined;
  }

  private getUserRole(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return (window as any).userRole || localStorage.getItem('userRole') || undefined;
  }

  private getOrganizationPlan(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return (window as any).organizationPlan || localStorage.getItem('organizationPlan') || undefined;
  }

  public resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      context: null,
      retryCount: 0
    });

    this.addBreadcrumb('recovery', 'Error boundary reset', 'info');
  };

  public retryWithBackoff = () => {
    const retryCount = this.state.retryCount + 1;
    const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff, max 30s

    this.setState({ retryCount });

    this.retryTimeout = setTimeout(() => {
      this.addBreadcrumb('retry', `Retrying after error (attempt ${retryCount})`, 'info');
      this.resetError();
    }, backoffDelay);
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          context={this.state.context!}
          resetError={this.resetError}
          recoveryOptions={this.props.recoveryOptions}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  context,
  resetError,
  recoveryOptions = []
}) => {
  const defaultRecoveryOptions: RecoveryOption[] = [
    {
      label: 'Try Again',
      action: resetError,
      primary: true
    },
    {
      label: 'Go to Dashboard',
      action: () => window.location.href = '/dashboard'
    },
    {
      label: 'Report Issue',
      action: () => {
        const subject = encodeURIComponent(`Error Report: ${error.name}`);
        const body = encodeURIComponent(`
Error: ${error.message}
Error ID: ${context.errorId}
Route: ${context.route}
Timestamp: ${context.timestamp}

Please describe what you were doing when this error occurred:
        `);
        window.location.href = `mailto:support@ghxstship.com?subject=${subject}&body=${body}`;
      }
    },
  ];

  const allRecoveryOptions = [...recoveryOptions, ...defaultRecoveryOptions];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-md">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-lg">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-icon-lg w-icon-lg text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
            <p className="text-sm text-gray-500">We apologize for the inconvenience</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Error: {error.name}</p>
          <p className="text-xs text-gray-500 font-mono break-all">
            ID: {context.errorId}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer">Technical Details</summary>
              <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap break-all">
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="space-y-xs">
          {allRecoveryOptions.map((option, index) => (
            <button
              key={index}
              onClick={option.action}
              className={`w-full px-md py-xs text-sm font-medium rounded-md ${
                option.primary
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors duration-200`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
          Error reported automatically • Support has been notified
        </div>
      </div>
    </div>
  );
};

// Higher-order component for easy error boundary wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook for adding breadcrumbs from functional components
export function useErrorTracking() {
  const addBreadcrumb = React.useCallback((category: string, message: string, level?: Breadcrumb['level'], data?: Record<string, unknown>) => {
    // This would need to be connected to the nearest ErrorBoundary
    // For now, we'll use console logging as fallback
    console.log(`Breadcrumb [${level || 'info'}]: ${category} - ${message}`, data);
  }, []);

  const setLastAction = React.useCallback((action: string) => {
    addBreadcrumb('user_action', action, 'info');
  }, [addBreadcrumb]);

  return {
    addBreadcrumb,
    setLastAction
  };
}

export default ErrorBoundary;
