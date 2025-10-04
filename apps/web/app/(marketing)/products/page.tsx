import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle,
  Globe,
  Shield,
  ShoppingBag,
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
  title: 'Products - ATLVS & OPENDECK | GHXSTSHIP',
  description:
    'Discover ATLVS production management and OPENDECK marketplace — the complete enterprise platform for creative professionals.',
  openGraph: {
    title: 'Products - ATLVS & OPENDECK | GHXSTSHIP',
    description:
      'Discover ATLVS production management and OPENDECK marketplace — the complete enterprise platform for creative professionals.',
    url: 'https://ghxstship.com/products',
  },
};

const suiteStats = [
  { label: 'Projects Shipped', value: '100K+' },
  { label: 'Creative Pros', value: '25K+' },
  { label: 'Operational Lift', value: '40% faster' },
  { label: 'Customer Satisfaction', value: '98%' },
];

const products = [
  {
    id: 'atlvs',
    name: 'ATLVS',
    tagline: 'Production Management Reimagined',
    description:
      'Enterprise-grade planning, budgeting, and collaboration for crews delivering high-stakes productions around the globe.',
    longDescription:
      'ATLVS keeps every milestone, asset, and approval in lock-step. From forecasting to post, automation and AI insights keep productions on time, under budget, and fully documented.',
    features: [
      {
        icon: Calendar,
        label: 'Orchestrate Every Timeline',
        description: 'Drag-and-drop schedules, dependency tracking, and scenario planning across multi-location shoots.',
      },
      {
        icon: Users,
        label: 'Crew Collaboration',
        description: 'Real-time messaging, file sharing, and call sheets that update across devices instantly.',
      },
      {
        icon: BarChart3,
        label: 'Predictive Analytics',
        description: 'AI assistants highlight risk, forecast burn, and surface opportunities before they derail delivery.',
      },
      {
        icon: Shield,
        label: 'Enterprise Security',
        description: 'SOC 2 Type II controls, granular permissions, SSO, and full audit trails for compliance teams.',
      },
    ],
    benefits: [
      'Reduce production timelines by up to 40%',
      'Increase cross-team visibility and accountability',
      'Automate repetitive workflows and approvals',
      'Maintain compliance with enterprise security requirements',
    ],
    stats: [
      { label: 'Projects Managed', value: '75K+' },
      { label: 'Teams Activated', value: '12K+' },
      { label: 'Time Saved', value: '40%' },
      { label: 'Satisfaction', value: '98%' },
    ],
    href: '/products/atlvs',
    cta: 'Explore ATLVS',
  },
  {
    id: 'opendeck',
    name: 'OPENDECK',
    tagline: 'The Creative Marketplace',
    description:
      'Connect with verified talent, discover resources, and unlock the largest network tailored to production pros.',
    longDescription:
      "OPENDECK matches enterprises with creators, vendors, and specialty resources in seconds. Build rosters, negotiate contracts, and manage payouts without the usual chaos.",
    features: [
      {
        icon: ShoppingBag,
        label: 'Verified Talent Marketplace',
        description: 'Curated roster of crew, vendors, and specialists with ratings, reels, and availability in real time.',
      },
      {
        icon: Briefcase,
        label: 'Resource Library',
        description: 'Templates, assets, and contracts ready to deploy across campaigns and productions.',
      },
      {
        icon: Globe,
        label: 'Global Coverage',
        description: 'Source teams across 50+ countries with localized compliance and payments support.',
      },
      {
        icon: Zap,
        label: 'Instant Matching',
        description: 'AI recommendations pair opportunities with best-fit talent, speeding hiring cycles by 90%.',
      },
    ],
    benefits: [
      'Access 25K+ vetted creative professionals',
      'Spin up project teams in hours, not weeks',
      'Centralize contracts, invoicing, and payouts',
      'Track marketplace ROI with unified dashboards',
    ],
    stats: [
      { label: 'Talent Pool', value: '25K+' },
      { label: 'Projects Listed', value: '50K+' },
      { label: 'Match Speed', value: '90% faster' },
      { label: 'Success Rate', value: '94%' },
    ],
    href: '/products/opendeck',
    cta: 'Explore OPENDECK',
  },
];

