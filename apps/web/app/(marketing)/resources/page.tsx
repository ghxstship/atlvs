import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Calendar,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Lightbulb,
  Users,
  Zap,
} from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid,
} from '../../_components/marketing';

export const metadata: Metadata = {
  title: 'Resource Library | GHXSTSHIP',
  description:
    'Guides, templates, case studies, and playbooks to help creative teams ship production work with GHXSTSHIP.',
  openGraph: {
    title: 'Resource Library | GHXSTSHIP',
    description:
      'Guides, templates, case studies, and playbooks to help creative teams ship production work with GHXSTSHIP.',
    url: 'https://ghxstship.com/resources',
  },
};

const resourceStats = [
  { label: 'Assets Available', value: '180+' },
  { label: 'Fresh Drops / Quarter', value: '35' },
  { label: 'On-Demand Webinars', value: '22' },
  { label: 'Templates Downloaded', value: '95K+' },
];

const resourceCategories = [
  {
    title: 'Playbooks',
    description: 'Step-by-step guides covering production workflows, crew ops, and budget management.',
    count: 42,
    icon: ClipboardCheck,
  },
  {
    title: 'Templates',
    description: 'Ready-to-use spreadsheets, call sheets, and planning documents tailored for ATLVS.',
    count: 56,
    icon: FileText,
  },
  {
    title: 'Webinars',
    description: 'Monthly sessions with industry experts and GHXSTSHIP strategists.',
    count: 18,
    icon: GraduationCap,
  },
  {
    title: 'Case Studies',
    description: 'Deep dives into productions using GHXSTSHIP to deliver at scale.',
    count: 24,
    icon: Briefcase,
  },
  {
    title: 'Product Updates',
    description: 'Release notes, roadmap previews, and platform changelog summaries.',
    count: 20,
    icon: Lightbulb,
  },
  {
    title: 'Events',
    description: 'Summits, partner showcases, and office hours—live and on-demand.',
    count: 15,
    icon: Calendar,
  },
];

const featuredResources = [
  {
    title: 'ATLVS Production Ops Playbook',
    category: 'Playbook',
    description: 'A 60-page blueprint for structuring enterprise production teams with automation and analytics.',
    readTime: '45 min read',
    type: 'Premium',
  },
  {
    title: 'OPENDECK Talent Pipeline Template',
    category: 'Template',
    description: 'Build and track creator rosters, availability, and contract status in one dynamic sheet.',
    readTime: 'Google Sheet',
    type: 'Download',
  },
  {
    title: 'Live Ops With GHXSTSHIP & Meridian Studios',
    category: 'Webinar',
    description: 'Hear how Meridian delivered a multi-market campaign with 30% faster turnaround.',
    readTime: '30 min video',
    type: 'On-Demand',
  },
];

const learningTracks = [
  {
    title: 'New To GHXSTSHIP',
    description: 'Ramp up in under a week with onboarding checklists, role-based tutorials, and go-live templates.',
    icon: BookOpen,
  },
  {
    title: 'Scaling Operations',
    description: 'Advanced automation, resource planning, and KPI dashboards for production leads.',
    icon: Users,
  },
  {
    title: 'Executive Insights',
    description: 'Board-ready reporting packs, ROI calculators, and compliance briefs for leadership.',
    icon: Briefcase,
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Resource Library"
          title="Ship Smarter With GHXSTSHIP"
          highlight="GHXSTSHIP"
          description="Explore playbooks, templates, and stories from crews shipping the world’s most ambitious productions."
          actions={
            <Link href="#featured">
              <Button className="group" size="lg">
                Browse Featured Resources
                <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
              </Button>
            </Link>
          }
        />
        <div className="mt-2xl">
          <MarketingStatGrid items={resourceStats} />
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Categories"
          title="Explore By Focus Area"
          description="Quickly find the playbooks, templates, and events that match your current mission."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-3">
          {resourceCategories.map((category) => {
            const Icon = category.icon;
            return (
              <MarketingCard
                key={category.title}
                title={category.title}
                description={category.description}
                highlight={`${category.count} resources`}
                icon={<Icon className="h-icon-md w-icon-md" />}
                footer={
                  <Link href="#featured" className="text-body-sm text-primary underline">
                    Explore {category.title}
                  </Link>
                }
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted" id="featured">
        <MarketingSectionHeader
          eyebrow="Featured"
          title="Start Here"
          description="Curated assets delivering the highest impact for production, operations, and leadership teams."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {featuredResources.map((resource) => (
            <Card key={resource.title} className="border border-border bg-card shadow-sm">
              <CardContent className="flex h-full flex-col gap-md p-xl">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{resource.category}</Badge>
                  <Badge variant={resource.type === 'Premium' ? 'default' : 'secondary'}>{resource.type}</Badge>
                </div>
                <div className="space-y-sm">
                  <h3 className="text-heading-4 uppercase leading-tight">{resource.title}</h3>
                  <p className="text-body-sm text-muted-foreground leading-relaxed">{resource.description}</p>
                </div>
                <div className="mt-auto flex items-center justify-between text-body-sm text-muted-foreground">
                  <span>{resource.readTime}</span>
                  <Button variant="ghost" size="sm" className="group px-sm">
                    {resource.type === 'Premium' ? 'Unlock' : 'Open'}
                    <ArrowRight className="ml-xxs h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Learning Paths"
          title="Guided Journeys"
          description="Focus on the skills and playbooks that map to your role and responsibilities."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {learningTracks.map((track) => {
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

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Unlock The Full Library"
          description="Access every template, guide, and webinar with a free 14-day trial of GHXSTSHIP."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/auth/signup">
            <Button className="group" size="lg">
              Start Free Trial
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
        <div className="mt-xl text-body-sm text-muted-foreground text-center">
          No credit card required. Cancel anytime during the trial period.
        </div>
      </MarketingSection>
    </div>
  );
}
