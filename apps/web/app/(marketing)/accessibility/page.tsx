import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import {
  Accessibility,
  CheckCircle,
  ExternalLink,
  Globe,
  Headphones,
  Laptop,
  Mail,
  Shield,
  Users,
} from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid,
} from '../../_components/marketing';

export const metadata: Metadata = {
  title: 'Accessibility Statement | GHXSTSHIP',
  description:
    'GHXSTSHIP is committed to inclusive design, accessible experiences, and continuous improvement across ATLVS and OPENDECK.',
  openGraph: {
    title: 'Accessibility Statement | GHXSTSHIP',
    description:
      'GHXSTSHIP is committed to inclusive design, accessible experiences, and continuous improvement across ATLVS and OPENDECK.',
    url: 'https://ghxstship.com/accessibility',
  },
};

const accessibilityStats = [
  { label: 'WCAG Coverage', value: '2.2 AA' },
  { label: 'Assistive Tech Pairings', value: '15+' },
  { label: 'Accessibility Reviews / Year', value: '12' },
  { label: 'Dedicated Specialists', value: '8' },
];

const commitmentPillars = [
  {
    title: 'Inclusive By Design',
    description: 'Accessibility requirements are built into our product roadmap, design system, and QA gates.',
    icon: Accessibility,
  },
  {
    title: 'Shared Responsibility',
    description: 'Cross-functional teams receive ongoing training on inclusive design, content standards, and WCAG updates.',
    icon: Users,
  },
  {
    title: 'Continuous Improvement',
    description: 'Internal audits, third-party reviews, and customer feedback loops drive measurable upgrades every quarter.',
    icon: Shield,
  },
];

const complianceStatements = [
  {
    title: 'WCAG 2.2 AA Alignment',
    body: 'ATLVS and OPENDECK target Web Content Accessibility Guidelines (WCAG 2.2 AA) for all core user journeys and components.',
  },
  {
    title: 'Global Standards',
    body: 'We monitor ADA, EN 301 549, AODA, and other regional regulations to ensure compliance for our enterprise customers.',
  },
  {
    title: 'Policy Reviews',
    body: 'Accessibility documentation, support scripts, and partner guidelines are reviewed at least twice per year.',
  },
];

const testingPractices = [
  {
    title: 'Assistive Technology Labs',
    description: 'Screen readers (JAWS, NVDA, VoiceOver), screen magnifiers, voice control software, and switch devices.',
    icon: Laptop,
  },
  {
    title: 'Manual Audits',
    description: 'Keyboard-only testing, color contrast validation, and semantic structure reviews on every major release.',
    icon: CheckCircle,
  },
  {
    title: 'Automated Scans',
    description: 'CI pipelines run axe-core, Lighthouse, and custom accessibility linting with alerts to responsible teams.',
    icon: Shield,
  },
];

const resourceLinks = [
  {
    name: 'Accessibility User Guide',
    href: '/help/accessibility-guide',
  },
  {
    name: 'Keyboard Shortcuts Reference',
    href: '/help/keyboard-shortcuts',
  },
  {
    name: 'Screen Reader Setup Guide',
    href: '/help/screen-reader-guide',
  },
];

const externalResources = [
  {
    name: 'W3C Web Accessibility Initiative',
    href: 'https://www.w3.org/WAI/',
  },
  {
    name: 'WebAIM Accessibility Resources',
    href: 'https://webaim.org/',
  },
  {
    name: 'ADA.gov Accessibility Guidance',
    href: 'https://www.ada.gov/',
  },
];

