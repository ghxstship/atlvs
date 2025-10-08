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
      title="Projects Error"
      message="Failed to load project information. Please try refreshing the page."
      action={{
        label: 'Reload Projects',
        onClick: reset
      }}
    />
  );
}
