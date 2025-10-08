import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2, FolderOpen, PlayCircle, PauseCircle, CheckCircle2, XCircle, DollarSign, Users, AlertTriangle, Target, Briefcase, BarChart3, Shield, Zap, Package, Building, MapPin, Camera, Megaphone, ClipboardCheck, Upload, Download, Archive, Layers, Database, CreditCard, Receipt, PieChart, ShoppingCart, UserCheck, UserPlus, Mail, Phone, Globe, Truck, Box, Tag, Star, Heart, MessageSquare, Bell, Filter, Grid3x3, List, LayoutGrid } from "lucide-react";
import { CHART_COLORS } from '@ghxstship/config/tokens/chart-colors';
import type { OverviewConfig } from "./useEnterpriseOverview";

// Projects Module Configuration
export const projectsOverviewConfig: OverviewConfig = {
 module: "Projects",
 tables: {
 main: "projects",
 tasks: "project_tasks",
 milestones: "project_milestones",
 risks: "project_risks",
 files: "project_files",
 activity: "activity_logs"
 },
 metrics: [
 {
 id: "total-projects",
 title: "Total Projects",
 query: (data) => data.main?.length || 0,
 subtitle: (data) => `${data.main?.filter((p: unknown) => p.status === "active").length || 0} active`,
 icon: FolderOpen,
 iconColor: "text-primary",
 trend: (data) => data.main?.length > 0 ? "up" : "neutral",
 route: "/projects"
 },
 {
 id: "completion-rate",
 title: "Completion Rate",
 query: (data) => {
 const projects = data.main || [];
 if (projects.length === 0) return "0%";
 const avg = projects.reduce((sum: number, p: unknown) => sum + (p.progress || 0), 0) / projects.length;
 return `${Math.round(avg)}%`;
 },
 icon: Target,
 iconColor: "text-info",
 route: "/projects/tasks"
 },
 {
 id: "total-budget",
 title: "Total Budget",
 query: (data) => {
 const total = (data.main || []).reduce((sum: number, p: unknown) => sum + (p.budget || 0), 0);
 return `$${(total / 1000).toFixed(0)}K`;
 },
 icon: DollarSign,
 iconColor: "text-success",
 route: "/projects?view=budget"
 },
 {
 id: "team-members",
 title: "Team Members",
 query: (data) => {
 const members = new Set();
 (data.main || []).forEach((p: unknown) => {
 if (p.team_members) p.team_members.forEach((m: string) => members.add(m));
 });
 return members.size;
 },
 icon: Users,
 iconColor: "text-purple-500",
 route: "/projects/team"
 },
 ],
 statusFields: {
 field: "status",
 values: [
 { value: "planning", label: "Planning", color: CHART_COLORS.muted, icon: Clock },
 { value: "active", label: "Active", color: CHART_COLORS.success, icon: PlayCircle },
 { value: "on_hold", label: "On Hold", color: CHART_COLORS.warning, icon: PauseCircle },
 { value: "completed", label: "Completed", color: CHART_COLORS.info, icon: CheckCircle2 },
 { value: "cancelled", label: "Cancelled", color: CHART_COLORS.error, icon: XCircle },
 ]
 },
 quickActions: [
 { id: "new", label: "New Project", icon: Plus, route: "/projects?action=create", variant: "default" },
 { id: "tasks", label: "Tasks", icon: CheckCircle2, route: "/projects/tasks" },
 { id: "milestones", label: "Milestones", icon: Target, route: "/projects/milestones" },
 { id: "risks", label: "Risks", icon: AlertTriangle, route: "/projects/risks" },
 { id: "reports", label: "Reports", icon: BarChart3, route: "/projects/reports" },
 { id: "settings", label: "Settings", icon: Settings, route: "/projects/settings" },
 ]
};

