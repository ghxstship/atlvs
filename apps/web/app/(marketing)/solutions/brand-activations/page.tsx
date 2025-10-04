import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Figma,
  Globe,
  Megaphone,
  Palette,
  Play,
  Share2,
  Zap,
} from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid,
} from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Brand Activations | GHXSTSHIP',
  description:
    'Design, launch, and measure experiential marketing programs with GHXSTSHIP’s activation workflows.',
};

const heroStats = [
  { label: 'Campaigns Managed', value: '1,000+' },
  { label: 'Ad Spend Orchestrated', value: '$500M+' },
  { label: 'Average ROI Increase', value: '300%' },
  { label: 'Agencies Served', value: '200+' },
];

const activationPhases = [
  {
    title: 'Concept & Creative',
    description: 'Brief intake, ideation boards, and client approvals built for fast-moving activation teams.',
    icon: Palette,
  },
  {
    title: 'Production & Logistics',
    description: 'Vendor sourcing, fabrication timelines, and run-of-show planning coordinated in one source of truth.',
    icon: Calendar,
  },
  {
    title: 'Launch & Measure',
    description: 'On-site staff tools, lead capture integrations, and performance dashboards in real time.',
    icon: Share2,
  },
];

const activationBenefits = [
  {
    title: 'Faster Campaign Delivery',
    description: 'Cut revision cycles and condense launch timelines with collaborative asset reviews.',
  },
  {
    title: 'Integrated Vendor Network',
    description: 'Track fabrication bids, contracts, and invoices with automated approvals.',
  },
  {
    title: 'Omni-Channel Reporting',
    description: 'Connect experiential KPIs to digital lift with unified analytics and ROI dashboards.',
  },
  {
    title: 'Client Visibility',
    description: 'Provide stakeholders with status hubs and live activation updates that keep everyone aligned.',
  },
];

const caseStudies = [
  {
    company: 'Apex Advertising',
    project: 'Global Brand Campaign',
    challenge: 'Managing 15 concurrent activations across 8 countries for a major retailer.',
    result: '40% faster delivery · 60% fewer revisions · 300% ROI lift · 98% client satisfaction',
    quote:
      'We scaled from 5 to 15 campaigns without hiring a single extra producer. GHXSTSHIP keeps everything tight and on-brand.',
    author: 'Marcus Rodriguez, Executive Creative Director',
  },
  {
    company: 'Digital Dynamics',
    project: 'Multi-Channel Product Launch',
    challenge: 'Coordinating live, digital, and retail experiences with a distributed team.',
    result: '50% faster creative production · 35% cost savings · 25% higher engagement',
    quote:
      'Our activations used to be a spreadsheet nightmare. Now every vendor, timeline, and asset lives in one place.',
    author: 'Sarah Chen, Account Director',
  },
];

const integrations = [
  'Google Ads',
  'Meta Business Suite',
  'Adobe Creative Cloud',
  'Figma',
  'HubSpot',
  'Salesforce',
  'Google Analytics',
  'Hootsuite',
];

export default function BrandActivationsPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Industry Solutions"
          title="Brand Activations"
          highlight="Brand"
          description="Plan immersive experiences, coordinate production partners, and prove ROI for every activation."
          actions={
            <div className="flex flex-col items-center gap-sm sm:flex-row">
              <Link href="/auth/signup">
                <Button className="group" size="lg">
                  Start Free Trial
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Talk To Activation Specialist
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
          title="Every Stage, One Platform"
          description="From brainstorm to wrap report, GHXSTSHIP equips activation teams with end-to-end visibility."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {activationPhases.map((phase) => {
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
          eyebrow="Results"
          title="Deliver Experiences That Perform"
          description="Agencies use GHXSTSHIP to scale activations, deepen client partnerships, and quantify impact."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {activationBenefits.map((benefit) => (
            <MarketingCard key={benefit.title} title={benefit.title} description={benefit.description} icon={<Briefcase className="h-icon-md w-icon-md" />} />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Proof"
          title="Campaigns Powered By GHXSTSHIP"
          description="See how leading agencies launch unforgettable experiences with measurable outcomes."
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
          title="Connect Your Activation Stack"
          description="Sync media buying, creative, CRM, and social reporting tools to keep data flowing."
          align="center"
        />
        <div className="mt-2xl grid gap-md md:grid-cols-4">
          {integrations.map((tool) => (
            <div key={tool} className="rounded-xl border border-border/60 bg-muted/30 px-lg py-md text-center text-body-sm text-muted-foreground">
              {tool}
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="primaryGradient" padding="lg">
        <MarketingSectionHeader
          title="Ready To Launch Your Next Activation?"
          description="Work with GHXSTSHIP to deliver immersive campaigns with speed, precision, and measurable ROI."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/contact">
            <Button className="group" size="lg">
              Book A Strategy Session
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
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
