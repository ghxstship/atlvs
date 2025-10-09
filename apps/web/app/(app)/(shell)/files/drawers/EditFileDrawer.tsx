"use client";


import {
  AppDrawer
} from "@ghxstship/ui";

import { useState, useEffect } from 'react';
import { createBrowserClient } from "@ghxstship/auth";
import AppDrawer from "@ghxstship/ui";
import type { DrawerFieldConfig } from "@ghxstship/ui";
import type { ProjectFile } from "./FilesClient";
import { Edit, Tag } from 'lucide-react';

interface EditFileDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 file: ProjectFile;
 projects?: Array<{ id: string; name: string }>;
 onSuccess?: () => void;
}

export default function EditFileDrawer({
 open,
 onOpenChange,
 file,
 projects = [],
 onSuccess
}: EditFileDrawerProps) {
 const supabase = createBrowserClient();
 const [loading, setLoading] = useState(false);

 const fields: DrawerFieldConfig[] = [
 {
 key: "name",
 label: "File Name",
 type: "text",
 required: true,
 placeholder: "Enter file name"
 },
 {
 key: "description",
 label: "Description",
 type: "textarea",
 placeholder: "Add a description for this file"
 },
 {
 key: "project_id",
 label: "Project",
 type: "select",
 options: [
 { label: "No project", value: "" },
 ...projects.map((p) => ({ label: p.name, value: p.id })),
 ]
 },
 {
 key: "category",
 label: "Category",
 type: "select",
 options: [
 { label: "Document", value: "document" },
 { label: "Image", value: "image" },
 { label: "Video", value: "video" },
 { label: "Audio", value: "audio" },
 { label: "Drawing", value: "drawing" },
 { label: "Specification", value: "specification" },
 { label: "Report", value: "report" },
 { label: "Other", value: "other" },
 ]
 },
 {
 key: "version",
 label: "Version",
 type: "text",
 placeholder: "1.0"
 },
 {
 key: "is_latest",
 label: "Mark as Latest Version",
 type: "checkbox"
 },
 {
 key: "access_level",
 label: "Access Level",
 type: "select",
 options: [
 { label: "Team", value: "team" },
 { label: "Public", value: "public" },
 { label: "Restricted", value: "restricted" },
 ]
 },
 {
 key: "tags",
 label: "Tags (comma-separated)",
 type: "text",
 placeholder: "tag1, tag2, tag3"
 },
 ];

 const handleSave = async (data: Record<string, unknown>) => {
 setLoading(true);
 try {
 // Process tags
 const tags = data.tags ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];

 // Update file record
 const { error } = await supabase
 .from("project_files")
 .update({
 name: data.name,
 description: data.description || null,
 project_id: data.project_id || null,
 category: data.category,
 version: data.version || "1.0",
 is_latest: data.is_latest || false,
 access_level: data.access_level,
 tags: tags,
 updated_at: new Date().toISOString()
 })
 .eq("id", file.id);

 if (error) throw error;

 onOpenChange(false);
 onSuccess?.();
 } catch (error) {
 console.error("Error updating file:", error);
 throw error;
 } finally {
 setLoading(false);
 }
 };

 // Pre-populate form with file data
 const record = {
 name: file.name,
 description: file.description || "",
 project_id: file.project_id || "",
 category: file.category,
 version: file.version,
 is_latest: file.is_latest,
 access_level: file.access_level,
 tags: file.tags?.join(", ") || ""
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title="Edit File"
 mode="edit"
 fields={fields}
 record={record}
 onSave={handleSave}
 loading={loading}
 />
 );
}
