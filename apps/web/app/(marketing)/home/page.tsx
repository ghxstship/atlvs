import type { Metadata } from 'next';
import { HeroSection } from '../../_components/marketing/HeroSection';
import { ProductHighlights } from '../../_components/marketing/ProductHighlights';
import { TrustSignals } from '../../_components/marketing/TrustSignals';
import { SocialProof } from '../../_components/marketing/SocialProof';
import { FeatureGrid } from '../../_components/marketing/FeatureGrid';
import { CTASection } from '../../_components/marketing/CTASection';

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
