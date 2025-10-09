import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import { ArrowRight, Building, Globe, Layers, Orbit, PlayCircle, Sparkles, Users, Zap } from "lucide-react";

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid
} from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Immersive Experiences | GHXSTSHIP',
  description:
    'Build XR installations, interactive exhibits, and immersive brand worlds with GHXSTSHIP’s production workflows.'
};

const heroStats = [
  { label: 'Immersive Launches', value: '1,200+' },
  { label: 'Audience Reach', value: '48M+' },
  { label: 'XR Platforms Supported', value: '25+' },
  { label: 'Production Speed Increase', value: '38%' },
];

const experiencePhases = [
  {
    title: 'Concept & Story Design',
    description: 'Narrative development, moodboarding, and experience mapping with cross-disciplinary teams.',
    icon: Sparkles
  },
  {
    title: 'Build & Integration',
    description: 'Coordinate 3D assets, interactive logic, and real-time engines across vendors.',
    icon: Layers
  },
  {
    title: 'Deployment & Operations',
    description: 'Manage environment installs, QA runs, and live operations across physical and digital venues.',
    icon: Globe
  },
  {
    title: 'Analytics & Lifecycles',
    description: 'Capture engagement metrics, iterate on content, and plan season-two enhancements.',
    icon: Orbit
  },
];

const immersiveBenefits = [
  {
    title: 'Cross-Reality Collaboration',
    description: 'Sync creative studios, technologists, and spatial sound designers with shared milestones.'
  },
  {
    title: 'Asset Governance',
    description: 'Version control for 3D assets, shaders, and spatial audio to keep builds consistent.'
  },
  {
    title: 'Operational Excellence',
    description: 'Automate checklists, safety reviews, and venue readiness for immersive activations.'
  },
  {
    title: 'Audience Intelligence',
    description: 'Track dwell time, interaction paths, and sentiment to optimize future experiences.'
  },
];

const caseStudies = [
  {
    company: 'Nova Immersive Studio',
    project: 'XR Brand World Launch',
    challenge: 'Delivering a persistent XR environment across VR headsets, mobile AR, and flagship stores.',
    result: '45% faster build cycles · 60% lift in engagement · 4.8/5 audience rating · Global simultaneous launch',
    quote:
      'GHXSTSHIP unified our creative and technical teams. We launched an ambitious XR world without missing a beat.',
    author: 'Elisa Park, Executive Producer'
  },
  {
    company: 'Spectrum Museums',
    project: 'Interactive History Exhibit',
    challenge: 'Building a multi-room immersive exhibit with projection mapping, motion tracking, and archival storytelling.',
    result: '30% reduced production risk · 55% more visitor dwell time · 90% positive sentiment',
    quote:
      'Every discipline had clarity. GHXSTSHIP kept artifacts, media, and tech vendors synchronized perfectly.',
    author: 'Marcus Lewis, Director of Innovation'
  },
];

const integrations = [
  'Unreal Engine',
  'Unity',
  'TouchDesigner',
  'Disguise',
  'Notch',
  'Blender & Maya',
  'Spatial Audio Suites',
  'IoT Sensor Networks',
];

export default function ImmersiveExperiencesPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Industry Solutions"
          title="Immersive Experiences"
          highlight="Immersive"
          description="Orchestrate the teams, assets, and technology needed to build unforgettable immersive worlds."
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
                  Talk To Immersive Lead
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
          title="From Spark To Launch"
          description="Keep creative, technical, and operational teams aligned across the entire immersive lifecycle."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {experiencePhases.map((phase) => {
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
          title="Build With Confidence"
          description="Immersive studios rely on GHXSTSHIP to coordinate complex builds with fewer surprises." 
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {immersiveBenefits.map((benefit) => (
            <MarketingCard key={benefit.title} title={benefit.title} description={benefit.description} icon={<Users className="h-icon-md w-icon-md" />} />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Proof"
          title="Worlds Powered By GHXSTSHIP"
          description="See how innovators bring immersive concepts to life on time and on budget." 
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
          title="Connect Your Immersive Stack"
          description="Sync GHXSTSHIP with engines, design tools, and hardware networks powering your experiences."
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
          title="Ready To Shape What’s Next?"
          description="Partner with GHXSTSHIP to orchestrate immersive experiences that inspire and endure."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/contact">
            <Button className="group" size="lg">
              Book An Immersive Session
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
