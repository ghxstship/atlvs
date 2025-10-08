"use client";

import { Edit, Trash2, MapPin, Calendar, User, AlertTriangle } from 'lucide-react';
import { Card, Badge, Button, Checkbox } from "@ghxstship/ui";
import { format, parseISO } from "date-fns";
import type { Inspection } from "../InspectionsClient";
import type { LucideIcon } from "lucide-react";

interface InspectionGridViewProps {
 inspections: Inspection[];
 selectedInspections: Set<string>;
 onSelectInspection: (id: string) => void;
 onView: (inspection: Inspection) => void;
 onEdit: (inspection: Inspection) => void;
 onDelete: (inspection: Inspection) => void;
 onDuplicate: (inspection: Inspection) => void;
 onStatusChange: (inspection: Inspection, status: string) => void;
 getTypeIcon: (type: string) => LucideIcon;
 getStatusBadgeVariant: (status: string) => any;
 getTypeBadgeVariant: (type: string) => any;
 getScoreColor: (score: number) => string;
}

export default function InspectionGridView({
 inspections,
 selectedInspections,
 onSelectInspection,
 onView,
 onEdit,
 onDelete,
 onDuplicate,
 onStatusChange,
 getTypeIcon,
 getStatusBadgeVariant,
 getTypeBadgeVariant,
 getScoreColor
}: InspectionGridViewProps) {
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
 return XCircle;
 default:
 return Clock;
 }
 };

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {inspections.map((inspection) => {
 const TypeIcon = getTypeIcon(inspection.type);
 const StatusIcon = getStatusIcon(inspection.status);
 
 return (
 <Card
 key={inspection.id}
 className={`p-md cursor-pointer hover:shadow-lg transition-shadow ${
 selectedInspections.has(inspection.id) ? "ring-2 ring-primary" : ""
 }`}
 onClick={() => onView(inspection)}
 >
 <div className="flex items-start justify-between mb-sm">
 <Checkbox
 checked={selectedInspections.has(inspection.id)}
 onChange={() => onSelectInspection(inspection.id)}
 onClick={(e: React.MouseEvent) => e.stopPropagation()}
 />
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(inspection);
 }}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 </div>

 <div className="space-y-sm">
 {/* Type Icon and Title */}
 <div className="flex items-start gap-sm">
 <TypeIcon className="h-icon-sm w-icon-sm text-muted-foreground flex-shrink-0 mt-1" />
 <div className="flex-1">
 <h3 className="font-semibold line-clamp-xs">{inspection.title}</h3>
 </div>
 </div>

 {/* Badges */}
 <div className="flex items-center gap-xs flex-wrap">
 <Badge variant={getTypeBadgeVariant(inspection.type)}>
 {inspection.type}
 </Badge>
 <Badge variant={getStatusBadgeVariant(inspection.status)}>
 <StatusIcon className="mr-1 h-3 w-3" />
 {inspection.status.replace("_", " ")}
 </Badge>
 </div>

 {/* Score */}
 {inspection.score !== undefined && inspection.score !== null && (
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">Score:</span>
 <span className={`font-bold text-lg ${getScoreColor(inspection.score)}`}>
 {inspection.score}%
 </span>
 </div>
 )}

 {/* Pass/Fail Status */}
 {inspection.status === "completed" && (
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">Result:</span>
 <Badge variant={inspection.is_passed ? "success" : "destructive"}>
 {inspection.is_passed ? "PASSED" : "FAILED"}
 </Badge>
 </div>
 )}

 {/* Project */}
 {inspection.project && (
 <div className="text-sm text-muted-foreground truncate">
 Project: {inspection.project.name}
 </div>
 )}

 {/* Inspector */}
 {inspection.inspector && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <User className="h-3 w-3" />
 <span className="truncate">
 {inspection.inspector.full_name || inspection.inspector.email}
 </span>
 </div>
 )}

 {/* Location */}
 {inspection.location && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <MapPin className="h-3 w-3" />
 <span className="truncate">{inspection.location}</span>
 </div>
 )}

 {/* Date */}
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Calendar className="h-3 w-3" />
 <span>
 {inspection.status === "completed" && inspection.completed_date
 ? `Completed ${format(parseISO(inspection.completed_date), "MMM d")}`
 : `Scheduled ${format(parseISO(inspection.scheduled_date), "MMM d")}`}
 </span>
 </div>

 {/* Follow-up Required */}
 {inspection.follow_up_required && (
 <div className="flex items-center gap-xs text-sm text-warning">
 <AlertTriangle className="h-3 w-3" />
 <span>Follow-up required</span>
 </div>
 )}

 {/* Actions */}
 <div className="flex items-center gap-xs pt-sm border-t">
 <Button
 variant="outline"
 size="sm"
 className="flex-1"
 onClick={(e) => {
 e.stopPropagation();
 if (inspection.status === "scheduled") {
 onStatusChange(inspection, "in_progress");
 } else if (inspection.status === "in_progress") {
 onStatusChange(inspection, "completed");
 }
 }}
 >
 {inspection.status === "scheduled" && "Start"}
 {inspection.status === "in_progress" && "Complete"}
 {inspection.status === "completed" && "View"}
 {inspection.status === "failed" && "Retry"}
 {inspection.status === "cancelled" && "Reschedule"}
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(inspection);
 }}
 >
 <Trash2 className="h-icon-xs w-icon-xs text-destructive" />
 </Button>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 );
}
