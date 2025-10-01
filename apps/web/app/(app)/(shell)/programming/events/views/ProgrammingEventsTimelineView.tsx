"use client";

import { Badge, Button, Card } from "@ghxstship/ui";
import type { ProgrammingEvent } from "../types";
import { STATUS_BADGE, EVENT_TYPE_LABEL } from "../ProgrammingEventsClient";
import { Calendar, Edit, Eye, Tag, Users } from 'lucide-react';

type ProgrammingEventsTimelineViewProps = {
 events: ProgrammingEvent[];
 onView: (event: ProgrammingEvent) => void;
 onEdit: (event: ProgrammingEvent) => void;
};

export default function ProgrammingEventsTimelineView({
 events,
 onView,
 onEdit,
}: ProgrammingEventsTimelineViewProps) {
 // Sort events by start date
 const sortedEvents = [...events].sort((a, b) => 
 new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
 );

 // Group events by date
 const eventsByDate = sortedEvents.reduce((acc, event) => {
 const eventDate = new Date(event.start_at).toDateString();
 if (!acc[eventDate]) acc[eventDate] = [];
 acc[eventDate].push(event);
 return acc;
 }, {} as Record<string, ProgrammingEvent[]>);

 const formatDate = (dateString: string) => {
 const date = new Date(dateString);
 const today = new Date();
 const tomorrow = new Date(today);
 tomorrow.setDate(today.getDate() + 1);
 const yesterday = new Date(today);
 yesterday.setDate(today.getDate() - 1);

 if (date.toDateString() === today.toDateString()) {
 return "Today";
 } else if (date.toDateString() === tomorrow.toDateString()) {
 return "Tomorrow";
 } else if (date.toDateString() === yesterday.toDateString()) {
 return "Yesterday";
 } else {
 return date.toLocaleDateString('en-US', { 
 weekday: 'long', 
 year: 'numeric', 
 month: 'long', 
 day: 'numeric' 
 });
 }
 };

 return (
 <div className="space-y-lg">
 {Object.entries(eventsByDate).map(([dateString, dayEvents]) => (
 <div key={dateString} className="space-y-md">
 {/* Date Header */}
 <div className="flex items-center gap-md">
 <div className="h-px flex-1 bg-border" />
 <div className="flex items-center gap-sm px-md py-sm bg-muted rounded-full">
 <Calendar className="h-icon-xs w-icon-xs" />
 <span className="font-medium">{formatDate(dateString)}</span>
 <Badge variant="outline" className="text-xs">
 {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
 </Badge>
 </div>
 <div className="h-px flex-1 bg-border" />
 </div>

 {/* Events for this date */}
 <div className="relative">
 {/* Timeline line */}
 <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

 <div className="space-y-md">
 {dayEvents.map((event, index) => {
 const statusConfig = STATUS_BADGE[event.status];
 const isLast = index === dayEvents.length - 1;

 return (
 <div key={event.id} className="relative flex gap-md">
 {/* Timeline dot */}
 <div className="relative z-10 flex h-icon-2xl w-icon-2xl items-center justify-center">
 <div className={`h-3 w-3 rounded-full border-2 border-background ${
 statusConfig.variant === 'success' ? 'bg-success' :
 statusConfig.variant === 'warning' ? 'bg-warning' :
 statusConfig.variant === 'destructive' ? 'bg-destructive' :
 statusConfig.variant === 'info' ? 'bg-info' :
 'bg-muted'
 }`} />
 </div>

 {/* Event Card */}
 <Card className="flex-1 p-md">
 <div className="flex items-start justify-between gap-md">
 <div className="flex-1 space-y-sm">
 {/* Event Header */}
 <div className="flex items-start justify-between gap-md">
 <div>
 <h3 className="font-semibold">{event.title}</h3>
 <div className="flex items-center gap-md text-sm text-muted-foreground">
 <span className="flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 {new Date(event.start_at).toLocaleTimeString()}
 {event.end_at && ` - ${new Date(event.end_at).toLocaleTimeString()}`}
 </span>
 <Badge variant="secondary" className="text-xs">
 {EVENT_TYPE_LABEL[event.event_type]}
 </Badge>
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 </div>
 </div>
 <div className="flex items-center gap-xs">
 <Button size="icon" variant="ghost" onClick={() => onView(event)}>
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button size="icon" variant="ghost" onClick={() => onEdit(event)}>
 <Pencil className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>

 {/* Event Details */}
 {event.description && (
 <p className="text-sm text-muted-foreground line-clamp-xs">
 {event.description}
 </p>
 )}

 <div className="flex flex-wrap gap-md text-sm text-muted-foreground">
 {event.location && (
 <span className="flex items-center gap-xs">
 <MapPin className="h-3 w-3" />
 {event.location}
 </span>
 )}
 {event.capacity && (
 <span className="flex items-center gap-xs">
 <Users className="h-3 w-3" />
 {event.capacity} capacity
 </span>
 )}
 {event.project && (
 <span>Project: {event.project.name}</span>
 )}
 </div>

 {/* Tags */}
 {event.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {event.tags.map((tag) => (
 <Badge key={tag} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 )}

 {/* Resources & Staffing */}
 {(event.resources.length > 0 || event.staffing.length > 0) && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-xs">
 {event.resources.length > 0 && (
 <div>
 <div className="font-medium text-muted-foreground mb-1">Resources</div>
 <div className="space-y-xs">
 {event.resources.slice(0, 3).map((resource, idx) => (
 <div key={idx} className="text-muted-foreground">
 {resource.name} ({resource.quantity})
 </div>
 ))}
 {event.resources.length > 3 && (
 <div className="text-muted-foreground">
 +{event.resources.length - 3} more
 </div>
 )}
 </div>
 </div>
 )}
 {event.staffing.length > 0 && (
 <div>
 <div className="font-medium text-muted-foreground mb-1">Staffing</div>
 <div className="space-y-xs">
 {event.staffing.slice(0, 3).map((staff, idx) => (
 <div key={idx} className="text-muted-foreground">
 {staff.role}
 </div>
 ))}
 {event.staffing.length > 3 && (
 <div className="text-muted-foreground">
 +{event.staffing.length - 3} more
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 </Card>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 ))}

 {sortedEvents.length === 0 && (
 <div className="py-xl text-center text-muted-foreground">
 No events found in the selected time range
 </div>
 )}
 </div>
 );
}
