'use client';
import * as React from 'react';
import { initPostHog } from './posthog';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    initPostHog();
  }, []);
  return <>{children}</>;
}
