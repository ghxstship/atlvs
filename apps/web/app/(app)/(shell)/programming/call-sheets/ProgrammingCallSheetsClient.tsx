"use client";

import { FileText, Plus, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
 type DataRecord,
} from "@ghxstship/ui";
import type { DataViewConfig, FieldConfig, FilterConfig, SortConfig } from "@ghxstship/ui/src/components/DataViews/types";

interface CallSheet extends DataRecord {
 id: string;
 title: string;
 description?: string | null;
 project_id?: string | null;
 event_date: string;
 call_time: string;
 location: string;
 status: "draft" | "published" | "distributed" | "completed";
 created_at: string;
 updated_at: string;
}

interface ProgrammingCallSheetsClientProps {
 orgId: string;
 userId: string;
 userEmail: string;
}

export default function ProgrammingCallSheetsClient({ orgId, userId, userEmail }: ProgrammingCallSheetsClientProps) {
 const supabase = useMemo(() => createBrowserClient(), []);

 const [data, setData] = useState<CallSheet[]>([]);
 const [loading, setLoading] = useState(false);
 const [createDrawerOpen, setCreateDrawerOpen] = useState(false);

 const fields: FieldConfig[] = [
 {
 key: "title",
 label: "Title",
 type: "text",
 sortable: true,
 filterable: true,
 },
 {
 key: "description",
 label: "Description",
 type: "text",
 sortable: false,
 filterable: true,
 },
 {
 key: "event_date",
 label: "Event Date",
 type: "date",
 sortable: true,
 filterable: true,
 },
 {
 key: "call_time",
 label: "Call Time",
 type: "text",
 sortable: true,
 filterable: false,
 },
 {
 key: "location",
 label: "Location",
 type: "text",
 sortable: true,
 filterable: true,
 },
 {
 key: "status",
 label: "Status",
 type: "select",
 sortable: true,
 filterable: true,
 options: [
 { value: "draft", label: "Draft" },
 { value: "published", label: "Published" },
 { value: "distributed", label: "Distributed" },
 { value: "completed", label: "Completed" },
 ],
 },
 {
 key: "created_at",
 label: "Created",
 type: "date",
 sortable: true,
 filterable: false,
 },
 ];

 const loadData = useCallback(async () => {
 if (!orgId) return;

 try {
 setLoading(true);
 const { data: callSheetsData, error } = await supabase
 .from("call_sheets")
 .select("*")
 .eq("organization_id", orgId)
 .order("created_at", { ascending: false });

 if (error) throw error;
 setData(callSheetsData ?? []);
 } catch (error) {
 console.error("Error loading call sheets:", error);
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
 .channel(`call-sheets-${orgId}`)
 .on(
 'postgres_changes',
 {
 event: '*',
 schema: 'public',
 table: 'call_sheets',
 filter: `organization_id=eq.${orgId}`,
 },
 () => loadData(),
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, [supabase, orgId, loadData]);

 const config: DataViewConfig = {
 id: "call-sheets-data",
 name: "Call Sheets",
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
 },
 };

 return (
 <div className="stack-md">
 <DataViewProvider config={config}>
 <StateManagerProvider>
 <div className="stack-md">
 <div className="flex items-center justify-between mb-md">
 <div className="flex items-center gap-sm">
 <FileText className="h-icon-md w-icon-md text-primary" />
 <h1 className="text-heading-3">Call Sheets</h1>
 </div>
 <div className="flex items-center gap-sm">
 <ViewSwitcher />
 <DataActions />
 <Button onClick={() => setCreateDrawerOpen(true)}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Create Call Sheet
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
 { id: "published", title: "Published" },
 { id: "distributed", title: "Distributed" },
 { id: "completed", title: "Completed" },
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
 title="Create Call Sheet"
 description="Create a new production call sheet"
 content={
 <div className="p-md">
 <p className="text-muted-foreground">
 Call sheet creation form will be implemented here.
 </p>
 </div>
 }
 />
 )}
 </div>
 );
}
