"use client";

import { Calendar, Clock, Edit, MapPin, Users, Activity, Tag, Briefcase, Radio, Settings, FileText } from "lucide-react";
import { AppDrawer, Badge, Button, Card } from "@ghxstship/ui";
import { format, parseISO, differenceInHours } from "date-fns";
import type { ProgrammingEvent } from "../types";
import { EVENT_TYPE_LABEL, STATUS_BADGE } from "../ProgrammingCalendarClient";

type ViewProgrammingEventDrawerProps = {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 event: ProgrammingEvent;
 onEdit?: () => void;
 onDelete?: () => void;
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
 const statusConfig = STATUS_BADGE[event.status];
 
 // Calculate event duration
 const getDuration = () => {
 if (!event.end_at) return null;
 const hours = differenceInHours(parseISO(event.end_at), parseISO(event.start_at));
 if (hours < 1) return "< 1 hour";
 if (hours === 1) return "1 hour";
 return `${hours} hours`;
 };

 // Get user by ID
 const getUserById = (userId?: string) => {
 if (!userId) return null;
 return users.find(user => user.id === userId);
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title={event.title}
 description={event.project?.name || "Programming Event"}
 icon={<Calendar className="h-icon-sm w-icon-sm" />}
 
 >
 <div className="space-y-lg">
 {/* Header Actions */}
 <div className="flex justify-between items-start">
 <div className="flex items-center gap-xs">
 <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
 <Badge variant="outline">{EVENT_TYPE_LABEL[event.event_type]}</Badge>
 </div>
 {onEdit && (
 <Button
 variant="outline"
 size="sm"
 onClick={onEdit}
 >
 <Edit className="h-icon-xs w-icon-xs mr-2" />
 Edit
 </Button>
 )}
 </div>

 {/* Description */}
 {event.description && (
 <div>
 <h3 className="font-medium mb-2 flex items-center gap-xs">
 <FileText className="h-icon-xs w-icon-xs" />
 Description
 </h3>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">
 {event.description}
 </p>
 </div>
 )}

 {/* Schedule */}
 <div>
 <h3 className="font-medium mb-3 flex items-center gap-xs">
 <Clock className="h-icon-xs w-icon-xs" />
 Schedule
 </h3>
 <div className="space-y-sm">
 <div className="flex items-center justify-between p-sm bg-muted/50 rounded-lg">
 <span className="text-sm">Start Time</span>
 <span className="text-sm font-medium">
 {format(parseISO(event.start_at), "MMMM d, yyyy 'at' h:mm a")}
 </span>
 </div>
 
 {event.end_at && (
 <div className="flex items-center justify-between p-sm bg-muted/50 rounded-lg">
 <span className="text-sm">End Time</span>
 <span className="text-sm font-medium">
 {format(parseISO(event.end_at), "MMMM d, yyyy 'at' h:mm a")}
 </span>
 </div>
 )}

 {getDuration() && (
 <div className="flex items-center justify-between p-sm bg-muted/50 rounded-lg">
 <span className="text-sm">Duration</span>
 <span className="text-sm font-medium">{getDuration()}</span>
 </div>
 )}

 {event.setup_start && (
 <div className="flex items-center justify-between p-sm bg-info/10 rounded-lg">
 <span className="text-sm">Setup Start</span>
 <span className="text-sm font-medium">
 {format(parseISO(event.setup_start), "MMMM d, yyyy 'at' h:mm a")}
 </span>
 </div>
 )}

 {event.teardown_end && (
 <div className="flex items-center justify-between p-sm bg-info/10 rounded-lg">
 <span className="text-sm">Teardown End</span>
 <span className="text-sm font-medium">
 {format(parseISO(event.teardown_end), "MMMM d, yyyy 'at' h:mm a")}
 </span>
 </div>
 )}
 </div>
 </div>

 {/* Location & Capacity */}
 {(event.location || event.capacity) && (
 <div>
 <h3 className="font-medium mb-3 flex items-center gap-xs">
 <MapPin className="h-icon-xs w-icon-xs" />
 Venue Details
 </h3>
 <div className="space-y-sm">
 {event.location && (
 <div className="flex items-center justify-between p-sm bg-muted/50 rounded-lg">
 <span className="text-sm">Location</span>
 <span className="text-sm font-medium">{event.location}</span>
 </div>
 )}
 {event.capacity && (
 <div className="flex items-center justify-between p-sm bg-muted/50 rounded-lg">
 <span className="text-sm">Capacity</span>
 <span className="text-sm font-medium">{event.capacity} people</span>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Project Info */}
 {event.project && (
 <div>
 <h3 className="font-medium mb-2 flex items-center gap-xs">
 <Briefcase className="h-icon-xs w-icon-xs" />
 Project
 </h3>
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <span className="font-medium">{event.project.name}</span>
 <Badge variant={
 event.project.status === "active" ? "success" :
 event.project.status === "planning" ? "warning" :
 event.project.status === "on_hold" ? "secondary" :
 "destructive"
 }>
 {event.project.status}
 </Badge>
 </div>
 </Card>
 </div>
 )}

 {/* Broadcast */}
 {event.broadcast_url && (
 <div>
 <h3 className="font-medium mb-2 flex items-center gap-xs">
 <Radio className="h-icon-xs w-icon-xs" />
 Broadcast
 </h3>
 <Card className="p-sm">
 <a
 href={event.broadcast_url as any as any}
 target="_blank"
 rel="noopener noreferrer"
 className="text-sm text-primary hover:underline break-all"
 >
 {event.broadcast_url}
 </a>
 </Card>
 </div>
 )}

 {/* Tags */}
 {event.tags && event.tags.length > 0 && (
 <div>
 <h3 className="font-medium mb-3 flex items-center gap-xs">
 <Tag className="h-icon-xs w-icon-xs" />
 Tags
 </h3>
 <div className="flex flex-wrap gap-xs">
 {event.tags.map((tag) => (
 <Badge key={tag} variant="secondary">
 {tag}
 </Badge>
 ))}
 </div>
 </div>
 )}

 {/* Resources */}
 {event.resources && event.resources.length > 0 && (
 <div>
 <h3 className="font-medium mb-3 flex items-center gap-xs">
 <Settings className="h-icon-xs w-icon-xs" />
 Resources
 </h3>
 <div className="space-y-xs">
 {event.resources.map((resource, index) => (
 <Card key={index} className="p-sm">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium">{resource.name}</span>
 <Badge variant="outline">Qty: {resource.quantity}</Badge>
 </div>
 </Card>
 ))}
 </div>
 </div>
 )}

 {/* Staffing */}
 {event.staffing && event.staffing.length > 0 && (
 <div>
 <h3 className="font-medium mb-3 flex items-center gap-xs">
 <Users className="h-icon-xs w-icon-xs" />
 Staffing
 </h3>
 <div className="space-y-xs">
 {event.staffing.map((staff, index) => {
 const user = getUserById(staff.user_id);
 
 return (
 <Card key={index} className="p-sm">
 <div className="flex items-center justify-between">
 <div>
 <div className="text-sm font-medium">{staff.role}</div>
 {user && (
 <div className="text-xs text-muted-foreground">
 {user.full_name || user.email}
 </div>
 )}
 {staff.notes && (
 <div className="text-xs text-muted-foreground mt-1">
 {staff.notes}
 </div>
 )}
 </div>
 {user && user.avatar_url && (
 <img
 src={user.avatar_url}
 alt={user.full_name || user.email}
 className="h-icon-lg w-icon-lg rounded-full"
 />
 )}
 </div>
 </Card>
 );
 })}
 </div>
 </div>
 )}

 {/* Activity */}
 <div>
 <h3 className="font-medium mb-3 flex items-center gap-xs">
 <Activity className="h-icon-xs w-icon-xs" />
 Activity
 </h3>
 <div className="space-y-xs text-sm text-muted-foreground">
 <div className="flex items-center justify-between">
 <span>Created</span>
 <span>{format(parseISO(event.created_at || event.start_at), "MMM d, yyyy 'at' h:mm a")}</span>
 </div>
 <div className="flex items-center justify-between">
 <span>Last Updated</span>
 <span>{format(parseISO(event.updated_at || event.start_at), "MMM d, yyyy 'at' h:mm a")}</span>
 </div>
 <div className="flex items-center justify-between">
 <span>Timezone</span>
 <span>{event.timezone || "UTC"}</span>
 </div>
 {event.is_all_day && (
 <div className="flex items-center justify-between">
 <span>All Day Event</span>
 <Badge variant="secondary">Yes</Badge>
 </div>
 )}
 </div>
 </div>

 {/* Close Button */}
 <div className="pt-6 border-t">
 <Button
 variant="outline"
 className="w-full"
 onClick={() => onOpenChange(false)}
 >
 Close
 </Button>
 </div>
 </div>
 </AppDrawer>
 );
}
