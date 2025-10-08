"use client";

import { ListTodo, Calendar, Clock, Users, AlertCircle } from "lucide-react";
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

interface User {
 id: string;
 email: string;
 full_name?: string;
}

interface CreateTaskDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 orgId: string;
 projectId?: string;
 projects: Project[];
 users: User[];
 onSuccess?: () => void;
}

export default function CreateTaskDrawer({
 open,
 onOpenChange,
 orgId,
 projectId,
 projects,
 users,
 onSuccess
}: CreateTaskDrawerProps) {
 const router = useRouter();
 const supabase = createBrowserClient();
 const [loading, setLoading] = useState(false);

 // Form state
 const [formData, setFormData] = useState({
 project_id: projectId || "",
 title: "",
 description: "",
 status: "todo" as "todo" | "in_progress" | "review" | "done" | "blocked",
 priority: "medium" as "low" | "medium" | "high" | "critical",
 assignee_id: "",
 start_date: "",
 due_date: "",
 estimated_hours: "",
 tags: [] as string[]
 });

 const [errors, setErrors] = useState<Record<string, string>({});
 const [tagInput, setTagInput] = useState("");

 // Validate form
 const validateForm = () => {
 const newErrors: Record<string, string> = {};

 if (!formData.project_id) {
 newErrors.project_id = "Project is required";
 }
 if (!formData.title.trim()) {
 newErrors.title = "Title is required";
 }
 if (formData.start_date && formData.due_date) {
 if (new Date(formData.start_date) > new Date(formData.due_date)) {
 newErrors.due_date = "Due date must be after start date";
 }
 }
 if (formData.estimated_hours && parseFloat(formData.estimated_hours) < 0) {
 newErrors.estimated_hours = "Estimated hours must be positive";
 }

 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 // Handle tag addition
 const handleAddTag = () => {
 if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
 setFormData({
 ...formData,
 tags: [...formData.tags, tagInput.trim()]
 });
 setTagInput("");
 }
 };

 // Handle tag removal
 const handleRemoveTag = (tag: string) => {
 setFormData({
 ...formData,
 tags: formData.tags.filter(t => t !== tag)
 });
 };

 // Handle submit
 const handleSubmit = async () => {
 if (!validateForm()) return;

 setLoading(true);
 try {
 // Get current user for reporter_id
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) throw new Error("User not authenticated");

 // Create task
 const { data, error } = await supabase
 .from("project_tasks")
 .insert({
 organization_id: orgId,
 project_id: formData.project_id,
 title: formData.title,
 description: formData.description || null,
 status: formData.status,
 priority: formData.priority,
 assignee_id: formData.assignee_id || null,
 reporter_id: user.id,
 start_date: formData.start_date || null,
 due_date: formData.due_date || null,
 estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
 tags: formData.tags.length > 0 ? formData.tags : null,
 position: 0
 })
 .select()
 .single();

 if (error) throw error;

 toast.success("Task created successfully");
 
 // Reset form
 setFormData({
 project_id: projectId || "",
 title: "",
 description: "",
 status: "todo",
 priority: "medium",
 assignee_id: "",
 start_date: "",
 due_date: "",
 estimated_hours: "",
 tags: []
 });
 setTagInput("");
 setErrors({});
 
 onOpenChange(false);
 onSuccess?.();
 } catch (error) {
 console.error("Error creating task:", error);
 toast.error("Failed to create task");
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
 status: "todo",
 priority: "medium",
 assignee_id: "",
 start_date: "",
 due_date: "",
 estimated_hours: "",
 tags: []
 });
 setTagInput("");
 setErrors({});
 onOpenChange(false);
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title="Create Task"
 description="Add a new task to the project"
 icon={<ListTodo className="h-icon-sm w-icon-sm" />}
 
 >
 <div className="space-y-lg">
 {/* Project Selection */}
 <div>
 <label className="block text-sm font-medium mb-2">
 Project <span className="text-destructive">*</span>
 </label>
 <Select
 value={formData.project_id}
 onValueChange={(value) => setFormData({ ...formData, project_id: value })}
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
 placeholder="e.g., Implement user authentication"
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
 placeholder="Describe the task requirements and acceptance criteria..."
 rows={4}
 />
 </div>

 {/* Status and Priority */}
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="block text-sm font-medium mb-2">
 Status
 </label>
 <Select
 value={formData.status}
 onValueChange={(value) => setFormData({ ...formData, status: value as typeof formData.status })}
 >
 <option value="todo">To Do</option>
 <option value="in_progress">In Progress</option>
 <option value="review">Review</option>
 <option value="done">Done</option>
 <option value="blocked">Blocked</option>
 </Select>
 </div>

 <div>
 <label className="block text-sm font-medium mb-2">
 Priority
 </label>
 <Select
 value={formData.priority}
 onValueChange={(value) => setFormData({ ...formData, priority: value as typeof formData.priority })}
 >
 <option value="low">Low</option>
 <option value="medium">Medium</option>
 <option value="high">High</option>
 <option value="critical">Critical</option>
 </Select>
 </div>
 </div>

 {/* Assignee */}
 <div>
 <label className="block text-sm font-medium mb-2">
 Assignee
 </label>
 <Select
 value={formData.assignee_id}
 onValueChange={(value) => setFormData({ ...formData, assignee_id: value })}
 >
 <option value="">Unassigned</option>
 {users.map((user) => (
 <option key={user.id} value={user.id}>
 {user.full_name || user.email}
 </option>
 ))}
 </Select>
 </div>

 {/* Dates */}
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="block text-sm font-medium mb-2">
 Start Date
 </label>
 <div className="relative">
 <Input
 type="date"
 value={formData.start_date}
 onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
 />
 <Calendar className="absolute right-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground pointer-events-none" />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium mb-2">
 Due Date
 </label>
 <div className="relative">
 <Input
 type="date"
 value={formData.due_date}
 onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
 min={formData.start_date}
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
 </div>

 {/* Estimated Hours */}
 <div>
 <label className="block text-sm font-medium mb-2">
 Estimated Hours
 </label>
 <div className="relative">
 <Input
 type="number"
 step="0.5"
 min="0"
 value={formData.estimated_hours}
 onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
 placeholder="e.g., 8"
 />
 <Clock className="absolute right-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground pointer-events-none" />
 </div>
 {errors.estimated_hours && (
 <p className="text-sm text-destructive mt-1 flex items-center gap-xs">
 <AlertCircle className="h-3 w-3" />
 {errors.estimated_hours}
 </p>
 )}
 </div>

 {/* Tags */}
 <div>
 <label className="block text-sm font-medium mb-2">
 Tags
 </label>
 <div className="flex gap-xs mb-2">
 <Input
 value={tagInput}
 onChange={(e) => setTagInput(e.target.value)}
 placeholder="Add a tag..."
 onKeyPress={(e) => {
 if (e.key === "Enter") {
 e.preventDefault();
 handleAddTag();
 }
 }}
 />
 <Button
 type="button"
 variant="outline"
 onClick={handleAddTag}
 >
 Add
 </Button>
 </div>
 {formData.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {formData.tags.map((tag) => (
 <span
 key={tag}
 className="inline-flex items-center gap-xs px-xs py-xs bg-muted rounded-md text-sm"
 >
 {tag}
 <button
 type="button"
 onClick={() => handleRemoveTag(tag)}
 className="text-muted-foreground hover:text-foreground"
 >
 ×
 </button>
 </span>
 ))}
 </div>
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
 {loading ? "Creating..." : "Create Task"}
 </Button>
 </div>
 </div>
 </AppDrawer>
 );
}
