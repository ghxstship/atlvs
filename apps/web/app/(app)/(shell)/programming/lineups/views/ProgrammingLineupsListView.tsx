"use client";

import { Edit, Eye, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Clock, MapPin, DollarSign, Phone, Mail, User } from "lucide-react";
import { Fragment, useState } from "react";
import {
 Badge,
 Button,
 Card,
 Checkbox,
} from "@ghxstship/ui";
import type { ProgrammingLineup, LineupSort, LineupProject, LineupEvent } from "../types";
import { STATUS_BADGE, PERFORMER_TYPE_BADGE } from "../types";

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

interface ProgrammingLineupsListViewProps {
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
}

export default function ProgrammingLineupsListView({
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
}: ProgrammingLineupsListViewProps) {
 const [expandedRows, setExpandedRows] = useState<Set<string>(new Set());

 const handleSort = (field: keyof ProgrammingLineup) => {
 if (sortConfig.field === field) {
 onSort({
 field,
 direction: sortConfig.direction === "asc" ? "desc" : "asc",
 });
 } else {
 onSort({ field, direction: "asc" });
 }
 };
 const getSortIcon = (field: keyof ProgrammingLineup) => {
 if (sortConfig.field !== field) {
 return <ArrowUpDown className="h-icon-xs w-icon-xs" />;
 }
 return sortConfig.direction === "asc" ? (
 <ArrowUp className="h-icon-xs w-icon-xs" />
 ) : (
 <ArrowDown className="h-icon-xs w-icon-xs" />
 );
 };

 const formatTime = (timeString?: string | null) => {
 if (!timeString) return "—";
 return new Date(timeString).toLocaleTimeString("en-US", {
 hour: "2-digit",
 minute: "2-digit",
 });
 };

 const formatDate = (dateString?: string | null) => {
 if (!dateString) return "—";
 return new Date(dateString).toLocaleDateString();
 };

 const formatCurrency = (amount?: number | null, currency?: string | null) => {
 if (amount == null || !currency) return "—";
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

 const allSelected = lineups.length > 0 && selectedLineups.size === lineups.length;
 const someSelected = selectedLineups.size > 0 && selectedLineups.size < lineups.length;

 if (loading) {
 return (
 <Card className="p-lg">
 <div className="flex items-center justify-center py-xsxl">
 <div className="text-center">
 <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary mx-auto mb-4"></div>
 <p className="text-muted-foreground">Loading lineups...</p>
 </div>
 </div>
 </Card>
 );
 }

 return (
 <Card>
 <div className="relative overflow-x-auto">
 <table className="w-full border-collapse text-sm">
 <thead className="bg-muted/50">
 <tr>
 <th className="w-icon-2xl px-md py-sm text-left">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected}
 onChange={(event) => onSelectAll(event.target.checked)}
 />
 </th>
 <th className="px-md py-sm">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort("performer_name")}
 className="h-auto p-0 font-medium"
 >
 Performer
 {getSortIcon("performer_name")}
 </Button>
 </th>
 <th className="px-md py-sm">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort("performer_type")}
 className="h-auto p-0 font-medium"
 >
 Type
 {getSortIcon("performer_type")}
 </Button>
 </th>
 <th className="px-md py-sm">
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
 <th className="px-md py-sm">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort("set_time")}
 className="h-auto p-0 font-medium"
 >
 Set Time
 {getSortIcon("set_time")}
 </Button>
 </th>
 <th className="px-md py-sm">
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
 <th className="px-md py-sm text-left">Stage</th>
 <th className="px-md py-sm text-left">Event</th>
 <th className="px-md py-sm text-left">Fee</th>
 <th className="w-icon-2xl px-md py-sm text-left">Actions</th>
 </tr>
 </thead>
 <tbody>
 {lineups.map((lineup) => {
 const statusConfig = STATUS_BADGE[lineup.status];
 const typeConfig = PERFORMER_TYPE_BADGE[lineup.performer_type || 'other'];
 const isExpanded = expandedRows.has(lineup.id);
 const isSelected = selectedLineups.has(lineup.id);

 return (
 <Fragment key={lineup.id}>
 <tr
 className={`cursor-pointer hover:bg-muted/50 ${
 isSelected ? "bg-muted/30" : ""
 }`}
 onClick={() => toggleRowExpansion(lineup.id)}
 >
 <td onClick={(e) => e.stopPropagation()}>
 <Checkbox
 checked={isSelected}
 onChange={(event) => onSelectionChange(lineup.id, event.target.checked)}
 />
 </td>
 <td>
 <div>
 <div className="font-medium">{lineup.performer_name}</div>
 {lineup.role && (
 <div className="text-sm text-muted-foreground">{lineup.role}</div>
 )}
 </div>
 </td>
 <td className="px-md py-sm">
 <Badge variant="secondary" className="text-xs">
 {typeConfig.icon} {typeConfig.label}
 </Badge>
 </td>
 <td className="px-md py-sm">
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 </td>
 <td className="px-md py-sm">
 <div className="flex items-center gap-xs text-sm">
 <Clock className="h-3 w-3" />
 {formatTime(lineup.set_time)}
 </div>
 </td>
 <td className="px-md py-sm">
 <div className="text-sm">
 {lineup.duration_minutes ? `${lineup.duration_minutes} min` : "—"}
 </div>
 </td>
 <td className="px-md py-sm">
 {lineup.stage && (
 <div className="flex items-center gap-xs text-sm">
 <MapPin className="h-3 w-3" />
 <span className="truncate max-w-xs">{lineup.stage}</span>
 </div>
 )}
 </td>
 <td className="px-md py-sm">
 {lineup.event && (
 <div className="text-sm">
 <div className="font-medium truncate max-w-xs">{lineup.event.title}</div>
 <div className="text-muted-foreground">
 {formatDate(lineup.event.start_at)}
 </div>
 </div>
 )}
 </td>
 <td className="px-md py-sm">
 {lineup.contract_details.fee != null && lineup.contract_details.currency && (
 <div className="flex items-center gap-xs text-sm">
 <DollarSign className="h-3 w-3" />
 {formatCurrency(lineup.contract_details.fee, lineup.contract_details.currency)}
 </div>
 )}
 </td>
 <td className="px-md py-sm" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(lineup)}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(lineup)}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(lineup)}
 >
 <Trash2 className="h-icon-xs w-icon-xs text-destructive" />
 </Button>
 </div>
 </td>
 </tr>

 {/* Expanded row details */}
 {isExpanded && (
 <tr className="border-b last:border-0">
 <td colSpan={10} className="px-md py-md bg-muted/30">
 <div className="space-y-md">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {/* Contact Information */}
 {(lineup.contact_info.email || lineup.contact_info.phone) && (
 <div>
 <h4 className="font-medium text-sm mb-1">Contact</h4>
 {lineup.contact_info.email && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Mail className="h-3 w-3" />
 {lineup.contact_info.email}
 </div>
 )}
 {lineup.contact_info.phone && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Phone className="h-3 w-3" />
 {lineup.contact_info.phone}
 </div>
 )}
 {lineup.contact_info.agent && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <User className="h-3 w-3" />
 Agent: {lineup.contact_info.agent}
 </div>
 )}
 </div>
 )}

 {/* Technical Requirements */}
 {lineup.technical_requirements?.equipment && lineup.technical_requirements.equipment.length > 0 && (
 <div>
 <h4 className="font-medium text-sm mb-1">Equipment</h4>
 <div className="flex flex-wrap gap-xs">
 {lineup.technical_requirements.equipment.slice(0, 3).map((item, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {item}
 </Badge>
 ))}
 {lineup.technical_requirements.equipment.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{lineup.technical_requirements.equipment.length - 3} more
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Contract Details */}
 {lineup.contract_details.payment_terms && (
 <div>
 <h4 className="font-medium text-sm mb-1">Payment Terms</h4>
 <p className="text-sm text-muted-foreground">
 {lineup.contract_details.payment_terms}
 </p>
 {lineup.contract_details.contract_signed && (
 <Badge variant="success" className="text-xs mt-1">
 Contract Signed
 </Badge>
 )}
 </div>
 )}

 {/* Project */}
 {lineup.project && (
 <div>
 <h4 className="font-medium text-sm mb-1">Project</h4>
 <div className="text-sm">
 <div className="font-medium">{lineup.project.name}</div>
 <Badge variant="outline" className="text-xs">
 {lineup.project.status}
 </Badge>
 </div>
 </div>
 )}

 {/* Tags */}
 {lineup.tags.length > 0 && (
 <div className="md:col-span-2 lg:col-span-3">
 <h4 className="font-medium text-sm mb-1">Tags</h4>
 <div className="flex flex-wrap gap-xs">
 {lineup.tags.map((tag) => (
 <Badge key={tag} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 </div>
 )}

 {/* Notes */}
 {lineup.notes && (
 <div className="md:col-span-2 lg:col-span-3">
 <h4 className="font-medium text-sm mb-1">Notes</h4>
 <p className="text-sm text-muted-foreground">{lineup.notes}</p>
 </div>
 )}

 {/* Created by */}
 <div className="md:col-span-2 lg:col-span-3 pt-2 border-t">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>Created by {getUserName(lineup.created_by)}</span>
 <span>{new Date(lineup.created_at).toLocaleString()}</span>
 </div>
 </div>
 </div>
 </div>
 </td>
 </tr>
 )}
 </Fragment>
 );
 })}
 </tbody>
 </table>
 </div>

 {lineups.length === 0 && (
 <div className="p-lg text-center">
 <p className="text-muted-foreground">No lineups found</p>
 </div>
 )}
 </Card>
 );
}
