import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, CardContent } from '@ghxstship/ui';
import { ArrowRight, Award, Calendar, Globe, GraduationCap, Heart, Lightbulb, MessageCircle, Target, Users, Zap } from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid
} from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Community Opportunities - Get Involved & Grow | GHXSTSHIP',
  description:
    'Discover opportunities to collaborate, learn, and grow with our community of 25,000+ creative professionals. Find mentorship, projects, events, and more.',
  openGraph: {
    title: 'Community Opportunities - Get Involved & Grow | GHXSTSHIP',
    description:
      'Discover opportunities to collaborate, learn, and grow with our community of 25,000+ creative professionals. Find mentorship, projects, events, and more.',
    url: 'https://ghxstship.com/community/opportunities'
  }
};

const opportunityStats = [
  { label: 'Active Opportunities', value: '300+' },
  { label: 'Community Members', value: '25K+' },
  { label: 'Documented Success Stories', value: '1,200+' },
  { label: 'Countries Represented', value: '50+' },
];

const opportunityCategories = [
  {
    title: 'Career Development',
    description: 'Mentorship, apprenticeships, and leadership programs to accelerate your growth.',
    icon: GraduationCap,
    total: '156 openings',
    spotlight: 'Creative Mentorship Program'
  },
  {
    title: 'Project Collaboration',
    description: 'Join productions seeking producers, crew, strategists, and creative partners.',
    icon: Users,
    total: '89 teams hiring',
    spotlight: 'Innovation Lab Contributor'
  },
  {
    title: 'Events & Networking',
    description: 'Host or attend field-leading workshops, showcases, and regional meetups.',
    icon: Calendar,
    total: '34 events live',
    spotlight: 'Community Event Organizer'
  },
  {
    title: 'Leadership & Recognition',
    description: 'Shape the community, create educational content, and earn professional visibility.',
    icon: Award,
    total: '23 active roles',
    spotlight: 'Content Creator Program'
  },
];

const featuredOpportunities = [
  {
    id: 'mentorship-program',
    title: 'Creative Mentorship Program',
    type: 'Career Development',
    description:
      'Pair with industry veterans for strategic guidance, portfolio reviews, and tailored career planning.',
    commitment: '2-4 hours / month',
    duration: '6 months',
    participants: '50 mentors · 100 mentees',
    benefits: ['Personalized guidance', 'Industry insights', 'Network expansion', 'Career acceleration'],
    icon: GraduationCap,
    status: 'Open',
    deadline: 'Rolling'
  },
  {
    id: 'innovation-lab',
    title: 'Innovation Lab Contributor',
    type: 'Project Collaboration',
    description:
      'Prototype with volumetric capture, AR workflows, and AI co-pilots alongside cross-disciplinary teams.',
    commitment: '10-15 hours / week',
    duration: '3 months',
    participants: '12 researchers',
    benefits: ['Emerging tech access', 'Publication potential', 'Patent pathways', 'Stipend available'],
    icon: Lightbulb,
    status: 'Applications Open',
    deadline: 'Dec 31, 2024'
  },
  {
    id: 'community-events',
    title: 'Community Event Organizer',
    type: 'Events & Networking',
    description:
      'Design and deliver local gatherings, hybrid workshops, and digital summits that elevate regional talent.',
    commitment: '5-10 hours / week',
    duration: 'Ongoing',
    participants: 'Regional cohorts',
    benefits: ['Leadership experience', 'Production resources', 'Budget support', 'Local partnerships'],
    icon: Calendar,
    status: 'Open',
    deadline: 'Rolling'
  },
  {
    id: 'content-creation',
    title: 'Content Creator Program',
    type: 'Leadership & Recognition',
    description:
      'Craft tutorials, playbooks, and behind-the-scenes breakdowns viewed by thousands of creative pros.',
    commitment: 'Flexible',
    duration: 'Ongoing',
    participants: 'Unlimited',
    benefits: ['Platform amplification', 'Editorial support', 'Community recognition', 'Revenue sharing'],
    icon: MessageCircle,
    status: 'Open',
    deadline: 'Rolling'
  },
];

const successStories = [
  {
    name: 'Alex Chen',
    role: 'Producer · Mentor',
    story:
      'Transitioned from mentee to mentor, launching 12 careers and leading multi-region collaboration tracks.',
    impact: '12 careers launched'
  },
  {
    name: 'Sarah Rodriguez',
    role: 'Innovation Lab Fellow',
    story:
      'Led volumetric capture research, secured $2M in funding, and published two patents with GHXSTSHIP teams.',
    impact: '$2M in grants · 2 patents'
  },
  {
    name: 'Marcus Johnson',
    role: 'Community Event Champion',
    story:
      'Built a network of 200+ creatives, facilitated 47 collaborations, and helped produce 23 new jobs regionally.',
    impact: '47 collaborations · 23 jobs'
  },
];

const gettingStartedSteps = [
  {
    step: 1,
    title: 'Create Your Profile',
    description: 'Showcase your experience, goals, and availability so opportunities can find you.',
    icon: Users
  },
  {
    step: 2,
    title: 'Join the Conversation',
    description: 'Introduce yourself in our community hubs and start building trusted connections.',
    icon: MessageCircle
  },
  {
    step: 3,
    title: 'Explore Open Roles',
    description: 'Filter by commitment, skill focus, or geography to find perfect-fit opportunities.',
    icon: Target
  },
  {
    step: 4,
    title: 'Make Your Move',
    description: 'Apply, co-create, and track your progress with curated support from GHXSTSHIP.',
    icon: Heart
  },
];

