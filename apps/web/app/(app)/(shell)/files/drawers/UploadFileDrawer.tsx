"use client";

import { Upload, X, FileText, Image, Video, Music, File } from "lucide-react";
import { useState, useRef } from 'react';
import { createBrowserClient } from "@ghxstship/auth";
import AppDrawer from "@ghxstship/ui";
import type { DrawerFieldConfig } from "@ghxstship/ui";
import {
  AppDrawer,
  Button
} from "@ghxstship/ui";

interface UploadFileDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 orgId: string;
 projectId?: string;
 projects?: Array<{ id: string; name: string }>;
 onSuccess?: () => void;
}

export default function UploadFileDrawer({
 open,
 onOpenChange,
 orgId,
 projectId,
 projects = [],
 onSuccess
}: UploadFileDrawerProps) {
 const supabase = createBrowserClient();
 const [loading, setLoading] = useState(false);
 const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
 const fileInputRef = useRef<HTMLInputElement>(null);

 const fields: DrawerFieldConfig[] = [
 {
 key: "project_id",
 label: "Project",
 type: "select",
 options: [
 { label: "Select a project", value: "" },
 ...projects.map((p) => ({ label: p.name, value: p.id })),
 ]
 },
 {
 key: "description",
 label: "Description",
 type: "textarea",
 placeholder: "Add a description for these files"
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

 const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
 const files = Array.from(e.target.files || []);
 setSelectedFiles(files);
 };

 const removeFile = (index: number) => {
 setSelectedFiles((prev: unknown) => prev.filter((_, i) => i !== index));
 };

 const getFileIcon = (file: File) => {
 if (file.type.startsWith("image/")) return Image;
 if (file.type.startsWith("video/")) return Video;
 if (file.type.startsWith("audio/")) return Music;
 if (file.type.includes("pdf") || file.type.includes("document") || file.type.includes("text")) return FileText;
 return File;
 };

 const formatFileSize = (bytes: number) => {
 if (bytes === 0) return "0 Bytes";
 const k = 1024;
 const sizes = ["Bytes", "KB", "MB", "GB"];
 const i = Math.floor(Math.log(bytes) / Math.log(k));
 return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
 };

 const detectCategory = (file: File) => {
 if (file.type.startsWith("image/")) return "image";
 if (file.type.startsWith("video/")) return "video";
 if (file.type.startsWith("audio/")) return "audio";
 if (file.type.includes("pdf") || file.type.includes("document")) return "document";
 return "other";
 };

 const handleSave = async (data: Record<string, unknown>) => {
 if (selectedFiles.length === 0) {
 throw new Error("Please select at least one file to upload");
 }

 setLoading(true);
 try {
 // Get current user
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) throw new Error("User not authenticated");

 // Process tags
 const tags = data.tags ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];

 // Upload each file
 for (const file of selectedFiles) {
 // Upload to Supabase Storage
 const fileExt = file.name.split(".").pop();
 const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
 const filePath = `${orgId}/${projectId || "general"}/${fileName}`;

 const { data: uploadData, error: uploadError } = await supabase.storage
 .from("project-files")
 .upload(filePath, file);

 if (uploadError) throw uploadError;

 // Get public URL
 const { data: { publicUrl } } = supabase.storage
 .from("project-files")
 .getPublicUrl(filePath);

 // Create file record in database
 const { error: dbError } = await supabase.from("project_files").insert({
 organization_id: orgId,
 project_id: data.project_id || projectId || null,
 name: file.name,
 description: data.description || null,
 file_url: publicUrl,
 file_size: file.size,
 file_type: file.type || "application/octet-stream",
 category: data.category || detectCategory(file),
 version: "1.0",
 is_latest: true,
 uploaded_by: user.id,
 tags: tags,
 access_level: data.access_level || "team",
 download_count: 0
 });

 if (dbError) throw dbError;
 }

 onOpenChange(false);
 setSelectedFiles([]);
 onSuccess?.();
 } catch (error) {
 console.error("Error uploading files:", error);
 throw error;
 } finally {
 setLoading(false);
 }
 };

 // Custom content for file selection
 const customContent = (
 <div className="space-y-md mb-md">
 <div className="border-2 border-dashed border-muted rounded-lg p-lg text-center">
 <input
 ref={fileInputRef}
 type="file"
 multiple
 onChange={handleFileSelect}
 className="hidden"
 />
 <Upload className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-md" />
 <p className="text-sm text-muted-foreground mb-sm">
 Drag and drop files here, or click to browse
 </p>
 <Button
 variant="outline"
 onClick={() => fileInputRef.current?.click()}
 >
 Select Files
 </Button>
 </div>

 {selectedFiles.length > 0 && (
 <div className="space-y-sm">
 <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
 <div className="space-y-xs max-h-content-sm overflow-y-auto">
 {selectedFiles.map((file, index) => {
 const FileIcon = getFileIcon(file);
 return (
 <div
 key={index}
 className="flex items-center gap-sm p-sm bg-muted/50 rounded-lg"
 >
 <FileIcon className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0" />
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium truncate">{file.name}</p>
 <p className="text-xs text-muted-foreground">
 {formatFileSize(file.size)}
 </p>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => removeFile(index)}
 >
 <X className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 );
 })}
 </div>
 </div>
 )}
 </div>
 );

 return (
 <AppDrawer
 open={open}
 onClose={() => {
 onOpenChange(false);
 setSelectedFiles([]);
 }}
 title="Upload Files"
 mode="create"
 fields={fields}
 onSave={handleSave}
 loading={loading}
 >
 {customContent}
 </AppDrawer>
 );
}
