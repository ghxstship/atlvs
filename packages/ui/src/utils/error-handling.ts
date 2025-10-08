/**
 * Error Handling Utilities
 * @package @ghxstship/ui
 */

/**
 * Try-catch wrapper with error reporting
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  onError?: (error: Error) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) {
      onError(err);
    } else {
      reportError(err);
    }
    return null;
  }
}

/**
 * Report error to console or error tracking service
 */
export function reportError(error: Error, context?: Record<string, unknown>): void {
  console.error('Error:', error.message, context || {});
  
  // In production, you could send to error tracking service
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Example: Sentry, LogRocket, etc.
    // Sentry.captureException(error, { extra: context });
  }
}

/**
 * Synchronous try-catch wrapper
 */
export function tryCatchSync<T>(
  fn: () => T,
  onError?: (error: Error) => void
): T | null {
  try {
    return fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) {
      onError(err);
    } else {
      reportError(err);
    }
    return null;
  }
}
