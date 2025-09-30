"use client";

import { Badge, Button, Card } from "@ghxstship/ui";
import type { ProgrammingEvent } from "../types";
import { STATUS_BADGE, EVENT_TYPE_LABEL } from "../ProgrammingEventsClient";
import { Calendar, Edit, Eye, Trash2, Users } from 'lucide-react';

type ProgrammingEventsBoardViewProps = {
 events: ProgrammingEvent[];
 selected: Set<string>;
 onSelect: (id: string) => void;
 onView: (event: ProgrammingEvent) => void;
 onEdit: (event: ProgrammingEvent) => void;
 onDelete: (event: ProgrammingEvent) => void;
};

const STATUS_COLUMNS: ProgrammingEvent["status"][] = [
 "draft",
 "scheduled",
 "in_progress",
 "completed",
 "cancelled",
];

export default function ProgrammingEventsBoardView({
 events,
 selected,
 onSelect,
 onView,
 onEdit,
 onDelete,
}: ProgrammingEventsBoardViewProps) {
 return (
 <div className="flex gap-md overflow-x-auto pb-md">
 {STATUS_COLUMNS.map((status) => {
 const columnEvents = events.filter((event) => event.status === status);
 const statusConfig = STATUS_BADGE[status];

 return (
 <section key={status} className="flex w-80 flex-shrink-0 flex-col gap-sm">
 <header className="flex items-center justify-between">
 <h3 className="text-sm font-semibold text-muted-foreground">{statusConfig.label}</h3>
 <Badge variant={statusConfig.variant} className="text-xs">
 {columnEvents.length}
 </Badge>
 </header>

 <div className="space-y-sm">
 {columnEvents.length === 0 ? (
 <Card className="p-md text-center text-xs text-muted-foreground">No events</Card>
 ) : (
 columnEvents.map((event) => {
 const isSelected = selected.has(event.id);

 return (
 <Card key={event.id} className={`space-y-sm p-sm ${isSelected ? "ring-2 ring-primary" : ""}`}>
 <div className="flex items-start justify-between gap-sm">
 <div className="space-y-xs">
 <div className="text-sm font-medium leading-tight">{event.title}</div>
 <div className="text-xs text-muted-foreground">{EVENT_TYPE_LABEL[event.event_type]}</div>
 <div className="flex flex-col gap-1 text-xs text-muted-foreground">
 <span className="flex items-center gap-1">
 <Calendar className="h-3 w-3" />
 {new Date(event.start_at).toLocaleDateString()}
 </span>
 <span className="flex items-center gap-1">
 <Clock className="h-3 w-3" />
 {new Date(event.start_at).toLocaleTimeString()}
 </span>
 {event.location ? (
 <span className="flex items-center gap-1">
 <MapPin className="h-3 w-3" />
 {event.location}
 </span>
 ) : null}
 {event.capacity ? (
 <span className="flex items-center gap-1">
 <Users className="h-3 w-3" />
 {event.capacity} capacity
 </span>
 ) : null}
 </div>
 {event.project ? (
 <div className="text-xs text-muted-foreground">Project: {event.project.name}</div>
 ) : null}
 {event.tags.length > 0 ? (
 <div className="flex flex-wrap gap-1">
 {event.tags.slice(0, 2).map((tag) => (
 <Badge key={tag} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 {event.tags.length > 2 ? (
 <Badge variant="outline" className="text-xs">
 +{event.tags.length - 2}
 </Badge>
 ) : null}
 </div>
 ) : null}
 </div>
 <div className="flex items-center gap-1">
 <Button size="icon" variant="ghost" onClick={() => onView(event)}>
 <Eye className="h-4 w-4" />
 </Button>
 <Button size="icon" variant="ghost" onClick={() => onEdit(event)}>
 <Pencil className="h-4 w-4" />
 </Button>
 <Button size="icon" variant="ghost" onClick={() => onDelete(event)}>
 <Trash2 className="h-4 w-4 text-destructive" />
 </Button>
 </div>
 </div>
 <Button
 variant="outline"
 size="sm"
 className="w-full"
 onClick={() => onSelect(event.id)}
 >
 {isSelected ? "Selected" : "Select"}
 </Button>
 </Card>
 );
 })
 )}
 </div>
 </section>
 );
 })}
 </div>
 );
}
