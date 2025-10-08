import type { Metadata } from 'next';
import Link from 'next/link';
import { Anton } from 'next/font/google';
import { Button } from '@ghxstship/ui';
import { ArrowRight, Award, Heart, Lightbulb, Rocket, Shield, Target, Users } from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid
} from '../../../_components/marketing';

const anton = Anton({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'About GHXSTSHIP - Built by Production Veterans | GHXSTSHIP',
  description: 'Learn about GHXSTSHIP\'s mission, journey, and the experienced team revolutionizing creative production management.',
  openGraph: {
    title: 'About GHXSTSHIP - Built by Production Veterans | GHXSTSHIP',
    description: 'Learn about GHXSTSHIP\'s mission, journey, and the experienced team revolutionizing creative production management.',
    url: 'https://ghxstship.com/company/about'
  }
};

const stats = [
  { label: 'Years of Combined Experience', value: '50+' },
  { label: 'Major Productions Managed', value: '500+' },
  { label: 'Countries Served', value: '45+' },
  { label: 'Active Users', value: '25K+' },
];

const missionPoints = [
  {
    icon: Target,
    title: 'PURPOSE-BUILT TOOLS',
    description: 'We build software that actually works when the pressure is high and deadlines are non-negotiable.'
  },
  {
    icon: Users,
    title: 'TEAM-FIRST DESIGN',
    description: 'Every feature is designed with the people who use it in mind - not just what they need, but how they work.'
  },
  {
    icon: Shield,
    title: 'ENTERPRISE RELIABILITY',
    description: 'When millions are on the line, you need systems that don\'t break. We\'ve built for that reality.'
  },
];

const values = [
  {
    icon: Heart,
    title: 'People First',
    description: 'Creative professionals deserve tools that amplify their talents, not complicate their lives.'
  },
  {
    icon: Lightbulb,
    title: 'Innovation Through Experience',
    description: 'Every feature comes from years of hands-on production experience, not theoretical assumptions.'
  },
  {
    icon: Rocket,
    title: 'Relentless Improvement',
    description: 'We never stop pushing boundaries to make creative work more efficient and enjoyable.'
  },
];

const milestones = [
  { year: '2018', title: 'The Spark', description: 'Julian Clarkson realizes production management software is stuck in the 90s after managing Formula 1 hospitality for 1,000+ crew.' },
  { year: '2019', title: 'GHXSTSHIP Founded', description: 'Launched with a clear mission: build tools that don\'t suck when lives depend on them.' },
  { year: '2020', title: 'ATLVS Platform Launch', description: 'Released our production management platform, quickly adopted by studios and agencies worldwide.' },
  { year: '2021', title: 'Global Expansion', description: 'Opened offices in London and Singapore to support international productions and creative teams.' },
  { year: '2022', title: 'OPENDECK Marketplace', description: 'Launched the creative talent marketplace, connecting professionals with opportunities worldwide.' },
  { year: '2023', title: 'AI Integration', description: 'Introduced AI-powered features to automate scheduling, budgeting, and resource allocation.' },
  { year: '2024', title: 'Enterprise Scale', description: 'Now managing $75K+ projects with 25K+ active creators across 45+ countries.' },
];

const leadership = [
  {
    name: 'Julian Clarkson',
    role: 'Founder & CEO',
    bio: 'Former Formula 1 hospitality director who managed 1,000+ crew members. Built GHXSTSHIP after realizing existing tools were inadequate for real production demands.'
  },
  {
    name: 'Sarah Chen',
    role: 'Chief Technology Officer',
    bio: 'Former Netflix production technology lead. Pioneered digital workflow systems for major film studios and streaming platforms.'
  },
  {
    name: 'Marcus Thompson',
    role: 'VP of Product',
    bio: 'Ex-Disney Imagineering director who designed operations for theme park openings and global entertainment events.'
  },
  {
    name: 'Lisa Rodriguez',
    role: 'Chief Operating Officer',
    bio: 'Former Universal Studios operations executive who managed logistics for blockbuster movie premieres and world tours.'
  },
];

const awards = [
  {
    title: 'Best Production Management Platform',
    organization: 'Creative Industry Awards 2024',
    description: 'Recognized for revolutionizing how creative teams manage complex productions.'
  },
  {
    title: 'Innovation in SaaS',
    organization: 'TechCrunch Awards 2024',
    description: 'Honored for building enterprise software that actually works in high-stakes creative environments.'
  },
  {
    title: 'Best Workplace Culture',
    organization: 'Great Place to Work 2023',
    description: 'Celebrated for our commitment to supporting creative professionals and fostering innovation.'
  },
  {
    title: 'Fastest Growing SaaS Company',
    organization: 'Forrester Wave 2023',
    description: 'Recognized for rapid adoption and market disruption in the creative technology space.'
  },
];

const relatedLinks = [
  {
    title: 'Our Solutions',
    description: 'Explore how GHXSTSHIP serves different creative industries and production types.',
    href: '/solutions'
  },
  {
    title: 'Careers',
    description: 'Join our team of production veterans building the future of creative operations.',
    href: '/careers'
  },
  {
    title: 'Press & Media',
    description: 'Read the latest news and coverage about GHXSTSHIP from leading publications.',
    href: '/press'
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <div className="stack-4xl text-center">
          <MarketingSectionHeader
            eyebrow="Our Story"
            title="BUILT BY PEOPLE WHO ACTUALLY DO THIS"
            highlight="WHO ACTUALLY DO THIS"
            description="Born from 13+ years of wrangling chaos in live entertainment, GHXSTSHIP turns the beautiful madness of creative production into a system that actually works."
          />
          <MarketingStatGrid items={stats} className="max-w-4xl mx-auto" />
        </div>
      </MarketingSection>

      <MarketingSection>
        <div className="grid items-center gap-2xl lg:grid-cols-2">
          <div className="stack-xl text-left">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 uppercase text-heading-gradient`}>OUR MISSION</h2>
            <p className="marketing-microcopy max-w-xl text-left text-base text-foreground/80">
              To build production management tools that don&apos;t make you toss your laptop across the room. After managing everything from cruise ship entertainment to Formula 1 hospitality, we know what actually works when the pressure&apos;s high and the clock is merciless.
            </p>
            <div className="stack-lg">
              {missionPoints.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-md">
                  <div className="marketing-tag shrink-0">
                    <Icon className="h-icon-sm w-icon-sm" />
                  </div>
                  <div className="stack-xs">
                    <h3 className="text-heading-4 text-heading-foreground uppercase">{title}</h3>
                    <p className="marketing-microcopy text-left">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="marketing-card marketing-interactive p-xl text-left">
            <h3 className={`${anton.className} text-heading-3 uppercase text-heading-gradient mb-md`}>Our Vision</h3>
            <p className="marketing-microcopy mb-lg">
              A world where production management doesn&apos;t require a PhD in chaos theory. Where creative professionals can focus on creating instead of fighting with spreadsheets that break when you look at them wrong.
            </p>
            <blockquote className="border-l-2 border-accent/60 pl-md italic text-foreground">
              &ldquo;We&apos;re building the tools I wish I had when managing 1,000+ crew members at 3am during Formula 1 weekend. Spoiler alert: it would&apos;ve been nice.&rdquo;
            </blockquote>
            <cite className="marketing-microcopy mt-sm block">— Julian Clarkson, Founder &amp; CXO</cite>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <div className="stack-3xl">
          <MarketingSectionHeader
            title="OUR VALUES"
            description="These core values guide every decision we make and every feature we ship."
          />
          <div className="grid gap-lg md:grid-cols-2">
            {values.map(({ icon: Icon, title, description }) => (
              <MarketingCard
                key={title}
                title={title}
                description={description}
                icon={<Icon className="h-icon-lg w-icon-lg" />}
                accent="primary"
                className="items-start text-left"
              />
            ))}
          </div>
        </div>
      </MarketingSection>

      <MarketingSection>
        <div className="stack-3xl">
          <MarketingSectionHeader
            title="OUR JOURNEY"
            description="From a scrappy startup to a global platform serving creative professionals worldwide."
            align="center"
          />
          <div className="relative">
            <div className="absolute left-1/2 hidden h-full w-px -translate-x-1/2 bg-border md:block" aria-hidden />
            <div className="stack-2xl">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`flex flex-col gap-xl md:flex-row ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="flex-1">
                    <div className="marketing-card marketing-interactive p-xl text-left">
                      <div className="text-heading-4 text-heading-foreground mb-xs">{milestone.year}</div>
                      <h3 className={`${anton.className} text-heading-3 uppercase text-heading-gradient mb-sm`}>
                        {milestone.title}
                      </h3>
                      <p className="marketing-microcopy text-left">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="mx-auto flex h-full w-full max-w-[2rem] items-center justify-center md:mx-0">
                    <span className="h-3 w-3 rounded-full bg-accent" />
                  </div>
                  <div className="hidden flex-1 md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <div className="stack-3xl">
          <MarketingSectionHeader
            title="LEADERSHIP TEAM"
            description="Meet the experienced leaders driving GHXSTSHIP's vision and growth."
            align="center"
          />
          <div className="grid gap-lg md:grid-cols-2 lg:grid-cols-4">
            {leadership.map((leader) => (
              <MarketingCard
                key={leader.name}
                title={leader.name}
                description={leader.bio}
                icon={<Users className="h-icon-lg w-icon-lg" />}
                accent="primary"
                highlight={leader.role}
                className="items-center text-center"
                footer={<span className="marketing-microcopy">{leader.role}</span>}
              />
            ))}
          </div>
        </div>
      </MarketingSection>

      <MarketingSection>
        <div className="stack-3xl">
          <MarketingSectionHeader
            title="AWARDS & RECOGNITION"
            description="Real-world achievements from actually managing large-scale productions (not just talking about it)."
            align="center"
          />
          <div className="grid gap-lg md:grid-cols-2 lg:grid-cols-3">
            {awards.map((award) => (
              <MarketingCard
                key={award.title}
                title={award.title}
                description={award.description}
                icon={<Award className="h-icon-lg w-icon-lg" />}
                accent="primary"
                className="items-start text-left"
                footer={<span className="marketing-microcopy">{award.organization}</span>}
              />
            ))}
          </div>
        </div>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <div className="stack-2xl text-center">
          <MarketingSectionHeader
            title="JOIN OUR MISSION"
            description="Ready to use production tools that don't suck? Join the growing number of professionals who are done fighting with brittle software."
            align="center"
          />
          <div className="cluster-lg flex-wrap justify-center">
            <Link href="/auth/signup">
              <Button className="marketing-interactive w-full sm:w-auto">
                Start Creating
                <ArrowRight className="ml-sm h-icon-xs w-icon-xs" />
              </Button>
            </Link>
            <Link href="/careers">
              <Button variant="outline" className="marketing-interactive w-full sm:w-auto">
                Join Our Team
              </Button>
            </Link>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection>
        <div className="stack-2xl">
          <MarketingSectionHeader title="LEARN MORE" align="center" />
          <div className="grid gap-lg md:grid-cols-3">
            {relatedLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="marketing-card marketing-interactive block p-xl text-left"
              >
                <h3 className={`${anton.className} text-heading-3 uppercase text-heading-gradient mb-sm`}>
                  {link.title}
                </h3>
                <p className="marketing-microcopy">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </MarketingSection>
    </div>
  );
}
