'use client';

import React from 'react';

import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
// PostHogProvider not available yet
import { telemetry } from '@/lib/telemetry';
import { sentry } from '@/lib/sentry';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Initialize Sentry
    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (sentryDsn) {
      sentry.initialize(sentryDsn);
    }

    // Initialize telemetry with basic context
    telemetry.initialize({
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Track page load
    telemetry.page('App Loaded', {
      pathname: window.location.pathname,
      referrer: document.referrer
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
