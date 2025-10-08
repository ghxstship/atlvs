import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import { ArrowRight, Calendar, Flower, Heart, HeartPulse, Sparkles } from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid
} from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Health & Wellness Experiences | GHXSTSHIP',
  description:
    'Design transformative wellness retreats, mind-body programs, and community health events with GHXSTSHIP.'
};

const heroStats = [
  { label: 'Wellness Participants', value: '450K+' },
  { label: 'Programs Delivered', value: '2,800+' },
  { label: 'Average Satisfaction', value: '97%' },
  { label: 'Retention Increase', value: '42%' },
];

const wellnessPhases = [
  {
    title: 'Program Design',
    description: 'Curate mind-body schedules, practitioner rosters, and experiential agendas for every cohort.',
    icon: Flower
  },
  {
    title: 'Participant Journey',
    description: 'Coordinate intake forms, dietary preferences, and personalized itineraries.',
    icon: HeartPulse
  },
  {
    title: 'Onsite Operations',
    description: 'Manage session timing, facility logistics, and wellness staff communications in real time.',
    icon: Calendar
  },
  {
    title: 'Post-Event Continuity',
    description: 'Deliver follow-up content, habit trackers, and community support spaces.',
    icon: Sparkles
  },
];

const wellnessBenefits = [
  {
    title: 'Holistic Care Coordination',
    description: 'Connect medical teams, therapists, and wellness practitioners with shared insights.'
  },
  {
    title: 'Personalized Experiences',
    description: 'Segment participants, tailor modalities, and track outcomes across cohorts.'
  },
  {
    title: 'Operational Efficiency',
    description: 'Automate scheduling, staffing, and vendor workflows to keep retreats focused on healing.'
  },
  {
    title: 'Impact Measurement',
    description: 'Quantify biometric trends, retention, and NPS to demonstrate wellness ROI.'
  },
];

const caseStudies = [
  {
    company: 'Serenity Wellness Collective',
    project: 'Transformational Healing Retreat',
    challenge: 'Delivering a hybrid mind-body program for 500 participants across multiple modalities.',
    result: '60% faster planning · 35% uplift in retention · 20% higher lifetime value · 99% satisfaction',
    quote:
      'GHXSTSHIP gave us total clarity—nutritionists, yoga instructors, and medical advisors all worked from the same playbook.',
    author: 'Dr. Maya Patel, Founder'
  },
  {
    company: 'Vitality Health Network',
    project: 'Corporate Wellness Initiative',
    challenge: 'Scaling personalized wellness journeys for 5,000 employees across three continents.',
    result: '50% participation increase · 40% fewer admin hours · 18% drop in stress indicators · 92% NPS',
    quote:
      'We moved from spreadsheets to a living wellness command center. GHXSTSHIP keeps teams aligned and participants cared for.',
    author: 'Marcus Rodriguez, Director of Employee Wellbeing'
  },
];

const integrations = [
  'Wearable & Biometric Platforms',
  'Telehealth Providers',
  'Nutrition & Meal Planning Apps',
  'Fitness & Studio Booking Tools',
  'Mental Health Networks',
  'Community Engagement Apps',
  'Corporate HRIS Systems',
  'Insurance & Benefits Partners',
];

export default function HealthWellnessEventsPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Industry Solutions"
          title="Health & Wellness Experiences"
          highlight="Wellness"
          description="Design nurturing environments, coordinate practitioners, and measure outcomes with GHXSTSHIP."
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
                  Talk To Wellness Strategist
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
          title="Support Every Phase"
          description="Keep practitioners, participants, and partners aligned from intake to long-term follow-up."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {wellnessPhases.map((phase) => {
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
          title="Elevate Wellbeing Programs"
          description="Wellness leaders deliver personalized, measurable programs with GHXSTSHIP." 
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {wellnessBenefits.map((benefit) => (
            <MarketingCard key={benefit.title} title={benefit.title} description={benefit.description} icon={<Heart className="h-icon-md w-icon-md" />} />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Proof"
          title="Transformations In Practice"
          description="See how organizations craft restorative, high-impact wellness journeys." 
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
          title="Connect Your Wellness Ecosystem"
          description="Sync GHXSTSHIP with monitoring tools, telehealth partners, and corporate benefit platforms."
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
          title="Ready To Transform Lives?"
          description="Partner with GHXSTSHIP to create restorative experiences backed by data and human connection."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/contact">
            <Button className="group" size="lg">
              Schedule A Wellness Demo
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
