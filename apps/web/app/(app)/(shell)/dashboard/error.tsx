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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <ErrorPage
      code="Error"
      title="Dashboard Error"
      message="Something went wrong while loading the dashboard. This has been reported to our team."
      action={{
        label: 'Try Again',
        onClick: reset
      }}
    />
  );
}
