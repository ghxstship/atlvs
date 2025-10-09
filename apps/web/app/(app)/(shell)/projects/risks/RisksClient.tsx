"use client";

import { Grid3x3, LayoutGrid, List, BarChart3, Search, Filter, Download, Plus, AlertTriangle, Shield, TrendingUp, Activity, Target, Zap, AlertCircle, CheckCircle, Clock, ArrowUpDown } from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@ghxstship/auth";
import {
 Card,
 Button,
 Badge,
 Input,
 Select,
 Checkbox,
 toast
} from "@ghxstship/ui";
import { format, parseISO, isBefore } from "date-fns";
import CreateRiskDrawer from "./CreateRiskDrawer";
import EditRiskDrawer from "./EditRiskDrawer";
import ViewRiskDrawer from "./ViewRiskDrawer";
import RiskGridView from "./views/RiskGridView";
import RiskMatrixView from "./views/RiskMatrixView";
import RiskListView from "./views/RiskListView";
import RiskHeatmapView from "./views/RiskHeatmapView";

// Types
export interface Risk {
 id: string;
 project_id: string;
 organization_id: string;
 project?: {
 id: string;
 name: string;
 status: string;
 };
 title: string;
 description: string;
 category: "technical" | "financial" | "operational" | "legal" | "environmental" | "safety";
 probability: "very_low" | "low" | "medium" | "high" | "very_high";
 impact: "very_low" | "low" | "medium" | "high" | "very_high";
 risk_score: number;
 status: "identified" | "assessed" | "mitigated" | "closed";
 owner_id?: string;
 owner?: {
 id: string;
 email: string;
 full_name?: string;
 };
 mitigation_plan?: string;
 contingency_plan?: string;
 identified_date: string;
 review_date?: string;
 closed_date?: string;
 created_at: string;
 updated_at: string;
 created_by?: string;
 updated_by?: string;
}

interface RisksClientProps {
 orgId: string;
 projectId?: string;
 initialRisks?: Risk[];
 projects?: Array<{ id: string; name: string }>;
 users?: Array<{ id: string; email: string; full_name?: string }>;
}

const VIEW_TYPES = [
 { id: "grid", label: "Grid", icon: Grid3x3 },
 { id: "matrix", label: "Matrix", icon: LayoutGrid },
 { id: "heatmap", label: "Heatmap", icon: BarChart3 },
 { id: "list", label: "List", icon: List },
] as const;

type ViewType = typeof VIEW_TYPES[number]["id"];

const FIELD_CONFIG = [
 { id: "title", label: "Title", visible: true, sortable: true },
 { id: "category", label: "Category", visible: true, sortable: true },
 { id: "probability", label: "Probability", visible: true, sortable: true },
 { id: "impact", label: "Impact", visible: true, sortable: true },
 { id: "risk_score", label: "Risk Score", visible: true, sortable: true },
 { id: "status", label: "Status", visible: true, sortable: true },
 { id: "owner", label: "Owner", visible: true, sortable: true },
 { id: "project", label: "Project", visible: true, sortable: true },
 { id: "identified_date", label: "Identified", visible: false, sortable: true },
 { id: "review_date", label: "Review Date", visible: false, sortable: true },
 { id: "created_at", label: "Created", visible: false, sortable: true },
];

