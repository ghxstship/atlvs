/**
 * PEOPLE MODULE - TIMELINE VIEW COMPONENT
 * Chronological data visualization for People events and milestones
 * Interactive timeline with dependency tracking
 */

"use client";

import React, { useMemo } from 'react';
import { Calendar, User, TrendingUp, Award, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineEvent {
  id: string;
  type: 'hire' | 'promotion' | 'review' | 'training' | 'achievement' | 'termination';
  title: string;
  description?: string;
  date: string;
  person: unknown;
  metadata?: Record<string, any>;
}

export interface TimelineViewProps {
  data: unknown[];
  events?: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
  onPersonClick?: (person: unknown) => void;
  className?: string;
  groupByPerson?: boolean;
}

const PeopleTimelineView: React.FC<TimelineViewProps> = ({
  data,
  events: externalEvents,
  onEventClick,
  onPersonClick,
  className,
  groupByPerson = false
}) => {
  // Generate timeline events from people data
  const generatedEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    data.forEach(person => {
      // Hire date
      if (person.start_date) {
        events.push({
          id: `hire-${person.id}`,
          type: 'hire',
          title: `${person.first_name} ${person.last_name} joined the team`,
          description: person.title ? `Hired as ${person.title}` : 'Joined the team',
          date: person.start_date,
          person,
          metadata: { department: person.department }
        });
      }

      // Mock additional events for demonstration
      if (person.start_date) {
        const hireDate = new Date(person.start_date);
        const monthsSinceHire = Math.floor((new Date().getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

        // Performance review (every 6 months)
        if (monthsSinceHire >= 6) {
          const reviewDate = new Date(hireDate);
          reviewDate.setMonth(reviewDate.getMonth() + 6);
          events.push({
            id: `review-${person.id}-6m`,
            type: 'review',
            title: `${person.first_name}'s 6-month performance review`,
            description: 'Completed performance evaluation',
            date: reviewDate.toISOString().split('T')[0],
            person,
            metadata: { reviewType: '6-month' }
          });
        }

        // Training completion (mock)
        if (monthsSinceHire >= 3) {
          const trainingDate = new Date(hireDate);
          trainingDate.setMonth(trainingDate.getMonth() + 3);
          events.push({
            id: `training-${person.id}`,
            type: 'training',
            title: `${person.first_name} completed onboarding training`,
            description: 'Successfully completed all required training modules',
            date: trainingDate.toISOString().split('T')[0],
            person,
            metadata: { trainingType: 'onboarding' }
          });
        }
      }
    });

    return events;
  }, [data]);

  const allEvents = useMemo(() => {
    const combined = [...generatedEvents, ...(externalEvents || [])];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [generatedEvents, externalEvents]);

  const groupedEvents = useMemo(() => {
    if (!groupByPerson) {
      // Group by month/year
      const grouped: Record<string, TimelineEvent[]> = {};

      allEvents.forEach(event => {
        const date = new Date(event.date);
        const monthYear = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

        if (!grouped[monthYear]) {
          grouped[monthYear] = [];
        }
        grouped[monthYear].push(event);
      });

      return grouped;
    } else {
      // Group by person
      const grouped: Record<string, TimelineEvent[]> = {};

      allEvents.forEach(event => {
        const personKey = `${event.person.first_name} ${event.person.last_name}`;

        if (!grouped[personKey]) {
          grouped[personKey] = [];
        }
        grouped[personKey].push(event);
      });

      return grouped;
    }
  }, [allEvents, groupByPerson]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'hire':
        return <User className="h-icon-sm w-icon-sm text-green-600" />;
      case 'promotion':
        return <TrendingUp className="h-icon-sm w-icon-sm text-blue-600" />;
      case 'review':
        return <Calendar className="h-icon-sm w-icon-sm text-purple-600" />;
      case 'training':
        return <BookOpen className="h-icon-sm w-icon-sm text-orange-600" />;
      case 'achievement':
        return <Award className="h-icon-sm w-icon-sm text-yellow-600" />;
      case 'termination':
        return <User className="h-icon-sm w-icon-sm text-red-600" />;
      default:
        return <Calendar className="h-icon-sm w-icon-sm text-gray-600" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'hire':
        return 'border-green-500 bg-green-50';
      case 'promotion':
        return 'border-blue-500 bg-blue-50';
      case 'review':
        return 'border-purple-500 bg-purple-50';
      case 'training':
        return 'border-orange-500 bg-orange-50';
      case 'achievement':
        return 'border-yellow-500 bg-yellow-50';
      case 'termination':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const renderEvent = (event: TimelineEvent) => {
    return (
      <div
        key={event.id}
        className="relative flex items-start space-x-md pb-8"
      >
        {/* Timeline line */}
        <div className="absolute left-6 top-xsxl bottom-0 w-0.5 bg-gray-200"></div>

        {/* Event icon */}
        <div className={cn(
          "relative z-10 flex h-icon-2xl w-icon-2xl items-center justify-center rounded-full border-2",
          getEventColor(event.type)
        )}>
          {getEventIcon(event.type)}
        </div>

        {/* Event content */}
        <div className="flex-1 min-w-0">
          <div
            onClick={() => onEventClick?.(event)}
            className="cursor-pointer hover:bg-gray-50 p-md rounded-lg border border-gray-200 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900">{event.title}</h4>
                {event.description && (
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                )}

                {/* Person info */}
                <div
                  className="flex items-center mt-3 cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPersonClick?.(event.person);
                  }}
                >
                  <div className="w-icon-md h-icon-md bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
                    {event.person.first_name?.[0]}{event.person.last_name?.[0]}
                  </div>
                  <span className="text-sm text-gray-700">
                    {event.person.first_name} {event.person.last_name}
                  </span>
                  {event.person.title && (
                    <span className="text-sm text-gray-500 ml-2">
                      • {event.person.title}
                    </span>
                  )}
                </div>

                {/* Metadata */}
                {event.metadata && (
                  <div className="flex flex-wrap gap-xs mt-2">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center px-xs py-xs rounded-full text-xs bg-gray-100 text-gray-700"
                      >
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="text-right text-sm text-gray-500 ml-4">
                <div className="font-medium">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'short'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGroup = (groupKey: string, events: TimelineEvent[]) => {
    return (
      <div key={groupKey} className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 sticky top-0 bg-white py-xs border-b border-gray-200">
          {groupKey}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({events.length} event{events.length !== 1 ? 's' : ''})
          </span>
        </h3>

        <div className="space-y-0">
          {events.map(renderEvent)}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-md">
          <h2 className="text-2xl font-bold text-gray-900">Team Timeline</h2>
          <span className="text-sm text-gray-500">
            {allEvents.length} events across {Object.keys(groupedEvents).length} {groupByPerson ? 'people' : 'periods'}
          </span>
        </div>

        <div className="flex items-center space-x-xs">
          <button
            onClick={() => {/* toggle groupByPerson */}}
            className={cn(
              "px-sm py-xs text-sm rounded",
              groupByPerson
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            Group by Person
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-xl">
        {Object.keys(groupedEvents).length === 0 ? (
          <div className="text-center py-xsxl">
            <Calendar className="h-icon-2xl w-icon-2xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No timeline events</h3>
            <p className="text-gray-500">Events will appear here as team members join and milestones are achieved.</p>
          </div>
        ) : (
          Object.entries(groupedEvents).map(([groupKey, events]) =>
            renderGroup(groupKey, events)
          )
        )}
      </div>
    </div>
  );
};

export default PeopleTimelineView;
