'use client';


import { Badge } from '@ghxstship/ui';
import { Shield, Award, Users, Globe, Zap, CheckCircle } from 'lucide-react';

interface TrustBadge {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

interface ClientLogo {
  name: string;
  logo: string;
}

interface Metric {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  description: string;
}

const trustBadges: TrustBadge[] = [
  {
    icon: Shield,
    label: 'SOC 2 Type II',
    description: 'Certified'
  },
  {
    icon: Award,
    label: 'ISO 27001',
    description: 'Compliant'
  },
  {
    icon: CheckCircle,
    label: 'GDPR',
    description: 'Ready'
  },
  {
    icon: Zap,
    label: '99.9%',
    description: 'Uptime SLA'
  },
];

const clientLogos: ClientLogo[] = [
  { name: 'Netflix', logo: '/logos/netflix.svg' },
  { name: 'Disney', logo: '/logos/disney.svg' },
  { name: 'Warner Bros', logo: '/logos/warner.svg' },
  { name: 'Universal', logo: '/logos/universal.svg' },
  { name: 'Sony Pictures', logo: '/logos/sony.svg' },
  { name: 'Paramount', logo: '/logos/paramount.svg' },
  { name: 'Apple', logo: '/logos/apple.svg' },
  { name: 'Amazon Studios', logo: '/logos/amazon.svg' },
];

const metrics: Metric[] = [
  {
    icon: Users,
    value: '500+',
    label: 'Enterprise Clients',
    description: 'Fortune 500 companies trust GHXSTSHIP'
  },
  {
    icon: Globe,
    value: '50+',
    label: 'Countries',
    description: 'Global reach across all continents'
  },
  {
    icon: CheckCircle,
    value: '100K+',
    label: 'Projects',
    description: 'Successfully completed productions'
  },
  {
    icon: Award,
    value: '98%',
    label: 'Satisfaction',
    description: 'Client satisfaction rating'
  },
];

export function TrustSignals() {
  return (
    <section className="py-mdxl bg-background border-b">
      <div className="container mx-auto px-lg">
        {/* Trust Badges */}
        <div className="text-center mb-lg">
          <p className="text-body-sm color-muted mb-md uppercase tracking-wide">
            TRUSTED BY INDUSTRY LEADERS
          </p>
          <div className="flex flex-wrap justify-center items-center gap-xl">
            {trustBadges.map((badge: TrustBadge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.label} className="flex items-center gap-xl color-muted">
                  <Icon className="h-icon-sm w-icon-sm" />
                  <span className="text-body-sm">
                    <span className="text-heading-4 color-foreground">{badge.label}</span>
                    <span className="ml-xs">{badge.description}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Client Logos */}
        <div className="mb-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-xl items-center opacity-60 hover:opacity-80 transition-opacity">
            {clientLogos.map((client: ClientLogo) => (
              <div key={client.name} className="flex items-center justify-center">
                <div className="w-component-lg h-icon-2xl bg-secondary/30 rounded-lg flex items-center justify-center">
                  <span className="text-body-sm form-label color-muted">
                    {client.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-xl">
          {metrics.map((metric: Metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="text-center">
                <div className="inline-flex items-center justify-center w-icon-2xl h-icon-2xl rounded-full bg-accent color-accent-foreground mb-sm">
                  <Icon className="h-icon-md w-icon-md color-accent" />
                </div>
                <div className="font-title text-heading-2 text-heading-3 color-foreground mb-xs">
                  {metric.value}
                </div>
                <div className="text-heading-4 color-foreground mb-xs">
                  {metric.label}
                </div>
                <div className="text-body-sm color-muted">
                  {metric.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Awards & Recognition */}
        <div className="mt-lg pt-2xl border-t text-center">
          <p className="text-body-sm color-muted mb-md uppercase tracking-wide">
            AWARDS & RECOGNITION
          </p>
          <div className="flex flex-wrap justify-center items-center gap-xl text-body-sm color-muted">
            <Badge variant="secondary" className="gap-xl">
              <Award className="h-icon-xs w-icon-xs" />
              Best Enterprise Software 2024
            </Badge>
            <Badge variant="secondary" className="gap-xl">
              <Users className="h-icon-xs w-icon-xs" />
              Top Workplace Technology
            </Badge>
            <Badge variant="secondary" className="gap-xl">
              <Shield className="h-icon-xs w-icon-xs" />
              Security Excellence Award
            </Badge>
            <Badge variant="secondary" className="gap-xl">
              <Globe className="h-icon-xs w-icon-xs" />
              Global Innovation Leader
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