export default function RisksClient({
 orgId,
 projectId,
 initialRisks = [],
 projects = [],
 users = []
}: RisksClientProps) {
 const router = useRouter();
 const supabase = createBrowserClient();

 // State
 const [risks, setRisks] = useState<Risk[]>(initialRisks);
 const [loading, setLoading] = useState(false);
 const [viewType, setViewType] = useState<ViewType>("grid");
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedCategory, setSelectedCategory] = useState<string>("all");
 const [selectedStatus, setSelectedStatus] = useState<string>("all");
 const [selectedProbability, setSelectedProbability] = useState<string>("all");
 const [selectedImpact, setSelectedImpact] = useState<string>("all");
 const [selectedProject, setSelectedProject] = useState<string>(projectId || "all");
 const [sortField, setSortField] = useState<string>("risk_score");
 const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
 const [selectedRisks, setSelectedRisks] = useState<Set<string>(new Set());
 const [fieldVisibility, setFieldVisibility] = useState(FIELD_CONFIG);

 // Drawers
 const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
 const [editDrawerOpen, setEditDrawerOpen] = useState(false);
 const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
 const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

 // Calculate risk score
 const calculateRiskScore = (probability: string, impact: string): number => {
 const probMap: Record<string, number> = {
 very_low: 1,
 low: 2,
 medium: 3,
 high: 4,
 very_high: 5
 };
 return probMap[probability] * probMap[impact];
 };

 // Load risks from Supabase
 const loadRisks = useCallback(async () => {
 setLoading(true);
 try {
 let query = supabase
 .from("project_risks")
 .select(`
 *,
 project:projects(id, name, status),
 owner:users!project_risks_owner_id_fkey(id, email, full_name)
 `)
 .eq("organization_id", orgId)
 .order(sortField, { ascending: sortDirection === "asc" });

 if (projectId) {
 query = query.eq("project_id", projectId);
 } else if (selectedProject !== "all") {
 query = query.eq("project_id", selectedProject);
 }

 const { data, error } = await query;
 if (error) throw error;
 setRisks(data || []);
 } catch (error) {
 console.error("Error loading risks:", error);
 toast.error("Failed to load risks");
 } finally {
 setLoading(false);
 }
 }, [supabase, orgId, projectId, selectedProject, sortField, sortDirection]);

 // Load risks on mount
 useEffect(() => {
 loadRisks();
 }, [loadRisks]);

 // Real-time subscription
 useEffect(() => {
 const channel = supabase
 .channel("risks-changes")
 .on(
 "postgres_changes",
 {
 event: "*",
 schema: "public",
 table: "project_risks",
 filter: `organization_id=eq.${orgId}`
 },
 () => {
 loadRisks();
 }
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, [supabase, orgId, loadRisks]);

 // Filter risks
 const filteredRisks = useMemo(() => {
 return risks.filter((risk) => {
 if (searchQuery) {
 const query = searchQuery.toLowerCase();
 return (
 risk.title.toLowerCase().includes(query) ||
 risk.description.toLowerCase().includes(query) ||
 risk.mitigation_plan?.toLowerCase().includes(query) ||
 risk.project?.name.toLowerCase().includes(query)
 );
 }
 return true;
 });
 }, [risks, searchQuery]);

 // Apply filters
 const filteredAndTypedRisks = useMemo(() => {
 return filteredRisks.filter((risk) => {
 if (selectedCategory !== "all" && risk.category !== selectedCategory) return false;
 if (selectedStatus !== "all" && risk.status !== selectedStatus) return false;
 if (selectedProbability !== "all" && risk.probability !== selectedProbability) return false;
 if (selectedImpact !== "all" && risk.impact !== selectedImpact) return false;
 return true;
 });
 }, [filteredRisks, selectedCategory, selectedStatus, selectedProbability, selectedImpact]);

 // Sort risks
 const sortedRisks = useMemo(() => {
 return [...filteredAndTypedRisks].sort((a, b) => {
 let aVal: unknown = a[sortField as keyof Risk];
 let bVal: unknown = b[sortField as keyof Risk];

 if (sortField === "owner") {
 aVal = a.owner?.full_name || a.owner?.email || "";
 bVal = b.owner?.full_name || b.owner?.email || "";
 } else if (sortField === "project") {
 aVal = a.project?.name || "";
 bVal = b.project?.name || "";
 }

 if (sortField.includes("date") || sortField.includes("_at")) {
 aVal = aVal ? new Date(aVal).getTime() : 0;
 bVal = bVal ? new Date(bVal).getTime() : 0;
 }

 if (typeof aVal === "number" && typeof bVal === "number") {
 return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
 }

 const aStr = String(aVal || "").toLowerCase();
 const bStr = String(bVal || "").toLowerCase();
 return sortDirection === "asc" 
 ? aStr.localeCompare(bStr)
 : bStr.localeCompare(aStr);
 });
}, [filteredAndTypedRisks, sortField, sortDirection]);

// Group risks for matrix view
const riskMatrix = useMemo(() => {
 const matrix: Record<string, Record<string, Risk[]>> = {};
 const probabilities = ["very_high", "high", "medium", "low", "very_low"];
 const impacts = ["very_low", "low", "medium", "high", "very_high"];

 probabilities.forEach(prob => {
 matrix[prob] = {};
 impacts.forEach(imp => {
 matrix[prob][imp] = [];
 });
 });

 sortedRisks.forEach(risk => {
 if (matrix[risk.probability] && matrix[risk.probability][risk.impact]) {
 matrix[risk.probability][risk.impact].push(risk);
 }
 });

 return matrix;
 }, [sortedRisks]);

 // Calculate statistics
 const statistics = useMemo(() => {
 const stats = {
 total: risks.length,
 identified: risks.filter(r => r.status === "identified").length,
 assessed: risks.filter(r => r.status === "assessed").length,
 mitigated: risks.filter(r => r.status === "mitigated").length,
 closed: risks.filter(r => r.status === "closed").length,
 critical: risks.filter(r => r.risk_score >= 20).length,
 high: risks.filter(r => r.risk_score >= 12 && r.risk_score < 20).length,
 medium: risks.filter(r => r.risk_score >= 6 && r.risk_score < 12).length,
 low: risks.filter(r => r.risk_score < 6).length,
 overdue: risks.filter(r => 
 r.review_date && 
 r.status !== "closed" && 
 isBefore(parseISO(r.review_date), new Date())
 ).length
 };
 return stats;
 }, [risks]);

 // Handle selection
 const handleSelectAll = useCallback(() => {
 if (selectedRisks.size === sortedRisks.length) {
 setSelectedRisks(new Set());
 } else {
 setSelectedRisks(new Set(sortedRisks.map((r) => r.id)));
 }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [selectedRisks, sortedRisks]);

 const handleSelectRisk = useCallback((id: string) => {
 setSelectedRisks((prev: unknown) => {
 const next = new Set(prev);
 if (next.has(id)) {
 next.delete(id);
 } else {
 next.add(id);
 }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
 return next;
 });
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 // Handle actions
 const handleView = useCallback((risk: Risk) => {
 setSelectedRisk(risk);
 setViewDrawerOpen(true);
 }, []);

 const handleEdit = useCallback((risk: Risk) => {
 setSelectedRisk(risk);
 setEditDrawerOpen(true);
 }, []);

 const handleDelete = useCallback(async (risk: Risk) => {
 if (!confirm(`Are you sure you want to delete "${risk.title}"?`)) return;

 try {
 const { error } = await supabase
 .from("project_risks")
 .delete()
 .eq("id", risk.id);

 if (error) throw error;
 toast.success("Risk deleted successfully");
 loadRisks();
 } catch (error) {
 console.error("Error deleting risk:", error);
 toast.error("Failed to delete risk");
 }
 }, [supabase, loadRisks]);

 const handleDuplicate = useCallback(async (risk: Risk) => {
 try {
 const { id, created_at, updated_at, ...riskData } = risk;
 const { data, error } = await supabase
 .from("project_risks")
 .insert({
 ...riskData,
 title: `${risk.title} (Copy)`,
 status: "identified",
 identified_date: new Date().toISOString().split("T")[0]
 })
 .select()
 .single();

 if (error) throw error;
 toast.success("Risk duplicated successfully");
 loadRisks();
 } catch (error) {
 console.error("Error duplicating risk:", error);
 toast.error("Failed to duplicate risk");
 }
 }, [supabase, loadRisks]);

 // Bulk actions
 const handleBulkExport = useCallback(() => {
 const selectedData = sortedRisks.filter(r => selectedRisks.has(r.id));
 const csv = convertToCSV(selectedData.length > 0 ? selectedData : sortedRisks);
 downloadCSV(csv, "risks.csv");
 }, [sortedRisks, selectedRisks]);

 const convertToCSV = (data: Risk[]) => {
 const headers = ["Title", "Category", "Probability", "Impact", "Score", "Status", "Owner", "Project"];
 const rows = data.map(r => [
 r.title,
 r.category,
 r.probability,
 r.impact,
 r.risk_score.toString(),
 r.status,
 r.owner?.full_name || r.owner?.email || "",
 r.project?.name || "",
 ]);
 return [headers, ...rows].map(row => row.join(",")).join("\n");
 };

 const downloadCSV = (csv: string, filename: string) => {
 const blob = new Blob([csv], { type: "text/csv" });
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = filename;
 a.click();
 window.URL.revokeObjectURL(url);
 };

 // Get helper functions
 const getCategoryIcon = (category: string) => {
 switch (category) {
 case "technical": return Activity;
 case "financial": return TrendingUp;
 case "operational": return Target;
 case "legal": return Shield;
 case "environmental": return AlertCircle;
 case "safety": return AlertTriangle;
 default: return AlertTriangle;
 }
 };

 const getRiskLevelColor = (score: number) => {
 if (score >= 20) return "text-destructive";
 if (score >= 12) return "text-warning";
 if (score >= 6) return "text-yellow-500";
 return "text-success";
 };

 const getRiskLevelBadgeVariant = (score: number) => {
 if (score >= 20) return "destructive";
 if (score >= 12) return "warning";
 if (score >= 6) return "secondary";
 return "success";
 };

 const getStatusBadgeVariant = (status: string) => {
 switch (status) {
 case "identified": return "secondary";
 case "assessed": return "warning";
 case "mitigated": return "success";
 case "closed": return "default";
 default: return "outline";
 }
 };

 const getCategoryBadgeVariant = (category: string) => {
 switch (category) {
 case "technical": return "info";
 case "financial": return "warning";
 case "operational": return "secondary";
 case "legal": return "destructive";
 case "environmental": return "success";
 case "safety": return "destructive";
 default: return "default";
 }
 };

 return (
 <div className="space-y-md">
 {/* Header */}
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-md">
 <div>
 <h1 className="text-2xl font-bold">Risk Management</h1>
 <p className="text-muted-foreground">
 Identify, assess, and mitigate project risks
 </p>
 </div>
 <Button onClick={() => setCreateDrawerOpen(true)}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Add Risk
 </Button>
 </div>

 {/* Statistics Cards */}
 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-md mb-md">
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Total</p>
 <p className="text-2xl font-bold">{statistics.total}</p>
 </div>
 <AlertTriangle className="h-icon-lg w-icon-lg text-muted-foreground" />
 </div>
 </Card>
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Critical</p>
 <p className="text-2xl font-bold text-destructive">{statistics.critical}</p>
 </div>
 <Zap className="h-icon-lg w-icon-lg text-destructive" />
 </div>
 </Card>
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">High</p>
 <p className="text-2xl font-bold text-warning">{statistics.high}</p>
 </div>
 <TrendingUp className="h-icon-lg w-icon-lg text-warning" />
 </div>
 </Card>
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Mitigated</p>
 <p className="text-2xl font-bold text-success">{statistics.mitigated}</p>
 </div>
 <Shield className="h-icon-lg w-icon-lg text-success" />
 </div>
 </Card>
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Closed</p>
 <p className="text-2xl font-bold text-info">{statistics.closed}</p>
 </div>
 <CheckCircle className="h-icon-lg w-icon-lg text-info" />
 </div>
 </Card>
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Overdue</p>
 <p className="text-2xl font-bold text-destructive">{statistics.overdue}</p>
 </div>
 <Clock className="h-icon-lg w-icon-lg text-destructive" />
 </div>
 </Card>
 </div>

 {/* Filters and View Switcher */}
 <div className="flex flex-col lg:flex-row gap-md">
 <div className="flex-1 flex flex-wrap gap-sm">
 <div className="relative flex-1 min-w-content-narrow">
 <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground" />
 <Input
 placeholder="Search risks..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-9"
 />
 </div>
 
 <Select value={selectedCategory} onValueChange={setSelectedCategory}>
 <option value="all">All Categories</option>
 <option value="technical">Technical</option>
 <option value="financial">Financial</option>
 <option value="operational">Operational</option>
 <option value="legal">Legal</option>
 <option value="environmental">Environmental</option>
 <option value="safety">Safety</option>
 </Select>

 <Select value={selectedStatus} onValueChange={setSelectedStatus}>
 <option value="all">All Status</option>
 <option value="identified">Identified</option>
 <option value="assessed">Assessed</option>
 <option value="mitigated">Mitigated</option>
 <option value="closed">Closed</option>
 </Select>

 <Select value={selectedProbability} onValueChange={setSelectedProbability}>
 <option value="all">All Probability</option>
 <option value="very_low">Very Low</option>
 <option value="low">Low</option>
 <option value="medium">Medium</option>
 <option value="high">High</option>
 <option value="very_high">Very High</option>
 </Select>

 {!projectId && projects.length > 0 && (
 <Select value={selectedProject} onValueChange={setSelectedProject}>
 <option value="all">All Projects</option>
 {projects.map((project) => (
 <option key={project.id} value={project.id}>
 {project.name}
 </option>
 ))}
 </Select>
 )}
 </div>

 {/* View Switcher */}
 <div className="flex items-center gap-sm">
 <Button variant="outline" size="sm" onClick={handleBulkExport}>
 <Download className="mr-2 h-icon-xs w-icon-xs" />
 Export
 </Button>

 <div className="flex rounded-md shadow-sm">
 {VIEW_TYPES.map((view) => {
 const Icon = view.icon;
 return (
 <Button
 key={view.id}
 variant={viewType === view.id ? "default" : "outline"}
 size="sm"
 onClick={() => setViewType(view.id as ViewType)}
 className="rounded-none first:rounded-l-md last:rounded-r-md"
 >
 <Icon className="h-icon-xs w-icon-xs" />
 </Button>
 );
 })}
 </div>
 </div>
 </div>
 </Card>

 {/* Bulk Actions Bar */}
 {selectedRisks.size > 0 && (
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <Checkbox
 checked={selectedRisks.size === sortedRisks.length}
 onChange={handleSelectAll}
 />
 <span className="text-sm text-muted-foreground">
 {selectedRisks.size} selected
 </span>
 </div>
 <div className="flex items-center gap-sm">
 <Button variant="outline" size="sm" onClick={handleBulkExport}>
 Export Selected
 </Button>
 <Button
 variant="destructive"
 size="sm"
 onClick={async () => {
 if (!confirm(`Delete ${selectedRisks.size} risks?`)) return;
 const { error } = await supabase
 .from("project_risks")
 .delete()
 .in("id", Array.from(selectedRisks));
 if (!error) {
 toast.success("Risks deleted");
 setSelectedRisks(new Set());
 loadRisks();
 }
 }}
 >
 Delete Selected
 </Button>
 </div>
 </div>
 </Card>
 )}

 {/* Content Views */}
 <Card className="p-lg">
 {loading ? (
 <div className="flex items-center justify-center py-xl">
 <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary"></div>
 </div>
 ) : sortedRisks.length === 0 ? (
 <div className="text-center py-xl">
 <AlertTriangle className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No risks found</h3>
 <p className="text-muted-foreground mb-md">
 {searchQuery || selectedCategory !== "all" || selectedStatus !== "all"
 ? "Try adjusting your filters"
 : "Get started by identifying your first risk"}
 </p>
 {!searchQuery && selectedCategory === "all" && selectedStatus === "all" && (
 <Button onClick={() => setCreateDrawerOpen(true)}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Add Risk
 </Button>
 )}
 </div>
 ) : (
 <>
 {viewType === "grid" && (
 <RiskGridView
 risks={sortedRisks}
 selectedRisks={selectedRisks}
 onSelectRisk={handleSelectRisk}
 onView={handleView}
 onEdit={handleEdit}
 onDelete={handleDelete}
 onDuplicate={handleDuplicate}
 getCategoryIcon={getCategoryIcon}
 getRiskLevelColor={getRiskLevelColor}
 getRiskLevelBadgeVariant={getRiskLevelBadgeVariant}
 getStatusBadgeVariant={getStatusBadgeVariant}
 getCategoryBadgeVariant={getCategoryBadgeVariant}
 />
 )}
 {viewType === "matrix" && (
 <RiskMatrixView
 riskMatrix={riskMatrix}
 onView={handleView}
 getRiskLevelColor={getRiskLevelColor}
 />
 )}
 {viewType === "heatmap" && (
 <RiskHeatmapView
 risks={sortedRisks}
 onView={handleView}
 />
 )}
 {viewType === "list" && (
 <RiskListView
 risks={sortedRisks}
 selectedRisks={selectedRisks}
 fieldVisibility={fieldVisibility}
 sortField={sortField}
 sortDirection={sortDirection}
 onSelectAll={handleSelectAll}
 onSelectRisk={handleSelectRisk}
 onSort={(field) => {
 if (sortField === field) {
 setSortDirection(sortDirection === "asc" ? "desc" : "asc");
 } else {
 setSortField(field);
 setSortDirection("asc");
 }
 }}
 onView={handleView}
 onEdit={handleEdit}
 onDelete={handleDelete}
 onDuplicate={handleDuplicate}
 getRiskLevelBadgeVariant={getRiskLevelBadgeVariant}
 getStatusBadgeVariant={getStatusBadgeVariant}
 getCategoryBadgeVariant={getCategoryBadgeVariant}
 />
 )}
 </>
 )}
 </Card>

 {/* Drawers */}
 <CreateRiskDrawer
 open={createDrawerOpen}
 onClose={() => setCreateDrawerOpen(false)}
 orgId={orgId}
 projectId={projectId}
 projects={projects}
 users={users}
 onSuccess={loadRisks}
 />
 
 {selectedRisk && (
 <>
 <EditRiskDrawer
 open={editDrawerOpen}
 onClose={() => setEditDrawerOpen(false)}
 risk={selectedRisk}
 projects={projects}
 users={users}
 onSuccess={loadRisks}
 />
 
 <ViewRiskDrawer
 open={viewDrawerOpen}
 onClose={() => setViewDrawerOpen(false)}
 risk={selectedRisk}
 onEdit={() => {
 setViewDrawerOpen(false);
 setEditDrawerOpen(true);
 }}
 getCategoryIcon={getCategoryIcon}
 getRiskLevelColor={getRiskLevelColor}
 getRiskLevelBadgeVariant={getRiskLevelBadgeVariant}
 getStatusBadgeVariant={getStatusBadgeVariant}
 getCategoryBadgeVariant={getCategoryBadgeVariant}
 />
 </>
 )}
 </div>
 );
}
