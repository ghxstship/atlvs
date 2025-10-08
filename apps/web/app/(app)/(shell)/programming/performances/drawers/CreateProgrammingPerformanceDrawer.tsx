"use client";

import { useState } from 'react';
import { createBrowserClient } from "@ghxstship/auth";
import AppDrawer from "@ghxstship/ui";
import type { DrawerFieldConfig } from "@ghxstship/ui";
import type { PerformanceProject, PerformanceEvent } from "../types";
import { 
 PERFORMANCE_TYPE_BADGE, 
 STATUS_BADGE, 
 CURRENCY_OPTIONS, 
 EQUIPMENT_OPTIONS,
 DURATION_PRESETS,
 TARGET_DEMOGRAPHICS 
} from "../types";

type CreateProgrammingPerformanceDrawerProps = {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 orgId: string;
 currentUserId: string;
 projects: PerformanceProject[];
 events: PerformanceEvent[];
 onSuccess: () => void;
};

export default function CreateProgrammingPerformanceDrawer({
 open,
 onOpenChange,
 orgId,
 currentUserId,
 projects,
 events,
 onSuccess
}: CreateProgrammingPerformanceDrawerProps) {
 const supabase = createBrowserClient();
 const [loading, setLoading] = useState(false);

 const fields: DrawerFieldConfig[] = [
 {
 key: "event_id",
 label: "Event",
 type: "select",
 required: true,
 options: events.map(event => ({
 label: `${event.title} - ${new Date(event.start_at).toLocaleDateString()}`,
 value: event.id
 }))
 },
 {
 key: "name",
 label: "Performance Name",
 type: "text",
 required: true,
 placeholder: "Enter performance name"
 },
 {
 key: "starts_at",
 label: "Start Time",
 type: "date",
 required: true
 },
 {
 key: "venue",
 label: "Venue",
 type: "text",
 placeholder: "Enter venue name"
 },
 ];

 const handleSubmit = async (data: Record<string, unknown>) => {
 try {
 setLoading(true);
 
 const payload = {
 ...data,
 organization_id: orgId,
 created_by: currentUserId,
 updated_by: currentUserId
 };

 const response = await fetch("/api/v1/programming/performances", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(payload)
 });

 if (!response.ok) {
 throw new Error("Failed to create performance");
 }

 onSuccess();
 onOpenChange(false);
 } catch (error) {
 console.error("Error creating performance:", error);
 } finally {
 setLoading(false);
 }
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title="Create Performance"
 mode="create"
 fields={fields}
 loading={loading}
 />
 );
}
