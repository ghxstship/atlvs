"use client";

import { Badge, Button, Checkbox, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ghxstship/ui";
import { format, parseISO } from "date-fns";
import type { Activation } from "../ActivationsClient";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Copy, Edit, Eye, Trash2 } from 'lucide-react';

interface ActivationListViewProps {
 activations: Activation[];
 selectedActivations: Set<string>;
 fieldVisibility: Array<{ id: string; label: string; visible: boolean; sortable: boolean }>;
 sortField: string;
 sortDirection: "asc" | "desc";
 onSelectAll: () => void;
 onSelectActivation: (id: string) => void;
 onSort: (field: string) => void;
 onView: (activation: Activation) => void;
 onEdit: (activation: Activation) => void;
 onDelete: (activation: Activation) => void;
 onDuplicate: (activation: Activation) => void;
 onStatusChange: (activation: Activation, status: string) => void;
}

export default function ActivationListView({
 activations,
 selectedActivations,
 fieldVisibility,
 sortField,
 sortDirection,
 onSelectAll,
 onSelectActivation,
 onSort,
 onView,
 onEdit,
 onDelete,
 onDuplicate,
 onStatusChange,
}: ActivationListViewProps) {
 const visibleFields = fieldVisibility.filter((f) => f.visible);

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

 const renderFieldValue = (activation: Activation, fieldId: string) => {
 switch (fieldId) {
 case "name":
 return <span className="font-medium">{activation.name}</span>;
 case "status":
 return (
 <Badge variant={getStatusBadgeVariant(activation.status)}>
 {activation.status}
 </Badge>
 );
 case "activation_type":
 return (
 <Badge variant={getTypeBadgeVariant(activation.activation_type)}>
 {activation.activation_type.replace("_", " ")}
 </Badge>
 );
 case "project":
 return activation.project?.name || "-";
 case "scheduled_date":
 return activation.scheduled_date
 ? format(parseISO(activation.scheduled_date), "MMM d, yyyy")
 : "-";
 case "actual_date":
 return activation.actual_date
 ? format(parseISO(activation.actual_date), "MMM d, yyyy")
 : "-";
 case "completion_date":
 return activation.completion_date
 ? format(parseISO(activation.completion_date), "MMM d, yyyy")
 : "-";
 case "location":
 return activation.location || "-";
 case "budget":
 return activation.budget ? `$${activation.budget.toLocaleString()}` : "-";
 case "actual_cost":
 return activation.actual_cost ? `$${activation.actual_cost.toLocaleString()}` : "-";
 case "created_at":
 return format(parseISO(activation.created_at), "MMM d, yyyy");
 case "updated_at":
 return format(parseISO(activation.updated_at), "MMM d, yyyy");
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
 checked={selectedActivations.size === activations.length && activations.length > 0}
 onCheckedChange={onSelectAll}
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
 {activations.map((activation) => (
 <tr
 key={activation.id}
 className={`border-b hover:bg-muted/50 cursor-pointer ${
 selectedActivations.has(activation.id) ? "bg-primary/5" : ""
 }`}
 onClick={() => onView(activation)}
 >
 <td className="p-sm" onClick={(e) => e.stopPropagation()}>
 <Checkbox
 checked={selectedActivations.has(activation.id)}
 onCheckedChange={() => onSelectActivation(activation.id)}
 />
 </td>
 {visibleFields.map((field) => (
 <td key={field.id} className="p-sm">
 {renderFieldValue(activation, field.id)}
 </td>
 ))}
 <td className="p-sm" onClick={(e) => e.stopPropagation()}>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="sm">
 <MoreVertical className="h-4 w-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem onClick={() => onView(activation)}>
 <Eye className="mr-2 h-4 w-4" />
 View
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => onEdit(activation)}>
 <Edit className="mr-2 h-4 w-4" />
 Edit
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => onDuplicate(activation)}>
 <Copy className="mr-2 h-4 w-4" />
 Duplicate
 </DropdownMenuItem>
 <DropdownMenuItem 
 onClick={() => onDelete(activation)}
 className="text-destructive"
 >
 <Trash2 className="mr-2 h-4 w-4" />
 Delete
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 
 {activations.length === 0 && (
 <div className="text-center py-xl text-muted-foreground">
 No activations to display
 </div>
 )}
 </div>
 );
}
