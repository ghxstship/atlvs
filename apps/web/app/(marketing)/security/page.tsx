import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import { AlertTriangle, ArrowRight, Database, Eye, FileCheck, Lock, Server, Shield, Users } from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid
} from '../../_components/marketing';

export const metadata: Metadata = {
  title: 'Security & Trust | GHXSTSHIP',
  description: 'See how GHXSTSHIP protects customer data with enterprise-grade security, compliance, and incident response.'
};

const securityStats = [
  { label: 'Uptime SLA', value: '99.9%' },
  { label: 'Security Reviews / Year', value: '12' },
  { label: 'Dedicated Security Engineers', value: '18' },
  { label: 'Average Response Time', value: '< 1 hr' },
];

const securityPillars = [
  {
    title: 'Enterprise-Grade Security',
    description: 'SOC 2 Type II controls, ISO 27001 alignment, and 24/7 monitoring across every environment.',
    icon: Shield
  },
  {
    title: 'Defense In Depth',
    description: 'Network segmentation, vulnerability scanning, and hardened infrastructure in every region.',
    icon: Server
  },
  {
    title: 'Privacy By Design',
    description: 'GDPR, CCPA, and regional privacy programs embedded in product development.',
    icon: Users
  },
  {
    title: 'Transparent Operations',
    description: 'Detailed audit logging, real-time status page, and incident communications within SLA.',
    icon: Eye
  },
];

const complianceHighlights = [
  {
    title: 'SOC 2 Type II',
    description: 'Independently audited controls for security, availability, confidentiality, and processing integrity.'
  },
  {
    title: 'ISO 27001',
    description: 'Certified information security management system with annual third-party audits.'
  },
  {
    title: 'GDPR & CCPA',
    description: 'Global privacy compliance with data processing agreements and regional data residency options.'
  },
  {
    title: 'Penetration Testing',
    description: 'Semi-annual third-party penetration tests with remediation SLAs tracked to completion.'
  },
];

const protectionLayers = [
  {
    title: 'Encryption Everywhere',
    description: 'TLS 1.2+ for data in transit and AES-256 for data at rest. Keys are rotated automatically.',
    icon: Lock
  },
  {
    title: 'Access Controls',
    description: 'Role-based access, SSO, SCIM provisioning, and mandatory MFA for admin roles.',
    icon: Users
  },
  {
    title: 'Audit Logging',
    description: 'Immutable logs for user actions, API usage, and configuration changes retained for seven years.',
    icon: FileCheck
  },
  {
    title: 'Data Lifecycle',
    description: 'Granular retention policies, secure deletion, and customer-managed archive exports.',
    icon: Database
  },
];

const incidentPlaybook = [
  '24/7 monitoring with automated alerting and escalation runbooks.',
  'Initial triage, containment, and threat analysis within 60 minutes.',
  'Customer notifications within 72 hours if data is impacted.',
  'Collaboration with regulators and law enforcement where required.',
  'Post-incident reviews with corrective actions shared to stakeholders.',
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Security & Trust"
          title="Your Data, Protected"
          highlight="Protected"
          description="From infrastructure hardening to privacy programs, GHXSTSHIP safeguards productions with enterprise-grade security." 
          actions={
            <Link href="/security/status">
              <Button className="group" size="lg">
                View Status Page
                <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
              </Button>
            </Link>
          }
        />
        <div className="mt-2xl">
          <MarketingStatGrid items={securityStats} />
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Our Approach"
          title="Built For Mission-Critical Work"
          description="Security is layered into every product decision, infrastructure component, and customer workflow."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {securityPillars.map((pillar) => {
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
          eyebrow="Compliance"
          title="Independently Verified"
          description="Global standards and regulatory frameworks guide our security and privacy programs."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {complianceHighlights.map((item) => (
            <MarketingCard key={item.title} title={item.title} description={item.description} />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Data Protection"
          title="Layered Controls From Login To Logs"
          description="Encryption, access management, and lifecycle policies work together to keep your data resilient."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {protectionLayers.map((layer) => {
            const Icon = layer.icon;
            return (
              <MarketingCard
                key={layer.title}
                title={layer.title}
                description={layer.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Incident Response"
          title="Prepared For The Unexpected"
          description="Dedicated teams monitor, respond, and communicate with transparency if an incident occurs."
        />

        <Card className="mx-auto mt-2xl max-w-4xl border border-border bg-card shadow-sm">
          <CardContent className="space-y-sm p-xl text-body text-muted-foreground">
            {incidentPlaybook.map((step) => (
              <div key={step} className="flex items-start gap-sm">
                <Badge variant="outline" className="mt-xxs">
                  <AlertTriangle className="h-icon-xs w-icon-xs" />
                </Badge>
                <span>{step}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Security Contact"
          title="Report A Vulnerability"
          description="We welcome responsible disclosure and respond quickly to security researchers and customers."
          align="center"
        />

        <Card className="mx-auto mt-2xl max-w-3xl border border-border bg-card shadow-sm">
          <CardContent className="space-y-sm p-xl text-body text-muted-foreground">
            <div>
              <strong>Email:</strong> <Link href="mailto:security@ghxstship.com" className="underline">security@ghxstship.com</Link>
            </div>
            <div>
              <strong>PGP Key:</strong> Available on request for encrypted submissions
            </div>
            <div>
              <strong>Response Time:</strong> Critical issues acknowledged within 24 hours
            </div>
          </CardContent>
        </Card>
      </MarketingSection>
    </div>
  );
}
