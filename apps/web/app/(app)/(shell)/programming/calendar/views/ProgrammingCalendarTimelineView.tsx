"use client";

import { useMemo } from 'react';
import { Badge, Button, Card } from "@ghxstship/ui";
import { format, parseISO, isAfter, isBefore, isToday, startOfDay, endOfDay, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import type { ProgrammingEvent } from "../types";
import { EVENT_TYPE_LABEL, STATUS_BADGE } from "../ProgrammingCalendarClient";
import { Calendar, Edit, Eye, Users, MapPin, Clock } from 'lucide-react';

type ProgrammingCalendarTimelineViewProps = {
 events: ProgrammingEvent[];
 onView: (event: ProgrammingEvent) => void;
 onEdit: (event: ProgrammingEvent) => void;
};

type TimeGroup = {
 id: string;
 label: string;
 events: ProgrammingEvent[];
};

export default function ProgrammingCalendarTimelineView({
 events,
 onView,
 onEdit
}: ProgrammingCalendarTimelineViewProps) {
 const timeGroups = useMemo(() => {
 const now = new Date();
 const today = startOfDay(now);
 const tomorrow = addDays(today, 1);
 const weekStart = startOfWeek(now);
 const weekEnd = endOfWeek(now);
 const monthStart = startOfMonth(now);
 const monthEnd = endOfMonth(now);

 const groups: TimeGroup[] = [
 { id: "overdue", label: "Overdue", events: [] },
 { id: "today", label: "Today", events: [] },
 { id: "tomorrow", label: "Tomorrow", events: [] },
 { id: "this-week", label: "This Week", events: [] },
 { id: "this-month", label: "This Month", events: [] },
 { id: "later", label: "Later", events: [] },
 { id: "no-date", label: "No Due Date", events: [] },
 ];

 events.forEach((event) => {
 const eventDate = parseISO(event.start_at);

 if (isBefore(eventDate, today) && event.status !== "completed" && event.status !== "cancelled") {
 groups[0].events.push(event);
 } else if (isToday(eventDate)) {
 groups[1].events.push(event);
 } else if (format(eventDate, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd")) {
 groups[2].events.push(event);
 } else if (isAfter(eventDate, today) && isBefore(eventDate, weekEnd)) {
 groups[3].events.push(event);
 } else if (isAfter(eventDate, weekEnd) && isBefore(eventDate, monthEnd)) {
 groups[4].events.push(event);
 } else if (isAfter(eventDate, monthEnd)) {
 groups[5].events.push(event);
 } else {
 groups[6].events.push(event);
 }
 });

 // Sort events within each group by start time
 groups.forEach((group) => {
 group.events.sort((a, b) => a.start_at.localeCompare(b.start_at));
 });

 return groups.filter((group) => group.events.length > 0);
 }, [events]);

 const renderEvent = (event: ProgrammingEvent) => {
 const statusConfig = STATUS_BADGE[event.status];
 const eventDate = parseISO(event.start_at);

 return (
 <Card key={event.id} className="p-md hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between gap-md">
 <div className="flex-1 space-y-sm">
 <div className="flex items-start justify-between">
 <div>
 <h4 className="font-semibold text-lg">{event.title}</h4>
 {event.description && (
 <p className="text-sm text-muted-foreground mt-xs line-clamp-xs">
 {event.description}
 </p>
 )}
 </div>
 <div className="flex items-center gap-xs">
 <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
 <Badge variant="outline">{EVENT_TYPE_LABEL[event.event_type]}</Badge>
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-md text-sm text-muted-foreground">
 <div className="flex items-center gap-xs">
 <Calendar className="h-icon-xs w-icon-xs" />
 <span>{format(eventDate, "MMM d, yyyy")}</span>
 </div>

 <div className="flex items-center gap-xs">
 <Clock className="h-icon-xs w-icon-xs" />
 <span>
 {format(eventDate, "h:mm a")}
 {event.end_at && ` - ${format(parseISO(event.end_at), "h:mm a")}`}
 </span>
 </div>

 {event.location && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-icon-xs w-icon-xs" />
 <span>{event.location}</span>
 </div>
 )}

 {event.project && (
 <div className="flex items-center gap-xs">
 <Users className="h-icon-xs w-icon-xs" />
 <span>{event.project.name}</span>
 </div>
 )}

 {event.capacity && (
 <div className="flex items-center gap-xs">
 <Users className="h-icon-xs w-icon-xs" />
 <span>Capacity: {event.capacity}</span>
 </div>
 )}
 </div>

 {event.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {event.tags.map((tag) => (
 <Badge key={tag} variant="secondary" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 )}

 {event.resources.length > 0 && (
 <div className="space-y-xs">
 <div className="text-sm font-medium">Resources:</div>
 <div className="flex flex-wrap gap-xs">
 {event.resources.map((resource, index) => (
 <span key={index} className="text-xs text-muted-foreground">
 {resource.name} ({resource.quantity})
 </span>
 ))}
 </div>
 </div>
 )}

 {event.staffing.length > 0 && (
 <div className="space-y-xs">
 <div className="text-sm font-medium">Staffing:</div>
 <div className="flex flex-wrap gap-xs">
 {event.staffing.map((staff, index) => (
 <span key={index} className="text-xs text-muted-foreground">
 {staff.role}
 {staff.notes && ` (${staff.notes})`}
 </span>
 ))}
 </div>
 </div>
 )}
 </div>

 <div className="flex flex-col gap-sm">
 <Button size="sm" variant="outline" onClick={() => onView(event)}>
 <Eye className="h-icon-xs w-icon-xs mr-xs" />
 View
 </Button>
 <Button size="sm" variant="outline" onClick={() => onEdit(event)}>
 <Calendar className="h-icon-xs w-icon-xs mr-xs" />
 Edit
 </Button>
 </div>
 </div>
 </Card>
 );
 };

 if (timeGroups.length === 0) {
 return (
 <Card className="p-lg text-center">
 <Calendar className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No events found</h3>
 <p className="text-muted-foreground">Try adjusting your filters or create a new event.</p>
 </Card>
 );
 }

 return (
 <div className="space-y-lg">
 {timeGroups.map((group) => (
 <section key={group.id} className="space-y-md">
 <div className="flex items-center justify-between">
 <h3 className="text-xl font-semibold">{group.label}</h3>
 <Badge variant="secondary">{group.events.length} events</Badge>
 </div>
 
 <div className="space-y-sm">
 {group.events.map(renderEvent)}
 </div>
 </section>
 ))}
 </div>
 );
}
