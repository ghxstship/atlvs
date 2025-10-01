"use client";

import { FolderOpen, PlayCircle, PauseCircle, CheckCircle2, XCircle, Clock, DollarSign, Users, TrendingUp, AlertTriangle, Calendar, Target, Activity, Briefcase, Settings, Plus, FileText, BarChart3, Shield, Zap, Package, GitBranch, Layers } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@ghxstship/auth";
import { Button, Card, Badge, toast } from "@ghxstship/ui";
import EnterpriseOverview, {
 type MetricCard,
 type StatusItem,
 type ActivityItem,
 type QuickAction,
 type OverviewSection,
} from "@/app/_components/shared/EnterpriseOverview";
import { format, parseISO, isBefore, differenceInDays } from "date-fns";

interface ProjectsOverviewEnhancedProps {
 orgId: string;
 userId: string;
 userEmail: string;
}

interface ProjectStats {
 total: number;
 active: number;
 planning: number;
 onHold: number;
 completed: number;
 cancelled: number;
 totalBudget: number;
 totalSpent: number;
 averageProgress: number;
 overdue: number;
 atRisk: number;
 healthy: number;
 totalTasks: number;
 completedTasks: number;
 totalMilestones: number;
 completedMilestones: number;
 totalRisks: number;
 highRisks: number;
 totalTeamMembers: number;
 activeClients: number;
}

