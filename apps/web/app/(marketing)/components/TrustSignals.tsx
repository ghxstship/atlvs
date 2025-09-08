'use client';

import { Badge } from '@ghxstship/ui';
import { Shield, Award, Users, Globe, Zap, CheckCircle } from 'lucide-react';

const trustBadges = [
  {
    icon: Shield,
    label: 'SOC 2 Type II',
    description: 'Certified',
  },
  {
    icon: Award,
    label: 'ISO 27001',
    description: 'Compliant',
  },
  {
    icon: CheckCircle,
    label: 'GDPR',
    description: 'Ready',
  },
  {
    icon: Zap,
    label: '99.9%',
    description: 'Uptime SLA',
  },
];

const clientLogos = [
  { name: 'Netflix', logo: '/logos/netflix.svg' },
  { name: 'Disney', logo: '/logos/disney.svg' },
  { name: 'Warner Bros', logo: '/logos/warner.svg' },
  { name: 'Universal', logo: '/logos/universal.svg' },
  { name: 'Sony Pictures', logo: '/logos/sony.svg' },
  { name: 'Paramount', logo: '/logos/paramount.svg' },
  { name: 'Apple', logo: '/logos/apple.svg' },
  { name: 'Amazon Studios', logo: '/logos/amazon.svg' },
];

const metrics = [
  {
    icon: Users,
    value: '500+',
    label: 'Enterprise Clients',
    description: 'Fortune 500 companies trust GHXSTSHIP',
  },
  {
    icon: Globe,
    value: '50+',
    label: 'Countries',
    description: 'Global reach across all continents',
  },
  {
    icon: CheckCircle,
    value: '100K+',
    label: 'Projects',
    description: 'Successfully completed productions',
  },
  {
    icon: Award,
    value: '98%',
    label: 'Satisfaction',
    description: 'Client satisfaction rating',
  },
];

export function TrustSignals() {
  return (
    <section className="py-16 bg-background border-b">
      <div className="container mx-auto px-4">
        {/* Trust Badges */}
        <div className="text-center mb-12">
          <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wide">
            TRUSTED BY INDUSTRY LEADERS
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.label} className="flex items-center gap-3 text-muted-foreground">
                  <Icon className="h-5 w-5" />
                  <div className="text-sm">
                    <span className="font-semibold text-foreground">{badge.label}</span>
                    <span className="ml-1">{badge.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Client Logos */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center opacity-60 hover:opacity-80 transition-opacity">
            {clientLogos.map((client) => (
              <div key={client.name} className="flex items-center justify-center">
                <div className="w-24 h-12 bg-muted/30 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    {client.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="font-title text-3xl font-bold text-foreground mb-2">
                  {metric.value}
                </div>
                <div className="font-semibold text-foreground mb-1">
                  {metric.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {metric.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Awards & Recognition */}
        <div className="mt-12 pt-12 border-t text-center">
          <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wide">
            AWARDS & RECOGNITION
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <Badge variant="outline" className="gap-2">
              <Award className="h-4 w-4" />
              Best Enterprise Software 2024
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Top Workplace Technology
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Shield className="h-4 w-4" />
              Security Excellence Award
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Globe className="h-4 w-4" />
              Global Innovation Leader
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
