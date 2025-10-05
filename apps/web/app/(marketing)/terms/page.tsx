import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Card, CardContent } from '@ghxstship/ui';
import { AlertTriangle, ArrowRight, Gavel, Scale, Shield, Users } from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid,
} from '../../_components/marketing';

export const metadata: Metadata = {
  title: 'Terms of Service | GHXSTSHIP',
  description:
    'Review the terms and conditions governing your use of GHXSTSHIP. Understand user responsibilities, compliance requirements, and legal protections.',
  openGraph: {
    title: 'Terms of Service | GHXSTSHIP',
    description:
      'Review the terms and conditions governing your use of GHXSTSHIP. Understand user responsibilities, compliance requirements, and legal protections.',
    url: 'https://ghxstship.com/terms',
  },
};

const keyHighlights = [
  { label: 'Account Security', value: '2FA Required' },
  { label: 'Arbitration Venue', value: 'San Francisco, CA' },
  { label: 'Support Availability', value: '24/7 Critical Coverage' },
  { label: 'Compliance Standards', value: 'SOC 2, GDPR, CCPA' },
];

const overviewPoints = [
  {
    title: 'Acceptance Of Terms',
    description:
      'Using GHXSTSHIP means you agree to these terms, our privacy policy, and all posted guidelines. Review updates regularly.',
    icon: Gavel,
  },
  {
    title: 'Service Scope',
    description:
      'We provide production management software, APIs, and support services. Features may evolve with notice.',
    icon: Scale,
  },
  {
    title: 'Responsible Use',
    description:
      'Maintain accurate account information, safeguard credentials, and prohibit unauthorized or malicious activity.',
    icon: Shield,
  },
  {
    title: 'Data Stewardship',
    description:
      'You retain ownership of content while granting operational rights. We protect data through industry security practices.',
    icon: Users,
  },
];

