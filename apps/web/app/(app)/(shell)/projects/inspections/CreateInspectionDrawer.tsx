"use client";

import { useMemo, useState } from "react";
import { createBrowserClient } from "@ghxstship/auth";
import { AppDrawer, type DrawerFieldConfig } from "@ghxstship/ui";
import { Check } from 'lucide-react';

interface CreateInspectionDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 orgId: string;
 projectId?: string;
 projects?: Array<{ id: string; name: string }>;
 inspectors?: Array<{ id: string; email: string; full_name?: string }>;
 onSuccess?: () => void;
}

const INSPECTION_TYPE_OPTIONS: { label: string; value: string }[] = [
 { label: "Safety", value: "safety" },
 { label: "Quality", value: "quality" },
 { label: "Compliance", value: "compliance" },
 { label: "Progress", value: "progress" },
 { label: "Final", value: "final" },
];

const toIsoStringOrNull = (value: unknown): string | null => {
 if (typeof value !== "string" || value.trim().length === 0) {
  return null;
 }

 const parsed = new Date(value);
 return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

export default function CreateInspectionDrawer({
 open,
 onOpenChange,
 orgId,
 projectId,
 projects = [],
 inspectors = [],
 onSuccess,
}: CreateInspectionDrawerProps) {
 const supabase = createBrowserClient();
 const [loading, setLoading] = useState(false);

 // Get current user for default inspector
 const getCurrentUserId = async () => {
 const {
 data: { user },
 } = await supabase.auth.getUser();
 return user?.id ?? null;
 };

 const projectOptions = useMemo(() => {
 const options = projects.map((project): { label: string; value: string } => ({
 label: project.name,
 value: project.id,
 }));

 return [{ label: "Select a project", value: "" }, ...options];
 }, [projects]);

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
 options: INSPECTION_TYPE_OPTIONS,
 },
 {
 key: "project_id",
 label: "Project",
 type: "select",
 required: projectId ? false : true,
 options: projectOptions,
 },
 {
 key: "scheduled_date",
 label: "Scheduled Date",
 type: "date",
 required: true,
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
 key: "checklist_template",
 label: "Checklist Template",
 type: "select",
 options: [
 { label: "None", value: "" },
 { label: "Safety Checklist", value: "safety" },
 { label: "Quality Checklist", value: "quality" },
 { label: "Compliance Checklist", value: "compliance" },
 { label: "Final Inspection", value: "final" },
 ],
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

 const inspectionType = typeof data.type === "string" && data.type.length > 0 ? data.type : INSPECTION_TYPE_OPTIONS[0]!.value;
 const scheduledDateRaw = typeof data.scheduled_date === "string" ? data.scheduled_date : "";
 if (!scheduledDateRaw) {
 throw new Error("Scheduled date is required");
 }

 const scheduledDate = new Date(scheduledDateRaw);
 if (Number.isNaN(scheduledDate.getTime())) {
 throw new Error("Scheduled date is invalid");
 }

 const selectedProjectId =
 typeof data.project_id === "string" && data.project_id.trim().length > 0
 ? data.project_id.trim()
 : projectId ?? null;

 const inspectorFromForm = typeof data.inspector_id === "string" && data.inspector_id.trim().length > 0
 ? data.inspector_id.trim()
 : null;

 const template = typeof data.checklist_template === "string" ? data.checklist_template : "";
 const checklistItems = generateChecklistItems(template);

 const location = typeof data.location === "string" ? data.location.trim() : "";
 const followUpRequired = typeof data.follow_up_required === "boolean"
 ? data.follow_up_required
 : typeof data.follow_up_required === "string"
 ? ["true", "1", "on"].includes(data.follow_up_required.toLowerCase())
 : false;
 const followUpDate = toIsoStringOrNull(data.follow_up_date);

 const payload = {
 organization_id: orgId,
 project_id: selectedProjectId,
 title,
 description: typeof data.description === "string" && data.description.trim().length > 0 ? data.description.trim() : null,
 type: inspectionType,
 status: "scheduled" as const,
 scheduled_date: scheduledDate.toISOString(),
 inspector_id: inspectorFromForm,
 location: location || null,
 follow_up_required: followUpRequired,
 follow_up_date: followUpDate,
 checklist_items: checklistItems,
 is_passed: false,
 score: null,
 findings: null,
 recommendations: null,
 attachments: [] as string[],
 };

 setLoading(true);

 try {
 const inspectorId = inspectorFromForm ?? (await getCurrentUserId());

 const { error } = await supabase.from("project_inspections").insert({
 ...payload,
 inspector_id: inspectorId,
 });

 if (error) {
 throw error;
 }

 onOpenChange(false);
 onSuccess?.();
 } catch (error) {
 console.error("Error creating inspection:", error);
 throw error;
 } finally {
 setLoading(false);
 }
 };

 // Generate checklist items based on template
 const generateChecklistItems = (template: string) => {
 const templates: Record<string, Array<{ category: string; item: string }> = {
 safety: [
 { category: "PPE", item: "Hard hats worn by all personnel" },
 { category: "PPE", item: "Safety glasses in use" },
 { category: "PPE", item: "High-visibility vests worn" },
 { category: "Site", item: "Emergency exits clearly marked" },
 { category: "Site", item: "Fire extinguishers accessible" },
 { category: "Site", item: "First aid kit available" },
 { category: "Equipment", item: "Equipment properly maintained" },
 { category: "Equipment", item: "Safety guards in place" },
 ],
 quality: [
 { category: "Materials", item: "Materials meet specifications" },
 { category: "Materials", item: "Proper storage conditions" },
 { category: "Workmanship", item: "Work meets quality standards" },
 { category: "Workmanship", item: "Defects identified and marked" },
 { category: "Documentation", item: "Quality records maintained" },
 { category: "Documentation", item: "Test results documented" },
 ],
 compliance: [
 { category: "Permits", item: "All permits obtained" },
 { category: "Permits", item: "Permits displayed on site" },
 { category: "Regulations", item: "Local regulations followed" },
 { category: "Regulations", item: "Environmental compliance met" },
 { category: "Documentation", item: "Compliance records complete" },
 { category: "Documentation", item: "Inspection logs up to date" },
 ],
 final: [
 { category: "Completion", item: "All work completed as specified" },
 { category: "Completion", item: "Punch list items addressed" },
 { category: "Quality", item: "Final quality check passed" },
 { category: "Quality", item: "Client walkthrough completed" },
 { category: "Documentation", item: "As-built drawings provided" },
 { category: "Documentation", item: "Warranties and manuals delivered" },
 { category: "Cleanup", item: "Site cleaned and restored" },
 { category: "Cleanup", item: "Waste properly disposed" },
 ],
 };

 const items = templates[template] || [];
 return items.map((item, index) => ({
 id: `item-${index}`,
 category: item.category,
 item: item.item,
 status: "pending",
 notes: null,
 }));
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title="Schedule Inspection"
 mode="create"
 fields={fields}
 onSave={handleSave}
 loading={loading}
 />
 );
}
