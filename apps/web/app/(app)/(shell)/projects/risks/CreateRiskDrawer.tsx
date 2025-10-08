"use client";

import { useMemo, useState } from 'react';
import { createBrowserClient } from "@ghxstship/auth";
import { AppDrawer, type DrawerFieldConfig } from "@ghxstship/ui";

interface CreateRiskDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 orgId: string;
 projectId?: string;
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

const toIsoStringOrNull = (value: unknown): string | null => {
 if (typeof value !== "string" || value.trim().length === 0) {
 return null;
 }

 const parsed = new Date(value);
 return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const normalizeTags = (value: unknown): string[] => {
 if (Array.isArray(value)) {
 return value.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0).map((tag) => tag.trim());
 }

 if (typeof value === "string" && value.trim().length > 0) {
 return value
 .split(",")
 .map((tag) => tag.trim())
 .filter((tag) => tag.length > 0);
 }

 return [];
};

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

export default function CreateRiskDrawer({
 open,
 onOpenChange,
 orgId,
 projectId,
 projects = [],
 users = [],
 onSuccess
}: CreateRiskDrawerProps) {
 const supabase = createBrowserClient();
 const [loading, setLoading] = useState(false);

 const projectOptions = useMemo(() => {
 const options = projects.map((project) => ({
 label: project.name,
 value: project.id
 }));

 if (!projectId) {
 return [{ label: "Select a project", value: "" }, ...options];
 }

 return options;
 }, [projectId, projects]);

 const ownerOptions = useMemo(() => (
 [
 { label: "Unassigned", value: "" },
 ...users.map((user) => ({
 label: user.full_name || user.email,
 value: user.id
 })),
 ]
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
 key: "status",
 label: "Status",
 type: "select",
 options: STATUS_OPTIONS
 },
 {
 key: "project_id",
 label: "Project",
 type: "select",
 required: !projectId,
 options: projectOptions
 },
 {
 key: "owner_id",
 label: "Risk Owner",
 type: "select",
 options: ownerOptions
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
 key: "mitigation_plan",
 label: "Mitigation Plan",
 type: "textarea",
 placeholder: "Describe how the risk will be mitigated"
 },
 {
 key: "contingency_plan",
 label: "Contingency Plan",
 type: "textarea",
 placeholder: "Describe fallback actions if the risk occurs"
 },
 {
 key: "tags",
 label: "Tags",
 type: "text",
 placeholder: "Comma separated tags (e.g. schedule, budget)"
 },
 ];

 const handleSave = async (data: Record<string, unknown>) => {
 const title = typeof data.title === "string" ? data.title.trim() : "";
 if (!title) {
 throw new Error("Risk title is required");
 }

 const probability = typeof data.probability === "string" ? data.probability : "medium";
 const impact = typeof data.impact === "string" ? data.impact : "medium";
 const normalizedProjectId =
 typeof data.project_id === "string" && data.project_id.trim().length > 0
 ? data.project_id.trim()
 : projectId ?? null;

 const mitigationPlan = typeof data.mitigation_plan === "string" ? data.mitigation_plan.trim() : "";
 const contingencyPlan = typeof data.contingency_plan === "string" ? data.contingency_plan.trim() : "";
 const status = typeof data.status === "string" && data.status.length > 0 ? data.status : "identified";
 const ownerId = typeof data.owner_id === "string" && data.owner_id.trim().length > 0 ? data.owner_id.trim() : null;

 const identifiedDateIso = toIsoStringOrNull(data.identified_date) ?? new Date().toISOString();
 const reviewDateIso = toIsoStringOrNull(data.review_date);
 const tags = normalizeTags(data.tags);

 const description = typeof data.description === "string" ? data.description.trim() : "";
 const category = typeof data.category === "string" && data.category.length > 0 ? data.category : "operational";

 const payload = {
 organization_id: orgId,
 project_id: normalizedProjectId,
 title,
 description: description || null,
 category,
 probability,
 impact,
 risk_score: calculateRiskScore(probability, impact),
 owner_id: ownerId,
 mitigation_plan: mitigationPlan || null,
 contingency_plan: contingencyPlan || null,
 status,
 identified_date: identifiedDateIso,
 review_date: reviewDateIso,
 attachments: [] as string[],
 tags
 };

 setLoading(true);

 try {
 const { error } = await supabase.from("project_risks").insert(payload);

 if (error) {
 throw error;
 }

 onOpenChange(false);
 onSuccess?.();
 } catch (error) {
 console.error("Error creating risk:", error);
 throw error;
 } finally {
 setLoading(false);
 }
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title="Identify New Risk"
 mode="create"
 fields={fields}
 onSave={handleSave}
 loading={loading}
 />
 );
}
