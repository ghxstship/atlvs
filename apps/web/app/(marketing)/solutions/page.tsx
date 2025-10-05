import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import {
  ArrowRight,
  BarChart3,
  Building,
  Film,
  Globe,
  Megaphone,
  Music,
  Target,
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
  title: 'Industry Solutions | GHXSTSHIP',
  description:
    'Discover how GHXSTSHIP powers film & TV, advertising, live events, and corporate production teams with tailored workflows.',
  openGraph: {
    title: 'Industry Solutions | GHXSTSHIP',
    description:
      'Discover how GHXSTSHIP powers film & TV, advertising, live events, and corporate production teams with tailored workflows.',
    url: 'https://ghxstship.com/solutions',
  },
};

const solutionStats = [
  { label: 'Productions Managed', value: '120K+' },
  { label: 'Average Time Saved', value: '45%' },
  { label: 'Vendors & Talent', value: '25K+' },
  { label: 'Global Markets', value: '50+' },
];

const industries = [
  {
    id: 'film-tv',
    icon: Film,
    title: 'Film & TV',
    tagline: 'Orchestrate multi-location shoots with confidence.',
    description:
      'Crew coordination, asset approvals, and budget tracking built for productions that can’t afford delays.',
    href: '/solutions/film-tv',
    stats: { projects: '15K+', savings: '45%', satisfaction: '99%', clients: '500+' },
  },
  {
    id: 'advertising',
    icon: Megaphone,
    title: 'Advertising',
    tagline: 'Ship campaigns on time across every channel.',
    description:
      'Creative approvals, client collaboration, and media planning in one workflow.',
    href: '/solutions/advertising',
    stats: { projects: '25K+', savings: '35%', satisfaction: '97%', clients: '750+' },
  },
  {
    id: 'music-events',
    icon: Music,
    title: 'Live Events',
    tagline: 'Keep festivals, tours, and broadcasts running on schedule.',
    description:
      'Vendor management, run-of-show logistics, and real-time monitoring built for live ops.',
    href: '/solutions/music-events',
    stats: { projects: '8K+', savings: '40%', satisfaction: '98%', clients: '300+' },
  },
  {
    id: 'corporate',
    icon: Building,
    title: 'Corporate Content',
    tagline: 'Enterprise-ready workflows for internal production teams.',
    description:
      'Compliance, translations, and distribution workflows designed for global enterprises.',
    href: '/solutions/corporate',
    stats: { projects: '35K+', savings: '50%', satisfaction: '98%', clients: '1K+' },
  },
];

const commonFeatures = [
  {
    title: 'Team Collaboration',
    description: 'Real-time chat, shared calendars, and asset reviews keep crews aligned across time zones.',
    icon: Users,
  },
  {
    title: 'Analytics & Forecasting',
    description: 'Dashboards, burn-down charts, and predictive alerts surface bottlenecks before they hit.',
    icon: BarChart3,
  },
  {
    title: 'Automation',
    description: 'Trigger workflows from milestones, auto-assign tasks, and sync with finance tools.',
    icon: Zap,
  },
  {
    title: 'Global Coordination',
    description: 'Localization, regional compliance, and vendor sourcing support productions worldwide.',
    icon: Globe,
  },
];

const integrationVendors = ['Slack', 'Adobe CC', 'Google Workspace', 'Microsoft 365'];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Industry Solutions"
          title="Built For High-Stakes Productions"
          highlight="High-Stakes"
          description="GHXSTSHIP adapts to the way film crews, agencies, event teams, and enterprises produce work—with workflows tuned to each industry."
          actions={
            <Link href="/solutions/film-tv">
              <Button className="group" size="lg">
                Explore Film & TV
                <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
              </Button>
            </Link>
          }
        />
        <div className="mt-2xl">
          <MarketingStatGrid items={solutionStats} />
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Industries"
          title="Tailored For Your Mission"
          description="Choose the solution that matches your production complexity, team structure, and compliance requirements."
        />

        <div className="mt-2xl space-y-2xl">
          {industries.map((industry, index) => {
            const Icon = industry.icon;
            return (
              <div
                key={industry.id}
                className={`grid gap-2xl lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start ${index % 2 === 1 ? 'lg:[&>*:first-child]:order-last' : ''}`}
              >
                <Card className="rounded-3xl border border-border bg-card shadow-sm">
                  <CardContent className="space-y-xl p-xl">
                    <div className="flex flex-wrap items-center gap-md">
                      <div className="inline-flex h-icon-xl w-icon-xl items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-icon-md w-icon-md" />
                      </div>
                      <div>
                        <Badge variant="outline" className="uppercase tracking-[0.2em]">
                          {industry.title}
                        </Badge>
                        <h3 className="mt-xs text-heading-3 uppercase leading-tight">{industry.tagline}</h3>
                      </div>
                    </div>
                    <p className="text-body text-muted-foreground leading-relaxed">{industry.description}</p>
                    <div className="grid gap-md md:grid-cols-2">
                      <MarketingCard
                        title="Projects"
                        description={industry.stats.projects}
                        icon={<Target className="h-icon-md w-icon-md" />}
                      />
                      <MarketingCard
                        title="Time Saved"
                        description={industry.stats.savings}
                        icon={<Zap className="h-icon-md w-icon-md" />}
                      />
                      <MarketingCard
                        title="Satisfaction"
                        description={industry.stats.satisfaction}
                        icon={<Users className="h-icon-md w-icon-md" />}
                      />
                      <MarketingCard
                        title="Clients"
                        description={industry.stats.clients}
                        icon={<Globe className="h-icon-md w-icon-md" />}
                      />
                    </div>
                    <Link href={industry.href}>
                      <Button className="group">
                        View {industry.title} Solution
                        <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border border-border bg-card shadow-sm">
                  <CardContent className="space-y-lg p-xl">
                    <h4 className="text-heading-4 uppercase leading-tight">What Teams Achieve</h4>
                    <p className="text-body-sm text-muted-foreground leading-relaxed">
                      Explore case studies, playbooks, and metrics from organizations operating in {industry.title}.
                    </p>
                    <Button variant="outline">Download Industry Brief</Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Shared Power"
          title="Across Every Industry"
          description="No matter the production, these features keep budgets tight, teams aligned, and stakeholders informed."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {commonFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <MarketingCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Integrations"
          title="Works With Your Current Stack"
          description="Over 100 integrations connect GHXSTSHIP to creative suites, communication tools, and finance systems."
        />

        <Card className="mx-auto mt-2xl max-w-4xl border border-border bg-card shadow-sm">
          <CardContent className="space-y-xl p-xl text-center">
            <div className="grid grid-cols-2 gap-md md:grid-cols-4">
              {integrationVendors.map((vendor) => (
                <div key={vendor} className="rounded-xl border border-border bg-muted px-lg py-md text-body-sm text-muted-foreground">
                  {vendor}
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-center gap-md sm:flex-row">
              <Link href="/resources/integrations">
                <Button variant="outline">View All Integrations</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="group">
                  Start Free Trial
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Ready To Tailor GHXSTSHIP To Your Team?"
          description="Tell us about your productions and we’ll map the workflows, automations, and integrations that deliver impact fast."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/contact">
            <Button className="group" size="lg">
              Talk To Solutions Team
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
