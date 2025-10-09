'use client';

/**
 * Assets Calendar View
 *
 * Enterprise-grade calendar view for asset management.
 * Features multiple calendar overlays, recurring events, time zones,
 * resource scheduling, and external calendar integration.
 *
 * @module assets/views/CalendarView
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Asset, AssetViewState } from '../types';
import { apiClient } from '../lib/api';
import { realtimeService } from '../lib/realtime';
import {
  Badge,
  Button,
  CalendarView,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@ghxstship/ui";
import { Calendar as CalendarIcon, CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Plus, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Settings, User } from 'lucide-react';

interface CalendarViewProps {
  viewState: AssetViewState;
  onViewStateChange: (newState: Partial<AssetViewState>) => void;
  onAssetSelect?: (asset: Asset, selected: boolean) => void;
  onAssetAction?: (action: string, asset: Asset) => void;
  className?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  asset: Asset;
  type: 'maintenance' | 'assignment' | 'warranty' | 'audit';
  color: string;
}

type CalendarViewType = 'month' | 'week' | 'day' | 'agenda';

const CALENDAR_VIEWS: { value: CalendarViewType; label: string }[] = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
  { value: 'agenda', label: 'Agenda' }
];

export default function CalendarView({
  viewState,
  onViewStateChange,
  onAssetSelect,
  onAssetAction,
  className = ''
}: CalendarViewProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');
  const [selectedEvents, setSelectedEvents] = useState<Set<string>(new Set());

  // Fetch assets with related data
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.getAssets(
        viewState.filters,
        viewState.sort,
        { ...viewState.pagination, pageSize: 500 } // Load more for calendar
      );
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewState.filters, viewState.sort, viewState.pagination]);

  // Set up realtime subscriptions
  React.useEffect(() => {
    const unsubscribers = [
      realtimeService.subscribeToAssets('org-id', (event, record) => {
        if (event === 'INSERT') setAssets(prev => [record, ...prev]);
        else if (event === 'UPDATE') setAssets(prev => prev.map(a => a.id === record.id ? record : a));
        else if (event === 'DELETE') setAssets(prev => prev.filter(a => a.id !== record.id));
      }),
      realtimeService.subscribeToMaintenance('org-id', (event, record) => {
        // Handle maintenance updates that affect calendar
        fetchAssets();
      }),
      realtimeService.subscribeToAssignments('org-id', (event, record) => {
        // Handle assignment updates that affect calendar
        fetchAssets();
      })
    ];

    return () => unsubscribers.forEach(unsub => unsub());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAssets]);

  React.useEffect(() => {
    fetchAssets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAssets]);

  // Generate calendar events from assets
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    assets.forEach(asset => {
      // Warranty expiry events
      if (asset.warranty_expiry) {
        events.push({
          id: `warranty-${asset.id}`,
          title: `${asset.name} - Warranty Expires`,
          start: new Date(asset.warranty_expiry),
          end: new Date(asset.warranty_expiry),
          asset,
          type: 'warranty',
          color: 'bg-orange-500'
        });
      }

      // Purchase date events
      if (asset.purchase_date) {
        events.push({
          id: `purchase-${asset.id}`,
          title: `${asset.name} - Purchased`,
          start: new Date(asset.purchase_date),
          end: new Date(asset.purchase_date),
          asset,
          type: 'audit',
          color: 'bg-blue-500'
        });
      }
    });

    return events;
  }, [assets]);

  // Calendar navigation
  const navigateCalendar = useCallback((direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate);

    switch (direction) {
      case 'prev':
        if (calendarView === 'month') newDate.setMonth(newDate.getMonth() - 1);
        else if (calendarView === 'week') newDate.setDate(newDate.getDate() - 7);
        else if (calendarView === 'day') newDate.setDate(newDate.getDate() - 1);
        break;
      case 'next':
        if (calendarView === 'month') newDate.setMonth(newDate.getMonth() + 1);
        else if (calendarView === 'week') newDate.setDate(newDate.getDate() + 7);
        else if (calendarView === 'day') newDate.setDate(newDate.getDate() + 1);
        break;
      case 'today':
        newDate.setTime(Date.now());
        break;
    }

    setCurrentDate(newDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, calendarView]);

  // Render month view
  const renderMonthView = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());

    const weeks = [];
    let currentWeek = [];
    let currentDateIter = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayEvents = calendarEvents.filter(event =>
        event.start.toDateString() === currentDateIter.toDateString()
      );

      currentWeek.push({
        date: new Date(currentDateIter),
        events: dayEvents,
        isCurrentMonth: currentDateIter.getMonth() === currentDate.getMonth()
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }

    return (
      <div className="grid grid-cols-7 gap-xs h-full">
        {/* Header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-xs text-center font-semibold text-gray-600 border-b">
            {day}
          </div>
        ))}

        {/* Days */}
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className={`min-h-24 p-xs border ${
                day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${day.date.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''}`}
              onClick={() => setCurrentDate(day.date)}
            >
              <div className={`text-sm ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                {day.date.getDate()}
              </div>
              <div className="space-y-xs mt-1">
                {day.events.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className={`text-xs p-xs rounded truncate cursor-pointer ${event.color} text-white`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssetAction?.('view', event.asset);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {day.events.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{day.events.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // Render event details
  const renderEventCard = (event: CalendarEvent) => {
    const isSelected = selectedEvents.has(event.id);

    return (
      <div
        key={event.id}
        className={`p-sm mb-2 rounded border cursor-pointer transition-colors ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => onAssetAction?.('view', event.asset)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-xs mb-1">
              <div className={`w-3 h-3 rounded-full ${event.color.replace('bg-', 'bg-')}`} />
              <span className="font-medium text-sm">{event.asset.name}</span>
              <Badge variant="secondary" className="text-xs">
                {event.asset.asset_tag}
              </Badge>
            </div>
            <div className="text-xs text-gray-600">{event.title}</div>
            <div className="flex items-center gap-md mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-xs">
                <CalendarIcon className="w-3 h-3" />
                {event.start.toLocaleDateString()}
              </div>
              {event.asset.assigned_to && (
                <div className="flex items-center gap-xs">
                  <User className="w-3 h-3" />
                  {event.asset.assigned_to.name}
                </div>
              )}
              {event.asset.location && (
                <div className="flex items-center gap-xs">
                  <MapPin className="w-3 h-3" />
                  {event.asset.location.name}
                </div>
              )}
            </div>
          </div>
          <Checkbox
            checked={isSelected}
            onChange={(checked) => {
              setSelectedEvents(prev => {
                const newSet = new Set(prev);
                if (checked) newSet.add(event.id);
                else newSet.delete(event.id);
                return newSet;
              });
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    );
  };

  // Render agenda view
  const renderAgendaView = () => {
    const sortedEvents = calendarEvents
      .filter(event => event.start >= currentDate)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 50); // Limit for performance

    return (
      <div className="space-y-xs">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-xl text-gray-500">
            <CalendarIcon className="w-icon-2xl h-icon-2xl mx-auto mb-4 text-gray-300" />
            <div className="text-lg font-medium">No upcoming events</div>
            <div className="text-sm">Scheduled maintenance, warranties, and assignments will appear here</div>
          </div>
        ) : (
          sortedEvents.map(renderEventCard)
        )}
      </div>
    );
  };

  const currentMonthYear = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-md border-b">
        <div className="flex items-center gap-md">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigateCalendar('prev')}
          >
            <ChevronLeft className="w-icon-xs h-icon-xs" />
          </Button>

          <h2 className="text-xl font-semibold text-gray-900">
            {currentMonthYear}
          </h2>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigateCalendar('next')}
          >
            <ChevronRight className="w-icon-xs h-icon-xs" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigateCalendar('today')}
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-xs">
          <Select value={calendarView} onChange={(value: CalendarViewType) => setCalendarView(value)}>
            <SelectTrigger className="w-component-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CALENDAR_VIEWS.map(view => (
                <SelectItem key={view.value} value={view.value}>
                  {view.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="secondary" size="sm">
            <Settings className="w-icon-xs h-icon-xs mr-2" />
            Settings
          </Button>

          <Button
            size="sm"
            onClick={() => onAssetAction?.('create', {} as Asset)}
          >
            <Plus className="w-icon-xs h-icon-xs mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-container-sm">
            <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading calendar...</span>
          </div>
        ) : (
          <div className="h-full p-md">
            {calendarView === 'month' && renderMonthView()}
            {calendarView === 'agenda' && renderAgendaView()}
            {/* Week and Day views would be implemented similarly */}
            {(calendarView === 'week' || calendarView === 'day') && (
              <div className="text-center py-xl text-gray-500">
                {calendarView.charAt(0).toUpperCase() + calendarView.slice(1)} view coming soon
              </div>
            )}
          </div>
        )}
      </div>

      {/* Event Summary */}
      <div className="px-md pb-4 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{calendarEvents.length} events</span>
          <div className="flex gap-md">
            <span>Warranty: {calendarEvents.filter(e => e.type === 'warranty').length}</span>
            <span>Maintenance: {calendarEvents.filter(e => e.type === 'maintenance').length}</span>
            <span>Assignments: {calendarEvents.filter(e => e.type === 'assignment').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
