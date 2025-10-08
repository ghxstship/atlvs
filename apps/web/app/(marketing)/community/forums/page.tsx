import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button } from '@ghxstship/ui';
import { ArrowRight, Calendar, Clock, MessageCircle, MessageSquare, TrendingUp, Users } from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid
} from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Community Forums | GHXSTSHIP',
  description: 'Join the GHXSTSHIP community forums to connect with other users, share knowledge, and get support.'
};

const forumStats = [
  { label: 'Threads', value: '4,735' },
  { label: 'Active Members', value: '3,276' },
  { label: 'Answers Resolved', value: '2,189' },
  { label: 'Daily Posts', value: '120+' },
];

const forumCategories = [
  {
    title: 'General Discussion',
    description: 'Production strategies, vendor recommendations, and shared learnings from live projects.',
    posts: 1247,
    members: 892,
    icon: MessageSquare,
    link: '#'
  },
  {
    title: 'Product Support',
    description: 'Workflow tips, integration guidance, and troubleshooting for ATLVS & OPENDECK.',
    posts: 2156,
    members: 1340,
    icon: Users,
    link: '#'
  },
  {
    title: 'Feature Requests',
    description: 'Shape the roadmap by highlighting the workflows and automations you need next.',
    posts: 543,
    members: 678,
    icon: TrendingUp,
    link: '#'
  },
  {
    title: 'Announcements',
    description: 'Release notes, program updates, and community news direct from the GHXSTSHIP team.',
    posts: 89,
    members: 2456,
    icon: Clock,
    link: '#'
  },
];

const guidelines = [
  {
    title: 'Respect Every Voice',
    description: 'Keep discussions constructive, inclusive, and grounded in real experience.'
  },
  {
    title: 'Share What Works',
    description: 'Help others by detailing the tactics, templates, and workflows driving results.'
  },
  {
    title: 'Stay Focused',
    description: 'Use tags, pick the right category, and keep threads on-topic to help others find answers.'
  },
];

const upcomingSessions = [
  {
    title: 'Office Hours: Production Planning',
    date: 'Dec 12, 2024',
    time: '1:00 PM ET',
    description: 'Drop in with your scheduling, budgeting, or staffing questions and leave with expert guidance.'
  },
  {
    title: 'Automation Deep Dive',
    date: 'Dec 19, 2024',
    time: '3:00 PM ET',
    description: 'See how power users are leveraging ATLVS automations to reduce manual effort by 40%.'
  },
  {
    title: 'Open Feedback Forum',
    date: 'Jan 9, 2025',
    time: '2:00 PM ET',
    description: 'Bring your feature requests and collaborate with the product team on future releases.'
  },
];

export default function ForumsPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Community Forums"
          title="Ask, Answer, Accelerate"
          highlight="Accelerate"
          description="Tap into thousands of professionals shipping productions daily. Share what works, troubleshoot fast, and stay ahead of the curve."
          actions={
            <Link href="#">
              <Button className="group">
                Join The Discussion
                <MessageCircle className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
              </Button>
            </Link>
          }
        />
        <div className="mt-2xl">
          <MarketingStatGrid items={forumStats} />
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Choose Your Channel"
          title="High-Signal Spaces For Every Need"
          description="Find the right room for your question—whether you need workflow support, inspiration, or a new integration."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2">
          {forumCategories.map((category) => {
            const Icon = category.icon;
            return (
              <MarketingCard
                key={category.title}
                title={category.title}
                description={category.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
                highlight={`${category.posts.toLocaleString()} posts`}
                footer={
                  <div className="flex items-center justify-between text-body-sm text-muted-foreground">
                    <span>{category.members.toLocaleString()} members</span>
                    <Link href={category.link}>
                      <Button variant="ghost" size="sm" className="px-sm">
                        Enter
                      </Button>
                    </Link>
                  </div>
                }
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Live Programming"
          title="Meet The Team In Real Time"
          description="Regular office hours and deep-dive sessions designed to keep your productions running smoothly."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {upcomingSessions.map((session) => (
            <MarketingCard
              key={session.title}
              title={session.title}
              description={session.description}
              highlight={`${session.date} · ${session.time}`}
              icon={<Calendar className="h-icon-md w-icon-md" />}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Guidelines"
          title="Keep The Signal High"
          description="A quick playbook so every thread remains actionable, respectful, and worth your time."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {guidelines.map((guideline) => (
            <MarketingCard
              key={guideline.title}
              title={guideline.title}
              description={guideline.description}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Ready To Post Your First Thread?"
          description="Introduce yourself, share a win, or ask for help—this forum is built to respond."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="#">
            <Button className="group">
              Start A Topic
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
            </Button>
          </Link>
          <Link href="/community/opportunities">
            <Button variant="outline">Explore Opportunities</Button>
          </Link>
        </div>
      </MarketingSection>
    </div>
  );
}