const enforcementHighlights = [
  {
    title: 'Acceptable Use Policy',
    description:
      'No violations of law, intellectual property abuse, security breaches, or misuse of our APIs and integrations.',
  },
  {
    title: 'Payment Terms',
    description:
      'Subscriptions renew automatically unless cancelled. Outstanding balances may pause service access.',
  },
  {
    title: 'Dispute Resolution',
    description:
      'Most disputes resolve through binding arbitration in California. You waive participation in class actions.',
  },
  {
    title: 'Liability Limits',
    description:
      'We limit liability to fees paid in the previous 12 months and disclaim indirect or consequential damages.',
  },
];

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: (
      <>
        <p>
          By accessing or using GHXSTSHIP you agree to the Terms of Service and Privacy Policy. If you do not agree, you must discontinue use of the platform.
        </p>
        <p>
          These Terms apply to all visitors, users, and organizations leveraging GHXSTSHIP websites, mobile applications, and APIs.
        </p>
      </>
    ),
  },
  {
    title: '2. Description of Service',
    body: (
      <>
        <p>GHXSTSHIP delivers cloud-based production management software including:</p>
        <ul>
          <li>ATLVS — production workflow and logistics tools</li>
          <li>OPENDECK — creative asset management platform</li>
          <li>Ancillary APIs, integrations, and customer support services</li>
        </ul>
        <p>We may modify or discontinue features with reasonable notice in line with platform improvements.</p>
      </>
    ),
  },
  {
    title: '3. User Accounts',
    body: (
      <>
        <p>Users must maintain accurate information, secure credentials, and meet eligibility requirements.</p>
        <ul>
          <li>Provide complete account details and organizational information</li>
          <li>Be at least 18 years old or possess parental consent</li>
          <li>Safeguard passwords and enable two-factor authentication</li>
          <li>Notify GHXSTSHIP of unauthorized access immediately</li>
        </ul>
      </>
    ),
  },
  {
    title: '4. Acceptable Use Policy',
    body: (
      <>
        <MarketingCard
          title="Prohibited Activities"
          description="Violating system security, intellectual property laws, or using GHXSTSHIP for unlawful purposes can result in immediate suspension."
          icon={<AlertTriangle className="h-icon-md w-icon-md text-destructive" />}
        />
        <ul>
          <li>Do not violate laws, regulations, or third-party rights</li>
          <li>Avoid uploading malicious code or disrupting system integrity</li>
          <li>Refrain from spamming, harassing, or abusing users</li>
          <li>No sharing of credentials or exceeding API rate limits</li>
        </ul>
      </>
    ),
  },
  {
    title: '5. Content and Data',
    body: (
      <>
        <p>You retain ownership of assets stored in GHXSTSHIP while granting us operational rights to process, safeguard, and back up content.</p>
        <p>Content must comply with applicable laws and community standards. We may remove material reported as violating these Terms.</p>
        <p>Maintain independent backups of critical data alongside GHXSTSHIP safeguards.</p>
      </>
    ),
  },
  {
    title: '6. Payment Terms',
    body: (
      <>
        <p>Subscription fees are invoiced per plan. Charges may recur automatically unless canceled before renewal.</p>
        <p>Late or unpaid balances can result in service suspension until resolved.</p>
      </>
    ),
  },
  {
    title: '7. Intellectual Property',
    body: (
      <>
        <p>GHXSTSHIP and its licensors retain rights to software, branding, and proprietary content. Users must not reproduce, reverse engineer, or misuse intellectual property without authorization.</p>
      </>
    ),
  },
  {
    title: '8. Third-Party Services',
    body: (
      <>
        <p>Some features rely on third-party tools. Their terms govern usage, and GHXSTSHIP is not liable for external services.</p>
      </>
    ),
  },
  {
    title: '9. Disclaimer of Warranties',
    body: (
      <>
        <p>GHXSTSHIP is provided “as is”. We do not guarantee uninterrupted availability, accuracy of data transmission, or error-free operation.</p>
      </>
    ),
  },
  {
    title: '10. Limitation of Liability',
    body: (
      <>
        <p>To the maximum extent permitted by law, GHXSTSHIP’s liability is capped at fees paid in the preceding 12 months. We are not responsible for indirect, incidental, or consequential damages.</p>
        <ul>
          <li>No liability for lost profits, data, or business opportunities</li>
          <li>No responsibility for third-party actions or service interruptions</li>
        </ul>
      </>
    ),
  },
  {
    title: '11. Indemnification',
    body: (
      <>
        <p>You agree to defend and indemnify GHXSTSHIP against claims arising from misuse, violations of these Terms, or infringement of rights.</p>
      </>
    ),
  },
  {
    title: '12. Termination',
    body: (
      <>
        <p>Accounts may be ended by the user or GHXSTSHIP. Termination can result from policy breaches or unpaid balances.</p>
        <p>Access ceases after termination; export vital data beforehand.</p>
      </>
    ),
  },
  {
    title: '13. Dispute Resolution',
    body: (
      <>
        <p>Contact legal@ghxstship.com for informal resolution. Otherwise, disputes proceed through binding arbitration in California, excluding intellectual property matters.</p>
        <p>Parties waive participation in class actions.</p>
      </>
    ),
  },
  {
    title: '14. General Provisions',
    body: (
      <>
        <p>These Terms follow California law, include severability clauses, and represent the entire agreement along with the Privacy Policy.</p>
        <p>We may update Terms with reasonable advance notice of material changes.</p>
      </>
    ),
  },
  {
    title: '15. Contact Information',
    body: (
      <Card className="border border-border">
        <CardContent className="space-y-sm p-xl text-body-sm">
          <p><strong>Email:</strong> legal@ghxstship.com</p>
          <p>
            <strong>Address:</strong> GHXSTSHIP, Inc.
            <br />123 Market Street, Suite 500
            <br />San Francisco, CA 94105
          </p>
          <p><strong>Phone:</strong> +1 (555) 123-4567</p>
        </CardContent>
      </Card>
    ),
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Legal"
          title="GHXSTSHIP Terms Of Service"
          highlight="Terms"
          description="Know your rights and obligations when partnering with GHXSTSHIP. Review responsibilities, payments, compliance, and dispute resolution."
          actions={
            <div className="flex flex-col items-center gap-sm sm:flex-row">
              <Link href="/auth/signup">
                <Badge className="px-lg py-sm text-body-sm" variant="outline">
                  Updated October 2025
                </Badge>
              </Link>
              <Link href="/contact">
                <Badge className="px-lg py-sm text-body-sm" variant="secondary">
                  Request Legal Assistance
                </Badge>
              </Link>
            </div>
          }
        />
        <div className="mt-2xl">
          <MarketingStatGrid items={keyHighlights} />
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Overview"
          title="Key Principles"
          description="Understand how GHXSTSHIP protects your data, manages services, and expects responsible use."
        />
        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {overviewPoints.map((point) => {
            const Icon = point.icon;
            return (
              <MarketingCard
                key={point.title}
                title={point.title}
                description={point.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Compliance"
          title="Critical Obligations"
          description="Review the policies governing acceptable use, payments, dispute processes, and liability limitations."
        />
        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {enforcementHighlights.map((highlight) => (
            <MarketingCard
              key={highlight.title}
              title={highlight.title}
              description={highlight.description}
              icon={<Scale className="h-icon-md w-icon-md" />}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Full Terms"
          title="Detailed Policies"
          description="Read the complete agreement covering service scope, data stewardship, liability, and dispute resolution." 
        />

        <div className="mt-2xl space-y-2xl">
          {sections.map((section) => (
            <Card key={section.title} className="border border-border bg-card">
              <CardContent className="space-y-md p-xl">
                <h2 className="text-heading-4 uppercase tracking-wide">{section.title}</h2>
                <div className="space-y-sm text-body text-muted-foreground">{section.body}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Need Clarification?"
          description="Our legal and compliance teams are ready to help you interpret the Terms of Service and stay aligned."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/contact">
            <Badge className="px-lg py-sm text-body-sm" variant="secondary">
              Contact Legal Team
            </Badge>
          </Link>
          <Link href="/auth/signup">
            <Badge className="px-lg py-sm text-body-sm" variant="outline">
              Review Customer Agreement
            </Badge>
          </Link>
        </div>
      </MarketingSection>
    </div>
  );
}
