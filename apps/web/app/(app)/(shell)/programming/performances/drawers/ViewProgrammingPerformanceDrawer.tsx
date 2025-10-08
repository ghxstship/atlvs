"use client";

import { Calendar, Clock, DollarSign, Edit, ExternalLink, ExternalTicket, FileText, MapPin, Music, Settings, Tag, Target, Ticket, Trash2, Users } from 'lucide-react';
import {
 Button,
 Badge,
 Drawer,
 DrawerContent,
 DrawerHeader,
 DrawerTitle,
 DrawerFooter,
 Separator
} from "@ghxstship/ui";
import type { ProgrammingPerformance, PerformanceProject, PerformanceEvent } from "../types";
import { STATUS_BADGE, PERFORMANCE_TYPE_BADGE } from "../types";

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

type ViewProgrammingPerformanceDrawerProps = {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 performance: ProgrammingPerformance;
 onEdit: () => void;
 onDelete: () => void;
 users: User[];
 projects: PerformanceProject[];
 events: PerformanceEvent[];
};

export default function ViewProgrammingPerformanceDrawer({
 open,
 onOpenChange,
 performance,
 onEdit,
 onDelete,
 users,
 projects,
 events
}: ViewProgrammingPerformanceDrawerProps) {

 const formatDateTime = (dateString: string) => {
 return new Date(dateString).toLocaleString();
 };

 const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString();
 };

 const formatTime = (dateString: string) => {
 return new Date(dateString).toLocaleTimeString("en-US", {
 hour: "2-digit",
 minute: "2-digit"
 });
 };

 const formatCurrency = (amount: number | null, currency: string | null) => {
 if (!amount || !currency) return null;
 return new Intl.NumberFormat("en-US", {
 style: "currency",
 currency: currency
 }).format(amount);
 };

 const getUserName = (userId: string) => {
 const user = users.find((u) => u.id === userId);
 return user?.full_name || user?.email || "Unknown User";
 };

 const getDuration = () => {
 if (performance.duration_minutes) {
 return `${performance.duration_minutes} minutes`;
 }
 if (performance.ends_at) {
 const start = new Date(performance.starts_at);
 const end = new Date(performance.ends_at);
 const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
 return `${diffMinutes} minutes`;
 }
 return "TBD";
 };

 const statusConfig = STATUS_BADGE[performance.status];
 const typeConfig = PERFORMANCE_TYPE_BADGE[performance.performance_type || 'other'];

 return (
 <Drawer open={open} onClose={() => onOpenChange(false)}>
 <DrawerContent className="max-w-4xl mx-auto">
 <DrawerHeader>
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <DrawerTitle className="text-xl">{performance.name}</DrawerTitle>
 <div className="flex items-center gap-xs mt-2">
 <Badge variant="secondary" className="text-sm">
 {typeConfig.icon} {typeConfig.label}
 </Badge>
 <Badge variant={statusConfig.variant} className="text-sm">
 {statusConfig.label}
 </Badge>
 {performance.ticket_info.sold_out && (
 <Badge variant="destructive" className="text-sm">
 Sold Out
 </Badge>
 )}
 </div>
 </div>
 <div className="flex items-center gap-xs">
 <Button variant="outline" onClick={onEdit}>
 <Edit className="mr-2 h-icon-xs w-icon-xs" />
 Edit
 </Button>
 <Button variant="outline" onClick={onDelete}>
 <Trash2 className="mr-2 h-icon-xs w-icon-xs text-destructive" />
 Delete
 </Button>
 </div>
 </div>
 </DrawerHeader>

 <div className="flex-1 overflow-y-auto px-lg space-y-lg">
 {/* Description */}
 {performance.description && (
 <div>
 <p className="text-muted-foreground">{performance.description}</p>
 </div>
 )}

 {/* Event & Project */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 {performance.event && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs">
 <Calendar className="h-icon-xs w-icon-xs text-muted-foreground" />
 <h3 className="font-medium">Event</h3>
 </div>
 <div className="pl-6">
 <div className="font-medium">{performance.event.title}</div>
 <div className="text-sm text-muted-foreground">
 {formatDate(performance.event.start_at)} - {formatDate(performance.event.end_at)}
 </div>
 {performance.event.location && (
 <div className="text-sm text-muted-foreground">
 {performance.event.location}
 </div>
 )}
 </div>
 </div>
 )}

 {performance.project && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs">
 <FileText className="h-icon-xs w-icon-xs text-muted-foreground" />
 <h3 className="font-medium">Project</h3>
 </div>
 <div className="pl-6">
 <div className="font-medium">{performance.project.name}</div>
 <Badge variant="outline" className="text-xs">
 {performance.project.status}
 </Badge>
 </div>
 </div>
 )}
 </div>

 <Separator />

 {/* Schedule */}
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <Clock className="h-icon-xs w-icon-xs text-muted-foreground" />
 <h3 className="text-lg font-medium">Schedule</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-md pl-6">
 <div>
 <div className="text-sm text-muted-foreground">Start Time</div>
 <div className="font-medium">{formatDateTime(performance.starts_at)}</div>
 </div>

 {performance.ends_at && (
 <div>
 <div className="text-sm text-muted-foreground">End Time</div>
 <div className="font-medium">{formatDateTime(performance.ends_at)}</div>
 </div>
 )}

 <div>
 <div className="text-sm text-muted-foreground">Duration</div>
 <div className="font-medium">{getDuration()}</div>
 </div>
 </div>
 </div>

 <Separator />

 {/* Venue */}
 {performance.venue && (
 <>
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <MapPin className="h-icon-xs w-icon-xs text-muted-foreground" />
 <h3 className="text-lg font-medium">Venue</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md pl-6">
 <div>
 <div className="text-sm text-muted-foreground">Venue Name</div>
 <div className="font-medium">{performance.venue}</div>
 </div>

 {performance.venue_capacity && (
 <div>
 <div className="text-sm text-muted-foreground">Capacity</div>
 <div className="font-medium">{performance.venue_capacity.toLocaleString()}</div>
 </div>
 )}
 </div>
 </div>
 <Separator />
 </>
 )}

 {/* Ticket Information */}
 {(performance.ticket_info.price_min || performance.ticket_info.price_max || performance.ticket_info.sales_url) && (
 <>
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <Ticket className="h-icon-xs w-icon-xs text-muted-foreground" />
 <h3 className="text-lg font-medium">Ticket Information</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-md pl-6">
 {(performance.ticket_info.price_min || performance.ticket_info.price_max) && (
 <div>
 <div className="text-sm text-muted-foreground">Price Range</div>
 <div className="font-medium">
 {performance.ticket_info.price_min && performance.ticket_info.price_max ? (
 <span>
 {formatCurrency(performance.ticket_info.price_min, performance.ticket_info.currency)} - {formatCurrency(performance.ticket_info.price_max, performance.ticket_info.currency)}
 </span>
 ) : (
 formatCurrency(
 performance.ticket_info.price_min || performance.ticket_info.price_max,
 performance.ticket_info.currency
 )
 )}
 </div>
 </div>
 )}

 {performance.ticket_info.currency && (
 <div>
 <div className="text-sm text-muted-foreground">Currency</div>
 <div className="font-medium">{performance.ticket_info.currency}</div>
 </div>
 )}

 {performance.ticket_info.sales_url && (
 <div>
 <div className="text-sm text-muted-foreground">Sales URL</div>
 <div className="font-medium">
 <a
 href={performance.ticket_info.sales_url as any as any}
 target="_blank"
 rel="noopener noreferrer"
 className="text-primary hover:underline flex items-center gap-xs"
 >
 View Tickets
 <ExternalLink className="h-3 w-3" />
 </a>
 </div>
 </div>
 )}
 </div>
 </div>
 <Separator />
 </>
 )}

 {/* Audience Information */}
 {(performance.audience_info.expected_attendance || performance.audience_info.target_demographic || performance.audience_info.accessibility_notes) && (
 <>
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <Users className="h-icon-xs w-icon-xs text-muted-foreground" />
 <h3 className="text-lg font-medium">Audience Information</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md pl-6">
 {performance.audience_info.expected_attendance && (
 <div>
 <div className="text-sm text-muted-foreground">Expected Attendance</div>
 <div className="font-medium">{performance.audience_info.expected_attendance.toLocaleString()}</div>
 </div>
 )}

 {performance.audience_info.target_demographic && (
 <div>
 <div className="text-sm text-muted-foreground">Target Demographic</div>
 <div className="font-medium">{performance.audience_info.target_demographic}</div>
 </div>
 )}
 </div>

 {performance.audience_info.accessibility_notes && (
 <div className="pl-6">
 <div className="text-sm text-muted-foreground">Accessibility Notes</div>
 <div className="font-medium">{performance.audience_info.accessibility_notes}</div>
 </div>
 )}
 </div>
 <Separator />
 </>
 )}

 {/* Technical Requirements */}
 {(performance.technical_requirements.sound_system || performance.technical_requirements.lighting || performance.technical_requirements.stage_setup || performance.technical_requirements.equipment_needed?.length > 0 || performance.technical_requirements.crew_requirements) && (
 <>
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <Settings className="h-icon-xs w-icon-xs text-muted-foreground" />
 <h3 className="text-lg font-medium">Technical Requirements</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md pl-6">
 {performance.technical_requirements.sound_system && (
 <div>
 <div className="text-sm text-muted-foreground">Sound System</div>
 <div className="font-medium">{performance.technical_requirements.sound_system}</div>
 </div>
 )}

 {performance.technical_requirements.lighting && (
 <div>
 <div className="text-sm text-muted-foreground">Lighting</div>
 <div className="font-medium">{performance.technical_requirements.lighting}</div>
 </div>
 )}
 </div>

 {performance.technical_requirements.stage_setup && (
 <div className="pl-6">
 <div className="text-sm text-muted-foreground">Stage Setup</div>
 <div className="font-medium">{performance.technical_requirements.stage_setup}</div>
 </div>
 )}

 {performance.technical_requirements.equipment_needed?.length > 0 && (
 <div className="pl-6">
 <div className="text-sm text-muted-foreground">Equipment Needed</div>
 <div className="flex flex-wrap gap-xs mt-1">
 {performance.technical_requirements.equipment_needed.map((item, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {item}
 </Badge>
 ))}
 </div>
 </div>
 )}

 {performance.technical_requirements.crew_requirements && (
 <div className="pl-6">
 <div className="text-sm text-muted-foreground">Crew Requirements</div>
 <div className="font-medium">{performance.technical_requirements.crew_requirements}</div>
 </div>
 )}
 </div>
 <Separator />
 </>
 )}

 {/* Production Notes */}
 {(performance.production_notes.call_time || performance.production_notes.sound_check || performance.production_notes.rehearsal_schedule || performance.production_notes.special_instructions) && (
 <>
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <FileText className="h-icon-xs w-icon-xs text-muted-foreground" />
 <h3 className="text-lg font-medium">Production Notes</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md pl-6">
 {performance.production_notes.call_time && (
 <div>
 <div className="text-sm text-muted-foreground">Call Time</div>
 <div className="font-medium">{formatDateTime(performance.production_notes.call_time)}</div>
 </div>
 )}

 {performance.production_notes.sound_check && (
 <div>
 <div className="text-sm text-muted-foreground">Sound Check</div>
 <div className="font-medium">{formatDateTime(performance.production_notes.sound_check)}</div>
 </div>
 )}
 </div>

 {performance.production_notes.rehearsal_schedule && (
 <div className="pl-6">
 <div className="text-sm text-muted-foreground">Rehearsal Schedule</div>
 <div className="font-medium">{performance.production_notes.rehearsal_schedule}</div>
 </div>
 )}

 {performance.production_notes.special_instructions && (
 <div className="pl-6">
 <div className="text-sm text-muted-foreground">Special Instructions</div>
 <div className="font-medium">{performance.production_notes.special_instructions}</div>
 </div>
 )}
 </div>
 <Separator />
 </>
 )}

 {/* Tags */}
 {performance.tags.length > 0 && (
 <>
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <Tag className="h-icon-xs w-icon-xs text-muted-foreground" />
 <h3 className="text-lg font-medium">Tags</h3>
 </div>

 <div className="pl-6">
 <div className="flex flex-wrap gap-xs">
 {performance.tags.map((tag) => (
 <Badge key={tag} variant="secondary" className="text-sm">
 {tag}
 </Badge>
 ))}
 </div>
 </div>
 </div>
 <Separator />
 </>
 )}

 {/* Metadata */}
 <div className="space-y-md">
 <h3 className="text-lg font-medium">Details</h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
 <div>
 <div className="text-muted-foreground">Created by</div>
 <div className="font-medium">{getUserName(performance.created_by)}</div>
 </div>

 <div>
 <div className="text-muted-foreground">Updated by</div>
 <div className="font-medium">{getUserName(performance.updated_by)}</div>
 </div>

 <div>
 <div className="text-muted-foreground">Created at</div>
 <div className="font-medium">{formatDateTime(performance.created_at)}</div>
 </div>

 <div>
 <div className="text-muted-foreground">Last updated</div>
 <div className="font-medium">{formatDateTime(performance.updated_at)}</div>
 </div>
 </div>
 </div>
 </div>

 <DrawerFooter>
 <div className="flex gap-xs">
 <Button variant="outline" onClick={() => onOpenChange(false)}>
 Close
 </Button>
 <Button onClick={onEdit}>
 <Edit className="mr-2 h-icon-xs w-icon-xs" />
 Edit Performance
 </Button>
 </div>
 </DrawerFooter>
 </DrawerContent>
 </Drawer>
 );
}
