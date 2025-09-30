"use client";

import { Edit, Eye, Trash2, Clock, MapPin, DollarSign, Calendar, Music, Users } from "lucide-react";
import { useMemo } from "react";
import {
 Badge,
 Button,
 Card,
} from "@ghxstship/ui";
import type { ProgrammingLineup, LineupSort, LineupProject, LineupEvent } from "../types";
import { STATUS_BADGE, PERFORMER_TYPE_BADGE } from "../types";

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

type ProgrammingLineupsTimelineViewProps = {
 lineups: ProgrammingLineup[];
 loading: boolean;
 selectedLineups: Set<string>;
 onSelectionChange: (id: string, selected: boolean) => void;
 onSelectAll: (selected: boolean) => void;
 onEdit: (lineup: ProgrammingLineup) => void;
 onView: (lineup: ProgrammingLineup) => void;
 onDelete: (lineup: ProgrammingLineup) => void;
 sortConfig: LineupSort;
 onSort: (sort: LineupSort) => void;
 users: User[];
 projects: LineupProject[];
 events: LineupEvent[];
};

interface TimelineGroup {
 date: string;
 event?: LineupEvent;
 lineups: ProgrammingLineup[];
}

export default function ProgrammingLineupsTimelineView({
 lineups,
 loading,
 selectedLineups,
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
}: ProgrammingLineupsTimelineViewProps) {
 
 const timelineGroups = useMemo(() => {
 const groups: { [key: string]: { event?: LineupEvent; lineups: ProgrammingLineup[] } } = {};
 
 lineups.forEach((lineup) => {
 // Use event date if available, otherwise use set_time date, or fallback to created date
 let groupDate: string;
 if (lineup.event?.start_at) {
 groupDate = new Date(lineup.event.start_at).toDateString();
 } else if (lineup.set_time) {
 groupDate = new Date(lineup.set_time).toDateString();
 } else {
 groupDate = new Date(lineup.created_at).toDateString();
 }
 
 if (!groups[groupDate]) {
 groups[groupDate] = {
 event: lineup.event || undefined,
 lineups: [],
 };
 }
 groups[groupDate].lineups.push(lineup);
 });

 return Object.entries(groups)
 .map(([date, data]) => ({
 date,
 event: data.event,
 lineups: data.lineups.sort((a, b) => {
 if (!a.set_time && !b.set_time) return 0;
 if (!a.set_time) return 1;
 if (!b.set_time) return -1;
 return new Date(a.set_time).getTime() - new Date(b.set_time).getTime();
 }),
 }))
 .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
 }, [lineups]);

 const formatDate = (dateString: string) => {
 const date = new Date(dateString);
 return date.toLocaleDateString("en-US", {
 weekday: "long",
 year: "numeric",
 month: "long",
 day: "numeric",
 });
 };

 const formatTime = (timeString: string | null) => {
 if (!timeString) return "TBD";
 return new Date(timeString).toLocaleTimeString("en-US", {
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

 const getTimelinePosition = (lineup: ProgrammingLineup, groupLineups: ProgrammingLineup[]) => {
 if (!lineup.set_time) return null;
 
 const setTime = new Date(lineup.set_time).getTime();
 const times = groupLineups
 .filter(l => l.set_time)
 .map(l => new Date(l.set_time!).getTime())
 .sort((a, b) => a - b);
 
 if (times.length === 0) return null;
 
 const minTime = times[0];
 const maxTime = times[times.length - 1];
 
 if (minTime === maxTime) return 50; // Center if all same time
 
 return ((setTime - minTime) / (maxTime - minTime)) * 100;
 };

 if (loading) {
 return (
 <Card className="p-lg">
 <div className="flex items-center justify-center py-12">
 <div className="text-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
 <p className="text-muted-foreground">Loading timeline...</p>
 </div>
 </div>
 </Card>
 );
 }

 if (timelineGroups.length === 0) {
 return (
 <Card className="p-lg">
 <div className="text-center py-12">
 <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-medium mb-2">No lineups found</h3>
 <p className="text-muted-foreground">Create your first lineup to see it on the timeline</p>
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
 {group.lineups.map((lineup, index) => {
 const statusConfig = STATUS_BADGE[lineup.status];
 const typeConfig = PERFORMER_TYPE_BADGE[lineup.performer_type || 'other'];
 const isSelected = selectedLineups.has(lineup.id);
 const fee = formatCurrency(lineup.contract_details.fee, lineup.contract_details.currency);

 return (
 <div key={lineup.id} className="relative">
 {/* Timeline Dot */}
 <div className={`absolute -left-6 top-3 w-3 h-3 rounded-full border-2 ${
 isSelected ? 'bg-primary border-primary' : 'bg-background border-border'
 }`} />

 {/* Lineup Card */}
 <Card className={`p-md transition-all hover:shadow-md ${
 isSelected ? 'ring-2 ring-primary/20 bg-primary/5' : ''
 }`}>
 <div className="flex items-start justify-between mb-sm">
 <div className="flex-1">
 <div className="flex items-center gap-sm mb-1">
 <h4 className="font-medium">{lineup.performer_name}</h4>
 <Badge variant="secondary" className="text-xs">
 {typeConfig.icon} {typeConfig.label}
 </Badge>
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 </div>
 
 {lineup.role && (
 <p className="text-sm text-muted-foreground mb-sm">
 {lineup.role}
 </p>
 )}
 </div>

 <div className="flex items-center gap-1 ml-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(lineup)}
 >
 <Eye className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(lineup)}
 >
 <Edit className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(lineup)}
 >
 <Trash2 className="h-4 w-4 text-destructive" />
 </Button>
 </div>
 </div>

 {/* Timeline Details */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md text-sm">
 {/* Set Time */}
 <div className="flex items-center gap-1">
 <Clock className="h-3 w-3 text-muted-foreground" />
 <span className="text-muted-foreground">Set Time:</span>
 <span className="font-medium">{formatTime(lineup.set_time)}</span>
 </div>

 {/* Duration */}
 <div className="flex items-center gap-1">
 <span className="text-muted-foreground">Duration:</span>
 <span>{lineup.duration_minutes ? `${lineup.duration_minutes} min` : "TBD"}</span>
 </div>

 {/* Stage */}
 {lineup.stage && (
 <div className="flex items-center gap-1">
 <MapPin className="h-3 w-3 text-muted-foreground" />
 <span className="text-muted-foreground">Stage:</span>
 <span className="truncate">{lineup.stage}</span>
 </div>
 )}

 {/* Fee */}
 {fee && (
 <div className="flex items-center gap-1">
 <DollarSign className="h-3 w-3 text-muted-foreground" />
 <span className="text-muted-foreground">Fee:</span>
 <span className="font-medium">{fee}</span>
 </div>
 )}
 </div>

 {/* Contact Info */}
 {(lineup.contact_info.email || lineup.contact_info.phone || lineup.contact_info.agent) && (
 <div className="mt-sm pt-sm border-t">
 <div className="text-xs text-muted-foreground mb-1">Contact:</div>
 <div className="flex flex-wrap gap-md text-sm">
 {lineup.contact_info.email && (
 <span>{lineup.contact_info.email}</span>
 )}
 {lineup.contact_info.phone && (
 <span>{lineup.contact_info.phone}</span>
 )}
 {lineup.contact_info.agent && (
 <span>Agent: {lineup.contact_info.agent}</span>
 )}
 </div>
 </div>
 )}

 {/* Technical Requirements */}
 {lineup.technical_requirements.equipment?.length > 0 && (
 <div className="mt-sm pt-sm border-t">
 <div className="text-xs text-muted-foreground mb-1">Equipment:</div>
 <div className="flex flex-wrap gap-1">
 {lineup.technical_requirements.equipment.slice(0, 5).map((item, itemIndex) => (
 <Badge key={itemIndex} variant="outline" className="text-xs">
 {item}
 </Badge>
 ))}
 {lineup.technical_requirements.equipment.length > 5 && (
 <Badge variant="outline" className="text-xs">
 +{lineup.technical_requirements.equipment.length - 5} more
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Project */}
 {lineup.project && (
 <div className="mt-sm pt-sm border-t">
 <div className="text-xs text-muted-foreground mb-1">Project:</div>
 <div className="flex items-center gap-sm">
 <span className="text-sm font-medium">{lineup.project.name}</span>
 <Badge variant="outline" className="text-xs">
 {lineup.project.status}
 </Badge>
 </div>
 </div>
 )}

 {/* Tags */}
 {lineup.tags.length > 0 && (
 <div className="mt-sm pt-sm border-t">
 <div className="text-xs text-muted-foreground mb-1">Tags:</div>
 <div className="flex flex-wrap gap-1">
 {lineup.tags.slice(0, 5).map((tag) => (
 <Badge key={tag} variant="secondary" className="text-xs">
 {tag}
 </Badge>
 ))}
 {lineup.tags.length > 5 && (
 <Badge variant="secondary" className="text-xs">
 +{lineup.tags.length - 5} more
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Notes */}
 {lineup.notes && (
 <div className="mt-sm pt-sm border-t">
 <div className="text-xs text-muted-foreground mb-1">Notes:</div>
 <p className="text-sm text-muted-foreground">{lineup.notes}</p>
 </div>
 )}

 {/* Footer */}
 <div className="mt-sm pt-sm border-t flex justify-between text-xs text-muted-foreground">
 <span>Created by {getUserName(lineup.created_by)}</span>
 <span>{new Date(lineup.created_at).toLocaleString()}</span>
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
