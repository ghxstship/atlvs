import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MarketingLayoutClient } from '../_components/marketing/MarketingLayoutClient';

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

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="h-screen bg-background animate-pulse" />}>
      <MarketingLayoutClient>
        {children}
      </MarketingLayoutClient>
    </Suspense>
  );
}
