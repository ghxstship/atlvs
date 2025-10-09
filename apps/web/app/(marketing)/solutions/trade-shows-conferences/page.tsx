import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import { ArrowRight, Building, Calendar, ChartBar, Handshake, Network, Users, Zap } from "lucide-react";

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid
} from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Trade Shows & Conferences Solutions | GHXSTSHIP',
  description:
    'Deliver growth-driving trade shows and conferences with GHXSTSHIP. Manage exhibitions, attendees, and business outcomes from one platform.',
  openGraph: {
    title: 'Trade Shows & Conferences Solutions | GHXSTSHIP',
    description:
      'Deliver growth-driving trade shows and conferences with GHXSTSHIP. Manage exhibitions, attendees, and business outcomes from one platform.',
    url: 'https://ghxstship.com/solutions/trade-shows-conferences'
  }
};

const heroStats = [
  { label: 'Attendees Managed', value: '5M+' },
  { label: 'Events Powered', value: '10K+' },
  { label: 'Lead Capture Rate', value: '95%' },
  { label: 'Average ROI Lift', value: '4.2×' },
];

const eventPillars = [
  {
    title: 'Large-Scale Attendee Management',
    description: 'Deliver registration, check-in, and live tracking for thousands of attendees, exhibitors, and speakers.',
    icon: Users
  },
  {
    title: 'Complex Scheduling Coordination',
    description: 'Control overlapping sessions, workshops, and venues with conflict resolution and resource allocation.',
    icon: Calendar
  },
  {
    title: 'Lead Generation & ROI Tracking',
    description: 'Capture leads, score opportunities, and tie business outcomes directly to the event experience.',
    icon: ChartBar
  },
  {
    title: 'Networking Facilitation',
    description: 'Match attendees, cultivate meetings, and track engagement across structured networking formats.',
    icon: Network
  },
];

const featureHighlights = [
  {
    title: 'Exhibition Management',
    description: 'Coordinate floor plans, booth services, and exhibitor portals with real-time updates.'
  },
  {
    title: 'Conference Orchestration',
    description: 'Run multi-track agendas, speaker workflows, and virtual simulcasts from a unified command center.'
  },
  {
    title: 'Attendee Experience Platform',
    description: 'Deliver mobile apps, networking journeys, and gamification to keep participants engaged.'
  },
  {
    title: 'Business Intelligence',
    description: 'Measure lead quality, sponsor ROI, and engagement metrics across exhibitors and audiences.'
  },
];

const caseStudies = [
  {
    company: 'Global Tech Summit',
    project: 'International Technology Conference',
    challenge: 'Managing 15,000 attendees, 200 sessions, and 500 exhibitors for a five-day global summit.',
    result: '98% satisfaction · 300% networking lift · 85% lead boost · 40% lower operations cost',
    quote:
      'GHXSTSHIP transformed our summit into a frictionless experience. We finally delivered insights to every stakeholder.',
    author: 'Maria Rodriguez, Event Director'
  },
  {
    company: 'Manufacturing Trade Expo',
    project: 'Industrial Equipment Exhibition',
    challenge: 'Coordinating 800 exhibitors, 25,000 visitors, and complex logistics with real-time analytics.',
    result: '95% exhibitor renewal · 250% more qualified leads · 60% better traffic flow · $50M deals closed',
    quote:
      'Our exhibitors saw record ROI. GHXSTSHIP kept operations, leads, and insights perfectly aligned.',
    author: 'David Chen, Trade Show Manager'
  },
];

const integrations = [
  'Salesforce',
  'HubSpot',
  'Eventbrite',
  'Zoom',
  'LinkedIn',
  'Mailchimp',
  'Stripe',
  'Google Analytics',
];

export default function TradeShowsConferencesPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Industry Solutions"
          title="Trade Shows & Conferences"
          highlight="Conferences"
          description="Power exhibitions, keynotes, and networking experiences with GHXSTSHIP’s business event platform."
          actions={
            <div className="flex flex-col items-center gap-sm sm:flex-row">
              <Link href="/auth/signup">
                <Button className="group" size="lg">
                  Start Building
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Talk To Event Strategist
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
          eyebrow="Event Pillars"
          title="Deliver Business Impact"
          description="Keep exhibitors, attendees, and sponsors aligned from call for papers through post-event analytics." 
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {eventPillars.map((pillar) => {
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
          eyebrow="Capabilities"
          title="Orchestrate Every Touchpoint"
          description="GHXSTSHIP centralizes the tools organizers need to deliver growth-driving trade shows and conferences." 
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {featureHighlights.map((feature) => (
            <MarketingCard key={feature.title} title={feature.title} description={feature.description} icon={<Handshake className="h-icon-md w-icon-md" />} />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Proof"
          title="Events Powered By GHXSTSHIP"
          description="See how global organizers turn conferences into measurable pipelines." 
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
          title="Connect Your Business Stack"
          description="Sync GHXSTSHIP with CRM, marketing automation, payments, and analytics tools."
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
          title="Ready To Drive Business Results?"
          description="Partner with GHXSTSHIP to deliver trade shows and conferences that turn relationships into revenue."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/contact">
            <Button className="group" size="lg">
              Book An Event Strategy Session
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="outline" size="lg">
              Start Building
            </Button>
          </Link>
        </div>
      </MarketingSection>
    </div>
  );
}
