"use client";

import { useState, useMemo } from "react";
import { Badge, Button, Card } from "@ghxstship/ui";
import { 
 format, 
 parseISO, 
 startOfMonth, 
 endOfMonth, 
 eachDayOfInterval, 
 isSameDay, 
 isSameMonth, 
 isToday,
 addMonths,
 subMonths
} from "date-fns";
import type { ProgrammingEvent } from "../types";
import { EVENT_TYPE_LABEL, STATUS_BADGE } from "../ProgrammingCalendarClient";
import { Calendar, Edit, Eye } from 'lucide-react';

type ProgrammingCalendarGridViewProps = {
 events: ProgrammingEvent[];
 onView: (event: ProgrammingEvent) => void;
 onEdit: (event: ProgrammingEvent) => void;
};

export default function ProgrammingCalendarGridView({
 events,
 onView,
 onEdit,
}: ProgrammingCalendarGridViewProps) {
 const [currentDate, setCurrentDate] = useState(new Date());

 const monthStart = startOfMonth(currentDate);
 const monthEnd = endOfMonth(currentDate);
 const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

 const eventsForMonth = useMemo(() => {
 return events.filter((event) => {
 const eventDate = parseISO(event.start_at);
 return isSameMonth(eventDate, currentDate);
 });
 }, [events, currentDate]);

 const getEventsForDay = (day: Date) => {
 return eventsForMonth.filter((event) => {
 const eventDate = parseISO(event.start_at);
 return isSameDay(eventDate, day);
 });
 };

 const navigateMonth = (direction: "prev" | "next") => {
 setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
 };

 const goToToday = () => {
 setCurrentDate(new Date());
 };

 return (
 <div className="space-y-md">
 {/* Calendar Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
 <ChevronLeft className="h-icon-xs w-icon-xs" />
 </Button>
 <h2 className="text-xl font-semibold min-w-content-narrow text-center">
 {format(currentDate, "MMMM yyyy")}
 </h2>
 <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
 <ChevronRight className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 <Button variant="outline" size="sm" onClick={goToToday}>
 Today
 </Button>
 </div>

 {/* Calendar Grid */}
 <Card className="p-0 overflow-hidden">
 <div className="grid grid-cols-7">
 {/* Day Headers */}
 {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
 <div
 key={day}
 className="p-sm text-center text-sm font-medium text-muted-foreground border-b border-r last:border-r-0"
 >
 {day}
 </div>
 ))}

 {/* Calendar Days */}
 {calendarDays.map((day, index) => {
 const dayEvents = getEventsForDay(day);
 const isCurrentDay = isToday(day);

 return (
 <div
 key={day.toISOString()}
 className={`min-h-header-lg p-sm border-b border-r last:border-r-0 ${
 isCurrentDay ? "bg-accent/10" : "hover:bg-muted/50"
 }`}
 >
 <div className={`text-sm font-medium mb-sm ${
 isCurrentDay ? "text-accent font-bold" : "text-foreground"
 }`}>
 {format(day, "d")}
 </div>

 <div className="space-y-xs">
 {dayEvents.slice(0, 3).map((event) => {
 const statusConfig = STATUS_BADGE[event.status];
 
 return (
 <div
 key={event.id}
 className="text-xs p-xs rounded cursor-pointer hover:opacity-80 transition-opacity"
 style={{ 
 backgroundColor: `var(--${statusConfig.variant === 'destructive' ? 'destructive' : statusConfig.variant === 'warning' ? 'warning' : statusConfig.variant === 'success' ? 'success' : 'muted'})`,
 opacity: 0.1
 }}
 onClick={() => onView(event)}
 >
 <div className="flex items-center gap-xs">
 <div 
 className={`w-2 h-2 rounded-full ${
 statusConfig.variant === 'destructive' ? 'bg-destructive' :
 statusConfig.variant === 'warning' ? 'bg-warning' :
 statusConfig.variant === 'success' ? 'bg-success' :
 'bg-muted-foreground'
 }`}
 />
 <span className="truncate font-medium text-foreground">
 {event.title}
 </span>
 </div>
 <div className="text-muted-foreground mt-0.5 flex items-center gap-xs">
 <Clock className="h-2 w-2" />
 <span>
 {format(parseISO(event.start_at), "h:mm a")}
 </span>
 </div>
 </div>
 );
 })}

 {dayEvents.length > 3 && (
 <div className="text-xs text-muted-foreground p-xs">
 +{dayEvents.length - 3} more
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </Card>

 {/* Events Summary */}
 {eventsForMonth.length > 0 && (
 <Card className="p-md">
 <h3 className="font-semibold mb-sm">
 Events in {format(currentDate, "MMMM yyyy")} ({eventsForMonth.length})
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sm">
 {eventsForMonth.slice(0, 6).map((event) => {
 const statusConfig = STATUS_BADGE[event.status];
 
 return (
 <div
 key={event.id}
 className="flex items-center justify-between p-sm rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
 onClick={() => onView(event)}
 >
 <div className="flex items-center gap-sm min-w-0">
 <div 
 className={`w-3 h-3 rounded-full ${
 statusConfig.variant === 'destructive' ? 'bg-destructive' :
 statusConfig.variant === 'warning' ? 'bg-warning' :
 statusConfig.variant === 'success' ? 'bg-success' :
 'bg-muted-foreground'
 }`}
 />
 <div className="min-w-0">
 <div className="font-medium text-sm truncate">{event.title}</div>
 <div className="text-xs text-muted-foreground flex items-center gap-md">
 <span className="flex items-center gap-xs">
 <Calendar className="h-3 w-3" />
 {format(parseISO(event.start_at), "MMM d")}
 </span>
 <span className="flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 {format(parseISO(event.start_at), "h:mm a")}
 </span>
 {event.location && (
 <span className="flex items-center gap-xs">
 <MapPin className="h-3 w-3" />
 {event.location}
 </span>
 )}
 </div>
 </div>
 </div>
 
 <div className="flex items-center gap-xs">
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 <Button size="icon" variant="ghost" onClick={(e) => {
 e.stopPropagation();
 onEdit(event);
 }}>
 <Eye className="h-3 w-3" />
 </Button>
 </div>
 </div>
 );
 })}
 </div>
 
 {eventsForMonth.length > 6 && (
 <div className="text-center pt-sm">
 <Button variant="outline" size="sm">
 View All {eventsForMonth.length} Events
 </Button>
 </div>
 )}
 </Card>
 )}
 </div>
 );
}
