import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card } from '@ghxstship/ui';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

import {
  MarketingCard,
  MarketingSection,
  MarketingSectionHeader,
} from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Community Events | GHXSTSHIP',
  description: 'Join GHXSTSHIP community events, workshops, and meetups to connect with fellow creators.',
};

const upcomingEvents = [
  {
    title: 'ATLVS Masterclass: Advanced Workflows',
    date: 'Feb 15, 2025',
    time: '2:00 PM PT',
    location: 'Virtual',
    seats: '156 registered',
    type: 'Workshop',
    href: '#',
  },
  {
    title: 'GHXSTSHIP User Meetup – Los Angeles',
    date: 'Feb 22, 2025',
    time: '6:00 PM PT',
    location: 'Los Angeles, CA',
    seats: '45 in person',
    type: 'Meetup',
    href: '#',
  },
  {
    title: 'OPENDECK Product Demo & Q&A',
    date: 'Mar 01, 2025',
    time: '11:00 AM PT',
    location: 'Virtual',
    seats: '89 registered',
    type: 'Product Session',
    href: '#',
  },
];

const hostingInfo = [
  {
    title: 'Host an Event',
    body: 'Bring the GHXSTSHIP community to your city or launch a virtual learning experience. We provide marketing, registration, and production support.',
    cta: 'Submit Proposal',
    href: '#',
  },
  {
    title: 'Watch On-Demand',
    body: 'Catch up on recordings, decks, and resources from past workshops, product sessions, and mixers.',
    cta: 'View Archive',
    href: '#',
  },
];

export default function EventsPage() {
  return (
    <div className="min-h-screen">
      <MarketingSection variant="gradient" padding="lg">
        <MarketingSectionHeader
          eyebrow="Community Events"
          title="Connect, Learn, Build Together"
          highlight="Together"
          description="Workshops, meetups, and live sessions built by the GHXSTSHIP network. Join the conversations that move projects forward."
          actions={<Button>Browse All Events</Button>}
        />
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Upcoming Sessions"
          title="On The Calendar"
          description="Reserve your spot for high-signal gatherings designed for producers, creative directors, and operations leads."
        />

        <div className="mt-2xl grid gap-xl">
          {upcomingEvents.map((event) => (
            <Card
              key={event.title}
              className="flex flex-col gap-xl rounded-3xl border border-border bg-card p-xl shadow-sm transition hover:-translate-y-1 motion-reduce:hover:translate-y-0 hover:shadow-elevation-4"
            >
              <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
                <div className="space-y-sm">
                  <Badge variant="outline" className="w-fit uppercase tracking-[0.2em]">
                    {event.type}
                  </Badge>
                  <h3 className="text-heading-3 uppercase leading-tight">{event.title}</h3>
                  <div className="flex flex-wrap gap-md text-body-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-xs">
                      <Calendar className="h-icon-xs w-icon-xs" />
                      {event.date}
                    </span>
                    <span className="inline-flex items-center gap-xs">
                      <Clock className="h-icon-xs w-icon-xs" />
                      {event.time}
                    </span>
                    <span className="inline-flex items-center gap-xs">
                      <MapPin className="h-icon-xs w-icon-xs" />
                      {event.location}
                    </span>
                    <span className="inline-flex items-center gap-xs">
                      <Users className="h-icon-xs w-icon-xs" />
                      {event.seats}
                    </span>
                  </div>
                </div>
                <div className="flex gap-sm">
                  <Button size="sm">Register</Button>
                  <Button size="sm" variant="outline">Add to Calendar</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection variant="muted">
        <MarketingSectionHeader
          eyebrow="Get Involved"
          title="Bring The Community To You"
          description="Run a session, host a meetup, or catch up on replays—we’ll equip you with everything you need."
        />

        <div className="mt-2xl grid gap-xl md:grid-cols-2">
          {hostingInfo.map((card) => (
            <MarketingCard
              key={card.title}
              title={card.title}
              description={card.body}
              footer={
                <Link href={card.href}>
                  <Button variant="outline">{card.cta}</Button>
                </Link>
              }
            />
          ))}
        </div>
      </MarketingSection>
    </div>
  );
}
