"use client";

import { Card, Badge, Button, Checkbox } from "@ghxstship/ui";
import type { Risk } from "../RisksClient";
import type { LucideIcon } from "lucide-react";
import { Clock, Copy, Edit, Eye, Shield, Trash2, User } from "lucide-react";

interface RiskGridViewProps {
 risks: Risk[];
 selectedRisks: Set<string>;
 onSelectRisk: (id: string) => void;
 onView: (risk: Risk) => void;
 onEdit: (risk: Risk) => void;
 onDelete: (risk: Risk) => void;
 onDuplicate: (risk: Risk) => void;
 getCategoryIcon: (category: string) => LucideIcon;
 getRiskLevelColor: (score: number) => string;
 getRiskLevelBadgeVariant: (score: number) => any;
 getStatusBadgeVariant: (status: string) => any;
 getCategoryBadgeVariant: (category: string) => any;
}

export default function RiskGridView({
 risks,
 selectedRisks,
 onSelectRisk,
 onView,
 onEdit,
 onDelete,
 onDuplicate,
 getCategoryIcon,
 getRiskLevelColor,
 getRiskLevelBadgeVariant,
 getStatusBadgeVariant,
 getCategoryBadgeVariant,
}: RiskGridViewProps) {
 const getRiskLevel = (score: number) => {
 if (score >= 20) return "Critical";
 if (score >= 12) return "High";
 if (score >= 6) return "Medium";
 return "Low";
 };

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {risks.map((risk) => {
 const CategoryIcon = getCategoryIcon(risk.category);
 const riskLevel = getRiskLevel(risk.risk_score);
 
 return (
 <Card
 key={risk.id}
 className={`p-md cursor-pointer hover:shadow-lg transition-shadow ${
 selectedRisks.has(risk.id) ? "ring-2 ring-primary" : ""
 }`}
 onClick={() => onView(risk)}
 >
 <div className="flex items-start justify-between mb-sm">
 <Checkbox
 checked={selectedRisks.has(risk.id)}
 onChange={() => onSelectRisk(risk.id)}
 onClick={(e: React.MouseEvent) => e.stopPropagation()}
 />
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(risk);
 }}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 </div>

 <div className="space-y-sm">
 {/* Risk Score and Level */}
 <div className="flex items-center justify-between">
 <div className={`text-3xl font-bold ${getRiskLevelColor(risk.risk_score)}`}>
 {risk.risk_score}
 </div>
 <Badge variant={getRiskLevelBadgeVariant(risk.risk_score)}>
 {riskLevel}
 </Badge>
 </div>

 {/* Title */}
 <h3 className="font-semibold line-clamp-xs">{risk.title}</h3>

 {/* Category and Status */}
 <div className="flex items-center gap-xs flex-wrap">
 <Badge variant={getCategoryBadgeVariant(risk.category)}>
 <CategoryIcon className="h-3 w-3 mr-xs" />
 {risk.category}
 </Badge>
 <Badge variant={getStatusBadgeVariant(risk.status)}>
 {risk.status}
 </Badge>
 </div>

 {/* Probability and Impact */}
 <div className="grid grid-cols-2 gap-xs text-sm">
 <div>
 <span className="text-muted-foreground">Probability:</span>
 <span className="ml-xs font-medium">{risk.probability.replace("_", " ")}</span>
 </div>
 <div>
 <span className="text-muted-foreground">Impact:</span>
 <span className="ml-xs font-medium">{risk.impact.replace("_", " ")}</span>
 </div>
 </div>

 {/* Description */}
 <p className="text-sm text-muted-foreground line-clamp-xs">
 {risk.description}
 </p>

 {/* Owner */}
 {risk.owner && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <User className="h-3 w-3" />
 <span className="truncate">
 {risk.owner.full_name || risk.owner.email}
 </span>
 </div>
 )}

 {/* Project */}
 {risk.project && (
 <div className="text-sm text-muted-foreground truncate">
 Project: {risk.project.name}
 </div>
 )}

 {/* Review Date */}
 {risk.review_date && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Clock className="h-3 w-3" />
 <span>Review: {new Date(risk.review_date).toLocaleDateString()}</span>
 </div>
 )}

 {/* Mitigation Status */}
 {risk.mitigation_plan && (
 <div className="flex items-center gap-xs text-sm text-success">
 <Shield className="h-3 w-3" />
 <span>Mitigation plan in place</span>
 </div>
 )}

 {/* Actions */}
 <div className="flex items-center gap-xs pt-sm border-t">
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onView(risk);
 }}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDuplicate(risk);
 }}
 >
 <Copy className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(risk);
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
