"use client";

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
import { Calendar, Check, CheckCircle, Copy, Edit, Eye, Play, Trash2, MoreVertical, MapPin, Clock, DollarSign, Building } from 'lucide-react';

interface ActivationGridViewProps {
 activations: Activation[];
 selectedActivations: Set<string>;
 onSelectActivation: (id: string) => void;
 onView: (activation: Activation) => void;
 onEdit: (activation: Activation) => void;
 onDelete: (activation: Activation) => void;
 onDuplicate: (activation: Activation) => void;
 onStatusChange: (activation: Activation, status: string) => void;
}

export default function ActivationGridView({
 activations,
 selectedActivations,
 onSelectActivation,
 onView,
 onEdit,
 onDelete,
 onDuplicate,
 onStatusChange
}: ActivationGridViewProps) {
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

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {activations.map((activation) => (
 <Card
 key={activation.id}
 className={`p-md cursor-pointer hover:shadow-lg transition-shadow ${
 selectedActivations.has(activation.id) ? "ring-2 ring-primary" : ""
 }`}
 onClick={() => onView(activation)}
 >
 <div className="flex items-start justify-between mb-sm">
 <Checkbox
 checked={selectedActivations.has(activation.id)}
 onCheckedChange={() => onSelectActivation(activation.id)}
 onClick={(e) => e.stopPropagation()}
 />
 <DropdownMenu>
 <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
 <Button variant="ghost" size="sm">
 <MoreVertical className="h-icon-xs w-icon-xs" />
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
 <DropdownMenuItem onClick={() => onDuplicate(activation)}>
 <Copy className="mr-2 h-icon-xs w-icon-xs" />
 Duplicate
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => onStatusChange(activation, "planning")}>
 <Clock className="mr-2 h-icon-xs w-icon-xs" />
 Set Planning
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => onStatusChange(activation, "active")}>
 <Play className="mr-2 h-icon-xs w-icon-xs" />
 Set Active
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => onStatusChange(activation, "completed")}>
 <CheckCircle className="mr-2 h-icon-xs w-icon-xs" />
 Set Completed
 </DropdownMenuItem>
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

 <div className="space-y-sm">
 <h3 className="font-semibold text-lg truncate">{activation.name}</h3>
 
 <div className="flex items-center gap-xs flex-wrap">
 <Badge variant={getStatusBadgeVariant(activation.status)}>
 {activation.status}
 </Badge>
 <Badge variant={getTypeBadgeVariant(activation.activation_type)}>
 {activation.activation_type.replace("_", " ")}
 </Badge>
 </div>

 {activation.project && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Building className="h-3 w-3" />
 <span className="truncate">{activation.project.name}</span>
 </div>
 )}

 {activation.scheduled_date && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Calendar className="h-3 w-3" />
 <span>{format(parseISO(activation.scheduled_date), "MMM d, yyyy")}</span>
 </div>
 )}

 {activation.location && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <MapPin className="h-3 w-3" />
 <span className="truncate">{activation.location}</span>
 </div>
 )}

 {activation.budget && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <DollarSign className="h-3 w-3" />
 <span>${activation.budget.toLocaleString()}</span>
 </div>
 )}
 </div>
 </Card>
 ))}
 </div>
 );
}
