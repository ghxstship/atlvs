"use client";

import { Target, Calendar, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@ghxstship/auth";
import {
 AppDrawer,
 Button,
 Input,
 Select,
 Textarea,
 toast,
} from "@ghxstship/ui";
import { format, parseISO } from "date-fns";

interface Project {
 id: string;
 name: string;
 status: string;
}

interface Milestone {
 id: string;
 project_id: string;
 organization_id: string;
 project?: {
 id: string;
 name: string;
 status: string;
 };
 title: string;
 description?: string;
 due_date: string;
 completed_at?: string;
 status: "pending" | "completed" | "overdue";
 progress: number;
 dependencies?: string[];
 created_at: string;
 updated_at: string;
}

interface EditMilestoneDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 milestone: Milestone;
 projects: Project[];
 onSuccess?: () => void;
}

export default function EditMilestoneDrawer({
 open,
 onOpenChange,
 milestone,
 projects,
 onSuccess,
}: EditMilestoneDrawerProps) {
 const router = useRouter();
 const supabase = createBrowserClient();
 const [loading, setLoading] = useState(false);

 // Form state
 const [formData, setFormData] = useState({
 project_id: "",
 title: "",
 description: "",
 due_date: "",
 progress: 0,
 status: "pending" as "pending" | "completed" | "overdue",
 });

 const [errors, setErrors] = useState<Record<string, string>({});

 // Initialize form with milestone data
 useEffect(() => {
 if (milestone) {
 setFormData({
 project_id: milestone.project_id,
 title: milestone.title,
 description: milestone.description || "",
 due_date: milestone.due_date,
 progress: milestone.progress,
 status: milestone.status,
 });
 }
 }, [milestone]);

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
 let status: "pending" | "completed" | "overdue" = formData.status;
 
 if (formData.progress === 100) {
 status = "completed";
 } else if (dueDate < today && formData.progress < 100) {
 status = "overdue";
 } else if (formData.progress < 100) {
 status = "pending";
 }

 // Update milestone
 const { data, error } = await supabase
 .from("project_milestones")
 .update({
 project_id: formData.project_id,
 title: formData.title,
 description: formData.description || null,
 due_date: formData.due_date,
 status,
 progress: formData.progress,
 completed_at: formData.progress === 100 && !milestone.completed_at 
 ? new Date().toISOString() 
 : formData.progress === 100 
 ? milestone.completed_at 
 : null,
 updated_at: new Date().toISOString(),
 })
 .eq("id", milestone.id)
 .select()
 .single();

 if (error) throw error;

 toast.success("Milestone updated successfully");
 onOpenChange(false);
 onSuccess?.();
 } catch (error) {
 console.error("Error updating milestone:", error);
 toast.error("Failed to update milestone");
 } finally {
 setLoading(false);
 }
 };

 // Handle delete
 const handleDelete = async () => {
 if (!confirm("Are you sure you want to delete this milestone?")) return;

 setLoading(true);
 try {
 const { error } = await supabase
 .from("project_milestones")
 .delete()
 .eq("id", milestone.id);

 if (error) throw error;

 toast.success("Milestone deleted successfully");
 onOpenChange(false);
 onSuccess?.();
 } catch (error) {
 console.error("Error deleting milestone:", error);
 toast.error("Failed to delete milestone");
 } finally {
 setLoading(false);
 }
 };

 // Handle cancel
 const handleCancel = () => {
 setErrors({});
 onOpenChange(false);
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title="Edit Milestone"
 description="Update milestone details and progress"
 icon={<Target className="h-5 w-5" />}
 
 >
 <div className="space-y-6">
 {/* Project Selection */}
 <div>
 <label className="block text-sm font-medium mb-2">
 Project <span className="text-destructive">*</span>
 </label>
 <Select
 value={formData.project_id}
 onValueChange={(value) => setFormData({ ...formData, project_id: value })}
 >
 <option value="">Select a project</option>
 {projects.map((project) => (
 <option key={project.id} value={project.id}>
 {project.name}
 </option>
 ))}
 </Select>
 {errors.project_id && (
 <p className="text-sm text-destructive mt-1 flex items-center gap-1">
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
 <p className="text-sm text-destructive mt-1 flex items-center gap-1">
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
 />
 <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
 </div>
 {errors.due_date && (
 <p className="text-sm text-destructive mt-1 flex items-center gap-1">
 <AlertCircle className="h-3 w-3" />
 {errors.due_date}
 </p>
 )}
 </div>

 {/* Status */}
 <div>
 <label className="block text-sm font-medium mb-2">
 Status
 </label>
 <Select
 value={formData.status}
 onValueChange={(value) => setFormData({ ...formData, status: value as typeof formData.status })}
 >
 <option value="pending">Pending</option>
 <option value="completed">Completed</option>
 <option value="overdue">Overdue</option>
 </Select>
 </div>

 {/* Progress */}
 <div>
 <label className="block text-sm font-medium mb-2">
 Progress (%)
 </label>
 <div className="flex items-center gap-4">
 <Input
 type="range"
 min="0"
 max="100"
 value={formData.progress}
 onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
 className="flex-1"
 />
 <div className="w-16">
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
 <p className="text-sm text-destructive mt-1 flex items-center gap-1">
 <AlertCircle className="h-3 w-3" />
 {errors.progress}
 </p>
 )}
 </div>

 {/* Metadata */}
 <div className="text-sm text-muted-foreground space-y-1">
 <p>Created: {format(parseISO(milestone.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
 <p>Updated: {format(parseISO(milestone.updated_at), "MMM d, yyyy 'at' h:mm a")}</p>
 {milestone.completed_at && (
 <p>Completed: {format(parseISO(milestone.completed_at), "MMM d, yyyy 'at' h:mm a")}</p>
 )}
 </div>

 {/* Actions */}
 <div className="flex justify-between pt-6 border-t">
 <Button
 variant="destructive"
 onClick={handleDelete}
 disabled={loading}
 >
 Delete
 </Button>
 <div className="flex gap-3">
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
 {loading ? "Saving..." : "Save Changes"}
 </Button>
 </div>
 </div>
 </div>
 </AppDrawer>
 );
}
