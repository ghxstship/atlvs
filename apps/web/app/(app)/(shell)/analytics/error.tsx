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
    Sentry.captureException(error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <ErrorPage
      code="Error"
      title="Analytics Error"
      message="Unable to load analytics data. This error has been reported."
      action={{
        label: 'Retry Analytics',
        onClick: reset
      }}
    />
  );
}
