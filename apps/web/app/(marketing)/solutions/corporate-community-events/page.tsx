import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import {
  ArrowRight,
  Building,
  Calendar,
  GlassWater,
  Key,
  Sparkle,
  Users,
} from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid,
} from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Corporate & Private Events | GHXSTSHIP',
  description:
    'Deliver executive meetings, investor gatherings, and luxury client experiences with GHXSTSHIP’s white-glove event workflows.',
};

const heroStats = [
  { label: 'Premium Events Delivered', value: '2,500+' },
  { label: 'Executive Clients', value: '500+' },
  { label: 'Confidentiality', value: '100%' },
  { label: 'Client Satisfaction', value: '9.8/10' },
];

const eventPillars = [
  {
    title: 'Executive Production',
    description: 'Board meetings, investor summits, and strategic retreats orchestrated with enterprise precision.',
    icon: Building,
  },
  {
    title: 'Luxury Guest Services',
    description: 'Concierge support, bespoke itineraries, and amenity management for VIP attendees.',
    icon: GlassWater,
  },
  {
    title: 'Security & Protocol',
    description: 'Confidential briefings, security checks, and discreet vendor coordination for high-profile guests.',
    icon: Key,
  },
  {
    title: 'Hybrid Experiences',
    description: 'Broadcast-ready production, simultaneous translation, and digital attendee hubs.',
    icon: Sparkle,
  },
];

const serviceHighlights = [
  {
    title: 'Personalized Guest Journeys',
    description: 'Capture preferences, dietary needs, and travel details to deliver white-glove touchpoints.',
  },
  {
    title: 'Stakeholder Alignment',
    description: 'Keep executives, communications teams, and venue partners aligned with centralized updates.',
  },
  {
    title: 'Confidential Planning',
    description: 'Secure document sharing, NDAs, and restricted access ensure sensitive information stays protected.',
  },
  {
    title: 'Impact & ROI Reporting',
    description: 'Measure engagement, sponsorship ROI, and pipeline influence from every event.',
  },
];

const caseStudies = [
  {
    company: 'Global Financial Group',
    project: 'Annual Shareholder Meeting',
    challenge: 'Delivering a hybrid shareholder meeting for 2,000+ attendees with global media coverage.',
    result: '100% incident-free · 95% attendee satisfaction · 50% faster planning · Seamless hybrid execution',
    quote:
      'GHXSTSHIP delivered the most professional, seamless shareholder meeting in our history. Every detail was flawless.',
    author: 'Sarah Chen, Chief Communications Officer',
  },
  {
    company: 'Private Equity Firm',
    project: 'Exclusive Client Gala',
    challenge: 'Designing a luxury experience for 150 UHNW clients while maintaining strict confidentiality.',
    result: '10/10 satisfaction · 100% confidentiality · 40% higher client engagement · $25M new business',
    quote:
      'The attention to detail and discretion exceeded expectations. GHXSTSHIP knows how to deliver five-star experiences.',
    author: 'Michael Torres, Managing Partner',
  },
];

const integrations = [
  'Concierge Services',
  'Executive Transport',
  'Luxury Catering',
  'Private Security',
  'Premium Venues',
  'Entertainment Booking',
  'Floral Design',
  'Photography & Video Teams',
];

export default function CorporateCommunityEventsPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Industry Solutions"
          title="Corporate & Private Events"
          highlight="Corporate"
          description="Deliver VIP gatherings, board meetings, and investor showcases with GHXSTSHIP’s luxury event operations toolkit."
          actions={
            <div className="flex flex-col items-center gap-sm sm:flex-row">
              <Link href="/auth/signup">
                <Button className="group" size="lg">
                  Start Premium Trial
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Talk To Concierge Team
                </Button>
              </Link>
            </div>
          }
        />
        <div className="mt-2xl">
          <MarketingStatGrid items={heroStats} />
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Experience Design"
          title="White-Glove Coordination"
          description="Plan itineraries, manage security, and execute flawless corporate gatherings." 
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {eventPillars.map((pillar) => {
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
          eyebrow="Value"
          title="Exceed Expectations"
          description="GHXSTSHIP equips corporate planners to deliver memorable, high-touch experiences."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {serviceHighlights.map((highlight) => (
            <MarketingCard key={highlight.title} title={highlight.title} description={highlight.description} icon={<Users className="h-icon-md w-icon-md" />} />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Proof"
          title="Events Powered By GHXSTSHIP"
          description="See how global brands and private equity firms orchestrate premium experiences."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2">
          {caseStudies.map((study) => (
            <Card key={study.company} className="border border-border bg-card shadow-sm">
              <CardContent className="space-y-md p-xl">
                <div className="flex items-center gap-sm">
                  <h3 className="text-heading-4 uppercase leading-tight">{study.company}</h3>
                  <Badge variant="outline">{study.project}</Badge>
                </div>
                <p className="text-body-sm text-muted-foreground">{study.challenge}</p>
                <div className="text-body font-medium text-foreground">{study.result}</div>
                <blockquote className="border-l-4 border-primary pl-md text-body text-muted-foreground italic">“{study.quote}”</blockquote>
                <cite className="text-body-sm text-muted-foreground">— {study.author}</cite>
              </CardContent>
            </Card>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Integrations"
          title="Coordinate Premium Partners"
          description="Connect with concierge vendors, luxury services, and security partners directly inside GHXSTSHIP."
          align="center"
        />
        <div className="mt-2xl grid gap-md md:grid-cols-4">
          {integrations.map((service) => (
            <div key={service} className="rounded-xl border border-border bg-muted px-lg py-md text-center text-body-sm text-muted-foreground">
              {service}
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Ready To Impress Your Guests?"
          description="Partner with GHXSTSHIP to deliver flawless corporate and private events that leave lasting impact."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/contact">
            <Button className="group" size="lg">
              Book A Concierge Consultation
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="outline" size="lg">
              Start Premium Trial
            </Button>
          </Link>
        </div>
      </MarketingSection>
    </div>
  );
}
