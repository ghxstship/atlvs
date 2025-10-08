import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import { ArrowRight, Camera, Clapperboard, Film, MonitorPlay, Share2, Star, Users } from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid
} from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Film & TV Solutions | GHXSTSHIP',
  description:
    'Coordinate multi-market productions, manage crews, and control budgets with GHXSTSHIP’s film and television workflows.'
};

const heroStats = [
  { label: 'Productions Managed', value: '500+' },
  { label: 'Budget Tracked', value: '$2B+' },
  { label: 'On-Time Delivery', value: '95%' },
  { label: 'Crew Members', value: '50K+' },
];

const workflowHighlights = [
  {
    title: 'Pre-Production',
    description: 'Script breakdowns, casting boards, and location scouting managed in one workspace.',
    icon: Clapperboard
  },
  {
    title: 'Production Control',
    description: 'Call sheets, run-of-show timelines, and asset approvals synced across crews and vendors.',
    icon: Camera
  },
  {
    title: 'Post & Delivery',
    description: 'Review cycles, localization, and broadcast delivery tracked with audit-ready history.',
    icon: MonitorPlay
  },
];

const productionBenefits = [
  {
    title: 'Crew Collaboration',
    description: 'Centralized communication, annotated assets, and approvals keep every department aligned.'
  },
  {
    title: 'Budget Confidence',
    description: 'Live burn reports highlight variances across locations and departments before they spike.'
  },
  {
    title: 'Global Talent Access',
    description: 'Tap OPENDECK’s vetted roster to staff specialty crews and regional fixers in hours.'
  },
  {
    title: 'Executive Visibility',
    description: 'Portfolio dashboards give studios and producers real-time status across slates.'
  },
];

const caseStudies = [
  {
    company: 'Meridian Studios',
    project: 'Epic Fantasy Series',
    challenge: 'Coordinating 200+ crew members across 5 countries for a $50M production.',
    result: '30% fewer delays · 25% tighter budget control · 40% faster post-production',
    quote:
      'GHXSTSHIP gave our showrunners and line producers a single source of truth. The visibility saved us weeks every season.',
    author: 'Sarah Chen, Executive Producer'
  },
  {
    company: 'Blackwater Productions',
    project: 'Documentary Series',
    challenge: 'Delivering simultaneous shoots across continents with lean travel budgets.',
    result: '50% faster crew onboarding · 20% faster delivery · 35% lower travel costs',
    quote:
      'The OPENDECK network helped us source local crews instantly. We shipped on time without flying half the world.',
    author: 'Marcus Rodriguez, Director'
  },
];

const integrations = [
  'Avid Media Composer',
  'Adobe Premiere Pro',
  'DaVinci Resolve',
  'Frame.io',
  'Shotgrid',
  'Movie Magic Scheduling',
  'StudioBinder',
  'Slack',
];

export default function FilmTVPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Industry Solutions"
          title="Film & TV"
          highlight="Film & TV"
          description="From script to final delivery, GHXSTSHIP keeps productions on schedule, under budget, and ready for release."
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
                  Talk To A Producer Advocate
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
          eyebrow="Workflows"
          title="Handle Every Phase Of Production"
          description="Purpose-built tooling for development, principle photography, and post keeps crews focused on the story."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {workflowHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <MarketingCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Why Studios Choose GHXSTSHIP"
          title="Production Powerhouse"
          description="Film and television teams rely on GHXSTSHIP to manage complex schedules, evolving scripts, and international crews."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {productionBenefits.map((benefit) => (
            <MarketingCard key={benefit.title} title={benefit.title} description={benefit.description} icon={<Star className="h-icon-md w-icon-md" />} />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Proven Results"
          title="Studios Shipping With GHXSTSHIP"
          description="Hear from crews bringing ambitious stories to screen with clarity and control."
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
          title="Works With Your Production Stack"
          description="Keep editorial, post, and communication tools connected. GHXSTSHIP slots into your existing workflow."
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
          title="Ready For Your Next Slate?"
          description="Walk through the GHXSTSHIP production playbook and see how studios accelerate every season."
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
