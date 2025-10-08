'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { ErrorPage } from '@ghxstship/ui';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <ErrorPage
      code="Error"
      title="Programming Error"
      message="Failed to load programming calendar. Please try refreshing."
      action={{
        label: 'Reload Calendar',
        onClick: reset
      }}
    />
  );
}
