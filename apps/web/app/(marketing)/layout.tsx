import '../globals.css';
import type { Metadata } from 'next';
// Temporarily disabled i18n imports to fix routing errors
// import { NextIntlClientProvider } from 'next-intl';
// import { getLocale, getMessages } from 'next-intl/server';
import { headers } from 'next/headers';
import { Anton, Share_Tech, Share_Tech_Mono } from 'next/font/google';
import { ThemeProvider } from '@ghxstship/ui';
import { MarketingHeader } from './components/MarketingHeader';
import { MarketingFooter } from './components/MarketingFooter';
import { CookieConsent } from './components/CookieConsent';
import Analytics from './components/Analytics';
import PerformanceOptimizations from './components/PerformanceOptimizations';
import AccessibilityEnhancements from './components/AccessibilityEnhancements';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });
const shareTech = Share_Tech({ weight: '400', subsets: ['latin'], variable: '--font-body' });
const shareTechMono = Share_Tech_Mono({ weight: '400', subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: {
    template: '%s | GHXSTSHIP',
    default: 'GHXSTSHIP - Enterprise Production Management Platform',
  },
  description: 'ATLVS and OPENDECK - The complete enterprise production management and marketplace platform for creative professionals.',
  keywords: ['production management', 'creative platform', 'enterprise software', 'ATLVS', 'OPENDECK'],
  authors: [{ name: 'GHXSTSHIP' }],
  creator: 'GHXSTSHIP',
  publisher: 'GHXSTSHIP',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ghxstship.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ghxstship.com',
    siteName: 'GHXSTSHIP',
    title: 'GHXSTSHIP - Enterprise Production Management Platform',
    description: 'ATLVS and OPENDECK - The complete enterprise production management and marketplace platform for creative professionals.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GHXSTSHIP Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GHXSTSHIP - Enterprise Production Management Platform',
    description: 'ATLVS and OPENDECK - The complete enterprise production management and marketplace platform for creative professionals.',
    images: ['/og-image.jpg'],
    creator: '@ghxstship',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Temporarily hardcode locale while i18n is disabled
  const locale = 'en';
  const messages = {};

  // Determine subdomain from host for brand theming
  const host = headers().get('host') || '';
  const hostname = host.split(':')[0];
  let subdomain = '';
  const parts = hostname.split('.');
  if (parts.length > 2) {
    subdomain = parts[0];
  } else if (parts.length === 2 && parts[0] !== 'localhost') {
    subdomain = parts[0];
  }

  // Map subdomain to brand identifier for CSS variables
  const brand = ['atlvs', 'opendeck', 'ghxstship'].includes(subdomain) ? subdomain : 'ghxstship';

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0066CC" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body 
        className={`${shareTech.className} ${shareTech.variable} ${shareTechMono.variable} ${anton.variable} antialiased`} 
        data-brand={brand}
      >
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
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
      </body>
    </html>
  );
}
