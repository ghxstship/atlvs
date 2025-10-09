'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { Card, Button } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';
import { Calendar, CalendarDays, Clock, FileText, MapPin, Music, Users } from "lucide-react";

interface ProgrammingStats {
  totalEvents: number;
  upcomingEvents: number;
  totalSpaces: number;
  activeLineups: number;
}

interface EventData {
  id: string;
  name: string;
  kind: string;
  starts_at: string | null;
  project: { name: string } | null;
}

export default function ProgrammingOverviewClient({ 
  orgId, 
  stats: initialStats, 
  recentEvents, 
  upcomingEvents 
}: { 
  orgId: string;
  stats: ProgrammingStats;
  recentEvents: EventData[];
  upcomingEvents: EventData[];
}) {
  const t = useTranslations('programming');
  const [stats] = useState<ProgrammingStats>(initialStats);
  const [loading] = useState(false);

  const statCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: CalendarDays,
      color: 'color-accent'
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: Clock,
      color: 'color-success'
    },
    {
      title: 'Available Spaces',
      value: stats.totalSpaces,
      icon: MapPin,
      color: 'color-secondary'
    },
    {
      title: 'Active Lineups',
      value: stats.activeLineups,
      icon: Music,
      color: 'color-warning'
    }
  ];

  const quickActions = [
    {
      title: 'Create Event',
      description: 'Schedule a new performance, activation, or workshop',
      icon: CalendarDays,
      href: '/programming/events'
    },
    {
      title: 'Manage Spaces',
      description: 'Configure rooms, green rooms, and meeting spaces',
      icon: MapPin,
      href: '/programming/spaces'
    },
    {
      title: 'Build Lineups',
      description: 'Organize performer schedules and stage assignments',
      icon: Users,
      href: '/programming/lineups'
    },
    {
      title: 'Create Call Sheets',
      description: 'Generate daily production schedules',
      icon: FileText,
      href: '/programming/call-sheets'
    }
  ];

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-component-lg bg-secondary animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm form-label color-muted">
                    {stat.title}
                  </p>
                  <p className="text-heading-3 text-heading-3">{stat.value}</p>
                </div>
                <Icon className={`h-icon-lg w-icon-lg ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="stack-md">
        <h2 className="text-body text-heading-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="p-md hover:shadow-elevated transition-shadow">
                <div className="flex items-start cluster">
                  <Icon className="h-icon-md w-icon-md color-accent mt-xs" />
                  <div className="flex-1">
                    <h3 className="form-label">{action.title}</h3>
                    <p className="text-body-sm color-muted mb-sm">
                      {action.description}
                    </p>
                    <Button asChild>
                      <a href={action.href}>Get Started</a>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <div className="stack-md">
          <h2 className="text-body text-heading-4">Recent Events</h2>
          <Card className="p-md">
            {recentEvents.length > 0 ? (
              <div className="stack-sm">
                {recentEvents.map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between py-sm border-b last:border-b-0">
                    <div>
                      <p className="form-label">{event.name}</p>
                      <p className="text-body-sm color-muted">
                        {event.kind} • {event.project?.name || 'No project'}
                      </p>
                    </div>
                    <div className="text-body-sm color-muted">
                      {event.starts_at ? new Date(event.starts_at).toLocaleDateString() : 'No date'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="color-muted text-center py-md">No recent events</p>
            )}
          </Card>
        </div>

        <div className="stack-md">
          <h2 className="text-body text-heading-4">Upcoming Events</h2>
          <Card className="p-md">
            {upcomingEvents.length > 0 ? (
              <div className="stack-sm">
                {upcomingEvents.map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between py-sm border-b last:border-b-0">
                    <div>
                      <p className="form-label">{event.name}</p>
                      <p className="text-body-sm color-muted">
                        {event.kind} • {event.project?.name || 'No project'}
                      </p>
                    </div>
                    <div className="text-body-sm color-muted">
                      {event.starts_at ? new Date(event.starts_at).toLocaleDateString() : 'No date'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="color-muted text-center py-md">No upcoming events</p>
            )}
          </Card>
        </div>
      </div>

      {/* Programming Modules */}
      <div className="stack-md">
        <h2 className="text-body text-heading-4">Programming Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <Card className="p-md">
            <h3 className="form-label mb-sm">Calendar View</h3>
            <p className="text-body-sm color-muted mb-sm">
              View all events and schedules in calendar format
            </p>
            <Button asChild>
              <NextLink href="/programming/calendar">Open Calendar</NextLink>
            </Button>
          </Card>
          
          <Card className="p-md">
            <h3 className="form-label mb-sm">Technical Riders</h3>
            <p className="text-body-sm color-muted mb-sm">
              Manage technical, hospitality, and stage plot requirements
            </p>
            <Button asChild>
              <NextLink href="/programming/riders">Manage Riders</NextLink>
            </Button>
          </Card>
          
          <Card className="p-md">
            <h3 className="form-label mb-sm">Workshops</h3>
            <p className="text-body-sm color-muted mb-sm">
              Schedule and organize educational sessions
            </p>
            <Button asChild>
              <NextLink href="/programming/workshops">View Workshops</NextLink>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
