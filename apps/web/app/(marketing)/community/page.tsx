import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button } from '@ghxstship/ui';
import {
  ArrowRight,
  Calendar,
  Github,
  Instagram,
  MessageCircle,
  MessageSquare,
  Trophy,
  Twitter,
  Twitch,
  Users,
  Youtube,
} from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatGrid,
} from '../../_components/marketing';

export const metadata: Metadata = {
  title: 'Community - Production Pros Who Actually Help | GHXSTSHIP',
  description:
    "Join 25,000+ production professionals who share real advice, collaborate on projects, and push the industry forward. Connect with peers who actually show up.",
  openGraph: {
    title: 'Community - Production Pros Who Actually Help | GHXSTSHIP',
    description:
      "Join 25,000+ production professionals who share real advice, collaborate on projects, and push the industry forward.",
    url: 'https://ghxstship.com/community',
  },
};

const communityStats = [
  { label: 'Members', value: '25K+' },
  { label: 'Active Conversations', value: '1,800+' },
  { label: 'Live Events / Year', value: '120+' },
  { label: 'Mentorship Matches', value: '530+' },
];

const communityChannels = [
  {
    name: 'Skool Community',
    description: 'Real-time chat with production pros who answer questions and share resources.',
    members: '15,247 members',
    activity: 'Very active',
    href: 'https://www.skool.com/rogue-ops-collective-3068/about?ref=4f6baad2394a4a7daf965d8e8f1a86ed',
    icon: MessageSquare,
  },
  {
    name: 'Forums',
    description: 'Deep-dive discussions, project breakdowns, and long-form AMAs with experts.',
    members: '12,456 members',
    activity: 'Active',
    href: '/community/forums',
    icon: MessageCircle,
  },
  {
    name: 'Events & Meetups',
    description: 'Workshops, networking, and office hours hosted weekly across regions.',
    members: '5,678 attendees',
    activity: 'Weekly',
    href: '/community/events',
    icon: Calendar,
  },
];

const socialChannels = [
  {
    name: 'Twitter',
    handle: '@ghxstship',
    followers: '25K followers',
    icon: Twitter,
    href: 'https://twitter.com/ghxstship',
  },
  {
    name: 'LinkedIn',
    handle: 'GHXSTSHIP',
    followers: '18K followers',
    icon: Users,
    href: 'https://linkedin.com/company/ghxstship',
  },
  {
    name: 'YouTube',
    handle: '@ghxstship',
    followers: '12K subscribers',
    icon: Youtube,
    href: 'https://youtube.com/@ghxstship',
  },
  {
    name: 'GitHub',
    handle: 'ghxstship',
    followers: '8K stars',
    icon: Github,
    href: 'https://github.com/ghxstship',
  },
  {
    name: 'Instagram',
    handle: '@ghxstship',
    followers: '10K followers',
    icon: Instagram,
    href: 'https://instagram.com/ghxstship',
  },
  {
    name: 'Twitch',
    handle: '@ghxstship',
    followers: '5K followers',
    icon: Twitch,
    href: 'https://twitch.tv/ghxstship',
  },
];

const highlights = [
  {
    title: 'Community Champion',
    description: 'Recognizes members who provide consistent support, insights, and mentorship.',
    icon: Trophy,
    metric: '156 honorees',
  },
  {
    title: 'Knowledge Sharer',
    description: 'Celebrates detailed breakdowns, templates, and resources shared with peers.',
    icon: Users,
    metric: '500+ contributions',
  },
  {
    title: 'Event Organizers',
    description: 'Spotlights volunteers who host meetups, workshops, and showcases.',
    icon: Calendar,
    metric: '45 active hosts',
  },
];

