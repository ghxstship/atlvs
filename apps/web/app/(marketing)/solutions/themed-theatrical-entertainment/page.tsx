import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import {
  ArrowRight,
  Clapperboard,
  Drama,
  Palette,
  Sparkles,
  Users,
  Wand2,
} from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid,
} from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Themed & Theatrical Entertainment Solutions | GHXSTSHIP',
  description:
    'Create spectacular themed experiences and theatrical productions with GHXSTSHIP. Manage theme parks, live shows, and immersive entertainment.',
  openGraph: {
    title: 'Themed & Theatrical Entertainment Solutions | GHXSTSHIP',
    description:
      'Create spectacular themed experiences and theatrical productions with GHXSTSHIP. Manage theme parks, live shows, and immersive entertainment.',
    url: 'https://ghxstship.com/solutions/themed-theatrical-entertainment',
  },
};

const heroStats = [
  { label: 'Productions Managed', value: '500+' },
  { label: 'Guests Entertained', value: '50M+' },
  { label: 'Cast & Crew Coordinated', value: '10K+' },
  { label: 'Guest Satisfaction', value: '95%' },
];

const productionPillars = [
  {
    title: 'Complex Production Coordination',
    description:
      'Manage staged spectacles, parade launches, and venue schedules with cross-department checklists and live dashboards.',
    icon: Clapperboard,
  },
  {
    title: 'Creative Asset Management',
    description:
      'Keep costumes, props, set pieces, and digital media organized with version control and availability tracking.',
    icon: Palette,
  },
  {
    title: 'Multi-Disciplinary Team Management',
    description:
      'Coordinate directors, choreographers, technicians, and performers with skill tagging and smart scheduling.',
    icon: Users,
  },
  {
    title: 'Experience Consistency',
    description:
      'Protect quality standards with performance notes, safety protocols, and guest feedback loops.',
    icon: Drama,
  },
];

const featureHighlights = [
  {
    title: 'Production Command Center',
    description:
      'Orchestrate rehearsals, cue sheets, and technical rehearsals with role-based workflows and approvals.',
  },
  {
    title: 'Creative Asset Hub',
    description:
      'Centralize wardrobe, props, scenic elements, and media files with audit trails and quick pulls.',
  },
  {
    title: 'Talent & Crew Coordination',
    description:
      'Manage contracts, availability, training, and payroll handoffs for large creative teams.',
  },
  {
    title: 'Guest Experience Analytics',
    description:
      'Understand satisfaction, dwell time, and per-guest revenue to fine tune every show cycle.',
  },
];

const caseStudies = [
  {
    company: 'Enchanted Worlds Theme Park',
    project: 'Multi-Attraction Launch',
    challenge:
      'Launching five new attractions simultaneously with complex technical requirements and 200+ cast members.',
    result: '100% on-time openings · 95% guest satisfaction · 40% fewer production delays · $2M operational savings',
    quote:
      'GHXSTSHIP enabled us to orchestrate our most ambitious expansion with precision and creativity.',
    author: 'Maria Santos, Creative Director',
  },
  {
    company: 'Broadway Spectacular Productions',
    project: 'Multi-Show Season',
    challenge:
      'Managing three concurrent productions with shared resources, overlapping schedules, and strict union rules.',
    result: '8 Tony nominations · 50% rehearsal efficiency gain · 30% lower production costs · 98% show completion',
    quote:
      'The platform transformed how we manage complex theatrical productions. Every show opened flawlessly.',
    author: 'James Mitchell, Executive Producer',
  },
];

const integrations = [
  'QLab',
  'Vectorworks',
  'AutoCAD',
  'Costume Pro',
  'StageWrite',
  'WYSIWYG',
  'Avid Pro Tools',
  'Unity',
];

export default function ThemedTheatricalEntertainmentPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Industry Solutions"
          title="Themed & Theatrical Entertainment"
          highlight="Entertainment"
          description="Bring themed destinations and theatrical productions to life with GHXSTSHIP’s creative production platform."
          actions={
            <div className="flex flex-col items-center gap-sm sm:flex-row">
              <Link href="/auth/signup">
                <Button className="group" size="lg">
                  Start Creating
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Book A Production Demo
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
          eyebrow="Production Pillars"
          title="Coordinate Spectacular Experiences"
          description="Keep creative, technical, and operations teams aligned from concept through curtain call." 
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {productionPillars.map((pillar) => {
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
          title="Deliver Magic With Confidence"
          description="GHXSTSHIP centralizes the teams, assets, and analytics that make every production unforgettable." 
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {featureHighlights.map((feature) => (
            <MarketingCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={<Wand2 className="h-icon-md w-icon-md" />}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Proof"
          title="Productions Powered By GHXSTSHIP"
          description="See how entertainment innovators launch new worlds, season after season." 
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
          title="Link Your Entertainment Stack"
          description="Connect GHXSTSHIP with show control, design, audio, and interactive pipelines."
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

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Ready To Create Magic?"
          description="Partner with GHXSTSHIP to produce themed destinations and theatrical spectacles without friction."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/contact">
            <Button className="group" size="lg">
              Book A Production Demo
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="outline" size="lg">
              Start Creating
            </Button>
          </Link>
        </div>
      </MarketingSection>
    </div>
  );
}