// Activations Module Configuration
export const activationsOverviewConfig: OverviewConfig = {
 module: "Activations",
 tables: {
 main: "project_activations",
 activity: "activity_logs"
 },
 metrics: [
 {
 id: "total-activations",
 title: "Total Activations",
 query: (data) => data.main?.length || 0,
 subtitle: (data) => `${data.main?.filter((a: unknown) => a.status === "active").length || 0} active`,
 icon: Megaphone,
 iconColor: "text-primary",
 route: "/projects/activations"
 },
 {
 id: "upcoming",
 title: "Upcoming",
 query: (data) => data.main?.filter((a: unknown) => a.status === "scheduled").length || 0,
 icon: Calendar,
 iconColor: "text-warning",
 route: "/projects/activations?status=scheduled"
 },
 {
 id: "total-budget",
 title: "Total Budget",
 query: (data) => {
 const total = (data.main || []).reduce((sum: number, a: unknown) => sum + (a.budget || 0), 0);
 return `$${(total / 1000).toFixed(0)}K`;
 },
 icon: DollarSign,
 iconColor: "text-success"
 },
 {
 id: "completion",
 title: "Completed",
 query: (data) => data.main?.filter((a: unknown) => a.status === "completed").length || 0,
 icon: CheckCircle2,
 iconColor: "text-info",
 route: "/projects/activations?status=completed"
 },
 ],
 statusFields: {
 field: "status",
 values: [
 { value: "draft", label: "Draft", color: CHART_COLORS.muted, icon: FileText },
 { value: "scheduled", label: "Scheduled", color: CHART_COLORS.warning, icon: Calendar },
 { value: "active", label: "Active", color: CHART_COLORS.success, icon: Zap },
 { value: "completed", label: "Completed", color: CHART_COLORS.info, icon: CheckCircle2 },
 { value: "cancelled", label: "Cancelled", color: CHART_COLORS.error, icon: XCircle },
 ]
 },
 quickActions: [
 { id: "new", label: "New Activation", icon: Plus, route: "/projects/activations?action=create", variant: "default" },
 { id: "calendar", label: "Calendar", icon: Calendar, route: "/projects/activations?view=calendar" },
 { id: "reports", label: "Reports", icon: BarChart3, route: "/projects/activations/reports" },
 ]
};

// Locations Module Configuration
export const locationsOverviewConfig: OverviewConfig = {
 module: "Locations",
 tables: {
 main: "locations",
 activity: "activity_logs"
 },
 metrics: [
 {
 id: "total-locations",
 title: "Total Locations",
 query: (data) => data.main?.length || 0,
 subtitle: (data) => `${data.main?.filter((l: unknown) => l.availability_status === "available").length || 0} available`,
 icon: MapPin,
 iconColor: "text-primary",
 route: "/projects/locations"
 },
 {
 id: "capacity",
 title: "Total Capacity",
 query: (data) => {
 const total = (data.main || []).reduce((sum: number, l: unknown) => sum + (l.capacity || 0), 0);
 return total.toLocaleString();
 },
 subtitle: () => "people",
 icon: Users,
 iconColor: "text-info"
 },
 {
 id: "featured",
 title: "Featured",
 query: (data) => data.main?.filter((l: unknown) => l.is_featured).length || 0,
 icon: Star,
 iconColor: "text-warning",
 route: "/projects/locations?featured=true"
 },
 {
 id: "types",
 title: "Location Types",
 query: (data) => {
 const types = new Set((data.main || []).map((l: unknown) => l.type));
 return types.size;
 },
 icon: Building,
 iconColor: "text-purple-500"
 },
 ],
 statusFields: {
 field: "availability_status",
 values: [
 { value: "available", label: "Available", color: CHART_COLORS.success, icon: CheckCircle2 },
 { value: "booked", label: "Booked", color: CHART_COLORS.warning, icon: Calendar },
 { value: "maintenance", label: "Maintenance", color: CHART_COLORS.muted, icon: Settings },
 { value: "unavailable", label: "Unavailable", color: CHART_COLORS.error, icon: XCircle },
 ]
 },
 quickActions: [
 { id: "new", label: "Add Location", icon: Plus, route: "/projects/locations?action=create", variant: "default" },
 { id: "map", label: "Map View", icon: MapPin, route: "/projects/locations?view=map" },
 { id: "gallery", label: "Gallery", icon: Camera, route: "/projects/locations?view=gallery" },
 ]
};

