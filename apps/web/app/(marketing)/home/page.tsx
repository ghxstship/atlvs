import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@ghxstship/ui';
import { ArrowRight, Play } from 'lucide-react';

import {
  MarketingSection,
  MarketingSectionHeader,
} from '../../_components/marketing';
import { CTASection } from '../../_components/marketing/CTASection';
import { FeatureGrid } from '../../_components/marketing/FeatureGrid';
import { HeroSection } from '../../_components/marketing/HeroSection';
import { ProductHighlights } from '../../_components/marketing/ProductHighlights';
import { SocialProof } from '../../_components/marketing/SocialProof';
import { TrustSignals } from '../../_components/marketing/TrustSignals';
import { analytics } from '@ghxstship/analytics';

export const metadata: Metadata = {
  title: 'GHXSTSHIP - Enterprise Production Management Platform',
  description:
    'ATLVS and OPENDECK deliver a unified production management and creative marketplace platform for global teams.',
  openGraph: {
    title: 'GHXSTSHIP - Enterprise Production Management Platform',
    description:
      'ATLVS and OPENDECK deliver a unified production management and creative marketplace platform for global teams.',
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
    description:
      'ATLVS and OPENDECK deliver a unified production management and creative marketplace platform for global teams.',
    images: ['/og-home.jpg'],
  },
};

export default function HomePage() {
  // Analytics event handlers
  const handleTrialSignup = () => {
    analytics.trackCTAInteraction('Start Free Trial', 'click', {
      variant: 'primary',
      destination: '/auth/signup',
      user_intent: 'trial_signup',
      page: '/',
      section: 'hero_cta',
      conversion_value: 1,
    });
  };

  const handleDemoRequest = () => {
    analytics.trackCTAInteraction('Watch Platform Demo', 'click', {
      variant: 'outline',
      destination: '#',
      user_intent: 'demo_request',
      page: '/',
      section: 'hero_cta',
      conversion_value: 0.5, // Lower value for demo vs trial
    });
  };

  return (
    <div className="min-h-screen">
      <HeroSection />
      <TrustSignals />
      <ProductHighlights />
      <FeatureGrid />
      <SocialProof />

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="See GHXSTSHIP In Action"
          description="Launch your first project with ATLVS, explore OPENDECK’s talent marketplace, and experience production workflows that scale."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/auth/signup">
            <Button
              className="group"
              size="lg"
              onClick={handleTrialSignup}
            >
              Start Free Trial
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
            </Button>
          </Link>
          <Link href="#">
            <Button
              variant="outline"
              size="lg"
              className="group"
              onClick={handleDemoRequest}
            >
              Watch Platform Demo
              <Play className="ml-sm h-icon-xs w-icon-xs" />
            </Button>
          </Link>
        </div>
      </MarketingSection>

      <CTASection />
    </div>
  );
}
