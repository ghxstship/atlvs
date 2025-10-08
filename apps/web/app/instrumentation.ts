import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Initialize Sentry in the recommended Next.js 14+ instrumentation hook
  // This replaces legacy sentry.server.config.ts usage.
  Sentry.init({
    dsn: process.env.SENTRY_DSN || undefined,
    tracesSampleRate: 0.1
  });
}
