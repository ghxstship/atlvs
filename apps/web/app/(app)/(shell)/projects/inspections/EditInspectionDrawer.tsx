"use client";

import { useMemo, useState } from "react";
import { createBrowserClient } from "@ghxstship/auth";
import { AppDrawer, type DrawerFieldConfig } from "@ghxstship/ui";
import type { Inspection } from "./InspectionsClient";
import { Edit } from 'lucide-react';

interface EditInspectionDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 inspection: Inspection;
 projects?: Array<{ id: string; name: string }>;
 inspectors?: Array<{ id: string; email: string; full_name?: string }>;
 onSuccess?: () => void;
}

const INSPECTION_TYPES: { label: string; value: string }[] = [
 { label: "Safety", value: "safety" },
 { label: "Quality", value: "quality" },
 { label: "Compliance", value: "compliance" },
 { label: "Progress", value: "progress" },
 { label: "Final", value: "final" },
];

const INSPECTION_STATUSES: { label: string; value: string }[] = [
 { label: "Scheduled", value: "scheduled" },
 { label: "In Progress", value: "in_progress" },
 { label: "Completed", value: "completed" },
 { label: "Failed", value: "failed" },
 { label: "Cancelled", value: "cancelled" },
];

const toIsoStringOrNull = (value: unknown): string | null => {
 if (typeof value !== "string" || value.trim().length === 0) {
  return null;
 }

 const parsed = new Date(value);
 return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const toDateInputValue = (iso: string | null | undefined): string => {
 if (!iso) return "";
 const date = new Date(iso);
 if (Number.isNaN(date.getTime())) return "";
 return date.toISOString().split("T")[0] ?? "";
};

export default function EditInspectionDrawer({
 open,
 onOpenChange,
 inspection,
 projects = [],
 inspectors = [],
 onSuccess,
}: EditInspectionDrawerProps) {
 const supabase = createBrowserClient();
 const [loading, setLoading] = useState(false);

 const projectOptions = useMemo(() => (
 [{ label: "No project", value: "" },
 ...projects.map((project): { label: string; value: string } => ({
 label: project.name,
 value: project.id,
 }))]
), [projects]);

 const inspectorOptions = useMemo(() => (
 [{ label: "Select an inspector", value: "" },
 ...inspectors.map((inspector): { label: string; value: string } => ({
 label: inspector.full_name || inspector.email,
 value: inspector.id,
 }))]
), [inspectors]);

 const fields: DrawerFieldConfig[] = [
 {
 key: "title",
 label: "Inspection Title",
 type: "text",
 required: true,
 placeholder: "Enter inspection title",
 },
 {
 key: "description",
 label: "Description",
 type: "textarea",
 placeholder: "Describe the inspection scope and objectives",
 },
 {
 key: "type",
 label: "Inspection Type",
 type: "select",
 required: true,
 options: INSPECTION_TYPES,
 },
 {
 key: "status",
 label: "Status",
 type: "select",
 required: true,
 options: INSPECTION_STATUSES,
 },
 {
 key: "project_id",
 label: "Project",
 type: "select",
 options: projectOptions,
 },
 {
 key: "scheduled_date",
 label: "Scheduled Date",
 type: "date",
 required: true,
 },
 {
 key: "completed_date",
 label: "Completed Date",
 type: "date",
 },
 {
 key: "inspector_id",
 label: "Inspector",
 type: "select",
 required: true,
 options: inspectorOptions,
 },
 {
 key: "location",
 label: "Location",
 type: "text",
 placeholder: "Enter inspection location",
 },
 {
 key: "score",
 label: "Score (0-100)",
 type: "number",
 placeholder: "Enter score",
 },
 {
 key: "is_passed",
 label: "Inspection Passed",
 type: "checkbox",
 },
 {
 key: "findings",
 label: "Findings",
 type: "textarea",
 placeholder: "Document inspection findings",
 },
 {
 key: "recommendations",
 label: "Recommendations",
 type: "textarea",
 placeholder: "Provide recommendations",
 },
 {
 key: "follow_up_required",
 label: "Follow-up Required",
 type: "checkbox",
 },
 {
 key: "follow_up_date",
 label: "Follow-up Date",
 type: "date",
 },
 ];

 const handleSave = async (data: Record<string, unknown>) => {
 const title = typeof data.title === "string" ? data.title.trim() : "";
 if (!title) {
 throw new Error("Inspection title is required");
 }

 const inspectionType = typeof data.type === "string" && data.type.length > 0 ? data.type : inspection.type;
 const status = typeof data.status === "string" && data.status.length > 0 ? data.status : inspection.status;

 const scheduledDateIso = toIsoStringOrNull(data.scheduled_date) ?? inspection.scheduled_date ?? new Date().toISOString();
 const completedDateIso = toIsoStringOrNull(data.completed_date) ?? inspection.completed_date ?? null;
 const selectedProjectId =
 typeof data.project_id === "string" && data.project_id.trim().length > 0
 ? data.project_id.trim()
 : inspection.project_id;
 const selectedInspectorId =
 typeof data.inspector_id === "string" && data.inspector_id.trim().length > 0
 ? data.inspector_id.trim()
 : inspection.inspector_id;
 const scoreValue = typeof data.score === "string" && data.score.trim().length > 0 ? Number(data.score) : null;
 const isPassed = typeof data.is_passed === "boolean"
 ? data.is_passed
 : typeof data.is_passed === "string"
 ? ["true", "1", "on"].includes(data.is_passed.toLowerCase())
 : Boolean(inspection.is_passed);
 const followUpRequired = typeof data.follow_up_required === "boolean"
 ? data.follow_up_required
 : typeof data.follow_up_required === "string"
 ? ["true", "1", "on"].includes(data.follow_up_required.toLowerCase())
 : Boolean(inspection.follow_up_required);
 const followUpDateIso = toIsoStringOrNull(data.follow_up_date) ?? inspection.follow_up_date ?? null;

 const updates = {
 title,
 description: typeof data.description === "string" && data.description.trim().length > 0 ? data.description.trim() : null,
 type: inspectionType,
 status,
 project_id: selectedProjectId || null,
 scheduled_date: scheduledDateIso,
 completed_date: status === "completed" ? (completedDateIso ?? new Date().toISOString()) : completedDateIso,
 inspector_id: selectedInspectorId,
 location: typeof data.location === "string" && data.location.trim().length > 0 ? data.location.trim() : null,
 score: scoreValue !== null ? scoreValue : null,
 is_passed: isPassed,
 findings: typeof data.findings === "string" && data.findings.trim().length > 0 ? data.findings.trim() : null,
 recommendations: typeof data.recommendations === "string" && data.recommendations.trim().length > 0 ? data.recommendations.trim() : null,
 follow_up_required: followUpRequired,
 follow_up_date: followUpDateIso,
 updated_at: new Date().toISOString(),
 };

 setLoading(true);

 try {
 const { error } = await supabase
 .from("project_inspections")
 .update(updates)
 .eq("id", inspection.id);

 if (error) {
 throw error;
 }

 onOpenChange(false);
 onSuccess?.();
 } catch (error) {
 console.error("Error updating inspection:", error);
 throw error;
 } finally {
 setLoading(false);
 }
 };

 // Pre-populate form with inspection data
 const record = {
 id: inspection.id,
 title: inspection.title,
 description: inspection.description ?? "",
 type: inspection.type,
 status: inspection.status,
 project_id: inspection.project_id ?? "",
 scheduled_date: toDateInputValue(inspection.scheduled_date ?? null),
 completed_date: toDateInputValue(inspection.completed_date ?? null),
 inspector_id: inspection.inspector_id ?? "",
 location: inspection.location ?? "",
 score: typeof inspection.score === "number" ? inspection.score.toString() : "",
 is_passed: Boolean(inspection.is_passed),
 findings: inspection.findings ?? "",
 recommendations: inspection.recommendations ?? "",
 follow_up_required: Boolean(inspection.follow_up_required),
 follow_up_date: toDateInputValue(inspection.follow_up_date ?? null),
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title="Edit Inspection"
 mode="edit"
 fields={fields}
 record={record}
 onSave={handleSave}
 loading={loading}
 />
 );
}
