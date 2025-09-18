'use client';

import { useCallback } from 'react';
import { sentry, captureModuleError, captureFormError, captureApiError, captureSupabaseError } from '@/lib/sentry';
import { telemetry } from '@/lib/telemetry';

export interface ErrorHandlerOptions {
  module?: string;
  action?: string;
  showToast?: boolean;
  fallbackMessage?: string;
}

export function useErrorHandler() {
  const handleError = useCallback((error: Error, options: ErrorHandlerOptions = {}) => {
    const {
      module = 'unknown',
      action = 'unknown',
      showToast = true,
      fallbackMessage = 'An unexpected error occurred'
    } = options;

    // Capture error with context
    const eventId = sentry.captureError(error, {
      module,
      action,
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined
      }
    });

    // Track in telemetry
    telemetry.error(error, {
      module,
      action,
      sentryEventId: eventId
    });

    // Show user-friendly error message
    if (showToast && typeof window !== 'undefined') {
      // You can integrate with your toast system here
      console.error(`${module} error:`, error.message);
    }

    return eventId;
  }, []);

  const handleModuleError = useCallback((module: string, action: string, error: Error, metadata: Record<string, any> = {}) => {
    return captureModuleError(module, action, error, metadata);
  }, []);

  const handleFormError = useCallback((form: string, error: Error, formData: Record<string, any> = {}) => {
    return captureFormError(form, error, formData);
  }, []);

  const handleApiError = useCallback((endpoint: string, method: string, error: Error, requestData: Record<string, any> = {}) => {
    return captureApiError(endpoint, method, error, requestData);
  }, []);

  const handleSupabaseError = useCallback((operation: string, table: string, error: Error, metadata: Record<string, any> = {}) => {
    return captureSupabaseError(operation, table, error, metadata);
  }, []);

  // Wrapper for async operations with error handling
  const withErrorHandling = useCallback(<T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T> => {
    return operation().catch((error) => {
      handleError(error, options);
      throw error; // Re-throw so calling code can handle it
    });
  }, [handleError]);

  // Safe async wrapper that doesn't re-throw
  const safeAsync = useCallback(<T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    return operation().catch((error) => {
      handleError(error, options);
      return null;
    });
  }, [handleError]);

  return {
    handleError,
    handleModuleError,
    handleFormError,
    handleApiError,
    handleSupabaseError,
    withErrorHandling,
    safeAsync
  };
}
