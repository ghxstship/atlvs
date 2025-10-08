"use client";

import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { Badge, Button, Card } from "@ghxstship/ui";
import { useState } from 'react';
import type { ProgrammingEvent } from "../types";
import { STATUS_BADGE, EVENT_TYPE_LABEL } from "../ProgrammingEventsClient";

type ProgrammingEventsCalendarViewProps = {
 events: ProgrammingEvent[];
 onView: (event: ProgrammingEvent) => void;
 onEdit: (event: ProgrammingEvent) => void;
};

export default function ProgrammingEventsCalendarView({
 events,
 onView,
 onEdit
}: ProgrammingEventsCalendarViewProps) {
 const [currentDate, setCurrentDate] = useState(new Date());

 const currentYear = currentDate.getFullYear();
 const currentMonth = currentDate.getMonth();

 // Get first day of month and number of days
 const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
 const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
 const daysInMonth = lastDayOfMonth.getDate();
 const startingDayOfWeek = firstDayOfMonth.getDay();

 // Generate calendar days
 const calendarDays = [];
 
 // Add empty cells for days before month starts
 for (let i = 0; i < startingDayOfWeek; i++) {
 calendarDays.push(null);
 }
 
 // Add days of the month
 for (let day = 1; day <= daysInMonth; day++) {
 calendarDays.push(day);
 }

 // Group events by date
 const eventsByDate = events.reduce((acc, event) => {
 const eventDate = new Date(event.start_at);
 if (eventDate.getFullYear() === currentYear && eventDate.getMonth() === currentMonth) {
 const day = eventDate.getDate();
 if (!acc[day]) acc[day] = [];
 acc[day].push(event);
 }
 return acc;
 }, {} as Record<number, ProgrammingEvent[]>);

 const navigateMonth = (direction: 'prev' | 'next') => {
 setCurrentDate(prev => {
 const newDate = new Date(prev);
 if (direction === 'prev') {
 newDate.setMonth(prev.getMonth() - 1);
 } else {
 newDate.setMonth(prev.getMonth() + 1);
 }
 return newDate;
 });
 };

 const monthNames = [
 'January', 'February', 'March', 'April', 'May', 'June',
 'July', 'August', 'September', 'October', 'November', 'December'
 ];

 const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

 return (
 <div className="space-y-md">
 {/* Calendar Header */}
 <div className="flex items-center justify-between">
 <h2 className="text-lg font-semibold">
 {monthNames[currentMonth]} {currentYear}
 </h2>
 <div className="flex items-center gap-sm">
 <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
 <ChevronLeft className="h-icon-xs w-icon-xs" />
 </Button>
 <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
 Today
 </Button>
 <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
 <ChevronRight className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>

 {/* Calendar Grid */}
 <Card className="p-md">
 <div className="grid grid-cols-7 gap-px bg-border">
 {/* Day Headers */}
 {dayNames.map((day) => (
 <div key={day} className="bg-background p-sm text-center text-sm font-medium text-muted-foreground">
 {day}
 </div>
 ))}

 {/* Calendar Days */}
 {calendarDays.map((day, index) => {
 const dayEvents = day ? eventsByDate[day] || [] : [];
 const isToday = day && 
 new Date().getDate() === day && 
 new Date().getMonth() === currentMonth && 
 new Date().getFullYear() === currentYear;

 return (
 <div
 key={index}
 className={`bg-background p-xs min-h-header-lg ${
 day ? 'border-r border-b border-border' : ''
 } ${isToday ? 'bg-primary/5' : ''}`}
 >
 {day && (
 <>
 <div className={`text-sm font-medium mb-xs ${isToday ? 'text-primary' : ''}`}>
 {day}
 </div>
 <div className="space-y-xs">
 {dayEvents.slice(0, 3).map((event) => {
 const statusConfig = STATUS_BADGE[event.status];
 return (
 <div
 key={event.id}
 className="cursor-pointer rounded px-xs py-xs text-xs bg-primary/10 hover:bg-primary/20 transition-colors"
 onClick={() => onView(event)}
 >
 <div className="font-medium truncate">{event.title}</div>
 <div className="flex items-center gap-xs text-muted-foreground">
 <Clock className="h-2 w-2" />
 {new Date(event.start_at).toLocaleTimeString([], { 
 hour: '2-digit', 
 minute: '2-digit' 
 })}
 </div>
 {event.location && (
 <div className="flex items-center gap-xs text-muted-foreground">
 <MapPin className="h-2 w-2" />
 <span className="truncate">{event.location}</span>
 </div>
 )}
 <Badge variant={statusConfig.variant} className="text-xs mt-1">
 {EVENT_TYPE_LABEL[event.event_type]}
 </Badge>
 </div>
 );
 })}
 {dayEvents.length > 3 && (
 <div className="text-xs text-muted-foreground text-center">
 +{dayEvents.length - 3} more
 </div>
 )}
 </div>
 </>
 )}
 </div>
 );
 })}
 </div>
 </Card>

 {/* Legend */}
 <div className="flex flex-wrap gap-md">
 {Object.entries(STATUS_BADGE).map(([status, config]) => (
 <div key={status} className="flex items-center gap-xs">
 <Badge variant={config.variant} className="text-xs">
 {config.label}
 </Badge>
 </div>
 ))}
 </div>
 </div>
 );
}
