import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import { ArrowRight, Briefcase, Calendar, CheckCircle, Coffee, DollarSign, Globe, GraduationCap, Heart, MapPin, Users, Zap } from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid
} from '../../_components/marketing';

export const metadata: Metadata = {
  title: 'Careers - Join Our Mission | GHXSTSHIP',
  description:
    'Join GHXSTSHIP and help build the future of creative production management. Explore open positions, culture, and benefits.',
  openGraph: {
    title: 'Careers - Join Our Mission | GHXSTSHIP',
    description:
      'Join GHXSTSHIP and help build the future of creative production management. Explore open positions, culture, and benefits.',
    url: 'https://ghxstship.com/careers'
  }
};

const heroStats = [
  { label: 'Team Members', value: '320+' },
  { label: 'Countries', value: '18' },
  { label: 'Growth YOY', value: '140%' },
  { label: 'Glassdoor Rating', value: '4.9★' },
];

const openPositions = [
  {
    id: 'vp-technology',
    title: 'VP, Technology',
    department: 'Leadership',
    location: 'San Francisco, CA',
    type: 'Full-time · Remote-friendly',
    description:
      'Lead engineering strategy, scale product delivery, and partner with design to ship resilient production tools at enterprise scale.',
    requirements: ['10+ years engineering leadership', 'Experience scaling SaaS platforms', 'Hands-on approach to architecture and DevOps'],
    salary: '$250k - $350k',
    posted: '1 day ago'
  },
  {
    id: 'vp-marketing',
    title: 'VP, Marketing',
    department: 'Marketing',
    location: 'Remote (North America)',
    type: 'Full-time · Remote',
    description:
      'Build a storytelling engine that positions ATLVS and OPENDECK as the industry standard. Drive GTM, demand gen, and brand narrative.',
    requirements: ['8+ years B2B SaaS marketing leadership', 'Demand-gen and brand experience', 'Ability to craft technical narratives'],
    salary: '$200k - $280k',
    posted: '3 days ago'
  },
  {
    id: 'customer-success-manager',
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Remote (US)',
    type: 'Full-time · Remote',
    description:
      'Partner with studios and enterprise clients to drive adoption, resolve blockers, and deliver measurable ROI.',
    requirements: ['3+ years customer success', 'Experience with creative or production software', 'Strong communication and facilitation'],
    salary: '$90k - $120k',
    posted: '1 week ago'
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    department: 'Product',
    location: 'San Francisco, CA',
    type: 'Full-time · Hybrid',
    description:
      'Own discovery and delivery for the production planning roadmap, collaborating with customers, design, and engineering.',
    requirements: ['4+ years product management', 'B2B SaaS background', 'Experience with production or operations tools'],
    salary: '$140k - $180k',
    posted: '5 days ago'
  },
  {
    id: 'project-director',
    title: 'Project Director',
    department: 'Operations',
    location: 'Los Angeles, CA',
    type: 'Full-time · Hybrid',
    description:
      'Lead multi-market activations for enterprise clients, ensuring productions go live on time and on budget.',
    requirements: ['7+ years project leadership', 'Creative industry experience', 'Expertise orchestrating cross-functional teams'],
    salary: '$130k - $170k',
    posted: '4 days ago'
  },
];

const benefits = [
  {
    title: 'Healthcare Coverage',
    description: 'Medical, dental, and vision plans with global telehealth and mental health support.',
    icon: Heart
  },
  {
    title: 'Flexible Work',
    description: 'Remote-first culture, flexible hours, and team hubs in key creative cities.',
    icon: Globe
  },
  {
    title: 'Professional Growth',
    description: 'Annual learning stipend, mentorship programs, and rotational leadership tracks.',
    icon: GraduationCap
  },
  {
    title: 'Financial Wellness',
    description: 'Competitive compensation, 401(k) match, equity grants, and performance bonuses.',
    icon: DollarSign
  },
  {
    title: 'Recharge & Support',
    description: 'Unlimited PTO, company shutdown weeks, and wellness stipends.',
    icon: Coffee
  },
  {
    title: 'Give Back',
    description: 'Paid volunteer days and donation matching for causes you champion.',
    icon: Heart
  },
];

const departments = [
  {
    name: 'Engineering',
    description: 'Build resilient infrastructure, AI copilots, and production tooling used worldwide.',
    openings: 12
  },
  {
    name: 'Product & Design',
    description: 'Shape the GHXSTSHIP experience end-to-end with research-driven roadmaps and beautiful, accessible interfaces.',
    openings: 8
  },
  {
    name: 'Sales & Marketing',
    description: 'Grow the platform with strategic partnerships, campaigns, and enterprise relationships.',
    openings: 9
  },
  {
    name: 'Customer Success',
    description: 'Partner with customers to drive adoption, training, and measurable business impact.',
    openings: 6
  },
  {
    name: 'Operations & Finance',
    description: 'Keep GHXSTSHIP running efficiently with data-informed decisions and operational excellence.',
    openings: 5
  },
  {
    name: 'People & Culture',
    description: 'Recruit, develop, and support talent across every discipline and geography.',
    openings: 4
  },
];

