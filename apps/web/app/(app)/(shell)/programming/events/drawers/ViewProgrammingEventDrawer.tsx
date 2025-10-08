"use client";

import { Calendar, Clock, Edit, ExternalLink, ExternalSettings, MapPin, Package, Settings, Tag, Trash2, UserCheck, Users } from 'lucide-react';
import {
 Badge,
 Button,
 Card,
 Modal
} from "@ghxstship/ui";
import type { ProgrammingEvent } from "../types";
import { STATUS_BADGE, EVENT_TYPE_LABEL } from "../ProgrammingEventsClient";

type ViewProgrammingEventDrawerProps = {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 event: ProgrammingEvent;
 onEdit: () => void;
 onDelete: () => void;
 users: { id: string; email: string; full_name?: string | null; avatar_url?: string | null }[];
};

export default function ViewProgrammingEventDrawer({
 open,
 onOpenChange,
 event,
 onEdit,
 onDelete,
 users
}: ViewProgrammingEventDrawerProps) {
 const handleClose = () => onOpenChange(false);
 const statusConfig = STATUS_BADGE[event.status];
 
 const formatDateTime = (dateString: string) => {
 const date = new Date(dateString);
 return {
 date: date.toLocaleDateString(),
 time: date.toLocaleTimeString(),
 full: date.toLocaleString()
 };
 };

 const getUserName = (userId?: string) => {
 if (!userId) return "Unassigned";
 const user = users.find(u => u.id === userId);
 return user?.full_name || user?.email || "Unknown User";
 };

 return (
 <Modal
 open={open}
 onClose={handleClose}
 title={event.title}
 size="2xl"
 >
 <div className="p-lg">
 <div className="flex items-start justify-between mb-lg">
 <div className="space-y-sm">
 <h2 className="text-heading-4">{event.title}</h2>
 <div className="flex items-center gap-sm">
 <Badge variant="secondary" className="text-xs">
 {EVENT_TYPE_LABEL[event.event_type]}
 </Badge>
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 </div>
 </div>
 <div className="flex items-center gap-sm">
 <Button variant="outline" size="sm" onClick={onEdit}>
 <Edit className="h-icon-xs w-icon-xs mr-2" />
 Edit
 </Button>
 <Button variant="outline" size="sm" onClick={onDelete}>
 <Trash2 className="h-icon-xs w-icon-xs mr-2 text-destructive" />
 Delete
 </Button>
 </div>
 </div>

 <div className="space-y-lg">
 {/* Basic Information */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <Settings className="h-icon-xs w-icon-xs" />
 Basic Information
 </h3>
 <div className="space-y-md">
 {event.description && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Description</div>
 <p className="text-sm">{event.description}</p>
 </div>
 )}

 {event.project && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Project</div>
 <div className="flex items-center gap-sm">
 <span className="text-sm">{event.project.name}</span>
 <Badge variant="outline" className="text-xs">
 {event.project.status}
 </Badge>
 </div>
 </div>
 )}
 </div>
 </Card>

 {/* Date & Time Information */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <Calendar className="h-icon-xs w-icon-xs" />
 Schedule
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Start</div>
 <div className="flex items-center gap-sm text-sm">
 <Calendar className="h-3 w-3" />
 {formatDateTime(event.start_at).date}
 </div>
 {!event.is_all_day && (
 <div className="flex items-center gap-sm text-sm text-muted-foreground">
 <Clock className="h-3 w-3" />
 {formatDateTime(event.start_at).time}
 </div>
 )}
 </div>

 {event.end_at && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">End</div>
 <div className="flex items-center gap-sm text-sm">
 <Calendar className="h-3 w-3" />
 {formatDateTime(event.end_at).date}
 </div>
 {!event.is_all_day && (
 <div className="flex items-center gap-sm text-sm text-muted-foreground">
 <Clock className="h-3 w-3" />
 {formatDateTime(event.end_at).time}
 </div>
 )}
 </div>
 )}

 {event.setup_start && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Setup Start</div>
 <div className="text-sm">{formatDateTime(event.setup_start).full}</div>
 </div>
 )}

 {event.teardown_end && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Teardown End</div>
 <div className="text-sm">{formatDateTime(event.teardown_end).full}</div>
 </div>
 )}
 </div>

 {event.is_all_day && (
 <div className="mt-md">
 <Badge variant="outline" className="text-xs">
 All Day Event
 </Badge>
 </div>
 )}
 </Card>

 {/* Location & Capacity */}
 {(event.location || event.capacity || event.broadcast_url) && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <MapPin className="h-icon-xs w-icon-xs" />
 Location & Details
 </h3>
 <div className="space-y-md">
 {event.location && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Location</div>
 <div className="flex items-center gap-sm text-sm">
 <MapPin className="h-3 w-3" />
 {event.location}
 </div>
 </div>
 )}

 {event.capacity && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Capacity</div>
 <div className="flex items-center gap-sm text-sm">
 <Users className="h-3 w-3" />
 {event.capacity} attendees
 </div>
 </div>
 )}

 {event.broadcast_url && (
 <div>
 <div className="text-sm font-medium text-muted-foreground mb-1">Broadcast</div>
 <a
 href={event.broadcast_url as any as any}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-sm text-sm text-primary hover:underline"
 >
 <ExternalLink className="h-3 w-3" />
 View Stream
 </a>
 </div>
 )}
 </div>
 </Card>
 )}

 {/* Tags */}
 {event.tags.length > 0 && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <Tag className="h-icon-xs w-icon-xs" />
 Tags
 </h3>
 <div className="flex flex-wrap gap-sm">
 {event.tags.map((tag) => (
 <Badge key={tag} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 </Card>
 )}

 {/* Resources */}
 {event.resources.length > 0 && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <Package className="h-icon-xs w-icon-xs" />
 Resources
 </h3>
 <div className="space-y-sm">
 {event.resources.map((resource, index) => (
 <div key={index} className="flex items-center justify-between p-sm bg-muted/50 rounded">
 <span className="text-sm font-medium">{resource.name}</span>
 <Badge variant="secondary" className="text-xs">
 {resource.quantity}
 </Badge>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Staffing */}
 {event.staffing.length > 0 && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <UserCheck className="h-icon-xs w-icon-xs" />
 Staffing
 </h3>
 <div className="space-y-sm">
 {event.staffing.map((staff, index) => (
 <div key={index} className="p-sm bg-muted/50 rounded">
 <div className="flex items-center justify-between">
 <div className="font-medium text-sm">{staff.role}</div>
 <div className="text-xs text-muted-foreground">
 {getUserName(staff.user_id)}
 </div>
 </div>
 {staff.notes && (
 <div className="text-xs text-muted-foreground mt-1">{staff.notes}</div>
 )}
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Metadata */}
 {event.metadata && Object.keys(event.metadata).length > 0 && (
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Additional Information</h3>
 <div className="space-y-sm">
 {Object.entries(event.metadata).map(([key, value]) => (
 <div key={key} className="flex justify-between text-sm">
 <span className="font-medium text-muted-foreground">{key}:</span>
 <span>{String(value)}</span>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Timestamps */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Event History</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
 {event.created_at && (
 <div>
 <div className="font-medium text-muted-foreground mb-1">Created</div>
 <div>{new Date(event.created_at).toLocaleString()}</div>
 </div>
 )}
 {event.updated_at && (
 <div>
 <div className="font-medium text-muted-foreground mb-1">Last Updated</div>
 <div>{new Date(event.updated_at).toLocaleString()}</div>
 </div>
 )}
 </div>
 </Card>
 </div>
 </div>
 </Modal>
 );
}
