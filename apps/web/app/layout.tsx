import './globals.css';
import type { Metadata } from 'next';
import { Anton, Share_Tech, Share_Tech_Mono } from 'next/font/google';
import Providers from './providers';
import { routeRegistry, toNavSections, filterByEntitlements, filterByRole } from '../lib/navigation/routeRegistry';
import { SidebarClient } from '../components/nav/SidebarClient';
import { CommandPalette } from '../components/nav/CommandPalette';
import { ProductToggle } from '../components/nav/ProductToggle';
import { BreadcrumbsNav } from '../components/nav/BreadcrumbsNav';
import NotificationsBell from './components/NotificationsBell';
// Temporarily disabled i18n imports
// import { NextIntlClientProvider } from 'next-intl';
// import { getLocale, getMessages } from 'next-intl/server';
import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@ghxstship/auth';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { SkipLink } from '../components/SkipLink';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });
const shareTech = Share_Tech({ weight: '400', subsets: ['latin'], variable: '--font-body' });
const shareTechMono = Share_Tech_Mono({ weight: '400', subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'GHXSTSHIP Platform',
  description: 'ATLVS + OPENDECK + GHXSTSHIP',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Temporarily hardcode locale while i18n middleware is disabled
  const locale = 'en';
  const messages = {};

  // Determine subdomain from host for tenancy + brand theme
  const host = headers().get('host') || '';
  const hostname = host.split(':')[0];
  let subdomain = '';
  const parts = hostname.split('.');
  if (parts.length > 2) {
    subdomain = parts[0];
  } else if (parts.length === 2 && parts[0] !== 'localhost') {
    // e.g., preview deployments with custom domains may still have subdomain
    subdomain = parts[0];
  }

  // Map subdomain to brand identifier for CSS variables
  const brand = ['atlvs', 'opendeck', 'ghxstship'].includes(subdomain) ? subdomain : 'atlvs';

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${shareTech.className} ${shareTech.variable} ${shareTechMono.variable} ${anton.variable}`} data-brand={brand}>
        <Providers>
          <SkipLink />
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
