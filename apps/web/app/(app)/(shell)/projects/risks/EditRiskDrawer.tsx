"use client";

import { useMemo, useState } from 'react';
import { createBrowserClient } from "@ghxstship/auth";
import { AppDrawer, type DrawerFieldConfig } from "@ghxstship/ui";
import type { Risk } from "./RisksClient";
import { Edit } from 'lucide-react';

interface EditRiskDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 risk: Risk;
 projects?: Array<{ id: string; name: string }>;
 users?: Array<{ id: string; email: string; full_name?: string }>;
 onSuccess?: () => void;
}

const PROBABILITY_OPTIONS: { label: string; value: string }[] = [
 { label: "Very Low (Rare)", value: "very_low" },
 { label: "Low (Unlikely)", value: "low" },
 { label: "Medium (Possible)", value: "medium" },
 { label: "High (Likely)", value: "high" },
 { label: "Very High (Almost Certain)", value: "very_high" },
];

const IMPACT_OPTIONS: { label: string; value: string }[] = [
 { label: "Very Low (Negligible)", value: "very_low" },
 { label: "Low (Minor)", value: "low" },
 { label: "Medium (Moderate)", value: "medium" },
 { label: "High (Major)", value: "high" },
 { label: "Very High (Catastrophic)", value: "very_high" },
];

const CATEGORY_OPTIONS: { label: string; value: string }[] = [
 { label: "Technical", value: "technical" },
 { label: "Financial", value: "financial" },
 { label: "Operational", value: "operational" },
 { label: "Legal", value: "legal" },
 { label: "Environmental", value: "environmental" },
 { label: "Safety", value: "safety" },
];

const STATUS_OPTIONS: { label: string; value: string }[] = [
 { label: "Identified", value: "identified" },
 { label: "Assessed", value: "assessed" },
 { label: "Mitigated", value: "mitigated" },
 { label: "Closed", value: "closed" },
];

const calculateRiskScore = (probability: string, impact: string): number => {
 const weight: Record<string, number> = {
 very_low: 1,
 low: 2,
 medium: 3,
 high: 4,
 very_high: 5
 };

 return (weight[probability] ?? 3) * (weight[impact] ?? 3);
};