const suiteHighlights = [
  {
    title: 'Unified Intelligence',
    description: 'Analytics and reporting across ATLVS and OPENDECK surface cross-platform KPIs in one command center.',
    icon: BarChart3,
  },
  {
    title: 'Enterprise Rollout',
    description: 'Implementation playbooks, training, and success programs ensure every region launches with confidence.',
    icon: Globe,
  },
  {
    title: 'E2E Automation',
    description: 'Trigger hiring workflows from production milestones, sync budgets, and automate notifications in one ecosystem.',
    icon: Zap,
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="The GHXSTSHIP Suite"
          title="ATLVS + OPENDECK"
          highlight="GHXSTSHIP"
          description="Two products built to operate together. Plan, produce, and staff every campaign with automation, insights, and a verified talent network."
          actions={
            <>
              <Link href="/products/compare">
                <Button className="group" size="lg">
                  Compare Platforms
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" size="lg">
                  Start Free Trial
                </Button>
              </Link>
            </>
          }
        />
        <div className="mt-2xl">
          <MarketingStatGrid items={suiteStats} />
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Product Deep Dive"
          title="Choose The Track That Matches Your Workflow"
          description="Each platform delivers standalone value, while integration between ATLVS and OPENDECK unlocks end-to-end efficiency."
        />

        <div className="mt-2xl space-y-2xl">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="grid gap-2xl lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start"
            >
              <Card className="rounded-3xl border border-border/40 bg-background/95 shadow-sm">
                <CardContent className="space-y-xl p-xl">
                  <div className="flex flex-wrap items-center gap-md">
                    <Badge variant="outline" className="uppercase tracking-[0.2em]">
                      {product.tagline}
                    </Badge>
                    <h2 className="text-heading-2 uppercase leading-tight">{product.name}</h2>
                  </div>
                  <p className="text-body text-muted-foreground leading-relaxed">{product.description}</p>
                  <p className="text-body-sm text-muted-foreground leading-relaxed">{product.longDescription}</p>

                  <div className="grid gap-lg md:grid-cols-2">
                    {product.features.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div key={feature.label} className="flex items-start gap-md">
                          <div className="inline-flex h-icon-xl w-icon-xl items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Icon className="h-icon-md w-icon-md" />
                          </div>
                          <div className="space-y-xs">
                            <span className="text-body font-medium text-foreground">{feature.label}</span>
                            <p className="text-body-sm text-muted-foreground leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-sm rounded-2xl bg-muted/30 p-lg">
                    <span className="text-body-xs uppercase tracking-[0.2em] text-muted-foreground">Why teams choose {product.name}</span>
                    <ul className="space-y-xs text-body-sm text-muted-foreground">
                      {product.benefits.map((benefit) => (
                        <li key={benefit} className="inline-flex items-center gap-xs">
                          <CheckCircle className="h-icon-2xs w-icon-2xs text-success" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-sm">
                    <Link href={product.href}>
                      <Button className="group">
                        {product.cta}
                        <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button variant="outline">Start Free Trial</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-border/40 bg-background/85 shadow-sm">
                <CardContent className="space-y-lg p-xl">
                  <h3 className="text-heading-4 uppercase leading-tight">{product.name} by the numbers</h3>
                  <div className="grid gap-lg sm:grid-cols-2">
                    {product.stats.map((stat) => (
                      <div key={stat.label} className="rounded-2xl bg-muted/20 p-lg text-center">
                        <div className="text-heading-3 text-foreground">{stat.value}</div>
                        <p className="text-body-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Why Pair ATLVS + OPENDECK"
          title="Stronger Together"
          description="Activate the full GHXSTSHIP ecosystem with shared data, unified permissions, and automation across both platforms."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {suiteHighlights.map((item) => {
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

      <MarketingSection variant="primaryGradient" padding="lg">
        <MarketingSectionHeader
          title="Launch Your Suite"
          description="Bundle ATLVS and OPENDECK to orchestrate productions end-to-end with unified data, automation, and talent at your fingertips."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/products/compare">
            <Button className="group" size="lg">
              Compare Plans
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="outline" size="lg">
              Talk To Sales
            </Button>
          </Link>
        </div>
      </MarketingSection>
    </div>
  );
}
