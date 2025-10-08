"use client";

import { FileCheck, Plus, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from "@ghxstship/auth";
import {
 Badge,
 Button,
 Card,
 DataActions,
 DataGrid,
 DataViewProvider,
 KanbanBoard,
 ListView,
 StateManagerProvider,
 ViewSwitcher,
 Drawer,
 type DataRecord
} from "@ghxstship/ui";
import type { DataViewConfig, FieldConfig, FilterConfig, SortConfig } from "@ghxstship/ui/src/components/DataViews/types";

interface Rider extends DataRecord {
 id: string;
 title: string;
 description?: string | null;
 type: "technical" | "hospitality" | "security" | "catering" | "transportation" | "other";
 project_id?: string | null;
 event_id?: string | null;
 requirements: string[];
 special_requests?: string | null;
 contact_person?: string | null;
 status: "draft" | "submitted" | "approved" | "rejected" | "fulfilled";
 created_at: string;
 updated_at: string;
}

interface ProgrammingRidersClientProps {
 orgId: string;
 userId: string;
 userEmail: string;
}

export default function ProgrammingRidersClient({ orgId, userId, userEmail }: ProgrammingRidersClientProps) {
 const supabase = useMemo(() => createBrowserClient(), []);

 const [data, setData] = useState<Rider[]>([]);
 const [loading, setLoading] = useState(false);
 const [createDrawerOpen, setCreateDrawerOpen] = useState(false);

 const fields: FieldConfig[] = [
 {
 key: "title",
 label: "Title",
 type: "text",
 sortable: true,
 filterable: true
 },
 {
 key: "description",
 label: "Description",
 type: "text",
 sortable: false,
 filterable: true
 },
 {
 key: "type",
 label: "Type",
 type: "select",
 sortable: true,
 filterable: true,
 options: [
 { value: "technical", label: "Technical" },
 { value: "hospitality", label: "Hospitality" },
 { value: "security", label: "Security" },
 { value: "catering", label: "Catering" },
 { value: "transportation", label: "Transportation" },
 { value: "other", label: "Other" },
 ]
 },
 {
 key: "contact_person",
 label: "Contact Person",
 type: "text",
 sortable: true,
 filterable: true
 },
 {
 key: "status",
 label: "Status",
 type: "select",
 sortable: true,
 filterable: true,
 options: [
 { value: "draft", label: "Draft" },
 { value: "submitted", label: "Submitted" },
 { value: "approved", label: "Approved" },
 { value: "rejected", label: "Rejected" },
 { value: "fulfilled", label: "Fulfilled" },
 ]
 },
 {
 key: "created_at",
 label: "Created",
 type: "date",
 sortable: true,
 filterable: false
 },
 ];

 const loadData = useCallback(async () => {
 if (!orgId) return;

 try {
 setLoading(true);
 const { data: ridersData, error } = await supabase
 .from("riders")
 .select("*")
 .eq("organization_id", orgId)
 .order("created_at", { ascending: false });

 if (error) throw error;
 setData(ridersData ?? []);
 } catch (error) {
 console.error("Error loading riders:", error);
 } finally {
 setLoading(false);
 }
 }, [orgId, supabase]);

 useEffect(() => {
 void loadData();
 }, [loadData]);

 // Real-time subscriptions
 useEffect(() => {
 const channel = supabase
 .channel(`riders-${orgId}`)
 .on(
 'postgres_changes',
 {
 event: '*',
 schema: 'public',
 table: 'riders',
 filter: `organization_id=eq.${orgId}`
 },
 () => loadData(),
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, [supabase, orgId, loadData]);

 const config: DataViewConfig = {
 id: "riders-data",
 name: "Riders",
 viewType: "grid",
 defaultView: "grid",
 fields,
 data,
 onSearch: (query: string) => {
 },
 onFilter: (filters: FilterConfig[]) => {
 },
 onSort: (sorts: SortConfig[]) => {
 },
 onRefresh: loadData,
 onExport: (records: DataRecord[], format: string) => {
 },
 onImport: (records: DataRecord[]) => {
 }
 };

 return (
 <div className="stack-md">
 <DataViewProvider config={config}>
 <StateManagerProvider>
 <div className="stack-md">
 <div className="flex items-center justify-between mb-md">
 <div className="flex items-center gap-sm">
 <FileCheck className="h-icon-md w-icon-md text-primary" />
 <h1 className="text-heading-3">Riders</h1>
 </div>
 <div className="flex items-center gap-sm">
 <ViewSwitcher />
 <DataActions />
 <Button onClick={() => setCreateDrawerOpen(true)}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Create Rider
 </Button>
 <Button variant="outline" onClick={loadData} disabled={loading}>
 <RefreshCcw className="mr-2 h-icon-xs w-icon-xs" />
 Refresh
 </Button>
 </div>
 </div>

 <DataGrid />

 <KanbanBoard
 columns={[
 { id: "draft", title: "Draft" },
 { id: "submitted", title: "Submitted" },
 { id: "approved", title: "Approved" },
 { id: "rejected", title: "Rejected" },
 { id: "fulfilled", title: "Fulfilled" },
 ]}
 statusField="status"
 titleField="title"
 />

 <ListView titleField="title" />
 </div>
 </StateManagerProvider>
 </DataViewProvider>

 {createDrawerOpen && (
 <Drawer
 open={createDrawerOpen}
 onClose={() => setCreateDrawerOpen(false)}
 title="Create Rider"
 description="Create a new technical or hospitality rider"
 content={
 <div className="p-md">
 <p className="text-muted-foreground">
 Rider creation form will be implemented here.
 </p>
 </div>
 }
 />
 )}
 </div>
 );
}
