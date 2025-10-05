import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import {
  ArrowRight,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Users,
} from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid,
} from '../../_components/marketing';

export const metadata: Metadata = {
  title: 'Contact Us - We Actually Respond | GHXSTSHIP',
  description:
    "Reach the GHXSTSHIP team for support, sales, and partnerships. We answer emails, solve problems, and don't ghost you.",
  openGraph: {
    title: 'Contact Us - We Actually Respond | GHXSTSHIP',
    description:
      "Reach the GHXSTSHIP team for support, sales, and partnerships. We answer emails, solve problems, and don't ghost you.",
    url: 'https://ghxstship.com/contact',
  },
};

const contactStats = [
  { label: 'Avg. First Response', value: '< 2 hrs' },
  { label: '24/7 Support Coverage', value: 'Global' },
  { label: 'Customer Satisfaction', value: '98%' },
  { label: 'Dedicated Specialists', value: '45' },
];

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Talk with product specialists who understand production ops.',
    contact: 'support@ghxstship.com',
    response: 'Replies within 24 hours',
  },
  {
    icon: MessageSquare,
    title: 'Sales Inquiries',
    description: 'Discover the right plan, integrations, and onboarding program.',
    contact: 'sales@ghxstship.com',
    response: 'Replies within 4 hours',
  },
  {
    icon: Users,
    title: 'Partnerships',
    description: 'Collaborate on co-marketing, integrations, or strategic alliances.',
    contact: 'partnerships@ghxstship.com',
    response: 'Replies within 48 hours',
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Speak to a human—no endless phone trees.',
    contact: '+1 (555) 123-4567',
    response: 'Mon–Fri, 9am–6pm PST',
  },
];

const offices = [
  {
    city: 'San Francisco',
    address: '123 Market Street, Suite 400',
    zipcode: 'San Francisco, CA 94105',
    phone: '+1 (555) 123-4567',
    email: 'sf@ghxstship.com',
    timezone: 'PST',
    isHeadquarters: true,
  },
  {
    city: 'New York',
    address: '456 Broadway, Floor 12',
    zipcode: 'New York, NY 10013',
    phone: '+1 (555) 987-6543',
    email: 'ny@ghxstship.com',
    timezone: 'EST',
  },
  {
    city: 'London',
    address: '789 Oxford Street',
    zipcode: 'London W1C 1DX, UK',
    phone: '+44 20 7123 4567',
    email: 'london@ghxstship.com',
    timezone: 'GMT',
  },
];

