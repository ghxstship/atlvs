"use client";

import { Edit, Eye, Trash2, Clock, MapPin, DollarSign, Calendar, Music, Users, Ticket } from "lucide-react";
import { useMemo } from "react";
import {
 Badge,
 Button,
 Card,
} from "@ghxstship/ui";
import type { ProgrammingPerformance, PerformanceSort, PerformanceProject, PerformanceEvent } from "../types";
import { STATUS_BADGE, PERFORMANCE_TYPE_BADGE } from "../types";

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

type ProgrammingPerformancesTimelineViewProps = {
 performances: ProgrammingPerformance[];
 loading: boolean;
 selectedPerformances: Set<string>;
 onSelectionChange: (id: string, selected: boolean) => void;
 onSelectAll: (selected: boolean) => void;
 onEdit: (performance: ProgrammingPerformance) => void;
 onView: (performance: ProgrammingPerformance) => void;
 onDelete: (performance: ProgrammingPerformance) => void;
 sortConfig: PerformanceSort;
 onSort: (sort: PerformanceSort) => void;
 users: User[];
 projects: PerformanceProject[];
 events: PerformanceEvent[];
};

interface TimelineGroup {
 date: string;
 event?: PerformanceEvent;
 performances: ProgrammingPerformance[];
}

export default function ProgrammingPerformancesTimelineView({
 performances,
 loading,
 selectedPerformances,
 onSelectionChange,
 onSelectAll,
 onEdit,
 onView,
 onDelete,
 sortConfig,
 onSort,
 users,
 projects,
 events,
}: ProgrammingPerformancesTimelineViewProps) {
 
 const timelineGroups = useMemo(() => {
 const groups: { [key: string]: { event?: PerformanceEvent; performances: ProgrammingPerformance[] } } = {};
 
 performances.forEach((performance) => {
 // Use event date if available, otherwise use performance start date
 let groupDate: string;
 if (performance.event?.start_at) {
 groupDate = new Date(performance.event.start_at).toDateString();
 } else {
 groupDate = new Date(performance.starts_at).toDateString();
 }
 
 if (!groups[groupDate]) {
 groups[groupDate] = {
 event: performance.event || undefined,
 performances: [],
 };
 }
 groups[groupDate].performances.push(performance);
 });

 return Object.entries(groups)
 .map(([date, data]) => ({
 date,
 event: data.event,
 performances: data.performances.sort((a, b) => 
 new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
 ),
 }))
 .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
 }, [performances]);

 const formatDate = (dateString: string) => {
 const date = new Date(dateString);
 return date.toLocaleDateString("en-US", {
 weekday: "long",
 year: "numeric",
 month: "long",
 day: "numeric",
 });
 };

 const formatTime = (dateString: string) => {
 return new Date(dateString).toLocaleTimeString("en-US", {
 hour: "2-digit",
 minute: "2-digit",
 });
 };

 const formatCurrency = (amount: number | null, currency: string | null) => {
 if (!amount || !currency) return null;
 return new Intl.NumberFormat("en-US", {
 style: "currency",
 currency: currency,
 }).format(amount);
 };

 const getUserName = (userId: string) => {
 const user = users.find((u) => u.id === userId);
 return user?.full_name || user?.email || "Unknown User";
 };

 const getDuration = (performance: ProgrammingPerformance) => {
 if (performance.duration_minutes) {
 return `${performance.duration_minutes} min`;
 }
 if (performance.ends_at) {
 const start = new Date(performance.starts_at);
 const end = new Date(performance.ends_at);
 const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
 return `${diffMinutes} min`;
 }
 return "TBD";
 };

 if (loading) {
 return (
 <Card className="p-lg">
 <div className="flex items-center justify-center py-xsxl">
 <div className="text-center">
 <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary mx-auto mb-4"></div>
 <p className="text-muted-foreground">Loading timeline...</p>
 </div>
 </div>
 </Card>
 );
 }

 if (timelineGroups.length === 0) {
 return (
 <Card className="p-lg">
 <div className="text-center py-xsxl">
 <Calendar className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-medium mb-2">No performances found</h3>
 <p className="text-muted-foreground">Create your first performance to see it on the timeline</p>
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-lg">
 {timelineGroups.map((group, groupIndex) => (
 <div key={group.date} className="relative">
 {/* Date Header */}
 <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-sm mb-md">
 <div className="flex items-center gap-md">
 <div className="h-px bg-border flex-1" />
 <div className="bg-background border rounded-full px-md py-sm">
 <h3 className="text-sm font-medium">{formatDate(group.date)}</h3>
 {group.event && (
 <p className="text-xs text-muted-foreground">{group.event.title}</p>
 )}
 </div>
 <div className="h-px bg-border flex-1" />
 </div>
 </div>

 {/* Timeline Items */}
 <div className="relative pl-8">
 {/* Timeline Line */}
 <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

 <div className="space-y-md">
 {group.performances.map((performance, index) => {
 const statusConfig = STATUS_BADGE[performance.status];
 const typeConfig = PERFORMANCE_TYPE_BADGE[performance.performance_type || 'other'];
 const isSelected = selectedPerformances.has(performance.id);
 const ticketPrice = performance.ticket_info.price_min || performance.ticket_info.price_max;

 return (
 <div key={performance.id} className="relative">
 {/* Timeline Dot */}
 <div className={`absolute -left-6 top-sm w-3 h-3 rounded-full border-2 ${
 isSelected ? 'bg-primary border-primary' : 'bg-background border-border'
 }`} />

 {/* Performance Card */}
 <Card className={`p-md transition-all hover:shadow-md ${
 isSelected ? 'ring-2 ring-primary/20 bg-primary/5' : ''
 }`}>
 <div className="flex items-start justify-between mb-sm">
 <div className="flex-1">
 <div className="flex items-center gap-sm mb-1">
 <h4 className="font-medium">{performance.name}</h4>
 <Badge variant="secondary" className="text-xs">
 {typeConfig.icon} {typeConfig.label}
 </Badge>
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 {performance.ticket_info.sold_out && (
 <Badge variant="destructive" className="text-xs">
 Sold Out
 </Badge>
 )}
 </div>
 
 {performance.description && (
 <p className="text-sm text-muted-foreground mb-sm">
 {performance.description}
 </p>
 )}
 </div>

 <div className="flex items-center gap-xs ml-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(performance)}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(performance)}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(performance)}
 >
 <Trash2 className="h-icon-xs w-icon-xs text-destructive" />
 </Button>
 </div>
 </div>

 {/* Performance Details */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md text-sm">
 {/* Start Time */}
 <div className="flex items-center gap-xs">
 <Clock className="h-3 w-3 text-muted-foreground" />
 <span className="text-muted-foreground">Start:</span>
 <span className="font-medium">{formatTime(performance.starts_at)}</span>
 </div>

 {/* Duration */}
 <div className="flex items-center gap-xs">
 <span className="text-muted-foreground">Duration:</span>
 <span>{getDuration(performance)}</span>
 </div>

 {/* Venue */}
 {performance.venue && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-3 w-3 text-muted-foreground" />
 <span className="text-muted-foreground">Venue:</span>
 <span className="truncate">{performance.venue}</span>
 </div>
 )}

 {/* Ticket Price */}
 {ticketPrice && (
 <div className="flex items-center gap-xs">
 <Ticket className="h-3 w-3 text-muted-foreground" />
 <span className="text-muted-foreground">Tickets:</span>
 <span className="font-medium">
 {performance.ticket_info.price_min && performance.ticket_info.price_max ? (
 <span>
 {formatCurrency(performance.ticket_info.price_min, performance.ticket_info.currency)} - {formatCurrency(performance.ticket_info.price_max, performance.ticket_info.currency)}
 </span>
 ) : (
 formatCurrency(ticketPrice, performance.ticket_info.currency)
 )}
 </span>
 </div>
 )}
 </div>

 {/* Venue & Audience Details */}
 {(performance.venue_capacity || performance.audience_info.expected_attendance) && (
 <div className="mt-sm pt-sm border-t">
 <div className="text-xs text-muted-foreground mb-1">Audience:</div>
 <div className="flex flex-wrap gap-md text-sm">
 {performance.venue_capacity && (
 <div className="flex items-center gap-xs">
 <Users className="h-3 w-3" />
 <span>Capacity: {performance.venue_capacity.toLocaleString()}</span>
 </div>
 )}
 {performance.audience_info.expected_attendance && (
 <div className="flex items-center gap-xs">
 <Users className="h-3 w-3" />
 <span>Expected: {performance.audience_info.expected_attendance.toLocaleString()}</span>
 </div>
 )}
 {performance.audience_info.target_demographic && (
 <span>Target: {performance.audience_info.target_demographic}</span>
 )}
 </div>
 </div>
 )}

 {/* Technical Requirements */}
 {performance.technical_requirements.equipment_needed?.length > 0 && (
 <div className="mt-sm pt-sm border-t">
 <div className="text-xs text-muted-foreground mb-1">Equipment:</div>
 <div className="flex flex-wrap gap-xs">
 {performance.technical_requirements.equipment_needed.slice(0, 5).map((item, itemIndex) => (
 <Badge key={itemIndex} variant="outline" className="text-xs">
 {item}
 </Badge>
 ))}
 {performance.technical_requirements.equipment_needed.length > 5 && (
 <Badge variant="outline" className="text-xs">
 +{performance.technical_requirements.equipment_needed.length - 5} more
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Production Notes */}
 {(performance.production_notes.call_time || performance.production_notes.sound_check) && (
 <div className="mt-sm pt-sm border-t">
 <div className="text-xs text-muted-foreground mb-1">Production:</div>
 <div className="flex flex-wrap gap-md text-sm">
 {performance.production_notes.call_time && (
 <span>Call: {formatTime(performance.production_notes.call_time)}</span>
 )}
 {performance.production_notes.sound_check && (
 <span>Sound Check: {formatTime(performance.production_notes.sound_check)}</span>
 )}
 </div>
 </div>
 )}

 {/* Project */}
 {performance.project && (
 <div className="mt-sm pt-sm border-t">
 <div className="text-xs text-muted-foreground mb-1">Project:</div>
 <div className="flex items-center gap-sm">
 <span className="text-sm font-medium">{performance.project.name}</span>
 <Badge variant="outline" className="text-xs">
 {performance.project.status}
 </Badge>
 </div>
 </div>
 )}

 {/* Tags */}
 {performance.tags.length > 0 && (
 <div className="mt-sm pt-sm border-t">
 <div className="text-xs text-muted-foreground mb-1">Tags:</div>
 <div className="flex flex-wrap gap-xs">
 {performance.tags.slice(0, 5).map((tag) => (
 <Badge key={tag} variant="secondary" className="text-xs">
 {tag}
 </Badge>
 ))}
 {performance.tags.length > 5 && (
 <Badge variant="secondary" className="text-xs">
 +{performance.tags.length - 5} more
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Footer */}
 <div className="mt-sm pt-sm border-t flex justify-between text-xs text-muted-foreground">
 <span>Created by {getUserName(performance.created_by)}</span>
 <span>{new Date(performance.created_at).toLocaleString()}</span>
 </div>
 </Card>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 ))}
 </div>
 );
}
