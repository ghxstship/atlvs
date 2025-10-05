import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import { Globe, Star, Users, Zap } from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid,
} from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Community Partners | GHXSTSHIP',
  description: "Discover our community partners and learn how to become part of the GHXSTSHIP partner ecosystem.",
};

const partnerStats = [
  { label: 'Certified Partners', value: '185' },
  { label: 'Countries Active', value: '32' },
  { label: 'Annual Co-Projects', value: '420+' },
  { label: 'Partner NPS', value: '71' },
];

const partnerTiers = [
  {
    title: 'Technology Partners',
    description: 'Product and integration leaders extending GHXSTSHIP with automations, data bridges, and AI tooling.',
    icon: Zap,
    benefits: ['API access', 'Joint product roadmaps', 'Co-marketing campaigns', 'Dedicated technical support'],
  },
  {
    title: 'Solution Partners',
    description: 'Implementation experts guiding enterprises through rollout, change management, and creative ops transformation.',
    icon: Globe,
    benefits: ['Enablement & certification', 'Lead sharing', 'Preferred pricing', 'Launch playbooks'],
  },
  {
    title: 'Community Champions',
    description: 'Advocates who activate regional communities, host events, and mentor emerging talent.',
    icon: Star,
    benefits: ['Early feature access', 'Spotlight opportunities', 'Revenue share programs', 'VIP summit invites'],
  },
];

const featuredPartners = [
  { name: 'Creative Cloud Solutions', category: 'Technology', logo: '/partners/creative-cloud.svg' },
  { name: 'Production Pro Services', category: 'Solution', logo: '/partners/production-pro.svg' },
  { name: 'Media Workflow Experts', category: 'Solution', logo: '/partners/media-workflow.svg' },
  { name: 'Digital Asset Management Co', category: 'Technology', logo: '/partners/dam-co.svg' },
];

const engagementSteps = [
  {
    title: '1. Apply',
    description: 'Share your capabilities, team credentials, and shared customer wins so we can understand the partnership fit.',
  },
  {
    title: '2. Enable',
    description: 'Complete technical validation, align on go-to-market strategy, and build a 90-day partner plan together.',
  },
  {
    title: '3. Launch',
    description: 'Co-announce, activate regional campaigns, and receive ongoing success reviews with the GHXSTSHIP partner team.',
  },
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Partner Ecosystem"
          title="Build With GHXSTSHIP"
          highlight="GHXSTSHIP"
          description="Join a network of technologists, agencies, and community champions who extend GHXSTSHIP’s impact across productions worldwide."
          actions={
            <Link href="#partner-apply">
              <Button className="group">
                Become a Partner
                <Zap className="ml-sm h-icon-xs w-icon-xs" />
              </Button>
            </Link>
          }
        />
        <div className="mt-2xl">
          <MarketingStatGrid items={partnerStats} />
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Partner Tiers"
          title="Choose Your Track"
          description="Whether you’re integrating technology, guiding enterprise deployments, or energizing community programs, there’s a tier designed for you."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {partnerTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <MarketingCard
                key={tier.title}
                title={tier.title}
                description={tier.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
                footer={
                  <div className="flex flex-col gap-xs text-body-sm text-muted-foreground">
                    {tier.benefits.map((benefit) => (
                      <span key={benefit} className="inline-flex items-center gap-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {benefit}
                      </span>
                    ))}
                  </div>
                }
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Featured Partners"
          title="Trusted By Industry Leaders"
          description="A snapshot of the companies co-building, co-selling, and co-supporting productions with GHXSTSHIP."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {featuredPartners.map((partner) => (
            <Card key={partner.name} className="rounded-3xl border border-border bg-card shadow-sm">
              <CardContent className="flex h-full flex-col items-center gap-md p-xl text-center">
                <div className="flex h-20 w-full items-center justify-center rounded-2xl bg-muted">
                  <span className="text-body-sm text-muted-foreground">{partner.logo ? 'Logo' : 'Partner'}</span>
                </div>
                <div className="space-y-xs">
                  <h3 className="text-heading-4 uppercase leading-tight">{partner.name}</h3>
                  <Badge variant="outline" className="uppercase tracking-[0.2em]">
                    {partner.category} Partner
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection id="partner-apply">
        <MarketingSectionHeader
          eyebrow="How It Works"
          title="Partner With Confidence"
          description="Our partner success team guides you from application through launch so your offerings shine inside the GHXSTSHIP ecosystem."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {engagementSteps.map((step) => (
            <MarketingCard key={step.title} title={step.title} description={step.description} />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Let’s Build The Future Of Production"
          description="Tell us about your products, services, and vision. We’ll co-design a partnership that unlocks new value for the creators we serve."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="mailto:partners@ghxstship.com">
            <Button className="group">
              Talk To Partner Team
              <Users className="ml-sm h-icon-xs w-icon-xs" />
            </Button>
          </Link>
          <Link href="/community/opportunities">
            <Button variant="outline">Explore Opportunities</Button>
          </Link>
        </div>
      </MarketingSection>
    </div>
  );
}
