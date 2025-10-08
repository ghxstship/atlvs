import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import { ArrowRight, Calendar, Clock, DollarSign, Globe, Heart, Target, TrendingUp, Users, Zap } from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid
} from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Community Impact - Making a Difference Together | GHXSTSHIP',
  description:
    'See how our community of 25,000+ creative professionals is driving positive change, creating opportunities, and building the future of creative industries.',
  openGraph: {
    title: 'Community Impact - Making a Difference Together | GHXSTSHIP',
    description:
      'See how our community of 25,000+ creative professionals is driving positive change, creating opportunities, and building the future of creative industries.',
    url: 'https://ghxstship.com/community/impact'
  }
};

const impactMetrics = [
  {
    title: 'Economic Impact',
    value: '$2.8B',
    description: 'Total project value created through community collaborations',
    icon: DollarSign,
    trend: '+24% YoY'
  },
  {
    title: 'Jobs Created',
    value: '15,400',
    description: 'New positions generated for creative professionals worldwide',
    icon: Users,
    trend: '+18% YoY'
  },
  {
    title: 'Global Reach',
    value: '120+',
    description: 'Countries where community members delivered projects',
    icon: Globe,
    trend: '+12% YoY'
  },
  {
    title: 'Hours Saved',
    value: '890K',
    description: 'Collective hours saved through shared workflows & tooling',
    icon: Clock,
    trend: '+31% YoY'
  },
];

const impactStories = [
  {
    title: 'From Local Theater to Global Production',
    story:
      "Maria leveraged the community network to land her first international film project, creating 47 jobs and $3.2M in new local revenue.",
    author: 'Maria Gonzalez',
    location: 'Buenos Aires, Argentina',
    impact: '$3.2M economic impact',
    category: 'Career Growth'
  },
  {
    title: 'Mentorship that Launches Careers',
    story:
      'The GHXSTSHIP mentorship program guided 234 emerging creatives into full-time production roles with industry-leading teams.',
    author: 'David Park',
    location: 'Seoul, South Korea',
    impact: '234 careers launched',
    category: 'Education'
  },
  {
    title: 'Sustainable Production Standards',
    story:
      'Community-developed green production guidelines helped more than 150 productions reduce carbon emissions by 40%.',
    author: 'Environmental Working Group',
    location: 'Global Initiative',
    impact: '40% emissions reduction',
    category: 'Sustainability'
  },
];

const communityInitiatives = [
  {
    title: 'Creative Careers Program',
    description: 'Structured mentorship and training pathways for underrepresented talent entering creative industries.',
    participants: '1,247 participants',
    success: '78% placement rate',
    icon: Users,
    status: 'Active'
  },
  {
    title: 'Green Production Standards',
    description: 'Industry-wide guidelines that help teams produce sustainably without sacrificing craftsmanship.',
    participants: '3,456 members',
    success: '150+ certified projects',
    icon: Target,
    status: 'Active'
  },
  {
    title: 'Global Collaboration Network',
    description: 'Cross-border partnerships that connect talent, studios, and brands in 47 countries.',
    participants: '8,932 creatives',
    success: '47 countries represented',
    icon: Globe,
    status: 'Active'
  },
  {
    title: 'Innovation Lab',
    description: 'Experimenting with volumetric capture, AI pre-visualization, and real-time production workflows.',
    participants: '567 innovators',
    success: '23 patents filed',
    icon: Zap,
    status: 'Beta'
  },
];

const regionalImpact = [
  { region: 'North America', projects: 892, jobs: 5420, value: '$1.2B', communities: 156 },
  { region: 'Europe', projects: 634, jobs: 3890, value: '$890M', communities: 98 },
  { region: 'Asia Pacific', projects: 723, jobs: 4120, value: '$950M', communities: 134 },
  { region: 'Latin America', projects: 456, jobs: 2120, value: '$420M', communities: 67 },
  { region: 'Africa & Middle East', projects: 234, jobs: 980, value: '$180M', communities: 45 },
];