const legalRegions = [
  {
    region: 'United States',
    items: ['Americans with Disabilities Act (ADA)', 'Section 508 of the Rehabilitation Act', '21st Century Communications and Video Accessibility Act'],
  },
  {
    region: 'International',
    items: ['European Accessibility Act (EAA)', 'EN 301 549 European Standard', 'Accessibility for Ontarians with Disabilities Act (AODA)'],
  },
];

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Accessibility"
          title="Accessible Experiences For Every Creator"
          highlight="Every Creator"
          description="We design GHXSTSHIP for inclusivity across workflows, devices, and abilities. Accessibility is an ongoing partnership between our teams, customers, and community."
          actions={
            <Link href="mailto:accessibility@ghxstship.com">
              <Button className="group" size="lg">
                Contact Accessibility Team
                <Mail className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
              </Button>
            </Link>
          }
        />
        <div className="mt-2xl">
          <MarketingStatGrid items={accessibilityStats} />
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Our Commitment"
          title="How GHXSTSHIP Delivers Accessible Products"
          description="Accessibility is a company-wide standard embedded in research, design, engineering, and customer success."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {commitmentPillars.map((pillar) => {
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
          title="Standards & Regulatory Alignment"
          description="We align with accessibility best practices and legal requirements across multiple regions."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {complianceStatements.map((item) => (
            <MarketingCard key={item.title} title={item.title} description={item.body} icon={<Shield className="h-icon-md w-icon-md" />} />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Testing & Validation"
          title="How We Measure Accessibility"
          description="Teams run manual and automated checks across assistive technology labs, regression suites, and usability studies."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {testingPractices.map((practice) => {
            const Icon = practice.icon;
            return (
              <MarketingCard
                key={practice.title}
                title={practice.title}
                description={practice.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Feedback & Support"
          title="Need Assistance Or Want To Report An Issue?"
          description="Share feedback, request alternative formats, or connect with our accessibility specialists."
          align="center"
        />

        <Card className="mx-auto mt-2xl max-w-4xl border border-border bg-card shadow-sm">
          <CardContent className="flex flex-col gap-xl p-xl md:flex-row">
            <div className="rounded-full bg-primary/10 p-lg text-primary">
              <Headphones className="h-icon-lg w-icon-lg" />
            </div>
            <div className="space-y-lg">
              <div className="space-y-xs">
                <h3 className="text-heading-4 uppercase leading-tight">Accessibility Team</h3>
                <p className="text-body text-muted-foreground">
                  Email <Link href="mailto:accessibility@ghxstship.com" className="underline">accessibility@ghxstship.com</Link> or call +1 (555) 123-4567 (TTY available). We aim to respond within 2 business days.
                </p>
              </div>
              <div className="space-y-xs">
                <h3 className="text-heading-4 uppercase leading-tight">Alternative Formats</h3>
                <p className="text-body-sm text-muted-foreground">
                  We can provide product documentation and training materials in large print, audio, or other accessible formats upon request.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Resources"
          title="Guides & Reference Material"
          description="Explore internal and external resources to help your team deliver accessible creative work."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2">
          <Card className="border border-border bg-card shadow-sm">
            <CardContent className="space-y-lg p-xl">
              <h3 className="text-heading-4 uppercase leading-tight">Getting Started</h3>
              <ul className="space-y-sm text-body-sm text-muted-foreground">
                {resourceLinks.map((resource) => (
                  <li key={resource.name} className="flex items-center gap-sm">
                    <ExternalLink className="h-icon-xs w-icon-xs" />
                    <Link href={resource.href} className="underline">
                      {resource.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card shadow-sm">
            <CardContent className="space-y-lg p-xl">
              <h3 className="text-heading-4 uppercase leading-tight">External Resources</h3>
              <ul className="space-y-sm text-body-sm text-muted-foreground">
                {externalResources.map((resource) => (
                  <li key={resource.name} className="flex items-center gap-sm">
                    <Globe className="h-icon-xs w-icon-xs" />
                    <Link href={resource.href} target="_blank" rel="noopener noreferrer" className="underline">
                      {resource.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Legal Compliance"
          title="Regulatory Coverage"
          description="GHXSTSHIP monitors and adheres to the accessibility regulations that affect our customers around the world."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2">
          {legalRegions.map((region) => (
            <MarketingCard
              key={region.region}
              title={region.region}
              description={region.items.join(' • ')}
              icon={<Shield className="h-icon-md w-icon-md" />}
            />
          ))}
        </div>

        <div className="mt-xl text-center text-body-sm text-muted-foreground">
          This accessibility statement was last reviewed on December 15, 2024. We revisit and update the statement regularly to keep it current.
        </div>
      </MarketingSection>
    </div>
  );
}
