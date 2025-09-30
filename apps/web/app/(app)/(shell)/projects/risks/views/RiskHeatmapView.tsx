"use client";

import { Card, Badge } from "@ghxstship/ui";
import type { Risk } from "../RisksClient";

interface RiskHeatmapViewProps {
 risks: Risk[];
 onView: (risk: Risk) => void;
}

export default function RiskHeatmapView({
 risks,
 onView,
}: RiskHeatmapViewProps) {
 // Group risks by category and calculate statistics
 const categoryStats = risks.reduce((acc, risk) => {
 if (!acc[risk.category]) {
 acc[risk.category] = {
 total: 0,
 critical: 0,
 high: 0,
 medium: 0,
 low: 0,
 avgScore: 0,
 risks: [],
 };
 }
 
 acc[risk.category].total++;
 acc[risk.category].risks.push(risk);
 
 if (risk.risk_score >= 20) acc[risk.category].critical++;
 else if (risk.risk_score >= 12) acc[risk.category].high++;
 else if (risk.risk_score >= 6) acc[risk.category].medium++;
 else acc[risk.category].low++;
 
 return acc;
 }, {} as Record<string, unknown>);

 // Calculate average scores
 Object.keys(categoryStats).forEach(category => {
 const totalScore = categoryStats[category].risks.reduce(
 (sum: number, r: Risk) => sum + r.risk_score, 0
 );
 categoryStats[category].avgScore = Math.round(
 totalScore / categoryStats[category].total
 );
 });

 // Sort categories by average score
 const sortedCategories = Object.keys(categoryStats).sort(
 (a, b) => categoryStats[b].avgScore - categoryStats[a].avgScore
 );

 const getCategoryColor = (avgScore: number) => {
 if (avgScore >= 20) return "bg-destructive text-destructive-foreground";
 if (avgScore >= 12) return "bg-warning text-warning-foreground";
 if (avgScore >= 6) return "bg-yellow-500 text-white";
 return "bg-success text-success-foreground";
 };

 const formatCategory = (category: string) => {
 return category.charAt(0).toUpperCase() + category.slice(1);
 };

 return (
 <div className="space-y-md">
 {/* Heatmap Overview */}
 <div>
 <h3 className="font-semibold mb-sm">Risk Heatmap by Category</h3>
 <p className="text-sm text-muted-foreground mb-md">
 Categories sorted by average risk score - Click to view risks
 </p>

 {/* Category Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {sortedCategories.map((category) => {
 const stats = categoryStats[category];
 const color = getCategoryColor(stats.avgScore);

 return (
 <Card
 key={category}
 className="p-md cursor-pointer hover:shadow-lg transition-shadow"
 onClick={() => {
 // Could implement category filter here
 }}
 >
 <div className="space-y-sm">
 {/* Category Header */}
 <div className="flex items-center justify-between">
 <h4 className="font-semibold text-lg">
 {formatCategory(category)}
 </h4>
 <div className={`px-sm py-xs rounded-lg ${color}`}>
 <span className="text-2xl font-bold">{stats.avgScore}</span>
 </div>
 </div>

 {/* Risk Count Breakdown */}
 <div className="grid grid-cols-4 gap-xs text-center">
 <div>
 <div className="text-xs text-muted-foreground">Critical</div>
 <div className="font-semibold text-destructive">{stats.critical}</div>
 </div>
 <div>
 <div className="text-xs text-muted-foreground">High</div>
 <div className="font-semibold text-warning">{stats.high}</div>
 </div>
 <div>
 <div className="text-xs text-muted-foreground">Medium</div>
 <div className="font-semibold text-yellow-500">{stats.medium}</div>
 </div>
 <div>
 <div className="text-xs text-muted-foreground">Low</div>
 <div className="font-semibold text-success">{stats.low}</div>
 </div>
 </div>

 {/* Total Risks */}
 <div className="text-center pt-sm border-t">
 <span className="text-sm text-muted-foreground">Total Risks: </span>
 <span className="font-semibold">{stats.total}</span>
 </div>

 {/* Top Risks Preview */}
 <div className="space-y-xs">
 <div className="text-sm font-medium">Top Risks:</div>
 {stats.risks
 .sort((a: Risk, b: Risk) => b.risk_score - a.risk_score)
 .slice(0, 3)
 .map((risk: Risk) => (
 <div
 key={risk.id}
 className="text-xs p-xs bg-muted rounded hover:bg-muted/70 transition-colors"
 onClick={(e) => {
 e.stopPropagation();
 onView(risk);
 }}
 >
 <div className="flex items-center justify-between">
 <span className="line-clamp-1 flex-1">{risk.title}</span>
 <Badge variant="outline" className="ml-xs">
 {risk.risk_score}
 </Badge>
 </div>
 </div>
 ))}
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 </div>

 {/* Overall Statistics */}
 <Card className="p-md">
 <h4 className="font-semibold mb-md">Overall Risk Distribution</h4>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
 <div className="text-center">
 <div className="text-3xl font-bold text-destructive">
 {risks.filter(r => r.risk_score >= 20).length}
 </div>
 <div className="text-sm text-muted-foreground">Critical Risks</div>
 </div>
 <div className="text-center">
 <div className="text-3xl font-bold text-warning">
 {risks.filter(r => r.risk_score >= 12 && r.risk_score < 20).length}
 </div>
 <div className="text-sm text-muted-foreground">High Risks</div>
 </div>
 <div className="text-center">
 <div className="text-3xl font-bold text-yellow-500">
 {risks.filter(r => r.risk_score >= 6 && r.risk_score < 12).length}
 </div>
 <div className="text-sm text-muted-foreground">Medium Risks</div>
 </div>
 <div className="text-center">
 <div className="text-3xl font-bold text-success">
 {risks.filter(r => r.risk_score < 6).length}
 </div>
 <div className="text-sm text-muted-foreground">Low Risks</div>
 </div>
 </div>
 </Card>

 {/* Risk Timeline */}
 <Card className="p-md">
 <h4 className="font-semibold mb-md">Risk Timeline</h4>
 <div className="space-y-sm">
 {risks
 .filter(r => r.review_date)
 .sort((a, b) => new Date(a.review_date!).getTime() - new Date(b.review_date!).getTime())
 .slice(0, 10)
 .map((risk) => (
 <div
 key={risk.id}
 className="flex items-center justify-between p-sm border rounded hover:bg-muted/50 cursor-pointer"
 onClick={() => onView(risk)}
 >
 <div className="flex-1">
 <p className="font-medium">{risk.title}</p>
 <div className="flex items-center gap-sm mt-xs">
 <Badge variant="outline">{risk.category}</Badge>
 <span className="text-sm text-muted-foreground">
 Review: {new Date(risk.review_date!).toLocaleDateString()}
 </span>
 </div>
 </div>
 <div className={`text-2xl font-bold ${
 risk.risk_score >= 20 ? "text-destructive" :
 risk.risk_score >= 12 ? "text-warning" :
 risk.risk_score >= 6 ? "text-yellow-500" :
 "text-success"
 }`}>
 {risk.risk_score}
 </div>
 </div>
 ))}
 </div>
 </Card>
 </div>
 );
}
