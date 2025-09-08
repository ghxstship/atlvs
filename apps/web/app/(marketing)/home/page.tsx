import type { Metadata } from 'next';
import { HeroSection } from './components/HeroSection';
import { ProductHighlights } from './components/ProductHighlights';
import { TrustSignals } from './components/TrustSignals';
import { SocialProof } from './components/SocialProof';
import { FeatureGrid } from './components/FeatureGrid';
import { CTASection } from './components/CTASection';

export const metadata: Metadata = {
  title: 'GHXSTSHIP - Enterprise Production Management Platform',
  description: 'ATLVS and OPENDECK - The complete enterprise production management and marketplace platform for creative professionals.',
  openGraph: {
    title: 'GHXSTSHIP - Enterprise Production Management Platform',
    description: 'ATLVS and OPENDECK - The complete enterprise production management and marketplace platform for creative professionals.',
    url: 'https://ghxstship.com',
    siteName: 'GHXSTSHIP',
    images: [
      {
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'GHXSTSHIP Platform Overview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GHXSTSHIP - Enterprise Production Management Platform',
    description: 'ATLVS and OPENDECK - The complete enterprise production management and marketplace platform for creative professionals.',
    images: ['/og-home.jpg'],
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustSignals />
      <ProductHighlights />
      <FeatureGrid />
      <SocialProof />
      <CTASection />
    </>
  );
}
