"use client";

import { Badge, Button, Card, Checkbox } from "@ghxstship/ui";
import { format, parseISO } from "date-fns";
import type { ProgrammingEvent } from "../types";
import { EVENT_TYPE_LABEL, STATUS_BADGE } from "../ProgrammingCalendarClient";
import { Calendar, Check, Edit, Eye, Trash2, Users } from 'lucide-react';

type ProgrammingCalendarListViewProps = {
 events: ProgrammingEvent[];
 selected: Set<string>;
 onSelect: (id: string) => void;
 onView: (event: ProgrammingEvent) => void;
 onEdit: (event: ProgrammingEvent) => void;
 onDelete: (event: ProgrammingEvent) => void;
};

export default function ProgrammingCalendarListView({
 events,
 selected,
 onSelect,
 onView,
 onEdit,
 onDelete,
}: ProgrammingCalendarListViewProps) {
 if (events.length === 0) {
 return (
 <Card className="p-lg text-center">
 <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No events found</h3>
 <p className="text-muted-foreground">Try adjusting your filters or create a new event.</p>
 </Card>
 );
 }

 return (
 <div className="space-y-sm">
 {events.map((event) => {
 const isSelected = selected.has(event.id);
 const statusConfig = STATUS_BADGE[event.status];

 return (
 <Card
 key={event.id}
 className={`p-md transition-all hover:shadow-md ${
 isSelected ? "ring-2 ring-primary" : ""
 }`}
 >
 <div className="flex items-start gap-md">
 <Checkbox
 checked={isSelected}
 onChange={() => onSelect(event.id)}
 className="mt-1"
 />

 <div className="flex-1 space-y-sm">
 <div className="flex items-start justify-between">
 <div className="space-y-xs">
 <h3 className="font-semibold text-lg">{event.title}</h3>
 {event.description && (
 <p className="text-sm text-muted-foreground line-clamp-2">
 {event.description}
 </p>
 )}
 </div>
 <div className="flex items-center gap-sm">
 <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
 <Badge variant="outline">{EVENT_TYPE_LABEL[event.event_type]}</Badge>
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-md text-sm text-muted-foreground">
 <div className="flex items-center gap-xs">
 <Calendar className="h-4 w-4" />
 <span>
 {format(parseISO(event.start_at), "MMM d, yyyy 'at' h:mm a")}
 </span>
 </div>

 {event.end_at && (
 <div className="flex items-center gap-xs">
 <Clock className="h-4 w-4" />
 <span>
 Until {format(parseISO(event.end_at), "MMM d, yyyy 'at' h:mm a")}
 </span>
 </div>
 )}

 {event.location && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-4 w-4" />
 <span>{event.location}</span>
 </div>
 )}

 {event.project && (
 <div className="flex items-center gap-xs">
 <Users className="h-4 w-4" />
 <span>{event.project.name}</span>
 </div>
 )}

 {event.capacity && (
 <div className="flex items-center gap-xs">
 <Users className="h-4 w-4" />
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

 <div className="flex items-center justify-between pt-sm border-t">
 <div className="text-xs text-muted-foreground">
 Created {format(parseISO(event.created_at || event.start_at), "MMM d, yyyy")}
 </div>
 <div className="flex items-center gap-sm">
 <Button size="sm" variant="ghost" onClick={() => onView(event)}>
 <Eye className="h-4 w-4 mr-xs" />
 View
 </Button>
 <Button size="sm" variant="ghost" onClick={() => onEdit(event)}>
 <Pencil className="h-4 w-4 mr-xs" />
 Edit
 </Button>
 <Button
 size="sm"
 variant="ghost"
 onClick={() => onDelete(event)}
 className="text-destructive hover:text-destructive"
 >
 <Trash2 className="h-4 w-4 mr-xs" />
 Delete
 </Button>
 </div>
 </div>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 );
}
