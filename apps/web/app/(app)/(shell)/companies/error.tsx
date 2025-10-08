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
      title="Companies Error"
      message="Failed to load company information. Please try again."
      action={{
        label: 'Reload Companies',
        onClick: reset
      }}
    />
  );
}
