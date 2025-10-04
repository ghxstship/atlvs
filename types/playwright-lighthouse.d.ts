declare module 'playwright-lighthouse' {
  import type { Page } from '@playwright/test';

  interface LighthouseThresholds {
    performance?: number;
    accessibility?: number;
    'best-practices'?: number;
    seo?: number;
    pwa?: number;
  }

  interface PlayAuditOptions {
    page: Page;
    thresholds?: LighthouseThresholds;
    port?: number;
    disableStorageReset?: boolean;
    [key: string]: unknown;
  }

  export function playAudit(options: PlayAuditOptions): Promise<void>;
}