// Inspections Module Configuration
export const inspectionsOverviewConfig: OverviewConfig = {
 module: "Inspections",
 tables: {
 main: "project_inspections",
 activity: "activity_logs"
 },
 metrics: [
 {
 id: "total-inspections",
 title: "Total Inspections",
 query: (data) => data.main?.length || 0,
 subtitle: (data) => `${data.main?.filter((i: unknown) => i.status === "scheduled").length || 0} scheduled`,
 icon: ClipboardCheck,
 iconColor: "text-primary",
 route: "/projects/inspections"
 },
 {
 id: "pass-rate",
 title: "Pass Rate",
 query: (data) => {
 const completed = data.main?.filter((i: unknown) => i.status === "completed") || [];
 if (completed.length === 0) return "N/A";
 const passed = completed.filter((i: unknown) => i.is_passed).length;
 return `${Math.round((passed / completed.length) * 100)}%`;
 },
 icon: Shield,
 iconColor: "text-success"
 },
 {
 id: "avg-score",
 title: "Avg Score",
 query: (data) => {
 const withScores = data.main?.filter((i: unknown) => i.score !== null) || [];
 if (withScores.length === 0) return "N/A";
 const avg = withScores.reduce((sum: number, i: unknown) => sum + i.score, 0) / withScores.length;
 return Math.round(avg);
 },
 subtitle: () => "out of 100",
 icon: Target,
 iconColor: "text-info"
 },
 {
 id: "follow-ups",
 title: "Follow-ups",
 query: (data) => data.main?.filter((i: unknown) => i.follow_up_required).length || 0,
 icon: AlertTriangle,
 iconColor: "text-warning",
 route: "/projects/inspections?follow_up=true"
 },
 ],
 statusFields: {
 field: "status",
 values: [
 { value: "scheduled", label: "Scheduled", color: CHART_COLORS.muted, icon: Calendar },
 { value: "in_progress", label: "In Progress", color: CHART_COLORS.warning, icon: Activity },
 { value: "completed", label: "Completed", color: CHART_COLORS.success, icon: CheckCircle2 },
 { value: "failed", label: "Failed", color: CHART_COLORS.error, icon: XCircle },
 { value: "cancelled", label: "Cancelled", color: CHART_COLORS.muted, icon: XCircle },
 ]
 },
 quickActions: [
 { id: "new", label: "Schedule Inspection", icon: Plus, route: "/projects/inspections?action=create", variant: "default" },
 { id: "calendar", label: "Calendar", icon: Calendar, route: "/projects/inspections?view=calendar" },
 { id: "reports", label: "Reports", icon: BarChart3, route: "/projects/inspections/reports" },
 ]
};

// Files Module Configuration
export const filesOverviewConfig: OverviewConfig = {
 module: "Files",
 tables: {
 main: "project_files",
 activity: "activity_logs"
 },
 metrics: [
 {
 id: "total-files",
 title: "Total Files",
 query: (data) => data.main?.length || 0,
 icon: FileText,
 iconColor: "text-primary",
 route: "/projects/files"
 },
 {
 id: "storage-used",
 title: "Storage Used",
 query: (data) => {
 const bytes = (data.main || []).reduce((sum: number, f: unknown) => sum + (f.size || 0), 0);
 const gb = bytes / (1024 * 1024 * 1024);
 return `${gb.toFixed(1)} GB`;
 },
 icon: Database,
 iconColor: "text-info"
 },
 {
 id: "recent-uploads",
 title: "Recent Uploads",
 query: (data) => {
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 return data.main?.filter((f: unknown) => new Date(f.created_at) >= today).length || 0;
 },
 subtitle: () => "today",
 icon: Upload,
 iconColor: "text-success"
 },
 {
 id: "shared",
 title: "Shared Files",
 query: (data) => data.main?.filter((f: unknown) => f.access_level === "public").length || 0,
 icon: Users,
 iconColor: "text-purple-500",
 route: "/projects/files?access=public"
 },
 ],
 statusFields: {
 field: "category",
 values: [
 { value: "document", label: "Documents", color: CHART_COLORS.info, icon: FileText },
 { value: "image", label: "Images", color: CHART_COLORS.success, icon: Camera },
 { value: "video", label: "Videos", color: CHART_COLORS.warning, icon: Camera },
 { value: "archive", label: "Archives", color: CHART_COLORS.muted, icon: Archive },
 { value: "other", label: "Other", color: CHART_COLORS.muted, icon: FileText },
 ]
 },
 quickActions: [
 { id: "upload", label: "Upload Files", icon: Upload, route: "/projects/files?action=upload", variant: "default" },
 { id: "folders", label: "Folders", icon: FolderOpen, route: "/projects/files?view=folders" },
 { id: "shared", label: "Shared", icon: Users, route: "/projects/files?filter=shared" },
 ]
};

// Export all configurations
export const overviewConfigs = {
 projects: projectsOverviewConfig,
 activations: activationsOverviewConfig,
 locations: locationsOverviewConfig,
 inspections: inspectionsOverviewConfig,
 files: filesOverviewConfig
};
