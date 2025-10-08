import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import { Activity, ArrowRight, Calendar, Megaphone, Trophy, Users } from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid
} from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Sporting Events & Tournaments | GHXSTSHIP',
  description:
    'Deliver world-class sporting events with GHXSTSHIP’s tournament operations, athlete management, and broadcast coordination tools.'
};

const heroStats = [
  { label: 'Athletes Coordinated', value: '10M+' },
  { label: 'Tournaments Managed', value: '25,000+' },
  { label: 'Sports Covered', value: '500+' },
  { label: 'Event Success Rate', value: '99.9%' },
];

const tournamentPhases = [
  {
    title: 'Planning & Scheduling',
    description: 'Manage venues, brackets, officials, and logistics across multiple divisions and leagues.',
    icon: Calendar
  },
  {
    title: 'Athlete & Team Ops',
    description: 'Coordinate registration, health checks, and credentialing for athletes, coaches, and staff.',
    icon: Users
  },
  {
    title: 'Live Competition',
    description: 'Monitor live scoring, timing integrations, replay queues, and fan engagement in real time.',
    icon: Activity
  },
  {
    title: 'Broadcast & Sponsorship',
    description: 'Deliver broadcast-ready assets, manage sponsorship activations, and report on media impact.',
    icon: Megaphone
  },
];

const operationsHighlights = [
  {
    title: 'Precision Scheduling',
    description: 'Automate seeding, brackets, and officiating assignments with conflict detection.'
  },
  {
    title: 'Athlete Safety',
    description: 'Track medical clearances, incident reports, and compliance requirements.'
  },
  {
    title: 'Fan Experience',
    description: 'Sync ticketing, fan zones, and mobile updates to keep audiences engaged.'
  },
  {
    title: 'Commercial Growth',
    description: 'Manage sponsor deliverables, merchandising, and hospitality packages with clear visibility.'
  },
];

const caseStudies = [
  {
    company: 'National Youth Championships',
    project: 'Nationwide Multi-Sport Tournament',
    challenge: 'Overseeing 15,000 athletes across 50 venues with live streams and international qualifiers.',
    result: '100% on-time completion · 99.8% bracket accuracy · 2M+ stream viewers · 95% satisfaction',
    quote:
      'GHXSTSHIP turned a logistical maze into a championship showcase. Our teams, officials, and fans felt the difference.',
    author: 'Michael Rodriguez, Tournament Director'
  },
  {
    company: 'Olympic Trials Swimming',
    project: 'Elite Athletic Qualification',
    challenge: 'Coordinating elite swimmers, precision timing, media, and security across a tight schedule.',
    result: '100% timing accuracy · 50+ qualifiers identified · 10M+ broadcast reach · Zero delays',
    quote:
      'The precision of GHXSTSHIP helped us deliver an unforgettable trials meet. Every stakeholder had what they needed.',
    author: 'Sarah Chen, Competition Manager'
  },
];

const integrations = [
  'Sports Federations',
  'Timing & Scoring Systems',
  'Broadcast Networks',
  'Venue Management Platforms',
  'Athlete Databases',
  'Streaming Platforms',
  'Sponsorship Systems',
  'Medical & Safety Services',
];

export default function SportingEventsTournamentsPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Industry Solutions"
          title="Sporting Events & Tournaments"
          highlight="Sporting"
          description="Plan brackets, manage athletes, and deliver broadcasts with GHXSTSHIP’s comprehensive tournament operations toolkit."
          actions={
            <div className="flex flex-col items-center gap-sm sm:flex-row">
              <Link href="/auth/signup">
                <Button className="group" size="lg">
                  Start Competing
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Talk To Sports Ops Team
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
          title="Control Every Stage Of Competition"
          description="Keep governing bodies, broadcast teams, and athletes fully aligned from planning to podium."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {tournamentPhases.map((phase) => {
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
          eyebrow="Why GHXSTSHIP"
          title="Run Tournaments Without Bench Time"
          description="Sports organizations rely on GHXSTSHIP to deliver precision, safety, and fan excitement." 
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {operationsHighlights.map((highlight) => (
            <MarketingCard key={highlight.title} title={highlight.title} description={highlight.description} icon={<Trophy className="h-icon-md w-icon-md" />} />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Proof"
          title="Championships Powered By GHXSTSHIP"
          description="See how tournaments deliver flawless experiences for athletes, officials, and fans." 
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
          title="Connect The Sports Ecosystem"
          description="Integrate GHXSTSHIP with timing, broadcast, and sponsorship platforms for frictionless operations."
          align="center"
        />
        <div className="mt-2xl grid gap-md md:grid-cols-4">
          {integrations.map((integration) => (
            <div key={integration} className="rounded-xl border border-border bg-muted px-lg py-md text-center text-body-sm text-muted-foreground">
              {integration}
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Ready To Crown Champions?"
          description="Partner with GHXSTSHIP to deliver tournaments that athletes and fans will never forget."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/contact">
            <Button className="group" size="lg">
              Book A Sports Ops Demo
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