const faqs = [
  {
    question: 'How do I get started with GHXSTSHIP?',
    answer: 'Launch a free 14-day trial of ATLVS or OPENDECK—no credit card required. Explore features with guided tours and onboarding resources.',
  },
  {
    question: 'Do you offer enterprise pricing?',
    answer: 'Yes. Our sales team will craft a plan that includes volume licensing, implementation support, and dedicated success managers.',
  },
  {
    question: 'Can GHXSTSHIP integrate with our existing tools?',
    answer: 'Absolutely. We offer Slack, Asana, and finance integrations out-of-the-box, plus an API for custom workflows.',
  },
  {
    question: 'What support options are available?',
    answer: '24/7 email support, live chat during business hours, a comprehensive knowledge base, and guided training sessions.',
  },
  {
    question: 'Is my data secure?',
    answer: 'We are SOC 2 Type II certified, GDPR compliant, and encrypt data at rest and in transit. Security is prioritized in every release.',
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Contact"
          title="Need Help? We Actually Respond"
          highlight="Actually Respond"
          description="Questions about production management that doesn’t quit? Reach the GHXSTSHIP crew and connect with people who’ve managed the chaos themselves."
          actions={
            <Link href="#contact-form">
              <Button className="group" size="lg">
                Send A Message
                <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
              </Button>
            </Link>
          }
        />
        <div className="mt-2xl">
          <MarketingStatGrid items={contactStats} />
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Talk To Us"
          title="Multiple Ways To Reach Humans"
          description="Pick your preferred channel—email, phone, or partnerships. We’ll route you straight to the right team."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {contactMethods.map((method) => {
            const Icon = method.icon;
            return (
              <MarketingCard
                key={method.title}
                title={method.title}
                description={method.description}
                highlight={method.contact}
                icon={<Icon className="h-icon-md w-icon-md" />}
                footer={<span className="text-body-sm text-muted-foreground">{method.response}</span>}
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Send A Message"
          title="Drop Us A Line"
          description="Share what you need and we’ll follow up with answers, resources, or a hands-on walkthrough."
          align="center"
        />

        <Card id="contact-form" className="mx-auto mt-2xl max-w-4xl border border-border bg-card shadow-sm">
          <CardContent className="p-xl">
            <form className="grid gap-lg md:grid-cols-2">
              <div className="space-y-md">
                <div className="space-y-xs">
                  <label htmlFor="name" className="text-body-sm text-muted-foreground uppercase tracking-[0.2em]">
                    Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Jane Doe"
                    className="w-full rounded-lg border border-border bg-background px-md py-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-xs">
                  <label htmlFor="email" className="text-body-sm text-muted-foreground uppercase tracking-[0.2em]">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@company.com"
                    className="w-full rounded-lg border border-border bg-background px-md py-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-xs">
                  <label htmlFor="company" className="text-body-sm text-muted-foreground uppercase tracking-[0.2em]">
                    Company
                  </label>
                  <input
                    id="company"
                    name="company"
                    placeholder="Production Studio"
                    className="w-full rounded-lg border border-border bg-background px-md py-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-md">
                <div className="space-y-xs">
                  <label htmlFor="topic" className="text-body-sm text-muted-foreground uppercase tracking-[0.2em]">
                    Topic *
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    required
                    className="w-full rounded-lg border border-border bg-background px-md py-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="support">Support Request</option>
                    <option value="sales">Sales Inquiry</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="billing">Billing Question</option>
                    <option value="general">General Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-xs">
                  <label htmlFor="message" className="text-body-sm text-muted-foreground uppercase tracking-[0.2em]">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    placeholder="Tell us more about your inquiry..."
                    className="w-full rounded-lg border border-border bg-background px-md py-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <label className="inline-flex items-center gap-sm text-body-sm text-muted-foreground">
                  <input type="checkbox" className="h-icon-xs w-icon-xs rounded border-border text-primary focus:ring-primary" />
                  I’d like product and feature updates from GHXSTSHIP.
                </label>
                <Button className="w-full group">
                  Send Message
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Global Offices"
          title="Find Us Around The World"
          description="Visit a regional hub or schedule time with teams operating across your timezone."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {offices.map((office) => (
            <MarketingCard
              key={office.city}
              title={office.city}
              description={`${office.address} • ${office.zipcode}`}
              highlight={office.isHeadquarters ? 'Headquarters' : `${office.timezone} timezone`}
              icon={<MapPin className="h-icon-md w-icon-md" />}
              footer={
                <div className="text-body-sm text-muted-foreground">
                  <div>{office.phone}</div>
                  <div>{office.email}</div>
                </div>
              }
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="FAQ"
          title="Answers Before You Ask"
          description="A quick primer for the most common questions we hear from producers, coordinators, and operations teams."
        />

        <div className="mt-2xl space-y-lg">
          {faqs.map((faq) => (
            <MarketingCard key={faq.question} title={faq.question} description={faq.answer} icon={<MessageCircle className="h-icon-md w-icon-md" />} />
          ))}
        </div>

        <div className="mt-xl text-center text-body-sm text-muted-foreground">
          Still need a hand? Visit our <Link href="/resources" className="underline">Help Center</Link> or email <Link href="mailto:support@ghxstship.com" className="underline">support@ghxstship.com</Link>.
        </div>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Ready To Get Started?"
          description="Join thousands of creative teams who trust GHXSTSHIP to manage productions end-to-end."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/auth/signup">
            <Button className="group">
              Start Free Trial
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline">View Pricing</Button>
          </Link>
        </div>
      </MarketingSection>
    </div>
  );
}