export default function OpportunitiesPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Community Opportunities"
          title="Grow With The Community"
          highlight="Grow"
          description="Unlock mentorship, collaboration, and leadership pathways designed for creative professionals ready to step into their next chapter."
          actions={
            <>
              <Button className="group">
                Browse Opportunities
                <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
              </Button>
              <Button variant="outline">Create Profile</Button>
            </>
          }
        />
        <div className="mt-2xl">
          <MarketingStatGrid items={opportunityStats} />
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Opportunity Categories"
          title="Choose A Path That Matches Your Goals"
          description="Four tracks that organize hundreds of active listings across mentorship, collaboration, events, and leadership."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {opportunityCategories.map((category) => {
            const Icon = category.icon;
            return (
              <MarketingCard
                key={category.title}
                title={category.title}
                description={category.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
                highlight={category.total}
                footer={
                  <div className="flex items-center justify-between text-body-sm text-muted-foreground">
                    <span>Spotlight: {category.spotlight}</span>
                    <Button variant="ghost" size="sm" className="px-sm">
                      View
                    </Button>
                  </div>
                }
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Featured Opportunities"
          title="High-Impact Roles Ready For You"
          description="These programs offer clear outcomes, coaching, and support to accelerate your momentum."
        />

        <div className="mt-2xl grid gap-xl lg:grid-cols-2">
          {featuredOpportunities.map((opportunity) => {
            const Icon = opportunity.icon;
            return (
              <Card key={opportunity.id} className="flex h-full flex-col justify-between gap-xl rounded-3xl border border-border bg-card p-xl shadow-sm transition hover:-translate-y-1 motion-reduce:hover:translate-y-0 hover:shadow-elevation-4">
                <div className="flex items-start gap-md">
                  <div className="inline-flex h-icon-xl w-icon-xl items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-icon-md w-icon-md" />
                  </div>
                  <div className="space-y-sm">
                    <Badge variant="outline" className="uppercase tracking-[0.2em]">
                      {opportunity.type}
                    </Badge>
                    <h3 className="text-heading-4 uppercase leading-tight">{opportunity.title}</h3>
                    <p className="text-body-sm text-muted-foreground leading-relaxed">
                      {opportunity.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-sm text-body-sm text-muted-foreground">
                  <div>
                    <span className="block text-body-xs uppercase tracking-[0.2em]">Commitment</span>
                    <span className="font-medium text-foreground">{opportunity.commitment}</span>
                  </div>
                  <div>
                    <span className="block text-body-xs uppercase tracking-[0.2em]">Duration</span>
                    <span className="font-medium text-foreground">{opportunity.duration}</span>
                  </div>
                  <div>
                    <span className="block text-body-xs uppercase tracking-[0.2em]">Participants</span>
                    <span className="font-medium text-foreground">{opportunity.participants}</span>
                  </div>
                  <div>
                    <span className="block text-body-xs uppercase tracking-[0.2em]">Deadline</span>
                    <span className="font-medium text-foreground">{opportunity.deadline}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-xs">
                  {opportunity.benefits.map((benefit) => (
                    <Badge key={benefit} variant="secondary" className="text-xs">
                      {benefit}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-sm">
                  <Badge variant={opportunity.status === 'Open' ? 'default' : 'secondary'}>{opportunity.status}</Badge>
                  <div className="flex gap-sm">
                    <Button size="sm">Apply Now</Button>
                    <Button size="sm" variant="outline">
                      Learn More
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Success Stories"
          title="Proof That Participation Pays Off"
          description="Members who stepped into GHXSTSHIP opportunities and unlocked new roles, funding, and collaborations."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {successStories.map((story) => (
            <MarketingCard
              key={story.name}
              title={story.name}
              description={story.story}
              highlight={story.impact}
              icon={<Heart className="h-icon-md w-icon-md" />}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Getting Started"
          title="Your Path To Participation"
          description="The GHXSTSHIP playbook for moving from curiosity to contribution in four straightforward steps."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-4">
          {gettingStartedSteps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.step} className="flex h-full flex-col gap-md rounded-3xl border border-border bg-card p-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-body-xs uppercase tracking-[0.25em] text-muted-foreground">Step {step.step}</span>
                  <div className="inline-flex h-icon-xl w-icon-xl items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-icon-md w-icon-md" />
                  </div>
                </div>
                <h3 className="text-heading-4 uppercase leading-tight">{step.title}</h3>
                <p className="text-body-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </Card>
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Ready To Get Involved?"
          description="Join thousands of creative professionals who are learning, collaborating, and succeeding together inside GHXSTSHIP."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/auth/signup">
            <Button className="group">
              Join The Community
              <Users className="ml-sm h-icon-xs w-icon-xs" />
            </Button>
          </Link>
          <Button variant="outline">Explore All Opportunities</Button>
        </div>
      </MarketingSection>
    </div>
  );
}
