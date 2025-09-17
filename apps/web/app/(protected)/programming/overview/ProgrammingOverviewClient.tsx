'use client';

import { useEffect, useState } from 'react';
import { Card, Button } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';
import { CalendarDays, Users, MapPin, Clock, FileText, Music } from 'lucide-react';

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
      color: 'color-primary'
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-secondary animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm form-label color-muted">
                    {stat.title}
                  </p>
                  <p className="text-heading-3 text-heading-3">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-body text-heading-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <Icon className="h-6 w-6 color-primary mt-1" />
                  <div className="flex-1">
                    <h3 className="form-label">{action.title}</h3>
                    <p className="text-body-sm color-muted mb-3">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-body text-heading-4">Recent Events</h2>
          <Card className="p-4">
            {recentEvents.length > 0 ? (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
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
              <p className="color-muted text-center py-4">No recent events</p>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-body text-heading-4">Upcoming Events</h2>
          <Card className="p-4">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
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
              <p className="color-muted text-center py-4">No upcoming events</p>
            )}
          </Card>
        </div>
      </div>

      {/* Programming Modules */}
      <div className="space-y-4">
        <h2 className="text-body text-heading-4">Programming Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="form-label mb-2">Calendar View</h3>
            <p className="text-body-sm color-muted mb-3">
              View all events and schedules in calendar format
            </p>
            <Button asChild>
              <a href="/programming/calendar">Open Calendar</a>
            </Button>
          </Card>
          
          <Card className="p-4">
            <h3 className="form-label mb-2">Technical Riders</h3>
            <p className="text-body-sm color-muted mb-3">
              Manage technical, hospitality, and stage plot requirements
            </p>
            <Button asChild>
              <a href="/programming/riders">Manage Riders</a>
            </Button>
          </Card>
          
          <Card className="p-4">
            <h3 className="form-label mb-2">Workshops</h3>
            <p className="text-body-sm color-muted mb-3">
              Schedule and organize educational sessions
            </p>
            <Button asChild>
              <a href="/programming/workshops">View Workshops</a>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
