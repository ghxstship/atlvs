"use client";

import { useMemo } from 'react';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@ghxstship/ui";
import { format, parseISO } from "date-fns";
import type { Activation } from "../ActivationsClient";
import { Check, CheckCircle, Edit, Eye, Play, Trash2, X, AlertCircle, MoreVertical, Clock } from 'lucide-react';

interface ActivationKanbanViewProps {
 activations: Activation[];
 selectedActivations: Set<string>;
 onSelectActivation: (id: string) => void;
 onView: (activation: Activation) => void;
 onEdit: (activation: Activation) => void;
 onDelete: (activation: Activation) => void;
 onStatusChange: (activation: Activation, status: string) => void;
}

export default function ActivationKanbanView({
 activations,
 selectedActivations,
 onSelectActivation,
 onView,
 onEdit,
 onDelete,
 onStatusChange
}: ActivationKanbanViewProps) {
 // Group activations by status
 const groupedActivations = useMemo(() => {
 const groups: Record<string, Activation[]> = {
 planning: [],
 ready: [],
 active: [],
 completed: [],
 cancelled: []
 };

 activations.forEach((activation) => {
 if (groups[activation.status]) {
 groups[activation.status].push(activation);
 }
 });

 return groups;
 }, [activations]);

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
 return AlertCircle;
 case "active":
 return Play;
 case "completed":
 return CheckCircle;
 case "cancelled":
 return XCircle;
 default:
 return Clock;
 }
 };

 return (
 <div className="flex gap-md overflow-x-auto pb-md">
 {Object.entries(groupedActivations).map(([status, items]) => {
 const StatusIcon = getStatusIcon(status);
 return (
 <div key={status} className="flex-shrink-0 w-container-md">
 <div className="bg-muted rounded-lg p-sm mb-sm">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <StatusIcon className="h-icon-xs w-icon-xs" />
 <h3 className="font-semibold capitalize">{status.replace("_", " ")}</h3>
 </div>
 <Badge variant={getStatusBadgeVariant(status)}>{items.length}</Badge>
 </div>
 </div>

 <div className="space-y-sm max-h-screen-minus-xl overflow-y-auto">
 {items.map((activation) => (
 <Card
 key={activation.id}
 className={`p-sm cursor-pointer hover:shadow-md transition-shadow ${
 selectedActivations.has(activation.id) ? "ring-2 ring-primary" : ""
 }`}
 onClick={() => onView(activation)}
 >
 <div className="flex items-start justify-between mb-xs">
 <Checkbox
 checked={selectedActivations.has(activation.id)}
 onCheckedChange={() => onSelectActivation(activation.id)}
 onClick={(e) => e.stopPropagation()}
 />
 <DropdownMenu>
 <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
 <Button variant="ghost" size="sm">
 <MoreVertical className="h-3 w-3" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem onClick={() => onView(activation)}>
 <Eye className="mr-2 h-icon-xs w-icon-xs" />
 View
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => onEdit(activation)}>
 <Edit className="mr-2 h-icon-xs w-icon-xs" />
 Edit
 </DropdownMenuItem>
 {status !== "planning" && (
 <DropdownMenuItem onClick={() => onStatusChange(activation, "planning")}>
 <Clock className="mr-2 h-icon-xs w-icon-xs" />
 Move to Planning
 </DropdownMenuItem>
 )}
 {status !== "ready" && (
 <DropdownMenuItem onClick={() => onStatusChange(activation, "ready")}>
 <AlertCircle className="mr-2 h-icon-xs w-icon-xs" />
 Move to Ready
 </DropdownMenuItem>
 )}
 {status !== "active" && (
 <DropdownMenuItem onClick={() => onStatusChange(activation, "active")}>
 <Play className="mr-2 h-icon-xs w-icon-xs" />
 Move to Active
 </DropdownMenuItem>
 )}
 {status !== "completed" && (
 <DropdownMenuItem onClick={() => onStatusChange(activation, "completed")}>
 <CheckCircle className="mr-2 h-icon-xs w-icon-xs" />
 Move to Completed
 </DropdownMenuItem>
 )}
 <DropdownMenuItem 
 onClick={() => onDelete(activation)}
 className="text-destructive"
 >
 <Trash2 className="mr-2 h-icon-xs w-icon-xs" />
 Delete
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>

 <h4 className="font-medium mb-xs truncate">{activation.name}</h4>
 
 <Badge 
 variant={getTypeBadgeVariant(activation.activation_type)}
 className="mb-xs"
 >
 {activation.activation_type.replace("_", " ")}
 </Badge>

 {activation.project && (
 <div className="text-xs text-muted-foreground mb-xs truncate">
 {activation.project.name}
 </div>
 )}

 {activation.scheduled_date && (
 <div className="text-xs text-muted-foreground">
 {format(parseISO(activation.scheduled_date), "MMM d")}
 </div>
 )}

 {activation.budget && (
 <div className="text-xs text-muted-foreground">
 ${activation.budget.toLocaleString()}
 </div>
 )}
 </Card>
 ))}
 
 {items.length === 0 && (
 <div className="text-center py-lg text-muted-foreground text-sm">
 No activations in {status}
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 );
}
