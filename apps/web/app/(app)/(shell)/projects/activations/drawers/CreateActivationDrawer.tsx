"use client";

import { useState } from 'react';
import { createBrowserClient } from "@ghxstship/auth";
import { AppDrawer, type DrawerFieldConfig } from "@ghxstship/ui";

interface CreateActivationDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 orgId: string;
 projects?: Array<{ id: string; name: string }>;
 onSuccess?: () => void;
}

export default function CreateActivationDrawer({
 open,
 onOpenChange,
 orgId,
 projects = [],
 onSuccess
}: CreateActivationDrawerProps) {
 const supabase = createBrowserClient();
 const [loading, setLoading] = useState(false);

 const fields: DrawerFieldConfig[] = [
 {
 key: "name",
 label: "Activation Name",
 type: "text",
 required: true,
 placeholder: "Enter activation name"
 },
 {
 key: "description",
 label: "Description",
 type: "textarea",
 placeholder: "Describe the activation objectives and scope"
 },
 {
 key: "status",
 label: "Status",
 type: "select",
 options: [
 { label: "Planning", value: "planning" },
 { label: "Ready", value: "ready" },
 { label: "Active", value: "active" },
 { label: "Completed", value: "completed" },
 { label: "Cancelled", value: "cancelled" },
 ]
 },
 {
 key: "activation_type",
 label: "Type",
 type: "select",
 options: [
 { label: "Full Launch", value: "full_launch" },
 { label: "Soft Launch", value: "soft_launch" },
 { label: "Beta", value: "beta" },
 { label: "Pilot", value: "pilot" },
 { label: "Rollout", value: "rollout" },
 ]
 },
 {
 key: "project_id",
 label: "Associated Project",
 type: "select",
 options: [
 { label: "Select a project", value: "" },
 ...projects.map((p) => ({ label: p.name, value: p.id })),
 ]
 },
 {
 key: "scheduled_date",
 label: "Scheduled Date",
 type: "date"
 },
 {
 key: "location",
 label: "Location",
 type: "text",
 placeholder: "Enter location"
 },
 {
 key: "budget",
 label: "Budget",
 type: "currency",
 placeholder: "0.00"
 },
 {
 key: "notes",
 label: "Notes",
 type: "textarea",
 placeholder: "Add any additional notes or comments"
 },
 ];

 const handleSave = async (data: Record<string, unknown>) => {
 try {
 const name = typeof data.name === "string" ? data.name.trim() : "";
 const description = typeof data.description === "string" ? data.description.trim() : "";
 const status = typeof data.status === "string" && data.status ? data.status : "planning";
 const activationType =
 typeof data.activation_type === "string" && data.activation_type ? data.activation_type : "full_launch";
 const projectId = typeof data.project_id === "string" && data.project_id.length > 0 ? data.project_id : null;
 const scheduledDate = typeof data.scheduled_date === "string" && data.scheduled_date ? data.scheduled_date : null;
 const location = typeof data.location === "string" && data.location.trim() ? data.location.trim() : null;
 const budget =
 typeof data.budget === "string" && data.budget.trim().length > 0 ? parseFloat(data.budget) : null;
 const notes = typeof data.notes === "string" && data.notes.trim() ? data.notes.trim() : null;

 const { error } = await supabase.from("project_activations").insert({
 organization_id: orgId,
 name,
 description: description || null,
 status,
 activation_type: activationType,
 project_id: projectId,
 scheduled_date: scheduledDate,
 location,
 budget,
 notes,
 success_metrics: {},
 stakeholders: [],
 dependencies: [],
 risks: []
 });

 if (error) throw error;

 onOpenChange(false);
 onSuccess?.();
 } catch (error) {
 console.error("Error creating activation:", error);
 throw error;
 }
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title="Create New Activation"
 mode="create"
 fields={fields}
 onSave={handleSave}
 loading={loading}
 />
 );
}