export default function ProjectsOverviewEnhanced({ orgId }: ProjectsOverviewEnhancedProps) {
 const router = useRouter();
 const supabase = createBrowserClient();
 
 const [loading, setLoading] = useState(true);
 const [stats, setStats] = useState<ProjectStats | null>(null);
 const [recentProjects, setRecentProjects] = useState<any[]>([]);
 const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
 const [upcomingMilestones, setUpcomingMilestones] = useState<any[]>([]);
 const [topRisks, setTopRisks] = useState<any[]>([]);

 // Load all overview data
 const loadOverviewData = useCallback(async () => {
 setLoading(true);
 try {
 // Load projects with related data
 const { data: projects } = await supabase
 .from("projects")
 .select(`
 *,
 client:clients(id, name),
 manager:users!projects_manager_id_fkey(id, email, full_name)
 `)
 .eq("organization_id", orgId);

 // Load tasks
 const { data: tasks } = await supabase
 .from("project_tasks")
 .select("*")
 .eq("organization_id", orgId);

 // Load milestones
 const { data: milestones } = await supabase
 .from("project_milestones")
 .select("*")
 .eq("organization_id", orgId)
 .order("due_date", { ascending: true });

 // Load risks
 const { data: risks } = await supabase
 .from("project_risks")
 .select("*")
 .eq("organization_id", orgId)
 .order("impact", { ascending: false });

 // Load recent activity
 const { data: activityData } = await supabase
 .from("activity_logs")
 .select(`
 *,
 user:users!activity_logs_user_id_fkey(id, email, full_name)
 `)
 .eq("organization_id", orgId)
 .eq("resource_type", "project")
 .order("created_at", { ascending: false })
 .limit(10);

 if (projects) {
 // Calculate statistics
 const now = new Date();
 const activeProjects = projects.filter(p => p.status === "active");
 const overdueProjects = activeProjects.filter(p => 
 p.end_date && isBefore(parseISO(p.end_date), now)
 );
 
 const atRiskProjects = activeProjects.filter(p => {
 if (!p.end_date) return false;
 const daysUntilDue = differenceInDays(parseISO(p.end_date), now);
 const progressExpected = ((now.getTime() - parseISO(p.start_date || p.created_at).getTime()) / 
 (parseISO(p.end_date).getTime() - parseISO(p.start_date || p.created_at).getTime())) * 100;
 return daysUntilDue < 14 || (p.progress || 0) < progressExpected - 20;
 });

 const healthyProjects = activeProjects.filter(p => 
 !overdueProjects.includes(p) && !atRiskProjects.includes(p)
 );

 // Get unique team members
 const allTeamMembers = new Set<string>();
 projects.forEach(p => {
 if (p.team_members) {
 p.team_members.forEach((m: string) => allTeamMembers.add(m));
 }
 if (p.manager_id) allTeamMembers.add(p.manager_id);
 });

 // Get unique clients
 const activeClients = new Set(
 projects
 .filter(p => p.client_id && p.status === "active")
 .map(p => p.client_id)
 );

 setStats({
 total: projects.length,
 active: activeProjects.length,
 planning: projects.filter(p => p.status === "planning").length,
 onHold: projects.filter(p => p.status === "on_hold").length,
 completed: projects.filter(p => p.status === "completed").length,
 cancelled: projects.filter(p => p.status === "cancelled").length,
 totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
 totalSpent: projects.reduce((sum, p) => sum + (p.actual_cost || 0), 0),
 averageProgress: projects.length > 0 
 ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
 : 0,
 overdue: overdueProjects.length,
 atRisk: atRiskProjects.length,
 healthy: healthyProjects.length,
 totalTasks: tasks?.length || 0,
 completedTasks: tasks?.filter(t => t.status === "done").length || 0,
 totalMilestones: milestones?.length || 0,
 completedMilestones: milestones?.filter(m => m.status === "completed").length || 0,
 totalRisks: risks?.length || 0,
 highRisks: risks?.filter(r => r.impact === "high" || r.impact === "critical").length || 0,
 totalTeamMembers: allTeamMembers.size,
 activeClients: activeClients.size,
 });

 // Set recent projects
 setRecentProjects(
 projects
 .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
 .slice(0, 5)
 );

 // Set upcoming milestones
 setUpcomingMilestones(
 (milestones || [])
 .filter(m => m.status !== "completed" && m.due_date)
 .slice(0, 5)
 );

 // Set top risks
 setTopRisks(
 (risks || [])
 .filter(r => r.status === "active")
 .slice(0, 5)
 );

 // Format activity
 setRecentActivity(
 (activityData || []).map(a => ({
 id: a.id,
 title: `${a.action} project`,
 description: a.details?.name || "Project updated",
 timestamp: a.created_at,
 type: a.action as unknown,
 user: a.user ? {
 name: a.user.full_name || a.user.email,
 } : undefined,
 onClick: () => router.push(`/projects/${a.resource_id}`),
 }))
 );
 }
 } catch (error) {
 console.error("Error loading overview data:", error);
 toast.error("Failed to load overview data");
 } finally {
 setLoading(false);
 }
 }, [supabase, orgId, router]);

 useEffect(() => {
 loadOverviewData();
 }, [loadOverviewData]);

 // Setup real-time subscriptions
 useEffect(() => {
 const channel = supabase
 .channel("projects-overview")
 .on(
 "postgres_changes",
 {
 event: "*",
 schema: "public",
 table: "projects",
 filter: `organization_id=eq.${orgId}`,
 },
 () => {
 loadOverviewData();
 }
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, [supabase, orgId, loadOverviewData]);

 // Prepare metrics
 const metrics: MetricCard[] = useMemo(() => {
 if (!stats) return [];
 
 return [
 {
 id: "total-projects",
 title: "Total Projects",
 value: stats.total,
 subtitle: `${stats.active} active`,
 icon: FolderOpen,
 iconColor: "text-primary",
 trend: stats.total > 0 ? "up" : "neutral",
 onClick: () => router.push("/projects"),
 },
 {
 id: "project-health",
 title: "Project Health",
 value: `${stats.healthy}/${stats.active}`,
 subtitle: "Healthy projects",
 icon: Shield,
 iconColor: stats.atRisk > 0 ? "text-warning" : "text-success",
 change: stats.active > 0 ? Math.round((stats.healthy / stats.active) * 100) : 0,
 changeLabel: "health score",
 onClick: () => router.push("/projects?filter=health"),
 },
 {
 id: "total-budget",
 title: "Total Budget",
 value: `$${(stats.totalBudget / 1000).toFixed(0)}K`,
 subtitle: `$${(stats.totalSpent / 1000).toFixed(0)}K spent`,
 icon: DollarSign,
 iconColor: "text-success",
 trend: stats.totalSpent <= stats.totalBudget ? "up" : "down",
 change: stats.totalBudget > 0 
 ? Math.round((stats.totalSpent / stats.totalBudget) * 100)
 : 0,
 changeLabel: "budget utilized",
 onClick: () => router.push("/projects?view=budget"),
 },
 {
 id: "completion-rate",
 title: "Completion Rate",
 value: `${stats.averageProgress}%`,
 subtitle: `${stats.completedTasks}/${stats.totalTasks} tasks`,
 icon: Target,
 iconColor: "text-info",
 trend: stats.averageProgress > 50 ? "up" : "down",
 onClick: () => router.push("/projects/tasks"),
 },
 ];
 }, [stats, router]);

 // Prepare status breakdown
 const statusBreakdown: StatusItem[] = useMemo(() => {
 if (!stats) return [];
 
 return [
 {
 id: "planning",
 label: "Planning",
 count: stats.planning,
 color: "#6B7280",
 icon: Clock,
 onClick: () => router.push("/projects?status=planning"),
 },
 {
 id: "active",
 label: "Active",
 count: stats.active,
 color: "#10B981",
 icon: PlayCircle,
 onClick: () => router.push("/projects?status=active"),
 },
 {
 id: "on-hold",
 label: "On Hold",
 count: stats.onHold,
 color: "#F59E0B",
 icon: PauseCircle,
 onClick: () => router.push("/projects?status=on_hold"),
 },
 {
 id: "completed",
 label: "Completed",
 count: stats.completed,
 color: "#3B82F6",
 icon: CheckCircle2,
 onClick: () => router.push("/projects?status=completed"),
 },
 {
 id: "cancelled",
 label: "Cancelled",
 count: stats.cancelled,
 color: "#EF4444",
 icon: XCircle,
 onClick: () => router.push("/projects?status=cancelled"),
 },
 ];
 }, [stats, router]);

 // Prepare quick actions
 const quickActions: QuickAction[] = [
 {
 id: "new-project",
 label: "New Project",
 icon: Plus,
 onClick: () => router.push("/projects?action=create"),
 variant: "default",
 },
 {
 id: "view-tasks",
 label: "View Tasks",
 icon: CheckCircle2,
 onClick: () => router.push("/projects/tasks"),
 },
 {
 id: "milestones",
 label: "Milestones",
 icon: Target,
 onClick: () => router.push("/projects/milestones"),
 },
 {
 id: "risks",
 label: "Risks",
 icon: AlertTriangle,
 onClick: () => router.push("/projects/risks"),
 },
 {
 id: "reports",
 label: "Reports",
 icon: BarChart3,
 onClick: () => router.push("/projects/reports"),
 },
 {
 id: "settings",
 label: "Settings",
 icon: Settings,
 onClick: () => router.push("/projects/settings"),
 },
 ];

 // Prepare custom sections
 const customSections: OverviewSection[] = useMemo(() => {
 const sections: OverviewSection[] = [];

 // Recent Projects section
 if (recentProjects.length > 0) {
 sections.push({
 id: "recent-projects",
 title: "Recent Projects",
 description: "Latest projects in your organization",
 actions: (
 <Button variant="outline" size="sm" onClick={() => router.push("/projects")}>
 View All
 </Button>
 ),
 content: (
 <div className="space-y-sm">
 {recentProjects.map((project) => (
 <div
 key={project.id}
 className="flex items-center justify-between p-sm border rounded-lg hover:bg-muted/50 cursor-pointer"
 onClick={() => router.push(`/projects/${project.id}`)}
 >
 <div className="flex-1">
 <div className="flex items-center gap-sm">
 <h4 className="font-medium">{project.name}</h4>
 <Badge variant={
 project.status === "active" ? "success" :
 project.status === "completed" ? "info" :
 project.status === "on_hold" ? "warning" :
 "secondary"
 }>
 {project.status}
 </Badge>
 </div>
 <div className="flex items-center gap-md mt-xs text-sm text-muted-foreground">
 {project.manager && (
 <span className="flex items-center gap-xs">
 <Users className="h-3 w-3" />
 {project.manager.full_name || project.manager.email}
 </span>
 )}
 {project.budget && (
 <span className="flex items-center gap-xs">
 <DollarSign className="h-3 w-3" />
 ${(project.budget / 1000).toFixed(0)}K
 </span>
 )}
 <span className="flex items-center gap-xs">
 <Calendar className="h-3 w-3" />
 {format(parseISO(project.created_at), "MMM d")}
 </span>
 </div>
 </div>
 {project.progress !== undefined && (
 <div className="text-right">
 <div className="text-sm font-medium">{project.progress}%</div>
 <div className="text-xs text-muted-foreground">Progress</div>
 </div>
 )}
 </div>
 ))}
 </div>
 ),
 });
 }

 // Upcoming Milestones section
 if (upcomingMilestones.length > 0) {
 sections.push({
 id: "upcoming-milestones",
 title: "Upcoming Milestones",
 description: "Important project milestones",
 actions: (
 <Button variant="outline" size="sm" onClick={() => router.push("/projects/milestones")}>
 View All
 </Button>
 ),
 content: (
 <div className="space-y-sm">
 {upcomingMilestones.map((milestone) => (
 <div
 key={milestone.id}
 className="flex items-center justify-between p-sm border rounded-lg"
 >
 <div className="flex-1">
 <p className="font-medium">{milestone.title}</p>
 <p className="text-sm text-muted-foreground mt-xs">
 Due {format(parseISO(milestone.due_date), "MMM d, yyyy")}
 </p>
 </div>
 <Badge variant={
 differenceInDays(parseISO(milestone.due_date), new Date()) < 7
 ? "destructive"
 : "secondary"
 }>
 {differenceInDays(parseISO(milestone.due_date), new Date())} days
 </Badge>
 </div>
 ))}
 </div>
 ),
 });
 }

 // Top Risks section
 if (topRisks.length > 0) {
 sections.push({
 id: "top-risks",
 title: "Top Risks",
 description: "High-priority risks requiring attention",
 actions: (
 <Button variant="outline" size="sm" onClick={() => router.push("/projects/risks")}>
 Manage Risks
 </Button>
 ),
 content: (
 <div className="space-y-sm">
 {topRisks.map((risk) => (
 <div
 key={risk.id}
 className="flex items-center justify-between p-sm border rounded-lg"
 >
 <div className="flex-1">
 <p className="font-medium">{risk.title}</p>
 <p className="text-sm text-muted-foreground mt-xs">
 {risk.description}
 </p>
 </div>
 <Badge variant={
 risk.impact === "critical" ? "destructive" :
 risk.impact === "high" ? "warning" :
 "secondary"
 }>
 {risk.impact}
 </Badge>
 </div>
 ))}
 </div>
 ),
 });
 }

 return sections;
 }, [recentProjects, upcomingMilestones, topRisks, router]);

 return (
 <EnterpriseOverview
 title="Projects Overview"
 description="Monitor and manage all your projects from a single dashboard"
 metrics={metrics}
 statusBreakdown={statusBreakdown}
 recentActivity={recentActivity}
 quickActions={quickActions}
 customSections={customSections}
 onRefresh={loadOverviewData}
 onExport={() => {
 // Export functionality
 toast.success("Exporting project data...");
 }}
 onSettings={() => router.push("/projects/settings")}
 loading={loading}
 emptyState={{
 title: "No Projects Yet",
 description: "Create your first project to get started with project management",
 icon: FolderOpen,
 actions: (
 <div className="flex gap-sm">
 <Button onClick={() => router.push("/projects?action=create")}>
 <Plus className="h-icon-xs w-icon-xs mr-xs" />
 Create Project
 </Button>
 <Button variant="outline" onClick={() => {
 // Seed demo data
 toast.success("Demo data seeded");
 }}>
 Seed Demo Data
 </Button>
 </div>
 ),
 }}
 />
 );
}
