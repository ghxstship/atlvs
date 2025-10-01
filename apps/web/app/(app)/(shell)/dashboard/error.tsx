'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-content-lg p-lg text-center">
      <AlertTriangle className="h-icon-2xl w-icon-2xl text-red-500 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Dashboard Error
      </h2>
      <p className="text-gray-600 mb-6 max-w-md">
        Something went wrong while loading the dashboard. This has been reported to our team.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center px-md py-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <RefreshCw className="h-icon-xs w-icon-xs mr-2" />
        Try Again
      </button>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500">
            Error Details
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 p-xs rounded overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  );
}
