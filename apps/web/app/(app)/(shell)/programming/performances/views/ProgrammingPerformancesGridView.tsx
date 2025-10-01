"use client";

import { Edit, Eye, Trash2, Clock, MapPin, DollarSign, Users, Calendar, Music, Ticket } from "lucide-react";
import {
 Badge,
 Button,
 Card,
 Checkbox,
} from "@ghxstship/ui";
import type { ProgrammingPerformance, PerformanceSort, PerformanceProject, PerformanceEvent } from "../types";
import { STATUS_BADGE, PERFORMANCE_TYPE_BADGE } from "../types";

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

type ProgrammingPerformancesGridViewProps = {
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

export default function ProgrammingPerformancesGridView({
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
}: ProgrammingPerformancesGridViewProps) {

 const formatDateTime = (dateString: string) => {
 return new Date(dateString).toLocaleString();
 };

 const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString();
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

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {Array.from({ length: 8 }).map((_, i) => (
 <Card key={i} className="p-md">
 <div className="animate-pulse">
 <div className="h-icon-xs bg-muted rounded mb-2"></div>
 <div className="h-3 bg-muted rounded mb-1"></div>
 <div className="h-3 bg-muted rounded mb-4"></div>
 <div className="flex gap-xs">
 <div className="h-icon-md bg-muted rounded flex-1"></div>
 <div className="h-icon-md bg-muted rounded flex-1"></div>
 </div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (performances.length === 0) {
 return (
 <Card className="p-lg">
 <div className="text-center py-xsxl">
 <Music className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-medium mb-2">No performances found</h3>
 <p className="text-muted-foreground">Create your first performance to get started</p>
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-md">
 {/* Grid Controls */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <Checkbox
 checked={performances.length > 0 && selectedPerformances.size === performances.length}
 indeterminate={selectedPerformances.size > 0 && selectedPerformances.size < performances.length}
 onChange={(checked) => onSelectAll(checked)}
 />
 <span className="text-sm text-muted-foreground">
 {selectedPerformances.size > 0 ? `${selectedPerformances.size} selected` : `${performances.length} performances`}
 </span>
 </div>
 </div>

 {/* Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {performances.map((performance) => {
 const statusConfig = STATUS_BADGE[performance.status];
 const typeConfig = PERFORMANCE_TYPE_BADGE[performance.performance_type || 'other'];
 const isSelected = selectedPerformances.has(performance.id);
 const ticketPrice = performance.ticket_info.price_min || performance.ticket_info.price_max;

 return (
 <Card
 key={performance.id}
 className={`p-md transition-all hover:shadow-md cursor-pointer ${
 isSelected ? 'ring-2 ring-primary/20 bg-primary/5' : ''
 }`}
 onClick={() => onView(performance)}
 >
 {/* Header */}
 <div className="flex items-start justify-between mb-sm">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-sm mb-1">
 <Checkbox
 checked={isSelected}
 onChange={(checked) => onSelectionChange(performance.id, checked)}
 onClick={(e) => e.stopPropagation()}
 />
 <Badge variant="secondary" className="text-xs">
 {typeConfig.icon} {typeConfig.label}
 </Badge>
 </div>
 <h3 className="font-medium text-sm truncate">{performance.name}</h3>
 {performance.description && (
 <p className="text-xs text-muted-foreground line-clamp-xs mt-1">
 {performance.description}
 </p>
 )}
 </div>

 <div className="flex items-center gap-xs ml-sm">
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(performance);
 }}
 >
 <Edit className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(performance);
 }}
 >
 <Trash2 className="h-3 w-3 text-destructive" />
 </Button>
 </div>
 </div>

 {/* Status */}
 <div className="mb-sm">
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 {performance.ticket_info.sold_out && (
 <Badge variant="destructive" className="text-xs ml-1">
 Sold Out
 </Badge>
 )}
 </div>

 {/* Event & Date */}
 {performance.event && (
 <div className="mb-sm">
 <div className="flex items-center gap-xs text-xs text-muted-foreground mb-1">
 <Calendar className="h-3 w-3" />
 <span className="truncate">{performance.event.title}</span>
 </div>
 <div className="text-xs text-muted-foreground">
 {formatDate(performance.event.start_at)}
 </div>
 </div>
 )}

 {/* Performance Time & Duration */}
 <div className="grid grid-cols-2 gap-sm mb-sm text-xs">
 <div>
 <div className="text-muted-foreground">Start Time</div>
 <div className="flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 {formatTime(performance.starts_at)}
 </div>
 </div>
 <div>
 <div className="text-muted-foreground">Duration</div>
 <div>{performance.duration_minutes ? `${performance.duration_minutes}m` : "TBD"}</div>
 </div>
 </div>

 {/* Venue */}
 {performance.venue && (
 <div className="mb-sm">
 <div className="flex items-center gap-xs text-xs">
 <MapPin className="h-3 w-3 text-muted-foreground" />
 <span className="truncate">{performance.venue}</span>
 </div>
 {performance.venue_capacity && (
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <Users className="h-3 w-3" />
 Capacity: {performance.venue_capacity.toLocaleString()}
 </div>
 )}
 </div>
 )}

 {/* Ticket Info */}
 {ticketPrice && (
 <div className="mb-sm">
 <div className="flex items-center gap-xs text-xs">
 <Ticket className="h-3 w-3 text-muted-foreground" />
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
 {performance.ticket_info.sales_url && (
 <div className="text-xs text-muted-foreground truncate">
 Sales: {performance.ticket_info.sales_url}
 </div>
 )}
 </div>
 )}

 {/* Audience Info */}
 {performance.audience_info.expected_attendance && (
 <div className="mb-sm">
 <div className="flex items-center gap-xs text-xs">
 <Users className="h-3 w-3 text-muted-foreground" />
 <span>Expected: {performance.audience_info.expected_attendance.toLocaleString()}</span>
 </div>
 {performance.audience_info.target_demographic && (
 <div className="text-xs text-muted-foreground">
 Target: {performance.audience_info.target_demographic}
 </div>
 )}
 </div>
 )}

 {/* Technical Requirements */}
 {performance.technical_requirements.equipment_needed?.length > 0 && (
 <div className="mb-sm">
 <div className="text-xs text-muted-foreground mb-1">Equipment</div>
 <div className="flex flex-wrap gap-xs">
 {performance.technical_requirements.equipment_needed.slice(0, 2).map((item, index) => (
 <Badge key={index} variant="outline" className="text-small px-xs py-0">
 {item}
 </Badge>
 ))}
 {performance.technical_requirements.equipment_needed.length > 2 && (
 <Badge variant="outline" className="text-small px-xs py-0">
 +{performance.technical_requirements.equipment_needed.length - 2}
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Project */}
 {performance.project && (
 <div className="mb-sm">
 <div className="text-xs text-muted-foreground mb-1">Project</div>
 <div className="text-xs font-medium truncate">{performance.project.name}</div>
 </div>
 )}

 {/* Tags */}
 {performance.tags.length > 0 && (
 <div className="mb-sm">
 <div className="flex flex-wrap gap-xs">
 {performance.tags.slice(0, 3).map((tag) => (
 <Badge key={tag} variant="secondary" className="text-small px-xs py-0">
 {tag}
 </Badge>
 ))}
 {performance.tags.length > 3 && (
 <Badge variant="secondary" className="text-small px-xs py-0">
 +{performance.tags.length - 3}
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Production Notes */}
 {(performance.production_notes.call_time || performance.production_notes.sound_check) && (
 <div className="mb-sm">
 <div className="text-xs text-muted-foreground mb-1">Production</div>
 {performance.production_notes.call_time && (
 <div className="text-xs">
 Call: {formatTime(performance.production_notes.call_time)}
 </div>
 )}
 {performance.production_notes.sound_check && (
 <div className="text-xs">
 Sound Check: {formatTime(performance.production_notes.sound_check)}
 </div>
 )}
 </div>
 )}

 {/* Footer */}
 <div className="pt-sm border-t text-xs text-muted-foreground">
 <div className="flex justify-between">
 <span>By {getUserName(performance.created_by)}</span>
 <span>{new Date(performance.created_at).toLocaleDateString()}</span>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 </div>
 );
}
