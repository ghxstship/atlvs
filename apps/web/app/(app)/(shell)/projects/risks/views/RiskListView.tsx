"use client";

import { Badge, Button, Checkbox } from "@ghxstship/ui";
import { ArrowDown, ArrowUp, ArrowUpDown, Copy, Edit, Eye, Trash2 } from "lucide-react";
import type { Risk } from "../RisksClient";

interface RiskListViewProps {
 risks: Risk[];
 selectedRisks: Set<string>;
 fieldVisibility: Array<{ id: string; label: string; visible: boolean; sortable: boolean }>;
 sortField: string;
 sortDirection: "asc" | "desc";
 onSelectAll: () => void;
 onSelectRisk: (id: string) => void;
 onSort: (field: string) => void;
 onView: (risk: Risk) => void;
 onEdit: (risk: Risk) => void;
 onDelete: (risk: Risk) => void;
 onDuplicate: (risk: Risk) => void;
 getRiskLevelBadgeVariant: (score: number) => any;
 getStatusBadgeVariant: (status: string) => any;
 getCategoryBadgeVariant: (category: string) => any;
}

export default function RiskListView({
 risks,
 selectedRisks,
 fieldVisibility,
 sortField,
 sortDirection,
 onSelectAll,
 onSelectRisk,
 onSort,
 onView,
 onEdit,
 onDelete,
 onDuplicate,
 getRiskLevelBadgeVariant,
 getStatusBadgeVariant,
 getCategoryBadgeVariant
}: RiskListViewProps) {
 const visibleFields = fieldVisibility.filter((f) => f.visible);

 const getRiskLevel = (score: number) => {
 if (score >= 20) return "Critical";
 if (score >= 12) return "High";
 if (score >= 6) return "Medium";
 return "Low";
 };

 const renderFieldValue = (risk: Risk, fieldId: string) => {
 switch (fieldId) {
 case "title":
 return <span className="font-medium">{risk.title}</span>;
 case "category":
 return (
 <Badge variant={getCategoryBadgeVariant(risk.category)}>
 {risk.category}
 </Badge>
 );
 case "probability":
 return risk.probability.replace("_", " ");
 case "impact":
 return risk.impact.replace("_", " ");
 case "risk_score":
 return (
 <div className="flex items-center gap-xs">
 <span className="font-bold">{risk.risk_score}</span>
 <Badge variant={getRiskLevelBadgeVariant(risk.risk_score)}>
 {getRiskLevel(risk.risk_score)}
 </Badge>
 </div>
 );
 case "status":
 return (
 <Badge variant={getStatusBadgeVariant(risk.status)}>
 {risk.status}
 </Badge>
 );
 case "owner":
 return risk.owner?.full_name || risk.owner?.email || "-";
 case "project":
 return risk.project?.name || "-";
 case "identified_date":
 return new Date(risk.identified_date).toLocaleDateString();
 case "review_date":
 return risk.review_date ? new Date(risk.review_date).toLocaleDateString() : "-";
 case "created_at":
 return new Date(risk.created_at).toLocaleDateString();
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
 checked={selectedRisks.size === risks.length && risks.length > 0}
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
 {risks.map((risk) => (
 <tr
 key={risk.id}
 className={`border-b hover:bg-muted/50 cursor-pointer ${
 selectedRisks.has(risk.id) ? "bg-primary/5" : ""
 }`}
 onClick={() => onView(risk)}
 >
 <td className="p-sm" onClick={(e) => e.stopPropagation()}>
 <Checkbox
 checked={selectedRisks.has(risk.id)}
 onChange={() => onSelectRisk(risk.id)}
 />
 </td>
 {visibleFields.map((field) => (
 <td key={field.id} className="p-sm">
 {renderFieldValue(risk, field.id)}
 </td>
 ))}
 <td className="p-sm" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(risk)}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(risk)}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDuplicate(risk)}
 >
 <Copy className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(risk)}
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
 
 {risks.length === 0 && (
 <div className="text-center py-xl text-muted-foreground">
 No risks to display
 </div>
 )}
 </div>
 );
}
