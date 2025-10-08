"use client";

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from "@ghxstship/auth";
import { toast } from "@ghxstship/ui";
import type { 
 MetricCard, 
 StatusItem, 
 ActivityItem, 
 QuickAction,
 OverviewSection 
} from "./EnterpriseOverview";

// Configuration for different module overviews
export interface OverviewConfig {
 module: string;
 tables: {
 main: string;
 // eslint-disable-next-line react-hooks/exhaustive-deps
 tasks?: string;
 milestones?: string;
 risks?: string;
 files?: string;
 activity?: string;
 };
 metrics: Array<{
 id: string;
 title: string;
 query: (data: unknown) => number | string;
 subtitle?: (data: unknown) => string;
 icon: unknown;
 iconColor?: string;
 trend?: (data: unknown) => "up" | "down" | "neutral";
 change?: (data: unknown) => number;
 changeLabel?: string;
 route?: string;
 }>;
 statusFields: {
 field: string;
 values: Array<{
 value: string;
 label: string;
 color: string;
 icon: unknown;
 }>;
 };
 quickActions: Array<{
 id: string;
 label: string;
 icon: unknown;
 route: string;
 variant?: "default" | "outline" | "destructive" | "secondary";
 }>;
 customSections?: Array<{
 id: string;
 title: string;
 description?: string;
 dataKey: string;
 renderItem: (item: unknown) => React.ReactNode;
 route?: string;
 }>;
}

// Hook to use the enterprise overview system
export function useEnterpriseOverview(config: OverviewConfig, orgId: string) {
 const supabase = createBrowserClient();
 
 const [loading, setLoading] = useState(true);
 const [data, setData] = useState<Record<string, unknown>({});
 const [metrics, setMetrics] = useState<MetricCard[]>([]);
 const [statusBreakdown, setStatusBreakdown] = useState<StatusItem[]>([]);
 const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
 const [customSections, setCustomSections] = useState<OverviewSection[]>([]);

 // Load all data based on configuration
 // eslint-disable-next-line react-hooks/exhaustive-deps
 const loadData = useCallback(async () => {
 setLoading(true);
 try {
 const results: Record<string, unknown> = {};

 // Load main table data
 const { data: mainData } = await supabase
 .from(config.tables.main)
 .select("*")
 .eq("organization_id", orgId);
 results.main = mainData || [];

 // Load optional tables
 if (config.tables.tasks) {
 const { data: tasksData } = await supabase
 .from(config.tables.tasks)
 .select("*")
 .eq("organization_id", orgId);
 results.tasks = tasksData || [];
 }

 if (config.tables.milestones) {
 const { data: milestonesData } = await supabase
 .from(config.tables.milestones)
 .select("*")
 .eq("organization_id", orgId);
 results.milestones = milestonesData || [];
 }

 if (config.tables.risks) {
 const { data: risksData } = await supabase
 .from(config.tables.risks)
 .select("*")
 .eq("organization_id", orgId);
 results.risks = risksData || [];
 }

 if (config.tables.files) {
 const { data: filesData } = await supabase
 .from(config.tables.files)
 .select("*")
 .eq("organization_id", orgId);
 results.files = filesData || [];
 }

 // Load activity
 if (config.tables.activity) {
 const { data: activityData } = await supabase
 .from(config.tables.activity)
 .select(`
 *,
 user:users!activity_logs_user_id_fkey(id, email, full_name)
 `)
 .eq("organization_id", orgId)
 .eq("resource_type", config.module.toLowerCase())
 .order("created_at", { ascending: false })
 .limit(10);
 
 results.activity = (activityData || []).map(a => ({
 id: a.id,
 title: `${a.action} ${config.module.toLowerCase()}`,
 description: a.details?.name || `${config.module} updated`,
 timestamp: a.created_at,
 type: a.action as unknown,
 user: a.user ? {
 name: a.user.full_name || a.user.email
 } : undefined,
 onClick: () => window.location.href = `/${config.module.toLowerCase()}/${a.resource_id}`
 }));
 }

 setData(results);

 // Calculate metrics
 const calculatedMetrics = config.metrics.map(metric => ({
 id: metric.id,
 title: metric.title,
 value: metric.query(results),
 subtitle: metric.subtitle?.(results),
 icon: metric.icon,
 iconColor: metric.iconColor,
 trend: metric.trend?.(results),
 change: metric.change?.(results),
 changeLabel: metric.changeLabel,
 onClick: metric.route ? () => window.location.href = metric.route : undefined
 }));
 setMetrics(calculatedMetrics);

 // Calculate status breakdown
 const statusCounts = config.statusFields.values.map(status => ({
 id: status.value,
 label: status.label,
 count: results.main.filter((item: unknown) => 
 item[config.statusFields.field] === status.value
 ).length,
 color: status.color,
 icon: status.icon,
 onClick: () => window.location.href = `/${config.module.toLowerCase()}?${config.statusFields.field}=${status.value}`
 }));
 setStatusBreakdown(statusCounts);

 // Set recent activity
 if (results.activity) {
 setRecentActivity(results.activity);
 }

 // Build custom sections
 if (config.customSections) {
 const sections = config.customSections
 .filter(section => results[section.dataKey]?.length > 0)
 .map(section => ({
 id: section.id,
 title: section.title,
 description: section.description,
 content: (
 <div className="space-y-sm">
 {results[section.dataKey].slice(0, 5).map((item: unknown) => 
 section.renderItem(item)
 )}
 </div>
 ),
 actions: section.route ? (
 <button
 className="text-sm text-primary hover:underline"
 onClick={() => window.location.href = section.route!}
 >
 View All →
 </button>
 ) : undefined
 }));
 setCustomSections(sections);
 }

 } catch (error) {
 console.error(`Error loading ${config.module} overview data:`, error);
 toast.error(`Failed to load ${config.module} overview`);
 } finally {
 setLoading(false);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [supabase, config, orgId]);

 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(() => {
 loadData();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [loadData]);

 // Setup real-time subscription
 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(() => {
 const channel = supabase
 .channel(`${config.module}-overview`)
 .on(
 "postgres_changes",
 {
 event: "*",
 schema: "public",
 table: config.tables.main,
 filter: `organization_id=eq.${orgId}`
 },
 () => {
 loadData();
 }
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [supabase, config.module, config.tables.main, orgId, loadData]);

 // Build quick actions
 const quickActions: QuickAction[] = config.quickActions.map(action => ({
 ...action,
 onClick: () => window.location.href = action.route
 }));

 return {
 loading,
 metrics,
 statusBreakdown,
 recentActivity,
 quickActions,
 customSections,
 refresh: loadData,
 data
 };
}
