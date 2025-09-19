'use client';


import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Report render errors to Sentry
  Sentry.captureException(error);

  return (
    <html>
      <body>
        <div style={{ padding: 24 }}>
          <h1>Something went wrong</h1>
          <p>
            {process.env.NODE_ENV === 'development'
              ? error?.message
              : 'An unexpected error occurred.'}
          </p>
          <button onClick={() => reset()} style={{ marginTop: 12 }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