const hiringProcess = [
  {
    step: '01',
    title: 'Apply',
    description: 'Share your experience, portfolio, and why you’re excited to build with GHXSTSHIP.'
  },
  {
    step: '02',
    title: 'Meet The Team',
    description: 'Connect with talent partners and hiring managers to explore mutual fit.'
  },
  {
    step: '03',
    title: 'Collaborative Sessions',
    description: 'Solve relevant scenarios, pair with future teammates, and outline your impact plan.'
  },
  {
    step: '04',
    title: 'Join The Crew',
    description: 'Review offer details, discuss ramp-up, and start your first mission.'
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Careers"
          title="Build The Future Of Production Ops"
          highlight="Future"
          description="From engineers to event producers, GHXSTSHIP is home to people obsessed with shipping world-class creative operations."
          actions={
            <Link href="#open-roles">
              <Button className="group" size="lg">
                Browse Open Roles
                <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
              </Button>
            </Link>
          }
        />
        <div className="mt-2xl">
          <MarketingStatGrid items={heroStats} />
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Open Positions"
          title="Join A Team Shaping Creative Workflows"
          description="We’re scaling every department to support productions in film, live events, advertising, and beyond."
        />

        <div id="open-roles" className="mt-2xl grid gap-xl">
          {openPositions.map((role) => (
            <Card key={role.id} className="border border-border bg-card shadow-sm transition hover:-translate-y-1 motion-reduce:hover:translate-y-0 hover:shadow-elevation-4">
              <CardContent className="flex flex-col gap-lg p-xl">
                <div className="flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
                  <div>
                    <Badge variant="outline" className="uppercase tracking-[0.2em]">
                      {role.department}
                    </Badge>
                    <h3 className="mt-sm text-heading-4 uppercase leading-tight">{role.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-sm text-body-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-xs">
                      <MapPin className="h-icon-xs w-icon-xs" />
                      {role.location}
                    </span>
                    <span className="inline-flex items-center gap-xs">
                      <Calendar className="h-icon-xs w-icon-xs" />
                      {role.posted}
                    </span>
                    <span className="inline-flex items-center gap-xs">
                      <Briefcase className="h-icon-xs w-icon-xs" />
                      {role.type}
                    </span>
                  </div>
                </div>

                <p className="text-body text-muted-foreground leading-relaxed">{role.description}</p>

                <div className="grid gap-sm md:grid-cols-2">
                  <div className="space-y-xs">
                    <span className="text-body-xs uppercase tracking-[0.2em] text-muted-foreground">What you’ll bring</span>
                    <ul className="space-y-xxs text-body-sm text-muted-foreground">
                      {role.requirements.map((requirement) => (
                        <li key={requirement} className="inline-flex items-start gap-xs">
                          <CheckCircle className="mt-xxs h-icon-2xs w-icon-2xs text-success" />
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-xs">
                    <span className="text-body-xs uppercase tracking-[0.2em] text-muted-foreground">Compensation</span>
                    <p className="text-body-sm text-muted-foreground">{role.salary}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-sm">
                  <Button className="group">
                    Apply Now
                    <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                  </Button>
                  <Button variant="outline">Share Role</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Benefits"
          title="How We Support The Crew"
          description="Competitive compensation, flexible work, and career development programs keep our teams thriving."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <MarketingCard
                key={benefit.title}
                title={benefit.title}
                description={benefit.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Departments"
          title="Teams Hiring Right Now"
          description="Find the crew where your skills will have the biggest impact."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {departments.map((dept) => (
            <MarketingCard
              key={dept.name}
              title={dept.name}
              description={dept.description}
              highlight={`${dept.openings} open roles`}
              icon={<Users className="h-icon-md w-icon-md" />}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Interview Process"
          title="Transparent From First Hello To Offer"
          description="We respect your time with clear timelines, collaborative sessions, and actionable feedback."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-4">
          {hiringProcess.map((step) => (
            <MarketingCard
              key={step.step}
              title={`Step ${step.step}`}
              description={`${step.title} · ${step.description}`}
              icon={<Calendar className="h-icon-md w-icon-md" />}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Ready To Build The Future With Us?"
          description="Take the next step in your career and help GHXSTSHIP power productions that define culture."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="#open-roles">
            <Button className="group" size="lg">
              View Open Roles
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
            </Button>
          </Link>
          <Link href="mailto:careers@ghxstship.com">
            <Button variant="outline" size="lg">
              Join Talent Network
            </Button>
          </Link>
        </div>
      </MarketingSection>
    </div>
  );
}