const toIsoStringOrNull = (value: unknown): string | null => {
 if (typeof value !== "string" || value.trim().length === 0) {
  return null;
 }

 const parsed = new Date(value);
 return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const toDateInputValue = (iso?: string | null) => {
 if (!iso) return "";
 const date = new Date(iso);
 if (Number.isNaN(date.getTime())) return "";
 return date.toISOString().split("T")[0] ?? "";
};

export default function EditRiskDrawer({
 open,
 onOpenChange,
 risk,
 projects = [],
 users = [],
 onSuccess
}: EditRiskDrawerProps) {
 const supabase = createBrowserClient();
 const [loading, setLoading] = useState(false);

 const projectOptions = useMemo(() => (
 projects.map((project): { label: string; value: string } => ({
 label: project.name,
 value: project.id
 }))
), [projects]);

 const ownerOptions = useMemo(() => (
 [{ label: "Unassigned", value: "" },
 ...users.map((user): { label: string; value: string } => ({
 label: user.full_name || user.email,
 value: user.id
 }))]
), [users]);

 const fields: DrawerFieldConfig[] = [
 {
 key: "title",
 label: "Risk Title",
 type: "text",
 required: true,
 placeholder: "Enter a clear, concise risk title"
 },
 {
 key: "description",
 label: "Description",
 type: "textarea",
 required: true,
 placeholder: "Describe the risk in detail, including potential consequences"
 },
 {
 key: "category",
 label: "Category",
 type: "select",
 required: true,
 options: CATEGORY_OPTIONS
 },
 {
 key: "probability",
 label: "Probability",
 type: "select",
 required: true,
 options: PROBABILITY_OPTIONS
 },
 {
 key: "impact",
 label: "Impact",
 type: "select",
 required: true,
 options: IMPACT_OPTIONS
 },
 {
 key: "project_id",
 label: "Project",
 type: "select",
 required: true,
 options: projectOptions
 },
 {
 key: "owner_id",
 label: "Risk Owner",
 type: "select",
 options: ownerOptions
 },
 {
 key: "status",
 label: "Status",
 type: "select",
 options: STATUS_OPTIONS
 },
 {
 key: "identified_date",
 label: "Identified Date",
 type: "date",
 required: true
 },
 {
 key: "review_date",
 label: "Review Date",
 type: "date",
 placeholder: "When should this risk be reviewed?"
 },
 {
 key: "closed_date",
 label: "Closed Date",
 type: "date",
 placeholder: "When was this risk closed?"
 },
 {
 key: "mitigation_plan",
 label: "Mitigation Plan",
 type: "textarea",
 placeholder: "Describe how this risk will be mitigated or managed"
 },
 {
 key: "contingency_plan",
 label: "Contingency Plan",
 type: "textarea",
 placeholder: "What actions will be taken if this risk occurs?"
 },
 ];

 const handleSave = async (data: Record<string, unknown>) => {
 const title = typeof data.title === "string" ? data.title.trim() : "";
 if (!title) {
 throw new Error("Risk title is required");
 }

 const description = typeof data.description === "string" ? data.description.trim() : "";
 const category = typeof data.category === "string" && data.category.length > 0 ? data.category : risk.category;
 const probability = typeof data.probability === "string" && data.probability.length > 0 ? data.probability : risk.probability;
 const impact = typeof data.impact === "string" && data.impact.length > 0 ? data.impact : risk.impact;
 const status = typeof data.status === "string" && data.status.length > 0 ? data.status : risk.status;
 const projectId = typeof data.project_id === "string" && data.project_id.length > 0 ? data.project_id : risk.project_id;
 const ownerId = typeof data.owner_id === "string" && data.owner_id.length > 0 ? data.owner_id : null;
 const mitigationPlan = typeof data.mitigation_plan === "string" ? data.mitigation_plan.trim() : "";
 const contingencyPlan = typeof data.contingency_plan === "string" ? data.contingency_plan.trim() : "";

 const identifiedDateIso = toIsoStringOrNull(data.identified_date) ?? risk.identified_date ?? new Date().toISOString();
 const reviewDateIso = toIsoStringOrNull(data.review_date) ?? risk.review_date ?? null;
 const closedDateIso = toIsoStringOrNull(data.closed_date) ?? risk.closed_date ?? null;

 const updates = {
 title,
 description,
 category,
 probability,
 impact,
 risk_score: calculateRiskScore(probability, impact),
 status,
 project_id: projectId,
 owner_id: ownerId,
 mitigation_plan: mitigationPlan || null,
 contingency_plan: contingencyPlan || null,
 identified_date: identifiedDateIso,
 review_date: reviewDateIso,
 closed_date: status === "closed" ? (closedDateIso ?? new Date().toISOString()) : closedDateIso,
 updated_at: new Date().toISOString()
 };

 setLoading(true);

 try {
 const { error } = await supabase
 .from("project_risks")
 .update(updates)
 .eq("id", risk.id);

 if (error) {
 throw error;
 }

 onOpenChange(false);
 onSuccess?.();
 } catch (error) {
 console.error("Error updating risk:", error);
 throw error;
 } finally {
 setLoading(false);
 }
 };

 // Pre-populate form with risk data
 const record = {
 id: risk.id,
 title: risk.title,
 description: risk.description ?? "",
 category: risk.category,
 probability: risk.probability,
 impact: risk.impact,
 project_id: risk.project_id ?? "",
 owner_id: risk.owner_id ?? "",
 status: risk.status,
 identified_date: toDateInputValue(risk.identified_date ?? null),
 review_date: toDateInputValue(risk.review_date ?? null),
 closed_date: toDateInputValue(risk.closed_date ?? null),
 mitigation_plan: risk.mitigation_plan ?? "",
 contingency_plan: risk.contingency_plan ?? ""
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title="Edit Risk"
 mode="edit"
 fields={fields}
 record={record}
 onSave={handleSave}
 loading={loading}
 />
 );
}