export default function ImpactPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Community Impact"
          title="Creativity With Purpose"
          highlight="Purpose"
          description="Our community of 25,000+ creative professionals is building a better industry, creating opportunities, and driving measurable change across the globe."
          actions={
            <>
              <Link href="/community/opportunities">
                <Button className="group">
                  Get Involved
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                </Button>
              </Link>
              <Button variant="outline">Download Impact Report</Button>
            </>
          }
        />
        <div className="mt-2xl grid gap-xl sm:grid-cols-2 lg:grid-cols-4">
          {impactMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title} className="rounded-2xl border border-border bg-card p-lg text-center shadow-sm transition hover:-translate-y-1 motion-reduce:hover:translate-y-0 hover:shadow-elevation-4">
                <div className="mx-auto mb-lg flex h-icon-2xl w-icon-2xl items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-icon-lg w-icon-lg" />
                </div>
                <div className="text-4xl font-semibold tracking-tight text-foreground">{metric.value}</div>
                <div className="mt-xs text-body font-medium text-muted-foreground">{metric.title}</div>
                <p className="mt-sm text-body-sm text-muted-foreground">{metric.description}</p>
                <Badge variant="outline" className="mt-md inline-flex items-center gap-xs text-body-xs uppercase tracking-[0.2em]">
                  <TrendingUp className="h-icon-2xs w-icon-2xs" />
                  {metric.trend}
                </Badge>
              </Card>
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Impact Stories"
          title="Transformation Powered By Community"
          description="First-hand accounts from members who turned collaboration, mentorship, and shared resources into meaningful outcomes."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {impactStories.map((story) => (
            <MarketingCard
              key={story.title}
              title={story.title}
              description={`"${story.story}"`}
              highlight={story.impact}
              footer={
                <div className="flex items-center justify-between text-body-sm text-muted-foreground">
                  <span>{story.author}</span>
                  <span>{story.location}</span>
                </div>
              }
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Active Initiatives"
          title="Programs Driving Industry Progress"
          description="Collaborative initiatives that expand access, improve sustainability, and accelerate innovation across production."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {communityInitiatives.map((initiative) => {
            const Icon = initiative.icon;
            return (
              <MarketingCard
                key={initiative.title}
                title={initiative.title}
                description={initiative.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
                footer={
                  <div className="flex items-center justify-between text-body-sm text-muted-foreground">
                    <span>{initiative.participants}</span>
                    <Badge variant="outline">{initiative.status}</Badge>
                  </div>
                }
                highlight={initiative.success}
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Global Reach"
          title="Impact Across Every Region"
          description="GHXSTSHIP projects span five continents, lifting local economies, creating jobs, and connecting creatives to global opportunities."
        />

        <Card className="mt-2xl overflow-hidden border border-border bg-card shadow-sm">
          <CardContent className="p-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-border text-body-sm uppercase tracking-[0.18em] text-muted-foreground">
                    <th className="py-sm pr-md font-medium">Region</th>
                    <th className="py-sm pr-md font-medium">Projects</th>
                    <th className="py-sm pr-md font-medium">Jobs Created</th>
                    <th className="py-sm pr-md font-medium">Economic Value</th>
                    <th className="py-sm font-medium">Communities</th>
                  </tr>
                </thead>
                <tbody>
                  {regionalImpact.map((region) => (
                    <tr key={region.region} className="border-b border-border text-body">
                      <td className="py-md pr-md font-medium text-foreground">{region.region}</td>
                      <td className="py-md pr-md text-muted-foreground">{region.projects.toLocaleString()}</td>
                      <td className="py-md pr-md text-muted-foreground">{region.jobs.toLocaleString()}</td>
                      <td className="py-md pr-md font-medium text-success">{region.value}</td>
                      <td className="py-md text-muted-foreground">{region.communities}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Set Impactful Goals With Us"
          description="We are scaling programs that open doors for talent, elevate sustainable practices, and expand creative economies. Join us to build what’s next."
          align="center"
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          <MarketingCard
            title="30,000 New Careers"
            description="Extend mentorship, training, and apprenticeship programs to launch 30,000 creative careers by 2025."
            icon={<Users className="h-icon-md w-icon-md" />}
            footer={<span className="text-body-sm text-muted-foreground">Current progress: 15,400</span>}
          />
          <MarketingCard
            title="$5B Economic Value"
            description="Empower community-led projects to generate $5B in value through co-productions and partnerships."
            icon={<DollarSign className="h-icon-md w-icon-md" />}
            footer={<span className="text-body-sm text-muted-foreground">Current progress: $2.8B</span>}
          />
          <MarketingCard
            title="150 Countries"
            description="Expand GHXSTSHIP’s reach to creatives in 150 countries with localized programming and resources."
            icon={<Globe className="h-icon-md w-icon-md" />}
            footer={<span className="text-body-sm text-muted-foreground">Current reach: 120+</span>}
          />
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          title="Join The Impact"
          description="Be part of a community that advances creativity, opportunity, and sustainable growth for talent everywhere."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/community/opportunities">
            <Button className="group">
              Get Involved
              <Heart className="ml-sm h-icon-xs w-icon-xs" />
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="outline">Join GHXSTSHIP</Button>
          </Link>
        </div>
      </MarketingSection>
    </div>
  );
}
