"use client";

import { Badge, Button, Checkbox } from "@ghxstship/ui";
import type { ProgrammingEvent } from "../types";
import { STATUS_BADGE, EVENT_TYPE_LABEL } from "../ProgrammingEventsClient";
import { Calendar, Check, Edit, Eye, Trash2, Users, MapPin, Clock, Pencil } from 'lucide-react';

type ProgrammingEventsListViewProps = {
 events: ProgrammingEvent[];
 selected: Set<string>;
 onSelect: (id: string) => void;
 onView: (event: ProgrammingEvent) => void;
 onEdit: (event: ProgrammingEvent) => void;
 onDelete: (event: ProgrammingEvent) => void;
};

export default function ProgrammingEventsListView({
 events,
 selected,
 onSelect,
 onView,
 onEdit,
 onDelete
}: ProgrammingEventsListViewProps) {
 const toggleAll = () => {
 if (selected.size === events.length) {
 events.forEach((event) => onSelect(event.id));
 } else {
 events.forEach((event) => {
 if (!selected.has(event.id)) {
 onSelect(event.id);
 }
 });
 }
 };

 return (
 <div className="space-y-sm">
 {/* Header */}
 <div className="grid grid-cols-12 gap-md border-b border-border pb-sm text-sm font-medium text-muted-foreground">
 <div className="col-span-1 flex items-center">
 <Checkbox
 checked={selected.size === events.length && events.length > 0}
 onCheckedChange={toggleAll}
 />
 </div>
 <div className="col-span-3">Event</div>
 <div className="col-span-2">Type</div>
 <div className="col-span-2">Date & Time</div>
 <div className="col-span-2">Location</div>
 <div className="col-span-1">Status</div>
 <div className="col-span-1">Actions</div>
 </div>

 {/* Events List */}
 <div className="space-y-xs">
 {events.map((event) => {
 const isSelected = selected.has(event.id);
 const statusConfig = STATUS_BADGE[event.status];

 return (
 <div
 key={event.id}
 className={`grid grid-cols-12 gap-md rounded-md border p-sm transition-colors hover:bg-muted/50 ${
 isSelected ? "bg-primary/5 border-primary" : "border-border"
 }`}
 >
 {/* Selection */}
 <div className="col-span-1 flex items-center">
 <Checkbox
 checked={isSelected}
 onCheckedChange={() => onSelect(event.id)}
 />
 </div>

 {/* Event Info */}
 <div className="col-span-3 space-y-xs">
 <div className="font-medium">{event.title}</div>
 {event.description && (
 <div className="text-sm text-muted-foreground line-clamp-xs">
 {event.description}
 </div>
 )}
 {event.project && (
 <div className="text-xs text-muted-foreground">
 Project: {event.project.name}
 </div>
 )}
 {event.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {event.tags.slice(0, 3).map((tag) => (
 <Badge key={tag} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 {event.tags.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{event.tags.length - 3}
 </Badge>
 )}
 </div>
 )}
 </div>

 {/* Type */}
 <div className="col-span-2 flex items-center">
 <Badge variant="secondary" className="text-xs">
 {EVENT_TYPE_LABEL[event.event_type]}
 </Badge>
 </div>

 {/* Date & Time */}
 <div className="col-span-2 space-y-xs">
 <div className="flex items-center gap-xs text-sm">
 <Calendar className="h-3 w-3" />
 {new Date(event.start_at).toLocaleDateString()}
 </div>
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Clock className="h-3 w-3" />
 {new Date(event.start_at).toLocaleTimeString()}
 </div>
 {event.end_at && (
 <div className="text-xs text-muted-foreground">
 Until {new Date(event.end_at).toLocaleString()}
 </div>
 )}
 </div>

 {/* Location */}
 <div className="col-span-2 space-y-xs">
 {event.location ? (
 <div className="flex items-center gap-xs text-sm">
 <MapPin className="h-3 w-3" />
 {event.location}
 </div>
 ) : (
 <div className="text-sm text-muted-foreground">No location</div>
 )}
 {event.capacity && (
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <Users className="h-3 w-3" />
 {event.capacity} capacity
 </div>
 )}
 </div>

 {/* Status */}
 <div className="col-span-1 flex items-center">
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 </div>

 {/* Actions */}
 <div className="col-span-1 flex items-center gap-xs">
 <Button size="icon" variant="ghost" onClick={() => onView(event)}>
 <Eye className="h-3 w-3" />
 </Button>
 <Button size="icon" variant="ghost" onClick={() => onEdit(event)}>
 <Pencil className="h-3 w-3" />
 </Button>
 <Button size="icon" variant="ghost" onClick={() => onDelete(event)}>
 <Trash2 className="h-3 w-3 text-destructive" />
 </Button>
 </div>
 </div>
 );
 })}
 </div>

 {events.length === 0 && (
 <div className="py-xl text-center text-muted-foreground">
 No events found matching your criteria
 </div>
 )}
 </div>
 );
}
