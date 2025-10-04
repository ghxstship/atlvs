import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import {
  ArrowRight,
  Calendar,
  Flag,
  Globe,
  Handshake,
  Heart,
  Megaphone,
  Sparkles,
  Users,
} from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid,
} from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Community & Cultural Events | GHXSTSHIP',
  description:
    'Celebrate heritage, coordinate volunteers, and partner with local organizations using GHXSTSHIP’s cultural event workflows.',
};

const heroStats = [
  { label: 'Community Members Reached', value: '2M+' },
  { label: 'Cultural Events Orchestrated', value: '5,000+' },
  { label: 'Traditions Preserved', value: '150+' },
  { label: 'Authenticity Rating', value: '98%' },
];

const programPillars = [
  {
    title: 'Cultural Programming',
    description: 'Curate performances, exhibitions, and storytelling tracks with cultural advisors and heritage groups.',
    icon: Sparkles,
  },
  {
    title: 'Community Engagement',
    description: 'Coordinate neighborhood outreach, youth workshops, and multi-language communications.',
    icon: Megaphone,
  },
  {
    title: 'Cultural Partnerships',
    description: 'Manage collaborations with cultural centers, faith leaders, and heritage organizations.',
    icon: Handshake,
  },
  {
    title: 'Volunteer Operations',
    description: 'Recruit, schedule, and train volunteers with shift bidding and credential management.',
    icon: Users,
  },
  {
    title: 'Logistics & Compliance',
    description: 'Secure permits, coordinate municipal services, and document accessibility plans.',
    icon: Flag,
  },
  {
    title: 'Production Technology',
    description: 'Track staging, sound, lighting, and broadcast support with real-time updates from the field.',
    icon: Calendar,
  },
];

const engagementHighlights = [
  {
    title: 'Inclusive Programming',
    description: 'Collect cultural requirements, dietary preferences, and ceremonial needs directly from stakeholders.',
  },
  {
    title: 'Language Access',
    description: 'Coordinate translators, signage, and ASL interpreters so every community feels represented.',
  },
  {
    title: 'Economic Impact',
    description: 'Track local vendor spend, sponsorship activation, and grant outcomes for reporting.',
  },
  {
    title: 'Legacy Documentation',
    description: 'Archive traditions, recordings, and oral histories for future generations.',
  },
];

const caseStudies = [
  {
    company: 'Citywide Heritage Festival',
    project: 'Multicultural Celebration Series',
    challenge: 'Coordinating 80 cultural groups with multilingual programming across the region.',
    result: '100% cultural participation · 95% community satisfaction · 50% increase in cultural awareness · 200+ new partnerships',
    quote:
      'GHXSTSHIP helped us deliver the most inclusive celebration our city has ever seen. Every community felt heard and represented.',
    author: 'Elena Vasquez, Cultural Events Director',
  },
  {
    company: 'Annual Harvest Festival',
    project: 'Traditional Agricultural Celebration',
    challenge: 'Preserving century-old traditions while engaging modern audiences across 5,000+ residents.',
    result: '300% youth participation lift · 100% tradition authenticity · 80% better volunteer coordination · $500K local impact',
    quote:
      'The platform honored our heritage while introducing new experiences for the next generation. Nothing slipped through the cracks.',
    author: 'Robert Thompson, Community Leader',
  },
];

const integrations = [
  'Community Cultural Centers',
  'Municipal Services',
  'Heritage Organizations',
  'Volunteer Networks',
  'Translation Services',
  'Local Media Partners',
  'Community Sponsors',
  'Cultural Performers',
];

export default function CommunityCulturalEventsPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Industry Solutions"
          title="Community & Cultural Events"
          highlight="Cultural"
          description="Design authentic celebrations, coordinate volunteers, and spotlight heritage with GHXSTSHIP’s community event toolkit."
          actions={
            <div className="flex flex-col items-center gap-sm sm:flex-row">
              <Link href="/auth/signup">
                <Button className="group" size="lg">
                  Start Celebrating
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Speak With Community Team
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
          eyebrow="Program Pillars"
          title="Plan With Cultural Sensitivity"
          description="Coordinate performers, elders, and municipal partners while respecting traditions and community needs."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-3">
          {programPillars.map((pillar) => {
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
          eyebrow="Impact"
          title="Strengthen Community Bonds"
          description="Organizers use GHXSTSHIP to deliver inclusive, well-documented celebrations that leave lasting impact."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {engagementHighlights.map((highlight) => (
            <MarketingCard key={highlight.title} title={highlight.title} description={highlight.description} icon={<Heart className="h-icon-md w-icon-md" />} />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Proof"
          title="Celebrations Powered By GHXSTSHIP"
          description="See how organizers preserve heritage, grow participation, and measure cultural impact."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2">
          {caseStudies.map((study) => (
            <Card key={study.company} className="border border-border/40 bg-background/95 shadow-sm">
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
          title="Unite Partners & Stakeholders"
          description="Connect GHXSTSHIP with cultural institutions, municipal services, and volunteer platforms."
          align="center"
        />
        <div className="mt-2xl grid gap-md md:grid-cols-4">
          {integrations.map((partner) => (
            <div key={partner} className="rounded-xl border border-border/60 bg-muted/30 px-lg py-md text-center text-body-sm text-muted-foreground">
              {partner}
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="primaryGradient" padding="lg">
        <MarketingSectionHeader
          title="Ready To Honor Your Community?"
          description="Partner with GHXSTSHIP to design celebrations that uplift voices, preserve tradition, and create shared memories."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/contact">
            <Button className="group" size="lg">
              Book A Cultural Planning Session
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
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
