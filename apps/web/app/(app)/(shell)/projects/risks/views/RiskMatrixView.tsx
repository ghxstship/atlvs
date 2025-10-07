"use client";

import { Card, Badge } from "@ghxstship/ui";
import type { Risk } from "../RisksClient";

interface RiskMatrixViewProps {
 riskMatrix: Record<string, Record<string, Risk[]>>;
 onView: (risk: Risk) => void;
 getRiskLevelColor: (score: number) => string;
}

export default function RiskMatrixView({
 riskMatrix,
 onView,
 getRiskLevelColor,
}: RiskMatrixViewProps) {
 const probabilities = ["very_high", "high", "medium", "low", "very_low"];
 const impacts = ["very_low", "low", "medium", "high", "very_high"];

 const getCellColor = (prob: string, imp: string) => {
 const probMap: Record<string, number> = {
 very_low: 1,
 low: 2,
 medium: 3,
 high: 4,
 very_high: 5,
 };
 const score = probMap[prob] * probMap[imp];
 
 if (score >= 20) return "bg-destructive/20 border-destructive";
 if (score >= 12) return "bg-warning/20 border-warning";
 if (score >= 6) return "bg-yellow-500/20 border-yellow-500";
 return "bg-success/20 border-success";
 };

 const formatLabel = (label: string) => {
 return label.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
 };

 return (
 <div className="overflow-x-auto">
 <div className="min-w-content-xlarge">
 {/* Matrix Header */}
 <div className="mb-md">
 <h3 className="font-semibold mb-sm">Risk Assessment Matrix</h3>
 <p className="text-sm text-muted-foreground">
 Probability vs Impact - Click on risks to view details
 </p>
 </div>

 {/* Matrix Grid */}
 <div className="grid grid-cols-6 gap-xs">
 {/* Top-left corner cell */}
 <div className="p-sm">
 <div className="text-xs font-medium text-muted-foreground text-right">
 Probability →
 </div>
 <div className="text-xs font-medium text-muted-foreground mt-sm">
 ↓ Impact
 </div>
 </div>

 {/* Impact headers */}
 {impacts.map((impact) => (
 <div key={impact} className="p-sm text-center">
 <div className="text-sm font-medium">
 {formatLabel(impact)}
 </div>
 </div>
 ))}

 {/* Matrix rows */}
 {probabilities.map((probability) => (
 <>
 {/* Probability label */}
 <div key={`label-${probability}`} className="p-sm text-right">
 <div className="text-sm font-medium">
 {formatLabel(probability)}
 </div>
 </div>

 {/* Risk cells */}
 {impacts.map((impact) => {
 const risks = riskMatrix[probability]?.[impact] || [];
 const cellColor = getCellColor(probability, impact);
 const probMap: Record<string, number> = {
 very_low: 1,
 low: 2,
 medium: 3,
 high: 4,
 very_high: 5,
 };
 const score = probMap[probability] * probMap[impact];

 return (
 <div
 key={`${probability}-${impact}`}
 className={`border-2 rounded-lg p-sm min-h-header-md ${cellColor}`}
 >
 <div className="text-xs font-medium text-center mb-xs">
 Score: {score}
 </div>
 {risks.length > 0 ? (
 <div className="space-y-xs">
 {risks.slice(0, 3).map((risk) => (
 <div
 key={risk.id}
 className="bg-background/80 rounded p-xs cursor-pointer hover:bg-background transition-colors"
 onClick={() => onView(risk)}
 >
 <p className="text-xs font-medium line-clamp-xs">
 {risk.title}
 </p>
 <Badge variant="outline" className="text-xs mt-xs">
 {risk.category}
 </Badge>
 </div>
 ))}
 {risks.length > 3 && (
 <div className="text-xs text-center text-muted-foreground">
 +{risks.length - 3} more
 </div>
 )}
 </div>
 ) : (
 <div className="text-xs text-center text-muted-foreground">
 No risks
 </div>
 )}
 </div>
 );
 })}
 </>
 ))}
 </div>

 {/* Legend */}
 <div className="mt-lg">
 <h4 className="font-medium mb-sm">Risk Levels</h4>
 <div className="flex items-center gap-md flex-wrap">
 <div className="flex items-center gap-xs">
 <div className="w-icon-xs h-icon-xs bg-destructive/20 border-2 border-destructive rounded"></div>
 <span className="text-sm">Critical (20-25)</span>
 </div>
 <div className="flex items-center gap-xs">
 <div className="w-icon-xs h-icon-xs bg-warning/20 border-2 border-warning rounded"></div>
 <span className="text-sm">High (12-19)</span>
 </div>
 <div className="flex items-center gap-xs">
 <div className="w-icon-xs h-icon-xs bg-yellow-500/20 border-2 border-yellow-500 rounded"></div>
 <span className="text-sm">Medium (6-11)</span>
 </div>
 <div className="flex items-center gap-xs">
 <div className="w-icon-xs h-icon-xs bg-success/20 border-2 border-success rounded"></div>
 <span className="text-sm">Low (1-5)</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
