"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@ghxstship/auth";
import {
 Button,
 CalendarView,
 DataActions,
 DataGrid,
 DataViewProvider,
 KanbanBoard,
 ListView,
 StateManagerProvider,
 ViewSwitcher,
 type DataRecord,
} from "@ghxstship/ui";
import type { DataViewConfig, FieldConfig, FilterConfig, SortConfig } from "@ghxstship/ui/src/components/DataViews/types";
import { Calendar, Filter, Search } from 'lucide-react';

interface ProgrammingRecord extends DataRecord {
 id: string;
 name: string;
 description?: string | null;
 type?: string | null;
 event_date?: string | null;
 start_time?: string | null;
 end_time?: string | null;
 location?: string | null;
 capacity?: number | null;
 status?: string | null;
 record_type: "event" | "space";
 created_at?: string | null;
}

export default function ProgrammingClient({ orgId }: { orgId: string }) {
 const supabase = useMemo(() => createBrowserClient(), []);

 const [data, setData] = useState<ProgrammingRecord[]>([]);
 const [loading, setLoading] = useState(false);

 const fields: FieldConfig[] = [
 {
 key: "name",
 label: "Name",
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
 key: "type",
 label: "Type",
 type: "select",
 sortable: true,
 filterable: true,
 options: [
 { value: "event", label: "Event" },
 { value: "space", label: "Space" },
 ],
 },
 {
 key: "event_date",
 label: "Event Date",
 type: "date",
 sortable: true,
 filterable: true,
 },
 {
 key: "start_time",
 label: "Start Time",
 type: "text",
 sortable: true,
 filterable: false,
 },
 {
 key: "end_time",
 label: "End Time",
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
 key: "capacity",
 label: "Capacity",
 type: "number",
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
 { value: "cancelled", label: "Cancelled" },
 ],
 },
 {
 key: "record_type",
 label: "Record Type",
 type: "text",
 sortable: true,
 filterable: true,
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
 if (!orgId) {
 return;
 }

 try {
 setLoading(true);

 const [{ data: eventsData, error: eventsError }, { data: spacesData, error: spacesError }] = await Promise.all([
 supabase
 .from("events")
 .select("*")
 .eq("organization_id", orgId)
 .order("created_at", { ascending: false }),
 supabase
 .from("spaces")
 .select("*")
 .eq("organization_id", orgId)
 .order("created_at", { ascending: false }),
 ]);

 if (eventsError) {
 throw eventsError;
 }

 if (spacesError) {
 throw spacesError;
 }

 const combinedData: ProgrammingRecord[] = [
 ...(eventsData ?? []).map((event: unknown) => ({
 id: event.id,
 name: event.name,
 description: event.description ?? null,
 type: "event",
 event_date: event.starts_at ?? null,
 start_time: event.starts_at ?? null,
 end_time: event.ends_at ?? null,
 location: event.location ?? null,
 capacity: event.capacity ?? null,
 status: event.status ?? null,
 record_type: "event",
 created_at: event.created_at ?? null,
 ...event,
 })),
 ...(spacesData ?? []).map((space: unknown) => ({
 id: space.id,
 name: space.name,
 description: space.description ?? null,
 type: "space",
 event_date: null,
 start_time: null,
 end_time: null,
 location: space.location ?? null,
 capacity: space.capacity ?? null,
 status: space.availability ?? null,
 record_type: "space",
 created_at: space.created_at ?? null,
 ...space,
 })),
 ];

 setData(combinedData);
 } catch (error) {
 console.error("Error loading programming data:", error);
 } finally {
 setLoading(false);
 }
 }, [orgId, supabase]);

 useEffect(() => {
 void loadData();
 }, [loadData]);

 const config: DataViewConfig = {
 id: "programming-data",
 name: "Programming",
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
 <h1 className="text-heading-3 text-heading-3">Programming</h1>
 <div className="flex items-center gap-sm">
 <ViewSwitcher />
 <DataActions />
 <Button onClick={loadData} disabled={loading}>
 Refresh
 </Button>
 </div>
 </div>

 <DataGrid />

 <KanbanBoard
 columns={[
 { id: "draft", title: "Draft" },
 { id: "published", title: "Published" },
 { id: "cancelled", title: "Cancelled" },
 ]}
 statusField="status"
 titleField="name"
 />

 <CalendarView startDateField="event_date" titleField="name" />

 <ListView titleField="name" />
 </div>
 </StateManagerProvider>
 </DataViewProvider>
 </div>
 );
}