const upcomingEvents = [
  {
    title: 'Production Management Masterclass',
    date: 'Dec 15, 2024',
    time: '2:00 PM ET',
    type: 'Workshop',
    description: 'Hands-on training for managing multi-location shoots and live events.',
  },
  {
    title: 'Creative Networking Mixer',
    date: 'Dec 20, 2024',
    time: '6:00 PM ET',
    type: 'Networking',
    description: 'Meet agency producers, freelance talent, and studio leads building big campaigns.',
  },
  {
    title: 'ATLVS Feature Deep Dive',
    date: 'Jan 8, 2025',
    time: '1:00 PM ET',
    type: 'Product Session',
    description: 'Explore the latest production scheduling features and workflow automation.',
  },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Community"
          title="Join The GHXSTSHIP Network"
          highlight="GHXSTSHIP"
          description="Connect with producers, designers, technologists, and showrunners who exchange knowledge, collaborate on projects, and open doors for each other."
          actions={
            <>
              <Link
                href="https://www.skool.com/rogue-ops-collective-3068/about?ref=4f6baad2394a4a7daf965d8e8f1a86ed"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="group">
                  Join Skool Community
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                </Button>
              </Link>
              <Link href="/community/opportunities">
                <Button variant="outline">Explore Opportunities</Button>
              </Link>
            </>
          }
        />
        <div className="mt-2xl">
          <MarketingStatGrid items={communityStats} />
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Where We Gather"
          title="Spaces Designed For Real Collaboration"
          description="Three hubs where conversations stay high-signal, resources flow freely, and events keep relationships strong."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {communityChannels.map((channel) => {
            const Icon = channel.icon;
            return (
              <MarketingCard
                key={channel.name}
                title={channel.name}
                description={channel.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
                highlight={channel.members}
                footer={
                  <div className="flex items-center justify-between text-body-sm text-muted-foreground">
                    <span>{channel.activity}</span>
                    <Link href={channel.href} target={channel.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
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
          eyebrow="Social Signals"
          title="Follow The Broadcast Channels"
          description="Stay in the loop with platform announcements, behind-the-scenes breakdowns, and live build sessions."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2 xl:grid-cols-3">
          {socialChannels.map((channel) => {
            const Icon = channel.icon;
            return (
              <MarketingCard
                key={channel.name}
                title={channel.name}
                description={`${channel.handle} · ${channel.followers}`}
                icon={<Icon className="h-icon-md w-icon-md" />}
                footer={
                  <Link href={channel.href} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="px-sm">
                      Follow
                    </Button>
                  </Link>
                }
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Community Highlights"
          title="Recognition From Your Peers"
          description="We celebrate members who share generously, host meaningful events, and lead collaborative breakthroughs."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {highlights.map((highlight) => {
            const Icon = highlight.icon;
            return (
              <MarketingCard
                key={highlight.title}
                title={highlight.title}
                description={highlight.description}
                icon={<Icon className="h-icon-md w-icon-md" />}
                highlight={highlight.metric}
              />
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Upcoming Events"
          title="Connect Live Online & In Person"
          description="Workshops, mixers, and product sessions hosted every month across the GHXSTSHIP network."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-3">
          {upcomingEvents.map((event) => (
            <MarketingCard
              key={event.title}
              title={event.title}
              description={event.description}
              highlight={`${event.date} · ${event.time}`}
              icon={<Calendar className="h-icon-md w-icon-md" />}
              footer={<span className="text-body-sm text-muted-foreground">{event.type}</span>}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          title="Ready To Dive In?"
          description="Whether you need answers, collaborators, or inspiration, the GHXSTSHIP community is ready to help."
          align="center"
        />
        <div className="mt-xl flex flex-col items-center justify-center gap-md sm:flex-row">
          <Link href="/community/opportunities">
            <Button className="group">
              Find Opportunities
              <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
            </Button>
          </Link>
          <Link
            href="https://www.skool.com/rogue-ops-collective-3068/about?ref=4f6baad2394a4a7daf965d8e8f1a86ed"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline">Join Skool</Button>
          </Link>
        </div>
      </MarketingSection>
    </div>
  );
}
