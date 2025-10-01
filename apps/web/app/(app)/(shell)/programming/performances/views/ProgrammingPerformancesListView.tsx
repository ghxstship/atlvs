"use client";

import { MoreHorizontal, Edit, Eye, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Clock, MapPin, DollarSign, Users, Calendar, Music } from "lucide-react";
import { useState } from "react";
import {
 Badge,
 Button,
 Card,
 Table,
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

type ProgrammingPerformancesListViewProps = {
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

export default function ProgrammingPerformancesListView({
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
}: ProgrammingPerformancesListViewProps) {
 const [expandedRows, setExpandedRows] = useState<Set<string>(new Set());

 const handleSort = (field: keyof ProgrammingPerformance) => {
 if (sortConfig.field === field) {
 onSort({
 field,
 direction: sortConfig.direction === "asc" ? "desc" : "asc",
 });
 } else {
 onSort({ field, direction: "asc" });
 }
 };

 const getSortIcon = (field: keyof ProgrammingPerformance) => {
 if (sortConfig.field !== field) {
 return <ArrowUpDown className="h-icon-xs w-icon-xs" />;
 }
 return sortConfig.direction === "asc" ? (
 <ArrowUp className="h-icon-xs w-icon-xs" />
 ) : (
 <ArrowDown className="h-icon-xs w-icon-xs" />
 );
 };

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
 if (!amount || !currency) return "—";
 return new Intl.NumberFormat("en-US", {
 style: "currency",
 currency: currency,
 }).format(amount);
 };

 const getUserName = (userId: string) => {
 const user = users.find((u) => u.id === userId);
 return user?.full_name || user?.email || "Unknown User";
 };

 const toggleRowExpansion = (id: string) => {
 setExpandedRows((prev: unknown) => {
 const newSet = new Set(prev);
 if (newSet.has(id)) {
 newSet.delete(id);
 } else {
 newSet.add(id);
 }
 return newSet;
 });
 };

 const allSelected = performances.length > 0 && selectedPerformances.size === performances.length;
 const someSelected = selectedPerformances.size > 0 && selectedPerformances.size < performances.length;

 if (loading) {
 return (
 <Card className="p-lg">
 <div className="flex items-center justify-center py-xsxl">
 <div className="text-center">
 <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary mx-auto mb-4"></div>
 <p className="text-muted-foreground">Loading performances...</p>
 </div>
 </div>
 </Card>
 );
 }

 return (
 <Card>
 <Table>
 <thead>
 <tr>
 <th className="w-icon-2xl">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected}
 onChange={(checked) => onSelectAll(checked)}
 />
 </th>
 <th>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort("name")}
 className="h-auto p-0 font-medium"
 >
 Performance
 {getSortIcon("name")}
 </Button>
 </th>
 <th>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort("performance_type")}
 className="h-auto p-0 font-medium"
 >
 Type
 {getSortIcon("performance_type")}
 </Button>
 </th>
 <th>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort("status")}
 className="h-auto p-0 font-medium"
 >
 Status
 {getSortIcon("status")}
 </Button>
 </th>
 <th>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort("starts_at")}
 className="h-auto p-0 font-medium"
 >
 Start Time
 {getSortIcon("starts_at")}
 </Button>
 </th>
 <th>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort("duration_minutes")}
 className="h-auto p-0 font-medium"
 >
 Duration
 {getSortIcon("duration_minutes")}
 </Button>
 </th>
 <th>Venue</th>
 <th>Event</th>
 <th>Tickets</th>
 <th className="w-icon-2xl">Actions</th>
 </tr>
 </thead>
 <tbody>
 {performances.map((performance) => {
 const statusConfig = STATUS_BADGE[performance.status];
 const typeConfig = PERFORMANCE_TYPE_BADGE[performance.performance_type || 'other'];
 const isExpanded = expandedRows.has(performance.id);
 const isSelected = selectedPerformances.has(performance.id);

 return (
 <>
 <tr
 key={performance.id}
 className={`cursor-pointer hover:bg-muted/50 ${
 isSelected ? "bg-muted/30" : ""
 }`}
 onClick={() => toggleRowExpansion(performance.id)}
 >
 <td onClick={(e) => e.stopPropagation()}>
 <Checkbox
 checked={isSelected}
 onChange={(checked) => onSelectionChange(performance.id, checked)}
 />
 </td>
 <td>
 <div>
 <div className="font-medium">{performance.name}</div>
 {performance.description && (
 <div className="text-sm text-muted-foreground truncate max-w-xs">
 {performance.description}
 </div>
 )}
 </div>
 </td>
 <td>
 <Badge variant="secondary" className="text-xs">
 {typeConfig.icon} {typeConfig.label}
 </Badge>
 </td>
 <td>
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 </td>
 <td>
 <div className="flex items-center gap-xs text-sm">
 <Calendar className="h-3 w-3" />
 <div>
 <div>{formatDate(performance.starts_at)}</div>
 <div className="text-muted-foreground">{formatTime(performance.starts_at)}</div>
 </div>
 </div>
 </td>
 <td>
 <div className="flex items-center gap-xs text-sm">
 <Clock className="h-3 w-3" />
 {performance.duration_minutes ? `${performance.duration_minutes} min` : "—"}
 </div>
 </td>
 <td>
 {performance.venue && (
 <div className="flex items-center gap-xs text-sm">
 <MapPin className="h-3 w-3" />
 <span className="truncate max-w-xs">{performance.venue}</span>
 </div>
 )}
 </td>
 <td>
 {performance.event && (
 <div className="text-sm">
 <div className="font-medium truncate max-w-xs">{performance.event.title}</div>
 <div className="text-muted-foreground">
 {formatDate(performance.event.start_at)}
 </div>
 </div>
 )}
 </td>
 <td>
 {(performance.ticket_info.price_min || performance.ticket_info.price_max) && (
 <div className="flex items-center gap-xs text-sm">
 <DollarSign className="h-3 w-3" />
 <div>
 {performance.ticket_info.price_min && performance.ticket_info.price_max ? (
 <span>
 {formatCurrency(performance.ticket_info.price_min, performance.ticket_info.currency)} - {formatCurrency(performance.ticket_info.price_max, performance.ticket_info.currency)}
 </span>
 ) : (
 <span>
 {formatCurrency(performance.ticket_info.price_min || performance.ticket_info.price_max, performance.ticket_info.currency)}
 </span>
 )}
 {performance.ticket_info.sold_out && (
 <Badge variant="destructive" className="text-xs ml-1">
 Sold Out
 </Badge>
 )}
 </div>
 </div>
 )}
 </td>
 <td onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center gap-xs">
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
 </td>
 </tr>

 {/* Expanded row details */}
 {isExpanded && (
 <tr>
 <td colSpan={10}>
 <div className="p-md bg-muted/30 border-t">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {/* Venue Details */}
 {(performance.venue_capacity || performance.audience_info.expected_attendance) && (
 <div>
 <h4 className="font-medium text-sm mb-1">Venue & Audience</h4>
 {performance.venue_capacity && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Users className="h-3 w-3" />
 Capacity: {performance.venue_capacity.toLocaleString()}
 </div>
 )}
 {performance.audience_info.expected_attendance && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Users className="h-3 w-3" />
 Expected: {performance.audience_info.expected_attendance.toLocaleString()}
 </div>
 )}
 {performance.audience_info.target_demographic && (
 <div className="text-sm text-muted-foreground">
 Target: {performance.audience_info.target_demographic}
 </div>
 )}
 </div>
 )}

 {/* Technical Requirements */}
 {(performance.technical_requirements.sound_system || performance.technical_requirements.lighting) && (
 <div>
 <h4 className="font-medium text-sm mb-1">Technical</h4>
 {performance.technical_requirements.sound_system && (
 <div className="text-sm text-muted-foreground">
 Sound: {performance.technical_requirements.sound_system}
 </div>
 )}
 {performance.technical_requirements.lighting && (
 <div className="text-sm text-muted-foreground">
 Lighting: {performance.technical_requirements.lighting}
 </div>
 )}
 {performance.technical_requirements.equipment_needed?.length > 0 && (
 <div className="flex flex-wrap gap-xs mt-1">
 {performance.technical_requirements.equipment_needed.slice(0, 3).map((item, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {item}
 </Badge>
 ))}
 {performance.technical_requirements.equipment_needed.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{performance.technical_requirements.equipment_needed.length - 3} more
 </Badge>
 )}
 </div>
 )}
 </div>
 )}

 {/* Production Notes */}
 {(performance.production_notes.call_time || performance.production_notes.sound_check) && (
 <div>
 <h4 className="font-medium text-sm mb-1">Production</h4>
 {performance.production_notes.call_time && (
 <div className="text-sm text-muted-foreground">
 Call: {formatDateTime(performance.production_notes.call_time)}
 </div>
 )}
 {performance.production_notes.sound_check && (
 <div className="text-sm text-muted-foreground">
 Sound Check: {formatDateTime(performance.production_notes.sound_check)}
 </div>
 )}
 </div>
 )}

 {/* Project */}
 {performance.project && (
 <div>
 <h4 className="font-medium text-sm mb-1">Project</h4>
 <div className="text-sm">
 <div className="font-medium">{performance.project.name}</div>
 <Badge variant="outline" className="text-xs">
 {performance.project.status}
 </Badge>
 </div>
 </div>
 )}

 {/* Tags */}
 {performance.tags.length > 0 && (
 <div className="md:col-span-2 lg:col-span-3">
 <h4 className="font-medium text-sm mb-1">Tags</h4>
 <div className="flex flex-wrap gap-xs">
 {performance.tags.map((tag) => (
 <Badge key={tag} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 </div>
 )}

 {/* Created by */}
 <div className="md:col-span-2 lg:col-span-3 pt-2 border-t">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>Created by {getUserName(performance.created_by)}</span>
 <span>{new Date(performance.created_at).toLocaleString()}</span>
 </div>
 </div>
 </div>
 </div>
 </td>
 </tr>
 )}
 </>
 );
 })}
 </tbody>
 </Table>

 {performances.length === 0 && (
 <div className="p-lg text-center">
 <p className="text-muted-foreground">No performances found</p>
 </div>
 )}
 </Card>
 );
}
