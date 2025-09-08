import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from '@ghxstship/ui';
import { MarketingHeader } from '../(marketing)/components/MarketingHeader';
import { MarketingFooter } from '../(marketing)/components/MarketingFooter';
import { CookieConsent } from '../(marketing)/components/CookieConsent';
import { Analytics } from '../(marketing)/components/Analytics';
import { PerformanceOptimizations } from '../(marketing)/components/PerformanceOptimizations';
import { AccessibilityEnhancements } from '../(marketing)/components/AccessibilityEnhancements';

export const metadata: Metadata = {
  title: 'GHXSTSHIP - Revolutionary Production Management Platform',
  description: 'Transform your creative production workflow with ATLVS and OPENDECK. Enterprise-grade project management, asset organization, and team collaboration tools.',
};

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
          <MarketingHeader />
          <main className="flex-1">
            {children}
          </main>
          <MarketingFooter />
          <CookieConsent />
          <Analytics />
          <PerformanceOptimizations />
          <AccessibilityEnhancements />
        </div>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
