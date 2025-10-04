import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import { ArrowRight, Building2, Compass, ConciergeBell, Globe2, Sparkles } from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid,
} from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Hospitality & Travel | GHXSTSHIP',
  description:
    'Craft luxury guest journeys, experiential stays, and premium travel programs with GHXSTSHIP’s hospitality workflows.',
};

const heroStats = [
  { label: 'Guest Journeys Managed', value: '320K+' },
  { label: 'Destinations Coordinated', value: '140' },
  { label: 'VIP Satisfaction', value: '9.7/10' },
  { label: 'Upsell Revenue Growth', value: '28%' },
];

const experiencePillars = [
  {
    title: 'Personalized Stays',
    description: 'Capture preferences, tailor amenities, and manage bespoke itineraries for every guest.',
    icon: ConciergeBell,
  },
  {
    title: 'Global Coordination',
    description: 'Align property teams, destination partners, and transportation providers across time zones.',
    icon: Globe2,
  },
  {
    title: 'Experiential Programming',
    description: 'Curate excursions, wellness sessions, and private events with vendor-ready runbooks.',
    icon: Compass,
  },
  {
    title: 'Onsite Operations',
    description: 'Real-time dashboards for check-ins, housekeeping, and guest relations keep service seamless.',
    icon: Building2,
  },
];

const hospitalityBenefits = [
  {
    title: 'Guest Relationship Intelligence',
    description: 'Surface loyalty data, milestones, and sentiment for personalized surprise-and-delight moments.',
  },
  {
    title: 'Premium Vendor Network',
    description: 'Track master service agreements, availability, and ratings for chefs, guides, and chauffeurs.',
  },
  {
    title: 'Revenue Optimization',
    description: 'Automate upsell offers, inventory holds, and billing flows tied to guest itineraries.',
  },
  {
    title: 'Compliance & Safety',
    description: 'Manage regulatory requirements, insurance documentation, and emergency protocols.',
  },
];

const caseStudies = [
  {
    company: 'Aurora Luxury Resorts',
    project: 'Signature Guest Journey Program',
    challenge: 'Delivering bespoke experiences for VIP guests across six flagship properties worldwide.',
    result: '35% faster itinerary planning · 30% increase in ancillary revenue · 97% guest satisfaction · 100% service recovery tracking',
    quote:
      'Every department—from concierge to culinary—worked in harmony. GHXSTSHIP helped us elevate every stay.',
    author: 'Elena Marques, VP of Guest Experience',
  },
  {
    company: 'Voyage Private Travel',
    project: 'Ultra-Luxury Expedition Series',
    challenge: 'Coordinating air, sea, and land experiences for UHNW travelers with stringent expectations.',
    result: '50% fewer operational escalations · 25% improvement in traveler retention · 40% faster vendor confirmations',
    quote:
      'Our travel designers finally share one cockpit. GHXSTSHIP keeps itineraries, vendors, and guests perfectly aligned.',
    author: 'Marcus Lee, Managing Director',
  },
];

const integrations = [
  'PMS & CRS Platforms',
  'Airline & Charter APIs',
  'Luxury Transport Networks',
  'F&B & Beverage Partners',
  'Concierge Marketplaces',
  'Wellness & Spa Systems',
  'CRM & Loyalty Suites',
  'Payment & Billing Providers',
];

export default function HospitalityTravelPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Industry Solutions"
          title="Hospitality & Travel"
          highlight="Hospitality"
          description="Deliver unforgettable stays, curated itineraries, and seamless travel logistics from a single command center."
          actions={
            <div className="flex flex-col items-center gap-sm sm:flex-row">
              <Link href="/auth/signup">
                <Button className="group" size="lg">
                  Start Guest Journey
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Speak With Hospitality Lead
                </Button>
              </Link>
            </div>
          }
        />
        <div className="mt-2xl">
          <MarketingStatGrid items={heroStats} />
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Experience Design"
          title="Craft Every Touchpoint"
          description="Keep guest services, operations, and destination partners aligned from booking to departure."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {experiencePillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <MarketingCard
                key={pillar.title}
                title={pillar.title}
                description={pillar.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Why GHXSTSHIP"
          title="Elevate Every Stay"
          description="Hospitality teams unlock loyalty, revenue, and operational excellence with GHXSTSHIP."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {hospitalityBenefits.map((benefit) => (
            <MarketingCard key={benefit.title} title={benefit.title} description={benefit.description} icon={<Sparkles className="h-icon-md w-icon-md" />} />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Proof"
          title="Journeys Powered By GHXSTSHIP"
          description="See how luxury brands and travel specialists deliver flawless experiences." 
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2">
          {caseStudies.map((study) => (
            <Card key={study.company} className="border border-border/40 bg-background/95 shadow-sm">
              <CardContent className="space-y-md p-xl">
                <div className="flex items-center gap-sm">
                  <h3 className="text-heading-4 uppercase leading-tight">{study.company}</h3>
                  <Badge variant="outline">{study.project}</Badge>
                </div>
                <p className="text-body-sm text-muted-foreground">{study.challenge}</p>
                <div className="text-body font-medium text-foreground">{study.result}</div>
                <blockquote className="border-l-4 border-primary pl-md text-body text-muted-foreground italic">“{study.quote}”</blockquote>
                <cite className="text-body-sm text-muted-foreground">— {study.author}</cite>
              </CardContent>
            </Card>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Integrations"
          title="Connect Your Travel Ecosystem"
          description="Sync GHXSTSHIP with property systems, travel networks, and premium service partners."
          align="center"
        />
        <div className="mt-2xl grid gap-md md:grid-cols-4">
          {integrations.map((integration) => (
            <div key={integration} className="rounded-xl border border-border/60 bg-muted/30 px-lg py-md text-center text-body-sm text-muted-foreground">
              {integration}
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Ready To Delight Every Guest?"
          description="Partner with GHXSTSHIP to craft extraordinary hospitality and travel experiences."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/contact">
            <Button className="group" size="lg">
              Book A Hospitality Consultation
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="outline" size="lg">
              Start Guest Journey
            </Button>
          </Link>
        </div>
      </MarketingSection>
    </div>
  );
}
