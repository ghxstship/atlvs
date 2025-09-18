import posthog from 'posthog-js';

export function initPostHog() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
  if (typeof window !== 'undefined' && key) {
    posthog.init(key, { api_host: host, capture_pageview: true });
  }
}

export { posthog };
