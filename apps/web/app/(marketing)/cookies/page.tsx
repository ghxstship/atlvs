import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingCard, MarketingSection, MarketingSectionHeader } from '../../_components/marketing';

export const metadata: Metadata = {
  title: 'Cookie Policy | GHXSTSHIP',
  description: 'Understand how GHXSTSHIP uses cookies to improve your experience on ATLVS and OPENDECK.'
};

const cookieCategories = [
  {
    title: 'Essential Cookies',
    description: 'Required for secure login, load balancing, and basic platform navigation. These cannot be disabled.'
  },
  {
    title: 'Performance Cookies',
    description: 'Help us analyze product usage and optimize workflows with aggregated metrics.'
  },
  {
    title: 'Functional Cookies',
    description: 'Remember your preferences such as language, theme, and saved filters.'
  },
  {
    title: 'Targeting Cookies',
    description: 'Support relevant marketing campaigns and partner attribution programs.'
  },
];

const thirdParties = [
  {
    title: 'Analytics Tools',
    description: 'Google Analytics, Segment, and similar tools measuring engagement so we can improve your experience.'
  },
  {
    title: 'Advertising Partners',
    description: 'Platforms that help us provide relevant content and measure campaign performance.'
  },
  {
    title: 'Social Integrations',
    description: 'Cookies from networks such as LinkedIn or YouTube when you interact with embedded content.'
  },
];

const managementSteps = [
  {
    title: 'Browser Controls',
    description: 'Most browsers let you view, delete, or block cookies. Check your browser settings for instructions.'
  },
  {
    title: 'Do Not Track',
    description: 'We honor browser Do Not Track signals for non-essential cookies when detected.'
  },
  {
    title: 'Consent Preferences',
    description: 'Use the cookie banner to update your preferences at any time. Changes apply immediately.'
  },
];

export default function CookiePolicyPage() {
  const lastUpdated = new Date('2024-12-15').toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Policies"
          title="Cookie Policy"
          description="We use cookies to keep GHXSTSHIP secure, reliable, and tailored to your workflow. This page explains what we collect and how you can control it."
        />
        <div className="mt-xl text-body-sm text-muted-foreground text-center">
          Last updated: {lastUpdated}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Overview"
          title="How Cookies Support Your Experience"
          description="Cookies are small text files stored on your device. They help us provide secure sessions, remember preferences, and improve product performance."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2">
          {cookieCategories.map((category) => (
            <MarketingCard key={category.title} title={category.title} description={category.description} />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Third Parties"
          title="Services That May Set Cookies"
          description="Some cookies originate from trusted partners who help us analyze usage, run campaigns, or embed external content."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {thirdParties.map((item) => (
            <MarketingCard key={item.title} title={item.title} description={item.description} />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Your Choices"
          title="Manage Your Cookie Preferences"
          description="You can change cookie settings at any time. These steps help you stay in control of your data."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {managementSteps.map((step) => (
            <MarketingCard key={step.title} title={step.title} description={step.description} />
          ))}
        </div>

        <div className="mt-xl text-body-sm text-muted-foreground">
          Need more information? Email <Link href="mailto:privacy@ghxstship.com" className="underline">privacy@ghxstship.com</Link> and we’ll respond within two business days.
        </div>
      </MarketingSection>
    </div>
  );
}
