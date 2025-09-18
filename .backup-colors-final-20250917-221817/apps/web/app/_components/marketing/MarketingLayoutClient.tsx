'use client';

import { ThemeProvider } from '@ghxstship/ui';
import { MarketingHeader } from './MarketingHeader';
import { MarketingFooter } from './MarketingFooter';
import { CookieConsent } from './CookieConsent';
import Analytics from './Analytics';
import PerformanceOptimizations from './PerformanceOptimizations';
import AccessibilityEnhancements from './AccessibilityEnhancements';

interface MarketingLayoutClientProps {
  children: React.ReactNode;
}

export function MarketingLayoutClient({ children }: MarketingLayoutClientProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col overflow-x-hidden">
        <MarketingHeader />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <MarketingFooter />
      </div>
      <CookieConsent />
      <Analytics />
      <PerformanceOptimizations />
      <AccessibilityEnhancements />
    </ThemeProvider>
  );
}
