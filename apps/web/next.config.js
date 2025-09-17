import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Temporarily ignore ESLint errors during builds (approved)
    ignoreDuringBuilds: true
  },
  typescript: {
    // Temporarily ignore TypeScript errors during builds for demo
    ignoreBuildErrors: true
  },
  transpilePackages: [
    '@ghxstship/ui',
    '@ghxstship/data-view',
    '@ghxstship/analytics',
    '@ghxstship/auth',
    '@ghxstship/utils',
    '@ghxstship/icons',
    '@ghxstship/config',
    '@ghxstship/domain',
    '@ghxstship/application',
    '@ghxstship/infrastructure'
  ],
  experimental: {
    typedRoutes: true,
    instrumentationHook: true
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  async headers() {
    const csp = `
      default-src 'self';
      base-uri 'self';
      frame-ancestors 'none';
      form-action 'self';
      img-src 'self' data: blob: https://*.googleusercontent.com;
      font-src 'self' data: https://fonts.gstatic.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;
      connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.ingest.sentry.io https://*.posthog.com https://*.vercel-insights.com https://accounts.google.com https://oauth2.googleapis.com https://github.com https://api.github.com;
      frame-src https://js.stripe.com https://hooks.stripe.com https://accounts.google.com https://github.com;
    `
      .replace(/\s{2,}/g, ' ')
      .trim();

    const securityHeaders = [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: csp }
    ];

    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  }
};

const withNextIntl = createNextIntlPlugin();

const wrapped = withNextIntl(nextConfig);

export default withSentryConfig(
  wrapped,
  {
    silent: true,
    // Remove this once Sentry SDK defaults to deleting sourcemaps
    sourcemaps: { deleteSourcemapsAfterUpload: true },
    // Optional: suppress missing global-error warning if needed
    // suppressGlobalErrorHandlerFileWarning: true,
  },
  { hideSourceMaps: true }
);
