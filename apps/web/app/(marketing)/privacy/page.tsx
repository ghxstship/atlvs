import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Card, CardContent } from '@ghxstship/ui';
import { Database, FileCheck, Globe, Lock, Mail, Shield, Users } from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader
} from '../../_components/marketing';

export const metadata: Metadata = {
  title: 'Privacy Policy | GHXSTSHIP',
  description: 'Learn how GHXSTSHIP collects, uses, and protects your information across ATLVS and OPENDECK.'
};

const principles = [
  {
    title: 'Transparency',
    description: 'Clear documentation shows what data we collect, why, and how it supports your experience.',
    icon: Globe
  },
  {
    title: 'Security',
    description: 'Data is encrypted in transit and at rest with enterprise-grade controls.',
    icon: Shield
  },
  {
    title: 'Control',
    description: 'You can access, export, or delete your data at any time through your account or by contacting us.',
    icon: Users
  },
];

const datapoints = [
  {
    title: 'Account & Profile Information',
    description: 'Name, email, team role, and authentication credentials required to provision access.'
  },
  {
    title: 'Usage Analytics',
    description: 'Product interactions and device information to optimize workflows and reliability.'
  },
  {
    title: 'Transactional Data',
    description: 'Billing records, contracts, and invoices stored for compliance and support.'
  },
  {
    title: 'Support Communications',
    description: 'Conversations with our teams to improve service quality and troubleshoot issues.'
  },
];

const securityMeasures = [
  {
    title: 'Encryption Everywhere',
    description: 'TLS 1.2+ for data in transit and AES-256 for data at rest across GHXSTSHIP systems.',
    icon: Lock
  },
  {
    title: 'Access Controls',
    description: 'Role-based permissions, SSO, and MFA secure your organization’s environment.',
    icon: Users
  },
  {
    title: 'Compliance Audits',
    description: 'SOC 2 Type II and GDPR compliance with annual third-party reviews.',
    icon: FileCheck
  },
  {
    title: 'Incident Response',
    description: '24/7 monitoring, logging, and breach notification protocols aligned with global standards.',
    icon: Database
  },
];

const rights = [
  'Access, export, or correct your personal data',
  'Request deletion of your account information',
  'Object to processing for marketing communications',
  'Appeal decisions made via automated processing',
];

const lastUpdated = new Date('2024-12-15').toLocaleDateString(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Policies"
          title="Privacy Policy"
          description="Your trust matters. This policy explains how GHXSTSHIP handles personal information and keeps productions secure."
        />
        <div className="mt-xl text-body-sm text-muted-foreground text-center">Last updated: {lastUpdated}</div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Our Principles"
          title="How We Approach Privacy"
          description="The GHXSTSHIP platform is designed with privacy, security, and control at every layer."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <MarketingCard
                key={principle.title}
                title={principle.title}
                description={principle.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Data We Collect"
          title="Information You Share With GHXSTSHIP"
          description="We collect the minimum data needed to deliver secure, compliant production workflows."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2">
          {datapoints.map((item) => (
            <MarketingCard key={item.title} title={item.title} description={item.description} />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Security & Compliance"
          title="How We Protect Your Data"
          description="Enterprise security, audits, and incident response keep your productions safe."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {securityMeasures.map((measure) => {
            const Icon = measure.icon;
            return (
              <MarketingCard
                key={measure.title}
                title={measure.title}
                description={measure.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Your Rights"
          title="Control Your Information"
          description="You remain in command of your data. These rights apply regardless of where you’re located."
        />

        <Card className="mx-auto mt-2xl max-w-4xl border border-border bg-card shadow-sm">
          <CardContent className="space-y-sm p-xl text-body text-muted-foreground">
            {rights.map((right) => (
              <div key={right} className="flex items-start gap-sm">
                <Badge variant="outline" className="mt-xxs">Right</Badge>
                <span>{right}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Cookies"
          title="How We Use Cookies"
          description="Essential, analytics, and preference cookies help us deliver reliable, personalized experiences."
        />

        <div className="mt-2xl text-body-sm text-muted-foreground">
          Manage your preferences anytime via the cookie banner or browser settings. See our <Link href="/cookies" className="underline">Cookie Policy</Link> for details.
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Global Operations"
          title="International Data Transfers"
          description="We operate worldwide. Safeguards like Standard Contractual Clauses and data residency options keep international transfers compliant."
        />

        <div className="mt-2xl text-body-sm text-muted-foreground">
          Questions about regional storage? Connect with our data protection team at <Link href="mailto:dpo@ghxstship.com" className="underline">dpo@ghxstship.com</Link>.
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Contact"
          title="Need Clarity Or Want To Exercise Your Rights?"
          description="Reach out and we’ll respond within two business days."
          align="center"
        />

        <Card className="mx-auto mt-2xl max-w-3xl border border-border bg-card shadow-sm">
          <CardContent className="space-y-sm p-xl text-body text-muted-foreground">
            <div>
              <strong>Email:</strong> <Link href="mailto:privacy@ghxstship.com" className="underline">privacy@ghxstship.com</Link>
            </div>
            <div>
              <strong>Data Protection Officer:</strong> <Link href="mailto:dpo@ghxstship.com" className="underline">dpo@ghxstship.com</Link>
            </div>
            <div>
              <strong>Mailing Address:</strong> GHXSTSHIP, Inc., 123 Market Street, Suite 500, San Francisco, CA 94105
            </div>
          </CardContent>
        </Card>
      </MarketingSection>
    </div>
  );
}
