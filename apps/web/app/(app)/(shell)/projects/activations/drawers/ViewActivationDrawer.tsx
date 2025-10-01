"use client";

import { Eye, Edit, Calendar, DollarSign, MapPin, Building, Users, AlertTriangle, Link, FileText, Activity, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";
import {
 Drawer,
 DrawerContent,
 DrawerHeader,
 DrawerTitle,
 DrawerDescription,
 DrawerFooter,
 Button,
 Badge,
 Tabs,
 TabsList,
 TabsTrigger,
 TabsContent,
} from "@ghxstship/ui";
import { format, parseISO } from "date-fns";
import type { Activation } from "./ActivationsClient";

interface ViewActivationDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 activation: Activation;
 onEdit?: () => void;
}

export default function ViewActivationDrawer({
 open,
 onOpenChange,
 activation,
 onEdit,
}: ViewActivationDrawerProps) {
 const getStatusBadgeVariant = (status: string) => {
 switch (status) {
 case "planning":
 return "secondary";
 case "ready":
 return "warning";
 case "active":
 return "info";
 case "completed":
 return "success";
 case "cancelled":
 return "destructive";
 default:
 return "secondary";
 }
 };

 const getTypeBadgeVariant = (type: string) => {
 switch (type) {
 case "full_launch":
 return "default";
 case "soft_launch":
 return "secondary";
 case "beta":
 return "warning";
 case "pilot":
 return "info";
 case "rollout":
 return "success";
 default:
 return "secondary";
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case "planning":
 return Clock;
 case "ready":
 return AlertTriangle;
 case "active":
 return Activity;
 case "completed":
 return CheckCircle;
 case "cancelled":
 return XCircle;
 default:
 return Clock;
 }
 };

 const StatusIcon = getStatusIcon(activation.status);

 return (
 <Drawer open={open} onClose={() => onOpenChange(false)}>
 <DrawerContent className="max-w-3xl mx-auto">
 <DrawerHeader>
 <div className="flex items-start justify-between">
 <div>
 <DrawerTitle className="flex items-center gap-sm text-xl">
 <Eye className="h-icon-sm w-icon-sm" />
 {activation.name}
 </DrawerTitle>
 <DrawerDescription className="mt-sm">
 {activation.description || "No description provided"}
 </DrawerDescription>
 </div>
 <div className="flex items-center gap-sm">
 <Badge variant={getStatusBadgeVariant(activation.status)}>
 <StatusIcon className="mr-1 h-3 w-3" />
 {activation.status}
 </Badge>
 <Badge variant={getTypeBadgeVariant(activation.activation_type)}>
 {activation.activation_type.replace("_", " ")}
 </Badge>
 </div>
 </div>
 </DrawerHeader>

 <div className="p-lg">
 <Tabs defaultValue="overview" className="w-full">
 <TabsList className="grid w-full grid-cols-5">
 <TabsTrigger value="overview">Overview</TabsTrigger>
 <TabsTrigger value="schedule">Schedule</TabsTrigger>
 <TabsTrigger value="resources">Resources</TabsTrigger>
 <TabsTrigger value="risks">Risks</TabsTrigger>
 <TabsTrigger value="activity">Activity</TabsTrigger>
 </TabsList>

 <TabsContent value="overview" className="space-y-md mt-md">
 <div className="grid grid-cols-2 gap-md">
 {/* Project */}
 {activation.project && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Building className="h-icon-xs w-icon-xs" />
 <span>Project</span>
 </div>
 <p className="font-medium">{activation.project.name}</p>
 </div>
 )}

 {/* Location */}
 {activation.location && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <MapPin className="h-icon-xs w-icon-xs" />
 <span>Location</span>
 </div>
 <p className="font-medium">{activation.location}</p>
 </div>
 )}

 {/* Budget */}
 {activation.budget && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <DollarSign className="h-icon-xs w-icon-xs" />
 <span>Budget</span>
 </div>
 <p className="font-medium">${activation.budget.toLocaleString()}</p>
 </div>
 )}

 {/* Actual Cost */}
 {activation.actual_cost && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <DollarSign className="h-icon-xs w-icon-xs" />
 <span>Actual Cost</span>
 </div>
 <p className="font-medium">${activation.actual_cost.toLocaleString()}</p>
 </div>
 )}
 </div>

 {/* Notes */}
 {activation.notes && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <FileText className="h-icon-xs w-icon-xs" />
 <span>Notes</span>
 </div>
 <p className="text-sm">{activation.notes}</p>
 </div>
 )}

 {/* Success Metrics */}
 {activation.success_metrics && Object.keys(activation.success_metrics).length > 0 && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Activity className="h-icon-xs w-icon-xs" />
 <span>Success Metrics</span>
 </div>
 <div className="bg-muted rounded-lg p-sm">
 <pre className="text-xs">{JSON.stringify(activation.success_metrics, null, 2)}</pre>
 </div>
 </div>
 )}
 </TabsContent>

 <TabsContent value="schedule" className="space-y-md mt-md">
 <div className="space-y-sm">
 {/* Scheduled Date */}
 {activation.scheduled_date && (
 <div className="flex items-center justify-between p-sm bg-muted rounded-lg">
 <div className="flex items-center gap-sm">
 <Calendar className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm">Scheduled Date</span>
 </div>
 <span className="font-medium">
 {format(parseISO(activation.scheduled_date), "MMMM d, yyyy")}
 </span>
 </div>
 )}

 {/* Actual Date */}
 {activation.actual_date && (
 <div className="flex items-center justify-between p-sm bg-muted rounded-lg">
 <div className="flex items-center gap-sm">
 <Calendar className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm">Actual Date</span>
 </div>
 <span className="font-medium">
 {format(parseISO(activation.actual_date), "MMMM d, yyyy")}
 </span>
 </div>
 )}

 {/* Completion Date */}
 {activation.completion_date && (
 <div className="flex items-center justify-between p-sm bg-muted rounded-lg">
 <div className="flex items-center gap-sm">
 <CheckCircle className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm">Completion Date</span>
 </div>
 <span className="font-medium">
 {format(parseISO(activation.completion_date), "MMMM d, yyyy")}
 </span>
 </div>
 )}

 {/* Timeline */}
 <div className="mt-md">
 <h4 className="font-semibold mb-sm">Timeline</h4>
 <div className="relative">
 <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
 <div className="space-y-md">
 <div className="flex items-center gap-md">
 <div className="w-icon-lg h-icon-lg rounded-full bg-background border-2 border-primary flex items-center justify-center">
 <Clock className="h-icon-xs w-icon-xs" />
 </div>
 <div>
 <p className="font-medium">Created</p>
 <p className="text-sm text-muted-foreground">
 {format(parseISO(activation.created_at), "MMM d, yyyy")}
 </p>
 </div>
 </div>
 {activation.scheduled_date && (
 <div className="flex items-center gap-md">
 <div className="w-icon-lg h-icon-lg rounded-full bg-background border-2 border-warning flex items-center justify-center">
 <Calendar className="h-icon-xs w-icon-xs" />
 </div>
 <div>
 <p className="font-medium">Scheduled</p>
 <p className="text-sm text-muted-foreground">
 {format(parseISO(activation.scheduled_date), "MMM d, yyyy")}
 </p>
 </div>
 </div>
 )}
 {activation.actual_date && (
 <div className="flex items-center gap-md">
 <div className="w-icon-lg h-icon-lg rounded-full bg-background border-2 border-info flex items-center justify-center">
 <Activity className="h-icon-xs w-icon-xs" />
 </div>
 <div>
 <p className="font-medium">Activated</p>
 <p className="text-sm text-muted-foreground">
 {format(parseISO(activation.actual_date), "MMM d, yyyy")}
 </p>
 </div>
 </div>
 )}
 {activation.completion_date && (
 <div className="flex items-center gap-md">
 <div className="w-icon-lg h-icon-lg rounded-full bg-background border-2 border-success flex items-center justify-center">
 <CheckCircle className="h-icon-xs w-icon-xs" />
 </div>
 <div>
 <p className="font-medium">Completed</p>
 <p className="text-sm text-muted-foreground">
 {format(parseISO(activation.completion_date), "MMM d, yyyy")}
 </p>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </TabsContent>

 <TabsContent value="resources" className="space-y-md mt-md">
 {/* Stakeholders */}
 {activation.stakeholders && activation.stakeholders.length > 0 && (
 <div className="space-y-sm">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Users className="h-icon-xs w-icon-xs" />
 <span>Stakeholders</span>
 </div>
 <div className="flex flex-wrap gap-xs">
 {activation.stakeholders.map((stakeholder, index) => (
 <Badge key={index} variant="secondary">
 {stakeholder}
 </Badge>
 ))}
 </div>
 </div>
 )}

 {/* Budget Breakdown */}
 <div className="space-y-sm">
 <h4 className="font-semibold">Budget Analysis</h4>
 <div className="grid grid-cols-2 gap-sm">
 <div className="p-sm bg-muted rounded-lg">
 <p className="text-sm text-muted-foreground">Allocated Budget</p>
 <p className="text-xl font-bold">
 ${activation.budget?.toLocaleString() || "0"}
 </p>
 </div>
 <div className="p-sm bg-muted rounded-lg">
 <p className="text-sm text-muted-foreground">Actual Spent</p>
 <p className="text-xl font-bold">
 ${activation.actual_cost?.toLocaleString() || "0"}
 </p>
 </div>
 </div>
 {activation.budget && activation.actual_cost && (
 <div className="p-sm bg-muted rounded-lg">
 <p className="text-sm text-muted-foreground">Variance</p>
 <p className={`text-xl font-bold ${
 activation.actual_cost > activation.budget ? "text-destructive" : "text-success"
 }`}>
 ${Math.abs(activation.budget - activation.actual_cost).toLocaleString()}
 {activation.actual_cost > activation.budget ? " over" : " under"}
 </p>
 </div>
 )}
 </div>
 </TabsContent>

 <TabsContent value="risks" className="space-y-md mt-md">
 {/* Dependencies */}
 {activation.dependencies && activation.dependencies.length > 0 && (
 <div className="space-y-sm">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Link className="h-icon-xs w-icon-xs" />
 <span>Dependencies</span>
 </div>
 <ul className="space-y-xs">
 {activation.dependencies.map((dep, index) => (
 <li key={index} className="flex items-start gap-xs">
 <span className="text-muted-foreground">•</span>
 <span className="text-sm">{dep}</span>
 </li>
 ))}
 </ul>
 </div>
 )}

 {/* Risks */}
 {activation.risks && activation.risks.length > 0 && (
 <div className="space-y-sm">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <AlertTriangle className="h-icon-xs w-icon-xs" />
 <span>Identified Risks</span>
 </div>
 <div className="space-y-xs">
 {activation.risks.map((risk, index) => (
 <div key={index} className="p-sm bg-destructive/10 rounded-lg">
 <p className="text-sm">{risk}</p>
 </div>
 ))}
 </div>
 </div>
 )}
 </TabsContent>

 <TabsContent value="activity" className="space-y-md mt-md">
 <div className="text-center py-lg text-muted-foreground">
 <MessageSquare className="mx-auto h-icon-2xl w-icon-2xl mb-sm opacity-50" />
 <p>Activity tracking coming soon</p>
 </div>
 </TabsContent>
 </Tabs>
 </div>

 <DrawerFooter>
 <div className="flex gap-sm justify-end">
 <Button variant="outline" onClick={() => onOpenChange(false)}>
 Close
 </Button>
 {onEdit && (
 <Button onClick={onEdit}>
 <Edit className="mr-2 h-icon-xs w-icon-xs" />
 Edit Activation
 </Button>
 )}
 </div>
 </DrawerFooter>
 </DrawerContent>
 </Drawer>
 );
}
