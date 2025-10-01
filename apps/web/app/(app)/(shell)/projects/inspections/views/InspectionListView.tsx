"use client";

import { Badge, Button, Checkbox } from "@ghxstship/ui";
import { format, parseISO } from "date-fns";
import type { Inspection } from "../InspectionsClient";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, CheckCircle, Copy, Edit, Eye, Play, Trash2 } from 'lucide-react';

interface InspectionListViewProps {
 inspections: Inspection[];
 selectedInspections: Set<string>;
 fieldVisibility: Array<{ id: string; label: string; visible: boolean; sortable: boolean }>;
 sortField: string;
 sortDirection: "asc" | "desc";
 onSelectAll: () => void;
 onSelectInspection: (id: string) => void;
 onSort: (field: string) => void;
 onView: (inspection: Inspection) => void;
 onEdit: (inspection: Inspection) => void;
 onDelete: (inspection: Inspection) => void;
 onDuplicate: (inspection: Inspection) => void;
 onStatusChange: (inspection: Inspection, status: string) => void;
 getTypeBadgeVariant: (type: string) => any;
 getStatusBadgeVariant: (status: string) => any;
 getScoreColor: (score: number) => string;
}

export default function InspectionListView({
 inspections,
 selectedInspections,
 fieldVisibility,
 sortField,
 sortDirection,
 onSelectAll,
 onSelectInspection,
 onSort,
 onView,
 onEdit,
 onDelete,
 onDuplicate,
 onStatusChange,
 getTypeBadgeVariant,
 getStatusBadgeVariant,
 getScoreColor,
}: InspectionListViewProps) {
 const visibleFields = fieldVisibility.filter((f) => f.visible);

 const renderFieldValue = (inspection: Inspection, fieldId: string) => {
 switch (fieldId) {
 case "title":
 return <span className="font-medium">{inspection.title}</span>;
 case "type":
 return (
 <Badge variant={getTypeBadgeVariant(inspection.type)}>
 {inspection.type}
 </Badge>
 );
 case "status":
 return (
 <Badge variant={getStatusBadgeVariant(inspection.status)}>
 {inspection.status.replace("_", " ")}
 </Badge>
 );
 case "project":
 return inspection.project?.name || "-";
 case "scheduled_date":
 return format(parseISO(inspection.scheduled_date), "MMM d, yyyy");
 case "completed_date":
 return inspection.completed_date
 ? format(parseISO(inspection.completed_date), "MMM d, yyyy")
 : "-";
 case "inspector":
 return inspection.inspector?.full_name || inspection.inspector?.email || "-";
 case "location":
 return inspection.location || "-";
 case "score":
 return inspection.score !== undefined && inspection.score !== null ? (
 <span className={`font-bold ${getScoreColor(inspection.score)}`}>
 {inspection.score}%
 </span>
 ) : (
 "-"
 );
 case "is_passed":
 return inspection.status === "completed" ? (
 <Badge variant={inspection.is_passed ? "success" : "destructive"}>
 {inspection.is_passed ? "PASSED" : "FAILED"}
 </Badge>
 ) : (
 "-"
 );
 case "follow_up_required":
 return inspection.follow_up_required ? (
 <Badge variant="warning">Required</Badge>
 ) : (
 <Badge variant="secondary">Not Required</Badge>
 );
 case "created_at":
 return format(parseISO(inspection.created_at), "MMM d, yyyy");
 case "updated_at":
 return format(parseISO(inspection.updated_at), "MMM d, yyyy");
 default:
 return "-";
 }
 };

 return (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b">
 <th className="text-left p-sm">
 <Checkbox
 checked={selectedInspections.size === inspections.length && inspections.length > 0}
 onChange={onSelectAll}
 />
 </th>
 {visibleFields.map((field) => (
 <th
 key={field.id}
 className={`text-left p-sm ${
 field.sortable ? "cursor-pointer hover:bg-muted/50" : ""
 }`}
 onClick={() => field.sortable && onSort(field.id)}
 >
 <div className="flex items-center gap-xs">
 {field.label}
 {field.sortable && (
 <>
 {sortField === field.id ? (
 sortDirection === "asc" ? (
 <ArrowUp className="h-3 w-3" />
 ) : (
 <ArrowDown className="h-3 w-3" />
 )
 ) : (
 <ArrowUpDown className="h-3 w-3 opacity-30" />
 )}
 </>
 )}
 </div>
 </th>
 ))}
 <th className="text-left p-sm">Actions</th>
 </tr>
 </thead>
 <tbody>
 {inspections.map((inspection) => (
 <tr
 key={inspection.id}
 className={`border-b hover:bg-muted/50 cursor-pointer ${
 selectedInspections.has(inspection.id) ? "bg-primary/5" : ""
 }`}
 onClick={() => onView(inspection)}
 >
 <td className="p-sm" onClick={(e) => e.stopPropagation()}>
 <Checkbox
 checked={selectedInspections.has(inspection.id)}
 onChange={() => onSelectInspection(inspection.id)}
 />
 </td>
 {visibleFields.map((field) => (
 <td key={field.id} className="p-sm">
 {renderFieldValue(inspection, field.id)}
 </td>
 ))}
 <td className="p-sm" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center gap-xs">
 {inspection.status === "scheduled" && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onStatusChange(inspection, "in_progress")}
 title="Start Inspection"
 >
 <Play className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 {inspection.status === "in_progress" && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onStatusChange(inspection, "completed")}
 title="Complete Inspection"
 >
 <CheckCircle className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(inspection)}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(inspection)}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDuplicate(inspection)}
 >
 <Copy className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(inspection)}
 className="text-destructive"
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 
 {inspections.length === 0 && (
 <div className="text-center py-xl text-muted-foreground">
 No inspections to display
 </div>
 )}
 </div>
 );
}
