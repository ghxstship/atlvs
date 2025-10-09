"use client";

import { Target, Calendar, AlertCircle } from "lucide-react";
import { useState } from 'react';
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@ghxstship/auth";
import {
 AppDrawer,
 Button,
 Input,
 Select,
 Textarea,
 toast
} from "@ghxstship/ui";
import { format } from "date-fns";

interface Project {
 id: string;
 name: string;
 status: string;
}

interface CreateMilestoneDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 orgId: string;
 projectId?: string;
 projects: Project[];
 onSuccess?: () => void;
}

export default function CreateMilestoneDrawer({
 open,
 onOpenChange,
 orgId,
 projectId,
 projects,
 onSuccess
}: CreateMilestoneDrawerProps) {
 const router = useRouter();
 const supabase = createBrowserClient();
 const [loading, setLoading] = useState(false);

 // Form state
 const [formData, setFormData] = useState({
 project_id: projectId || "",
 title: "",
 description: "",
 due_date: "",
 progress: 0
 });

 const [errors, setErrors] = useState<Record<string, string>({});

 // Validate form
 const validateForm = () => {
 const newErrors: Record<string, string> = {};

 if (!formData.project_id) {
 newErrors.project_id = "Project is required";
 }
 if (!formData.title.trim()) {
 newErrors.title = "Title is required";
 }
 if (!formData.due_date) {
 newErrors.due_date = "Due date is required";
 }
 if (formData.progress < 0 || formData.progress > 100) {
 newErrors.progress = "Progress must be between 0 and 100";
 }

 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 // Handle submit
 const handleSubmit = async () => {
 if (!validateForm()) return;

 setLoading(true);
 try {
 // Determine status based on due date and progress
 const today = new Date();
 const dueDate = new Date(formData.due_date);
 let status: "pending" | "completed" | "overdue" = "pending";
 
 if (formData.progress === 100) {
 status = "completed";
 } else if (dueDate < today) {
 status = "overdue";
 }

 // Create milestone
 const { data, error } = await supabase
 .from("project_milestones")
 .insert({
 organization_id: orgId,
 project_id: formData.project_id,
 title: formData.title,
 description: formData.description || null,
 due_date: formData.due_date,
 status,
 progress: formData.progress,
 completed_at: formData.progress === 100 ? new Date().toISOString() : null
 })
 .select()
 .single();

 if (error) throw error;

 toast.success("Milestone created successfully");
 
 // Reset form
 setFormData({
 project_id: projectId || "",
 title: "",
 description: "",
 due_date: "",
 progress: 0
 });
 setErrors({});
 
 onOpenChange(false);
 onSuccess?.();
 } catch (error) {
 console.error("Error creating milestone:", error);
 toast.error("Failed to create milestone");
 } finally {
 setLoading(false);
 }
 };

 // Handle cancel
 const handleCancel = () => {
 setFormData({
 project_id: projectId || "",
 title: "",
 description: "",
 due_date: "",
 progress: 0
 });
 setErrors({});
 onOpenChange(false);
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title="Create Milestone"
 description="Add a new milestone to track project progress"
 icon={<Target className="h-icon-sm w-icon-sm" />}
 
 >
 <div className="space-y-lg">
 {/* Project Selection */}
 <div>
 <label className="block text-sm font-medium mb-2">
 Project <span className="text-destructive">*</span>
 </label>
 <Select
 value={formData.project_id}
 onChange={(e) => setFormData({ ...formData, project_id: value })}
 disabled={!!projectId}
 >
 <option value="">Select a project</option>
 {projects.map((project) => (
 <option key={project.id} value={project.id}>
 {project.name}
 </option>
 ))}
 </Select>
 {errors.project_id && (
 <p className="text-sm text-destructive mt-1 flex items-center gap-xs">
 <AlertCircle className="h-3 w-3" />
 {errors.project_id}
 </p>
 )}
 </div>

 {/* Title */}
 <div>
 <label className="block text-sm font-medium mb-2">
 Title <span className="text-destructive">*</span>
 </label>
 <Input
 value={formData.title}
 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 placeholder="e.g., Phase 1 Complete"
 maxLength={255}
 />
 {errors.title && (
 <p className="text-sm text-destructive mt-1 flex items-center gap-xs">
 <AlertCircle className="h-3 w-3" />
 {errors.title}
 </p>
 )}
 </div>

 {/* Description */}
 <div>
 <label className="block text-sm font-medium mb-2">
 Description
 </label>
 <Textarea
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 placeholder="Describe the milestone and its deliverables..."
 rows={4}
 />
 </div>

 {/* Due Date */}
 <div>
 <label className="block text-sm font-medium mb-2">
 Due Date <span className="text-destructive">*</span>
 </label>
 <div className="relative">
 <Input
 type="date"
 value={formData.due_date}
 onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
 min={format(new Date(), "yyyy-MM-dd")}
 />
 <Calendar className="absolute right-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground pointer-events-none" />
 </div>
 {errors.due_date && (
 <p className="text-sm text-destructive mt-1 flex items-center gap-xs">
 <AlertCircle className="h-3 w-3" />
 {errors.due_date}
 </p>
 )}
 </div>

 {/* Progress */}
 <div>
 <label className="block text-sm font-medium mb-2">
 Initial Progress (%)
 </label>
 <div className="flex items-center gap-md">
 <Input
 type="range"
 min="0"
 max="100"
 value={formData.progress}
 onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
 className="flex-1"
 />
 <div className="w-component-md">
 <Input
 type="number"
 min="0"
 max="100"
 value={formData.progress}
 onChange={(e) => {
 const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
 setFormData({ ...formData, progress: value });
 }}
 />
 </div>
 </div>
 {errors.progress && (
 <p className="text-sm text-destructive mt-1 flex items-center gap-xs">
 <AlertCircle className="h-3 w-3" />
 {errors.progress}
 </p>
 )}
 </div>

 {/* Actions */}
 <div className="flex justify-end gap-sm pt-6 border-t">
 <Button
 variant="outline"
 onClick={handleCancel}
 disabled={loading}
 >
 Cancel
 </Button>
 <Button
 onClick={handleSubmit}
 disabled={loading}
 >
 {loading ? "Creating..." : "Create Milestone"}
 </Button>
 </div>
 </div>
 </AppDrawer>
 );
}
