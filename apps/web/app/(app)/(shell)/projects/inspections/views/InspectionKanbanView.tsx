"use client";

import { useMemo } from "react";
import { Card, Badge, Button, Checkbox } from "@ghxstship/ui";
import { format, parseISO } from "date-fns";
import type { Inspection } from "../InspectionsClient";
import type { LucideIcon } from "lucide-react";

interface InspectionKanbanViewProps {
 inspections: Inspection[];
 selectedInspections: Set<string>;
 onSelectInspection: (id: string) => void;
 onView: (inspection: Inspection) => void;
 onEdit: (inspection: Inspection) => void;
 onDelete: (inspection: Inspection) => void;
 onStatusChange: (inspection: Inspection, status: string) => void;
 getTypeIcon: (type: string) => LucideIcon;
 getTypeBadgeVariant: (type: string) => any;
 getScoreColor: (score: number) => string;
}

export default function InspectionKanbanView({
 inspections,
 selectedInspections,
 onSelectInspection,
 onView,
 onEdit,
 onDelete,
 onStatusChange,
 getTypeIcon,
 getTypeBadgeVariant,
 getScoreColor,
}: InspectionKanbanViewProps) {
 // Group inspections by status
 const groupedInspections = useMemo(() => {
 const groups: Record<string, Inspection[]> = {
 scheduled: [],
 in_progress: [],
 completed: [],
 failed: [],
 cancelled: [],
 };

 inspections.forEach((inspection) => {
 if (groups[inspection.status]) {
 groups[inspection.status].push(inspection);
 }
 });

 return groups;
 }, [inspections]);

 const getStatusIcon = (status: string) => {
 switch (status) {
 case "scheduled":
 return Clock;
 case "in_progress":
 return Play;
 case "completed":
 return CheckCircle;
 case "failed":
 return XCircle;
 case "cancelled":
 return AlertCircle;
 default:
 return Clock;
 }
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case "scheduled":
 return "bg-gray-100";
 case "in_progress":
 return "bg-yellow-100";
 case "completed":
 return "bg-green-100";
 case "failed":
 return "bg-red-100";
 case "cancelled":
 return "bg-gray-100";
 default:
 return "bg-gray-100";
 }
 };

 return (
 <div className="flex gap-md overflow-x-auto pb-md">
 {Object.entries(groupedInspections).map(([status, items]) => {
 const StatusIcon = getStatusIcon(status);
 return (
 <div key={status} className="flex-shrink-0 w-container-md">
 <div className={`${getStatusColor(status)} rounded-lg p-sm mb-sm`}>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <StatusIcon className="h-icon-xs w-icon-xs" />
 <h3 className="font-semibold capitalize">{status.replace("_", " ")}</h3>
 </div>
 <Badge variant="secondary">{items.length}</Badge>
 </div>
 </div>

 <div className="space-y-sm max-h-screen-minus-xl overflow-y-auto">
 {items.map((inspection) => {
 const TypeIcon = getTypeIcon(inspection.type);
 return (
 <Card
 key={inspection.id}
 className={`p-sm cursor-pointer hover:shadow-md transition-shadow ${
 selectedInspections.has(inspection.id) ? "ring-2 ring-primary" : ""
 }`}
 onClick={() => onView(inspection)}
 >
 <div className="flex items-start justify-between mb-xs">
 <Checkbox
 checked={selectedInspections.has(inspection.id)}
 onChange={() => onSelectInspection(inspection.id)}
 onClick={(e: React.MouseEvent) => e.stopPropagation()}
 />
 <div className="flex items-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(inspection);
 }}
 >
 <Edit className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(inspection);
 }}
 >
 <Trash2 className="h-3 w-3 text-destructive" />
 </Button>
 </div>
 </div>

 <div className="flex items-start gap-xs mb-xs">
 <TypeIcon className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0 mt-0.5" />
 <h4 className="font-medium text-sm line-clamp-xs">{inspection.title}</h4>
 </div>
 
 <Badge 
 variant={getTypeBadgeVariant(inspection.type)}
 className="mb-xs"
 >
 {inspection.type}
 </Badge>

 {inspection.score !== undefined && inspection.score !== null && (
 <div className="flex items-center justify-between mb-xs">
 <span className="text-xs text-muted-foreground">Score:</span>
 <span className={`font-bold text-sm ${getScoreColor(inspection.score)}`}>
 {inspection.score}%
 </span>
 </div>
 )}

 {inspection.status === "completed" && (
 <Badge 
 variant={inspection.is_passed ? "success" : "destructive"}
 className="mb-xs w-full justify-center"
 >
 {inspection.is_passed ? "PASSED" : "FAILED"}
 </Badge>
 )}

 {inspection.project && (
 <div className="text-xs text-muted-foreground mb-xs truncate">
 {inspection.project.name}
 </div>
 )}

 {inspection.inspector && (
 <div className="flex items-center gap-xs text-xs text-muted-foreground mb-xs">
 <User className="h-3 w-3" />
 <span className="truncate">
 {inspection.inspector.full_name || inspection.inspector.email}
 </span>
 </div>
 )}

 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <Calendar className="h-3 w-3" />
 <span>
 {inspection.status === "completed" && inspection.completed_date
 ? format(parseISO(inspection.completed_date), "MMM d")
 : format(parseISO(inspection.scheduled_date), "MMM d")}
 </span>
 </div>

 {inspection.follow_up_required && (
 <div className="mt-xs pt-xs border-t">
 <Badge variant="warning" className="text-xs">
 Follow-up required
 </Badge>
 </div>
 )}

 {/* Quick Actions */}
 <div className="mt-sm pt-sm border-t">
 {status === "scheduled" && (
 <Button
 variant="outline"
 size="sm"
 className="w-full"
 onClick={(e) => {
 e.stopPropagation();
 onStatusChange(inspection, "in_progress");
 }}
 >
 Start Inspection
 </Button>
 )}
 {status === "in_progress" && (
 <Button
 variant="outline"
 size="sm"
 className="w-full"
 onClick={(e) => {
 e.stopPropagation();
 onStatusChange(inspection, "completed");
 }}
 >
 Complete Inspection
 </Button>
 )}
 {status === "failed" && (
 <Button
 variant="outline"
 size="sm"
 className="w-full"
 onClick={(e) => {
 e.stopPropagation();
 onStatusChange(inspection, "scheduled");
 }}
 >
 Reschedule
 </Button>
 )}
 </div>
 </Card>
 );
 })}
 
 {items.length === 0 && (
 <div className="text-center py-lg text-muted-foreground text-sm">
 No inspections
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 );
}
