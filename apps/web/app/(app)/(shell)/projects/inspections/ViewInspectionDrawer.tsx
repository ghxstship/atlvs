"use client";

import { Eye, Edit, Download, FileText, Calendar, User, MapPin, Shield, Award, ClipboardCheck, TrendingUp, FileCheck, CheckCircle, XCircle, AlertTriangle, Clock, Activity, MessageSquare } from "lucide-react";
import {
 Button,
 Badge,
 Tabs,
 TabsList,
 TabsTrigger,
 TabsContent,
 Progress,
} from "@ghxstship/ui";
import { AppDrawer } from "@ghxstship/ui";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import type { Inspection } from "./InspectionsClient";
import type { LucideIcon } from "lucide-react";

interface ViewInspectionDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 inspection: Inspection;
 onEdit?: () => void;
 getTypeIcon: (type: string) => LucideIcon;
 getStatusBadgeVariant: (status: string) => any;
 getTypeBadgeVariant: (type: string) => any;
 getScoreColor: (score: number) => string;
}

export default function ViewInspectionDrawer({
 open,
 onOpenChange,
 inspection,
 onEdit,
 getTypeIcon,
 getStatusBadgeVariant,
 getTypeBadgeVariant,
 getScoreColor,
}: ViewInspectionDrawerProps) {
 const TypeIcon = getTypeIcon(inspection.type);

 const getStatusIcon = (status: string) => {
 switch (status) {
 case "scheduled":
 return Clock;
 case "in_progress":
 return Activity;
 case "completed":
 return CheckCircle;
 case "failed":
 return XCircle;
 case "cancelled":
 return AlertTriangle;
 default:
 return Clock;
 }
 };

 const StatusIcon = getStatusIcon(inspection.status);

 // Custom tabs for inspection details
 const tabs = [
 {
 key: "overview",
 label: "Overview",
 content: (
 <div className="space-y-md">
 {/* Status and Score */}
 <div className="grid grid-cols-2 gap-md">
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <StatusIcon className="h-4 w-4" />
 <span>Status</span>
 </div>
 <Badge variant={getStatusBadgeVariant(inspection.status)}>
 {inspection.status.replace("_", " ")}
 </Badge>
 </div>

 {inspection.score !== undefined && inspection.score !== null && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Award className="h-4 w-4" />
 <span>Score</span>
 </div>
 <div className={`text-2xl font-bold ${getScoreColor(inspection.score)}`}>
 {inspection.score}%
 </div>
 <Progress value={inspection.score} className="h-2" />
 </div>
 )}
 </div>

 {/* Pass/Fail Status */}
 {inspection.status === "completed" && (
 <div className="p-md bg-muted rounded-lg">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium">Result:</span>
 <Badge 
 variant={inspection.is_passed ? "success" : "destructive"}
 className="text-lg px-md py-xs"
 >
 {inspection.is_passed ? "✓ PASSED" : "✗ FAILED"}
 </Badge>
 </div>
 </div>
 )}

 {/* Type and Project */}
 <div className="grid grid-cols-2 gap-md">
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <TypeIcon className="h-4 w-4" />
 <span>Type</span>
 </div>
 <Badge variant={getTypeBadgeVariant(inspection.type)}>
 {inspection.type}
 </Badge>
 </div>

 {inspection.project && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <FileText className="h-4 w-4" />
 <span>Project</span>
 </div>
 <p className="font-medium">{inspection.project.name}</p>
 </div>
 )}
 </div>

 {/* Inspector and Location */}
 <div className="grid grid-cols-2 gap-md">
 {inspection.inspector && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <User className="h-4 w-4" />
 <span>Inspector</span>
 </div>
 <p className="font-medium">
 {inspection.inspector.full_name || inspection.inspector.email}
 </p>
 </div>
 )}

 {inspection.location && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <MapPin className="h-4 w-4" />
 <span>Location</span>
 </div>
 <p className="font-medium">{inspection.location}</p>
 </div>
 )}
 </div>

 {/* Description */}
 {inspection.description && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <FileText className="h-4 w-4" />
 <span>Description</span>
 </div>
 <p className="text-sm">{inspection.description}</p>
 </div>
 )}

 {/* Follow-up Required */}
 {inspection.follow_up_required && (
 <div className="p-sm bg-warning/10 border border-warning rounded-lg">
 <div className="flex items-center gap-sm">
 <AlertTriangle className="h-4 w-4 text-warning" />
 <div>
 <p className="font-medium text-sm">Follow-up Required</p>
 {inspection.follow_up_date && (
 <p className="text-xs text-muted-foreground">
 Due: {format(parseISO(inspection.follow_up_date), "MMM d, yyyy")}
 </p>
 )}
 </div>
 </div>
 </div>
 )}
 </div>
 ),
 },
 {
 key: "schedule",
 label: "Schedule",
 content: (
 <div className="space-y-md">
 {/* Timeline */}
 <div className="space-y-sm">
 <h4 className="font-semibold">Inspection Timeline</h4>
 <div className="relative">
 <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
 <div className="space-y-md">
 {/* Created */}
 <div className="flex items-center gap-md">
 <div className="w-8 h-8 rounded-full bg-background border-2 border-muted flex items-center justify-center">
 <Clock className="h-4 w-4" />
 </div>
 <div>
 <p className="font-medium">Created</p>
 <p className="text-sm text-muted-foreground">
 {format(parseISO(inspection.created_at), "MMM d, yyyy 'at' h:mm a")}
 </p>
 </div>
 </div>

 {/* Scheduled */}
 <div className="flex items-center gap-md">
 <div className="w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center">
 <Calendar className="h-4 w-4" />
 </div>
 <div>
 <p className="font-medium">Scheduled</p>
 <p className="text-sm text-muted-foreground">
 {format(parseISO(inspection.scheduled_date), "MMM d, yyyy 'at' h:mm a")}
 </p>
 </div>
 </div>

 {/* Completed */}
 {inspection.completed_date && (
 <div className="flex items-center gap-md">
 <div className="w-8 h-8 rounded-full bg-background border-2 border-success flex items-center justify-center">
 <CheckCircle className="h-4 w-4" />
 </div>
 <div>
 <p className="font-medium">Completed</p>
 <p className="text-sm text-muted-foreground">
 {format(parseISO(inspection.completed_date), "MMM d, yyyy 'at' h:mm a")}
 </p>
 </div>
 </div>
 )}

 {/* Follow-up */}
 {inspection.follow_up_required && inspection.follow_up_date && (
 <div className="flex items-center gap-md">
 <div className="w-8 h-8 rounded-full bg-background border-2 border-warning flex items-center justify-center">
 <AlertTriangle className="h-4 w-4" />
 </div>
 <div>
 <p className="font-medium">Follow-up Due</p>
 <p className="text-sm text-muted-foreground">
 {format(parseISO(inspection.follow_up_date), "MMM d, yyyy")}
 </p>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Duration */}
 {inspection.status === "completed" && inspection.completed_date && (
 <div className="p-sm bg-muted rounded-lg">
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">Inspection Duration:</span>
 <span className="font-medium">
 {formatDistanceToNow(parseISO(inspection.scheduled_date), { addSuffix: false })}
 </span>
 </div>
 </div>
 )}
 </div>
 ),
 },
 {
 key: "findings",
 label: "Findings",
 content: (
 <div className="space-y-md">
 {/* Findings */}
 {inspection.findings ? (
 <div className="space-y-sm">
 <h4 className="font-semibold">Inspection Findings</h4>
 <div className="p-md bg-muted rounded-lg">
 <p className="text-sm whitespace-pre-wrap">{inspection.findings}</p>
 </div>
 </div>
 ) : (
 <div className="text-center py-lg text-muted-foreground">
 <FileText className="mx-auto h-12 w-12 mb-sm opacity-50" />
 <p>No findings documented yet</p>
 </div>
 )}

 {/* Recommendations */}
 {inspection.recommendations && (
 <div className="space-y-sm">
 <h4 className="font-semibold">Recommendations</h4>
 <div className="p-md bg-info/10 border border-info rounded-lg">
 <p className="text-sm whitespace-pre-wrap">{inspection.recommendations}</p>
 </div>
 </div>
 )}
 </div>
 ),
 },
 {
 key: "checklist",
 label: "Checklist",
 content: (
 <div className="space-y-md">
 {inspection.checklist_items && inspection.checklist_items.length > 0 ? (
 <div className="space-y-sm">
 {/* Group checklist items by category */}
 {Object.entries(
 inspection.checklist_items.reduce((acc, item) => {
 if (!acc[item.category]) acc[item.category] = [];
 acc[item.category].push(item);
 return acc;
 }, {} as Record<string, typeof inspection.checklist_items>)
 ).map(([category, items]) => (
 <div key={category} className="space-y-xs">
 <h4 className="font-semibold">{category}</h4>
 <div className="space-y-xs">
 {items.map((item) => (
 <div
 key={item.id}
 className="flex items-start gap-sm p-sm bg-muted/50 rounded-lg"
 >
 <div className="mt-0.5">
 {item.status === "pass" && (
 <CheckCircle className="h-4 w-4 text-success" />
 )}
 {item.status === "fail" && (
 <XCircle className="h-4 w-4 text-destructive" />
 )}
 {item.status === "na" && (
 <AlertTriangle className="h-4 w-4 text-muted-foreground" />
 )}
 {item.status === "pending" && (
 <Clock className="h-4 w-4 text-warning" />
 )}
 </div>
 <div className="flex-1">
 <p className="text-sm font-medium">{item.item}</p>
 {item.notes && (
 <p className="text-xs text-muted-foreground mt-xs">
 {item.notes}
 </p>
 )}
 </div>
 <Badge
 variant={
 item.status === "pass"
 ? "success"
 : item.status === "fail"
 ? "destructive"
 : item.status === "na"
 ? "secondary"
 : "warning"
 }
 >
 {item.status.toUpperCase()}
 </Badge>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-lg text-muted-foreground">
 <ClipboardCheck className="mx-auto h-12 w-12 mb-sm opacity-50" />
 <p>No checklist items for this inspection</p>
 </div>
 )}
 </div>
 ),
 },
 {
 key: "activity",
 label: "Activity",
 content: (
 <div className="text-center py-lg text-muted-foreground">
 <MessageSquare className="mx-auto h-12 w-12 mb-sm opacity-50" />
 <p>Activity tracking coming soon</p>
 </div>
 ),
 },
 ];

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title={inspection.title}
 mode="view"
 tabs={tabs}
 actions={[
 {
 key: "edit",
 label: "Edit",
 icon: <Edit className="h-4 w-4" />,
 onClick: onEdit,
 },
 {
 key: "download",
 label: "Download Report",
 icon: <Download className="h-4 w-4" />,
 onClick: () => {
 // Generate and download inspection report
 },
 },
 ]}
 />
 );
}
