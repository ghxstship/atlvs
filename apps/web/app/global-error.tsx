'use client';

import * as Sentry from '@sentry/nextjs';
import { ErrorPage } from '@ghxstship/ui';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Report render errors to Sentry
  Sentry.captureException(error);

  return (
    <html>
      <body>
        <ErrorPage
          code="500"
          title="Something went wrong"
          message={
            process.env.NODE_ENV === 'development'
              ? error?.message
              : 'An unexpected error occurred. Please try again.'
          }
          action={{
            label: 'Try again',
            onClick: reset
          }}
        />
      </body>
    </html>
  );
}
