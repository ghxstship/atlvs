"use client";

import { Edit, AlertTriangle, Shield, Activity, Target, TrendingUp, TrendingDown, Calendar, User, FileText, CheckCircle, XCircle, Clock, AlertCircle, Zap } from "lucide-react";
import {
 Button,
 Badge,
 Progress,
 Card
} from "@ghxstship/ui";
import { AppDrawer } from "@ghxstship/ui";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import type { Risk } from "./RisksClient";
import type { LucideIcon } from "lucide-react";

interface ViewRiskDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 risk: Risk;
 onEdit?: () => void;
 getCategoryIcon: (category: string) => LucideIcon;
 getRiskLevelColor: (score: number) => string;
 getRiskLevelBadgeVariant: (score: number) => any;
 getStatusBadgeVariant: (status: string) => any;
 getCategoryBadgeVariant: (category: string) => any;
}

export default function ViewRiskDrawer({
 open,
 onOpenChange,
 risk,
 onEdit,
 getCategoryIcon,
 getRiskLevelColor,
 getRiskLevelBadgeVariant,
 getStatusBadgeVariant,
 getCategoryBadgeVariant
}: ViewRiskDrawerProps) {
 const CategoryIcon = getCategoryIcon(risk.category);
 
 const getRiskLevel = (score: number) => {
 if (score >= 20) return "Critical";
 if (score >= 12) return "High";
 if (score >= 6) return "Medium";
 return "Low";
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case "identified":
 return AlertCircle;
 case "assessed":
 return Activity;
 case "mitigated":
 return Shield;
 case "closed":
 return CheckCircle;
 default:
 return Clock;
 }
 };

 const StatusIcon = getStatusIcon(risk.status);

 // Custom tabs for risk details
 const tabs = [
 {
 key: "overview",
 label: "Overview",
 content: (
 <div className="space-y-md">
 {/* Risk Score and Level */}
 <div className="bg-muted rounded-lg p-md">
 <div className="flex items-center justify-between mb-sm">
 <h4 className="font-semibold">Risk Assessment</h4>
 <Badge variant={getRiskLevelBadgeVariant(risk.risk_score)}>
 {getRiskLevel(risk.risk_score)}
 </Badge>
 </div>
 <div className="grid grid-cols-3 gap-md">
 <div className="text-center">
 <div className={`text-3xl font-bold ${getRiskLevelColor(risk.risk_score)}`}>
 {risk.risk_score}
 </div>
 <div className="text-sm text-muted-foreground">Risk Score</div>
 </div>
 <div className="text-center">
 <div className="text-lg font-medium">
 {risk.probability.replace("_", " ")}
 </div>
 <div className="text-sm text-muted-foreground">Probability</div>
 </div>
 <div className="text-center">
 <div className="text-lg font-medium">
 {risk.impact.replace("_", " ")}
 </div>
 <div className="text-sm text-muted-foreground">Impact</div>
 </div>
 </div>
 <Progress 
 value={(risk.risk_score / 25) * 100} 
 className="mt-md h-2"
 />
 </div>

 {/* Status and Category */}
 <div className="grid grid-cols-2 gap-md">
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <StatusIcon className="h-icon-xs w-icon-xs" />
 <span>Status</span>
 </div>
 <Badge variant={getStatusBadgeVariant(risk.status)}>
 {risk.status}
 </Badge>
 </div>

 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <CategoryIcon className="h-icon-xs w-icon-xs" />
 <span>Category</span>
 </div>
 <Badge variant={getCategoryBadgeVariant(risk.category)}>
 {risk.category}
 </Badge>
 </div>
 </div>

 {/* Description */}
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <FileText className="h-icon-xs w-icon-xs" />
 <span>Description</span>
 </div>
 <p className="text-sm">{risk.description}</p>
 </div>

 {/* Owner */}
 {risk.owner && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <User className="h-icon-xs w-icon-xs" />
 <span>Risk Owner</span>
 </div>
 <p className="font-medium">
 {risk.owner.full_name || risk.owner.email}
 </p>
 </div>
 )}

 {/* Project */}
 {risk.project && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Target className="h-icon-xs w-icon-xs" />
 <span>Project</span>
 </div>
 <p className="font-medium">{risk.project.name}</p>
 </div>
 )}

 {/* Dates */}
 <div className="grid grid-cols-2 gap-md">
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Calendar className="h-icon-xs w-icon-xs" />
 <span>Identified</span>
 </div>
 <p className="font-medium">
 {format(parseISO(risk.identified_date), "MMM d, yyyy")}
 </p>
 </div>

 {risk.review_date && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Clock className="h-icon-xs w-icon-xs" />
 <span>Review Date</span>
 </div>
 <p className="font-medium">
 {format(parseISO(risk.review_date), "MMM d, yyyy")}
 </p>
 </div>
 )}
 </div>

 {/* Closed Date */}
 {risk.closed_date && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <CheckCircle className="h-icon-xs w-icon-xs" />
 <span>Closed Date</span>
 </div>
 <p className="font-medium">
 {format(parseISO(risk.closed_date), "MMM d, yyyy")}
 </p>
 </div>
 )}
 </div>
 )
 },
 {
 key: "mitigation",
 label: "Mitigation",
 content: (
 <div className="space-y-md">
 {/* Mitigation Plan */}
 <div className="space-y-sm">
 <h4 className="font-semibold flex items-center gap-xs">
 <Shield className="h-icon-xs w-icon-xs" />
 Mitigation Plan
 </h4>
 {risk.mitigation_plan ? (
 <div className="p-md bg-muted rounded-lg">
 <p className="text-sm whitespace-pre-wrap">{risk.mitigation_plan}</p>
 </div>
 ) : (
 <div className="p-md bg-muted/50 rounded-lg text-center">
 <AlertTriangle className="mx-auto h-icon-lg w-icon-lg text-warning mb-sm" />
 <p className="text-sm text-muted-foreground">
 No mitigation plan documented yet
 </p>
 </div>
 )}
 </div>

 {/* Contingency Plan */}
 <div className="space-y-sm">
 <h4 className="font-semibold flex items-center gap-xs">
 <Zap className="h-icon-xs w-icon-xs" />
 Contingency Plan
 </h4>
 {risk.contingency_plan ? (
 <div className="p-md bg-info/10 border border-info rounded-lg">
 <p className="text-sm whitespace-pre-wrap">{risk.contingency_plan}</p>
 </div>
 ) : (
 <div className="p-md bg-muted/50 rounded-lg text-center">
 <AlertCircle className="mx-auto h-icon-lg w-icon-lg text-muted-foreground mb-sm" />
 <p className="text-sm text-muted-foreground">
 No contingency plan documented yet
 </p>
 </div>
 )}
 </div>

 {/* Risk Response Strategy */}
 <div className="space-y-sm">
 <h4 className="font-semibold">Response Strategy</h4>
 <div className="grid grid-cols-2 gap-sm">
 <Card className="p-sm">
 <div className="flex items-center gap-xs mb-xs">
 <Shield className="h-icon-xs w-icon-xs text-success" />
 <span className="text-sm font-medium">Mitigate</span>
 </div>
 <p className="text-xs text-muted-foreground">
 Reduce probability or impact
 </p>
 </Card>
 <Card className="p-sm">
 <div className="flex items-center gap-xs mb-xs">
 <XCircle className="h-icon-xs w-icon-xs text-destructive" />
 <span className="text-sm font-medium">Avoid</span>
 </div>
 <p className="text-xs text-muted-foreground">
 Eliminate the risk entirely
 </p>
 </Card>
 <Card className="p-sm">
 <div className="flex items-center gap-xs mb-xs">
 <TrendingUp className="h-icon-xs w-icon-xs text-warning" />
 <span className="text-sm font-medium">Transfer</span>
 </div>
 <p className="text-xs text-muted-foreground">
 Shift risk to third party
 </p>
 </Card>
 <Card className="p-sm">
 <div className="flex items-center gap-xs mb-xs">
 <CheckCircle className="h-icon-xs w-icon-xs text-info" />
 <span className="text-sm font-medium">Accept</span>
 </div>
 <p className="text-xs text-muted-foreground">
 Acknowledge and monitor
 </p>
 </Card>
 </div>
 </div>
 </div>
 )
 },
 {
 key: "timeline",
 label: "Timeline",
 content: (
 <div className="space-y-md">
 <h4 className="font-semibold">Risk Timeline</h4>
 <div className="relative">
 <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
 <div className="space-y-md">
 {/* Created */}
 <div className="flex items-center gap-md">
 <div className="w-icon-lg h-icon-lg rounded-full bg-background border-2 border-muted flex items-center justify-center">
 <Clock className="h-icon-xs w-icon-xs" />
 </div>
 <div>
 <p className="font-medium">Risk Created</p>
 <p className="text-sm text-muted-foreground">
 {format(parseISO(risk.created_at), "MMM d, yyyy 'at' h:mm a")}
 </p>
 </div>
 </div>

 {/* Identified */}
 <div className="flex items-center gap-md">
 <div className="w-icon-lg h-icon-lg rounded-full bg-background border-2 border-warning flex items-center justify-center">
 <AlertTriangle className="h-icon-xs w-icon-xs" />
 </div>
 <div>
 <p className="font-medium">Risk Identified</p>
 <p className="text-sm text-muted-foreground">
 {format(parseISO(risk.identified_date), "MMM d, yyyy")}
 </p>
 </div>
 </div>

 {/* Status Changes */}
 {risk.status === "assessed" && (
 <div className="flex items-center gap-md">
 <div className="w-icon-lg h-icon-lg rounded-full bg-background border-2 border-info flex items-center justify-center">
 <Activity className="h-icon-xs w-icon-xs" />
 </div>
 <div>
 <p className="font-medium">Risk Assessed</p>
 <p className="text-sm text-muted-foreground">
 Impact and probability evaluated
 </p>
 </div>
 </div>
 )}

 {risk.status === "mitigated" && (
 <div className="flex items-center gap-md">
 <div className="w-icon-lg h-icon-lg rounded-full bg-background border-2 border-success flex items-center justify-center">
 <Shield className="h-icon-xs w-icon-xs" />
 </div>
 <div>
 <p className="font-medium">Risk Mitigated</p>
 <p className="text-sm text-muted-foreground">
 Mitigation measures implemented
 </p>
 </div>
 </div>
 )}

 {/* Review Date */}
 {risk.review_date && (
 <div className="flex items-center gap-md">
 <div className="w-icon-lg h-icon-lg rounded-full bg-background border-2 border-primary flex items-center justify-center">
 <Calendar className="h-icon-xs w-icon-xs" />
 </div>
 <div>
 <p className="font-medium">Scheduled Review</p>
 <p className="text-sm text-muted-foreground">
 {format(parseISO(risk.review_date), "MMM d, yyyy")}
 </p>
 </div>
 </div>
 )}

 {/* Closed */}
 {risk.closed_date && (
 <div className="flex items-center gap-md">
 <div className="w-icon-lg h-icon-lg rounded-full bg-background border-2 border-success flex items-center justify-center">
 <CheckCircle className="h-icon-xs w-icon-xs" />
 </div>
 <div>
 <p className="font-medium">Risk Closed</p>
 <p className="text-sm text-muted-foreground">
 {format(parseISO(risk.closed_date), "MMM d, yyyy")}
 </p>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Last Updated */}
 <div className="pt-md border-t">
 <p className="text-sm text-muted-foreground">
 Last updated {formatDistanceToNow(parseISO(risk.updated_at), { addSuffix: true })}
 </p>
 </div>
 </div>
 )
 },
 ];

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title={risk.title}
 mode="view"
 tabs={tabs}
 actions={[
 {
 key: "edit",
 label: "Edit",
 icon: <Edit className="h-icon-xs w-icon-xs" />,
 onClick: onEdit
 },
 ]}
 />
 );
}
