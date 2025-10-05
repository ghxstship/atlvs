import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import { ArrowRight, Calendar, Music, Share2, Volume2 } from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid,
} from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Concerts, Festivals & Tours | GHXSTSHIP',
  description:
    'Coordinate artists, vendors, and global audiences with GHXSTSHIP workflows built for concerts, festivals, and touring productions.',
};

const heroStats = [
  { label: 'Artists Supported', value: '10K+' },
  { label: 'Events Produced', value: '500+' },
  { label: 'Tracks Delivered', value: '1M+' },
  { label: 'Countries Served', value: '50+' },
];

const lifecyclePhases = [
  {
    title: 'Advance & Booking',
    description: 'Lock routing, hospitality, and technical riders while keeping agents, promoters, and crews aligned.',
    icon: Calendar,
  },
  {
    title: 'Show Day Operations',
    description: 'Real-time run-of-show dashboards, crew assignments, and production checklists on every stage.',
    icon: Music,
  },
  {
    title: 'Tour Wrap & Reporting',
    description: 'Consolidate settlements, merch reports, and content delivery with audit-ready documentation.',
    icon: Share2,
  },
];

const productionBenefits = [
  {
    title: 'Artist Logistics',
    description: 'Manage advancing, backline, travel, and credentials from a single source of truth.',
  },
  {
    title: 'Vendor Coordination',
    description: 'Track bids, contracts, and onsite schedules for staging, lighting, and broadcast vendors.',
  },
  {
    title: 'Risk & Safety Planning',
    description: 'Incident playbooks, compliance checks, and emergency contacts integrated into every show.',
  },
  {
    title: 'Audience Engagement',
    description: 'Sync ticketing, content capture, and live-stream metrics to understand fan impact in real time.',
  },
];

const caseStudies = [
  {
    company: 'Harmony Records',
    project: 'Global Album Sessions',
    challenge: 'Producing a 12-track album with artists and engineers collaborating across six countries.',
    result: '50% faster production · 30% lower studio spend · 100% on-time release · Grammy nomination',
    quote:
      'GHXSTSHIP connected studios, producers, and artists like we were all in the same room. We hit every deadline with zero drama.',
    author: 'Maya Patel, Executive Producer',
  },
  {
    company: 'Electric Nights Festival',
    project: 'Three-Day Multi-Stage Festival',
    challenge: 'Coordinating 150 artists, overlapping sets, and complex technical requirements across five stages.',
    result: '99.8% show execution · 40% higher artist satisfaction · 25% fewer technical incidents · 200K attendees',
    quote:
      'Every stage lead used GHXSTSHIP to stay locked. From pyro cues to guest lists, nothing slipped.',
    author: 'Carlos Rodriguez, Festival Director',
  },
];

const integrations = [
  'Pro Tools',
  'Logic Pro',
  'Ableton Live',
  'Spotify for Artists',
  'Eventbrite',
  'Bandsintown',
  'Twitch',
  'YouTube Live',
];

export default function ConcertsFestivalsToursPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Industry Solutions"
          title="Concerts, Festivals & Tours"
          highlight="Concerts"
          description="Plan routing, manage production crews, and keep artists on schedule with GHXSTSHIP’s live entertainment toolkit."
          actions={
            <div className="flex flex-col items-center gap-sm sm:flex-row">
              <Link href="/auth/signup">
                <Button className="group" size="lg">
                  Start Free Trial
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Speak With Live Ops Team
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
          eyebrow="Lifecycle"
          title="Own Every Leg Of The Tour"
          description="From advance packets to encore, GHXSTSHIP keeps production teams synced, informed, and ready." 
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {lifecyclePhases.map((phase) => {
            const Icon = phase.icon;
            return (
              <MarketingCard
                key={phase.title}
                title={phase.title}
                description={phase.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Why It Works"
          title="Production Without Compromise"
          description="Promoters, tour managers, and production companies rely on GHXSTSHIP to run flawless shows at scale."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {productionBenefits.map((benefit) => (
            <MarketingCard
              key={benefit.title}
              title={benefit.title}
              description={benefit.description}
              icon={<Volume2 className="h-icon-md w-icon-md" />}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Proof"
          title="Productions On GHXSTSHIP"
          description="Festival operators and touring labels streamline everything from talent logistics to fan reporting."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2">
          {caseStudies.map((study) => (
            <Card key={study.company} className="border border-border bg-card shadow-sm">
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
          title="Plug Into Your Show Stack"
          description="Keep your favorite DAWs, ticketing, and streaming platforms in sync with GHXSTSHIP."
          align="center"
        />
        <div className="mt-2xl grid gap-md md:grid-cols-4">
          {integrations.map((tool) => (
            <div key={tool} className="rounded-xl border border-border bg-muted px-lg py-md text-center text-body-sm text-muted-foreground">
              {tool}
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Ready To Light Up The Next Tour?"
          description="Partner with GHXSTSHIP to deliver unforgettable concerts, festivals, and global tours."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/contact">
            <Button className="group" size="lg">
              Book A Production Demo
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="outline" size="lg">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </MarketingSection>
    </div>
  );
}
