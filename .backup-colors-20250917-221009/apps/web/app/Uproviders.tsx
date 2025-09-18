'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
// import { PostHogProvider } from '@ghxstship/analytics';
import { telemetry } from '@/lib/telemetry';
import { sentry } from '@/lib/sentry';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

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
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* PostHog provider will be available in future release */}
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
