import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import { ArrowRight, Award, BarChart3, Globe, Handshake, Lightbulb, Rocket, Users } from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid
} from '../../_components/marketing';

export const metadata: Metadata = {
  title: 'Partnerships | GHXSTSHIP',
  description:
    'Join the GHXSTSHIP partner ecosystem. Integrate technology, co-launch solutions, and reach global production teams.',
  openGraph: {
    title: 'Partnerships | GHXSTSHIP',
    description:
      'Join the GHXSTSHIP partner ecosystem. Integrate technology, co-launch solutions, and reach global production teams.',
    url: 'https://ghxstship.com/partnerships'
  }
};

const partnerStats = [
  { label: 'Certified Partners', value: '185' },
  { label: 'Co-launched Products', value: '60+' },
  { label: 'Global Markets', value: '32' },
  { label: 'Avg. Partner ROI', value: '3.1x' },
];

const partnerTracks = [
  {
    title: 'Technology Partners',
    description: 'Integrate your platform with ATLVS and OPENDECK to unlock automation, shared analytics, and a joint product roadmap.',
    icon: Lightbulb
  },
  {
    title: 'Solution Partners',
    description: 'Implement GHXSTSHIP for clients, deliver change management, and build managed service offerings that scale.',
    icon: Handshake
  },
  {
    title: 'Channel & Resellers',
    description: 'Grow revenue with localized marketing, lead sharing, and co-branded campaigns tailored to your territory.',
    icon: Rocket
  },
];

const partnerBenefits = [
  {
    title: 'Launch Support',
    description: 'Partner enablement, dedicated success managers, and technical validation ensure a smooth go-to-market.',
    icon: Rocket
  },
  {
    title: 'Revenue Programs',
    description: 'Tiered incentives, referral bonuses, and recurring revenue shares for long-term success.',
    icon: BarChart3
  },
  {
    title: 'Co-Marketing Kits',
    description: 'Campaign assets, event sponsorships, and press opportunities to amplify your brand.',
    icon: Globe
  },
  {
    title: 'Product Influence',
    description: 'Access to beta programs, roadmap councils, and direct collaboration with GHXSTSHIP product teams.',
    icon: Lightbulb
  },
];

const partnerProcess = [
  {
    step: '01',
    title: 'Apply & Align',
    description: 'Share your offerings, customer segments, and goals. We’ll identify the best partnership track together.'
  },
  {
    step: '02',
    title: 'Enable & Integrate',
    description: 'Complete enablement, build integrations or service packages, and finalize go-to-market plans.'
  },
  {
    step: '03',
    title: 'Launch & Grow',
    description: 'Co-market your solution, activate success programs, and iterate with ongoing support from GHXSTSHIP.'
  },
];

const successStories = [
  {
    company: 'CreativeFlow Solutions',
    type: 'Channel Partner',
    result: '300% revenue growth in 18 months',
    testimonial:
      'Partnering with GHXSTSHIP transformed our services business. We co-created offerings and tripled our revenue.',
    author: 'Sarah Martinez, CEO'
  },
  {
    company: 'TechIntegrate Inc.',
    type: 'Technology Partner',
    result: '50K+ new users through integration',
    testimonial:
      'The GHXSTSHIP integration expanded our reach and generated tangible outcomes for joint customers.',
    author: 'David Chen, CTO'
  },
];

const partnerResources = [
  {
    title: 'API Documentation',
    description: 'Explore authentication, webhooks, and integration guides for ATLVS and OPENDECK.',
    href: '/resources/docs'
  },
  {
    title: 'Marketing Playbooks',
    description: 'Access co-branding guidelines, event kits, and launch checklists.',
    href: '/resources/guides'
  },
  {
    title: 'Partner Support Center',
    description: 'Submit tickets, request enablement sessions, or chat with partner success.',
    href: '/contact'
  },
];

export default function PartnershipsPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Partner Ecosystem"
          title="Build With GHXSTSHIP"
          highlight="GHXSTSHIP"
          description="Deliver smarter production workflows with ATLVS and OPENDECK. Partner with the platform designed for the creative economy."
          actions={
            <Link href="#partner-apply">
              <Button className="group" size="lg">
                Start Partnership Conversation
                <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
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
          eyebrow="Partner Tracks"
          title="Choose How You Collaborate"
          description="Three partnership paths—technology, solution, and channel—built to match your strengths and business goals."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {partnerTracks.map((track) => {
            const Icon = track.icon;
            return (
              <MarketingCard
                key={track.title}
                title={track.title}
                description={track.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Benefits"
          title="Why Partners Choose GHXSTSHIP"
          description="Scale faster with a team that co-invests in launch, revenue, and long-term success."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {partnerBenefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <MarketingCard
                key={benefit.title}
                title={benefit.title}
                description={benefit.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Process"
          title="From Alignment To Launch"
          description="We make partnering simple: align on goals, enable your team, and go to market with GHXSTSHIP."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {partnerProcess.map((step) => (
            <MarketingCard
              key={step.step}
              title={`Step ${step.step}: ${step.title}`}
              description={step.description}
              icon={<ArrowRight className="h-icon-md w-icon-md rotate-90" />}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Success Stories"
          title="Proof In The Results"
          description="Hear from partners growing faster, serving clients better, and unlocking new revenue streams with GHXSTSHIP."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2">
          {successStories.map((story) => (
            <Card key={story.company} className="border border-border bg-card shadow-sm">
              <CardContent className="space-y-lg p-xl">
                <div className="flex items-center gap-sm">
                  <h3 className="text-heading-4 uppercase leading-tight">{story.company}</h3>
                  <Badge variant="outline">{story.type}</Badge>
                </div>
                <div className="flex items-center gap-sm text-body font-medium text-foreground">
                  <Award className="h-icon-xs w-icon-xs text-warning" />
                  {story.result}
                </div>
                <blockquote className="border-l-4 border-primary pl-md text-body text-muted-foreground italic">
                  “{story.testimonial}”
                </blockquote>
                <cite className="text-body-sm text-muted-foreground">— {story.author}</cite>
              </CardContent>
            </Card>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection id="partner-apply" variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Ready To Partner?"
          description="Tell us about your solutions and goals. We’ll reach out with next steps, enablement resources, and launch timelines."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/contact">
            <Button className="group" size="lg">
              Start Partnership Discussion
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            Download Partner Guide
          </Button>
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Resources"
          title="Equip Your Team"
          description="Access technical documentation, marketing assets, and support channels to launch successfully."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {partnerResources.map((resource) => (
            <MarketingCard
              key={resource.title}
              title={resource.title}
              description={resource.description}
              icon={<Globe className="h-icon-md w-icon-md" />}
              footer={
                <Link href={resource.href}>
                  <Button variant="ghost" size="sm" className="px-sm">
                    View Resource
                  </Button>
                </Link>
              }
            />
          ))}
        </div>
      </MarketingSection>
    </div>
  );
}
