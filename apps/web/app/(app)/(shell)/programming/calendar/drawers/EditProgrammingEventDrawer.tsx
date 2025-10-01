"use client";

import { Calendar, Clock, MapPin, Users, AlertCircle, Tag, Plus, X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
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
import type { ProgrammingEvent, ProgrammingEventProject } from "../types";

type EditProgrammingEventDrawerProps = {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 event: ProgrammingEvent;
 orgId: string;
 currentUserId: string;
 projects: ProgrammingEventProject[];
 onSuccess?: () => void;
};

export default function EditProgrammingEventDrawer({
 open,
 onOpenChange,
 event,
 orgId,
 currentUserId,
 projects,
 onSuccess,
}: EditProgrammingEventDrawerProps) {
 const supabase = createBrowserClient();
 const [loading, setLoading] = useState(false);

 // Form state
 const [formData, setFormData] = useState({
 title: "",
 description: "",
 project_id: "",
 event_type: "performance" as const,
 status: "draft" as const,
 location: "",
 capacity: "",
 start_at: "",
 end_at: "",
 setup_start: "",
 teardown_end: "",
 timezone: "UTC",
 is_all_day: false,
 broadcast_url: "",
 tags: [] as string[],
 });

 const [errors, setErrors] = useState<Record<string, string>({});
 const [tagInput, setTagInput] = useState("");

 // Initialize form with event data
 useEffect(() => {
 if (event) {
 setFormData({
 title: event.title,
 description: event.description || "",
 project_id: event.project_id || "",
 event_type: event.event_type,
 status: event.status,
 location: event.location || "",
 capacity: event.capacity?.toString() || "",
 start_at: event.start_at ? format(parseISO(event.start_at), "yyyy-MM-dd'T'HH:mm") : "",
 end_at: event.end_at ? format(parseISO(event.end_at), "yyyy-MM-dd'T'HH:mm") : "",
 setup_start: event.setup_start ? format(parseISO(event.setup_start), "yyyy-MM-dd'T'HH:mm") : "",
 teardown_end: event.teardown_end ? format(parseISO(event.teardown_end), "yyyy-MM-dd'T'HH:mm") : "",
 timezone: event.timezone || "UTC",
 is_all_day: event.is_all_day,
 broadcast_url: event.broadcast_url || "",
 tags: event.tags || [],
 });
 }
 }, [event]);

 // Validate form
 const validateForm = () => {
 const newErrors: Record<string, string> = {};

 if (!formData.title.trim()) {
 newErrors.title = "Title is required";
 }
 if (!formData.start_at) {
 newErrors.start_at = "Start time is required";
 }
 if (formData.start_at && formData.end_at) {
 if (new Date(formData.start_at) >= new Date(formData.end_at)) {
 newErrors.end_at = "End time must be after start time";
 }
 }
 if (formData.capacity && parseInt(formData.capacity) <= 0) {
 newErrors.capacity = "Capacity must be positive";
 }
 if (formData.broadcast_url && !formData.broadcast_url.startsWith("http")) {
 newErrors.broadcast_url = "Broadcast URL must be a valid URL";
 }

 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 // Handle tag addition
 const handleAddTag = () => {
 const tag = tagInput.trim();
 if (tag && !formData.tags.includes(tag)) {
 setFormData({
 ...formData,
 tags: [...formData.tags, tag],
 });
 setTagInput("");
 }
 };

 // Handle tag removal
 const handleRemoveTag = (tag: string) => {
 setFormData({
 ...formData,
 tags: formData.tags.filter(t => t !== tag),
 });
 };

 // Handle submit
 const handleSubmit = async () => {
 if (!validateForm()) return;

 setLoading(true);
 try {
 const response = await fetch(`/api/v1/programming/events/${event.id}`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 title: formData.title,
 description: formData.description || undefined,
 project_id: formData.project_id || null,
 event_type: formData.event_type,
 status: formData.status,
 location: formData.location || null,
 capacity: formData.capacity ? parseInt(formData.capacity) : null,
 start_at: new Date(formData.start_at).toISOString(),
 end_at: formData.end_at ? new Date(formData.end_at).toISOString() : null,
 setup_start: formData.setup_start ? new Date(formData.setup_start).toISOString() : null,
 teardown_end: formData.teardown_end ? new Date(formData.teardown_end).toISOString() : null,
 timezone: formData.timezone,
 is_all_day: formData.is_all_day,
 broadcast_url: formData.broadcast_url || null,
 tags: formData.tags,
 resources: event.resources || [],
 staffing: event.staffing || [],
 metadata: event.metadata || {},
 }),
 });

 if (!response.ok) {
 const error = await response.json();
 throw new Error(error.error || "Failed to update event");
 }

 toast.success("Event updated successfully");
 onOpenChange(false);
 onSuccess?.();
 } catch (error) {
 console.error("Error updating event:", error);
 toast.error(error instanceof Error ? error.message : "Failed to update event");
 } finally {
 setLoading(false);
 }
 };

 // Handle delete
 const handleDelete = async () => {
 if (!confirm(`Are you sure you want to delete "${event.title}"?`)) return;

 setLoading(true);
 try {
 const response = await fetch(`/api/v1/programming/events/${event.id}`, {
 method: "DELETE",
 });

 if (!response.ok) {
 const error = await response.json();
 throw new Error(error.error || "Failed to delete event");
 }

 toast.success("Event deleted successfully");
 onOpenChange(false);
 onSuccess?.();
 } catch (error) {
 console.error("Error deleting event:", error);
 toast.error(error instanceof Error ? error.message : "Failed to delete event");
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
 title="Edit Programming Event"
 description="Update event details and settings"
 icon={<Calendar className="h-icon-sm w-icon-sm" />}
 
 >
 <div className="space-y-lg">
 {/* Title */}
 <div>
 <label className="block text-sm font-medium mb-2">
 Title <span className="text-destructive">*</span>
 </label>
 <Input
 value={formData.title}
 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 placeholder="e.g., Main Stage Performance"
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
 placeholder="Describe the event details, requirements, and expectations..."
 rows={4}
 />
 </div>

 {/* Project and Event Type */}
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="block text-sm font-medium mb-2">
 Project
 </label>
 <Select
 value={formData.project_id}
 onValueChange={(value) => setFormData({ ...formData, project_id: value })}
 >
 <option value="">No project</option>
 {projects.map((project) => (
 <option key={project.id} value={project.id}>
 {project.name}
 </option>
 ))}
 </Select>
 </div>

 <div>
 <label className="block text-sm font-medium mb-2">
 Event Type
 </label>
 <Select
 value={formData.event_type}
 onValueChange={(value) => setFormData({ ...formData, event_type: value as typeof formData.event_type })}
 >
 <option value="performance">Performance</option>
 <option value="activation">Activation</option>
 <option value="workshop">Workshop</option>
 <option value="meeting">Meeting</option>
 <option value="rehearsal">Rehearsal</option>
 <option value="setup">Setup</option>
 <option value="breakdown">Breakdown</option>
 <option value="other">Other</option>
 </Select>
 </div>
 </div>

 {/* Status and Location */}
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="block text-sm font-medium mb-2">
 Status
 </label>
 <Select
 value={formData.status}
 onValueChange={(value) => setFormData({ ...formData, status: value as typeof formData.status })}
 >
 <option value="draft">Draft</option>
 <option value="scheduled">Scheduled</option>
 <option value="in_progress">In Progress</option>
 <option value="completed">Completed</option>
 <option value="cancelled">Cancelled</option>
 </Select>
 </div>

 <div>
 <label className="block text-sm font-medium mb-2">
 Location
 </label>
 <div className="relative">
 <Input
 value={formData.location}
 onChange={(e) => setFormData({ ...formData, location: e.target.value })}
 placeholder="e.g., Main Stage, Studio A"
 />
 <MapPin className="absolute right-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground pointer-events-none" />
 </div>
 </div>
 </div>

 {/* Start and End Times */}
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="block text-sm font-medium mb-2">
 Start Time <span className="text-destructive">*</span>
 </label>
 <div className="relative">
 <Input
 type="datetime-local"
 value={formData.start_at}
 onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
 />
 <Clock className="absolute right-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground pointer-events-none" />
 </div>
 {errors.start_at && (
 <p className="text-sm text-destructive mt-1 flex items-center gap-xs">
 <AlertCircle className="h-3 w-3" />
 {errors.start_at}
 </p>
 )}
 </div>

 <div>
 <label className="block text-sm font-medium mb-2">
 End Time
 </label>
 <div className="relative">
 <Input
 type="datetime-local"
 value={formData.end_at}
 onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
 min={formData.start_at}
 />
 <Clock className="absolute right-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground pointer-events-none" />
 </div>
 {errors.end_at && (
 <p className="text-sm text-destructive mt-1 flex items-center gap-xs">
 <AlertCircle className="h-3 w-3" />
 {errors.end_at}
 </p>
 )}
 </div>
 </div>

 {/* Setup and Teardown Times */}
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="block text-sm font-medium mb-2">
 Setup Start
 </label>
 <Input
 type="datetime-local"
 value={formData.setup_start}
 onChange={(e) => setFormData({ ...formData, setup_start: e.target.value })}
 />
 </div>

 <div>
 <label className="block text-sm font-medium mb-2">
 Teardown End
 </label>
 <Input
 type="datetime-local"
 value={formData.teardown_end}
 onChange={(e) => setFormData({ ...formData, teardown_end: e.target.value })}
 />
 </div>
 </div>

 {/* Capacity and Broadcast URL */}
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="block text-sm font-medium mb-2">
 Capacity
 </label>
 <div className="relative">
 <Input
 type="number"
 min="0"
 value={formData.capacity}
 onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
 placeholder="e.g., 500"
 />
 <Users className="absolute right-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground pointer-events-none" />
 </div>
 {errors.capacity && (
 <p className="text-sm text-destructive mt-1 flex items-center gap-xs">
 <AlertCircle className="h-3 w-3" />
 {errors.capacity}
 </p>
 )}
 </div>

 <div>
 <label className="block text-sm font-medium mb-2">
 Broadcast URL
 </label>
 <Input
 type="url"
 value={formData.broadcast_url}
 onChange={(e) => setFormData({ ...formData, broadcast_url: e.target.value })}
 placeholder="https://stream.example.com/event"
 />
 {errors.broadcast_url && (
 <p className="text-sm text-destructive mt-1 flex items-center gap-xs">
 <AlertCircle className="h-3 w-3" />
 {errors.broadcast_url}
 </p>
 )}
 </div>
 </div>

 {/* Tags */}
 <div>
 <label className="block text-sm font-medium mb-2">
 Tags
 </label>
 <div className="flex gap-xs mb-2">
 <div className="relative flex-1">
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
 <Tag className="absolute right-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground pointer-events-none" />
 </div>
 <Button
 type="button"
 variant="outline"
 onClick={handleAddTag}
 >
 <Plus className="h-icon-xs w-icon-xs" />
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
 <X className="h-3 w-3" />
 </button>
 </span>
 ))}
 </div>
 )}
 </div>

 {/* Metadata */}
 <div className="text-sm text-muted-foreground space-y-xs">
 <p>Created: {format(parseISO(event.created_at || event.start_at), "MMM d, yyyy 'at' h:mm a")}</p>
 <p>Updated: {format(parseISO(event.updated_at || event.start_at), "MMM d, yyyy 'at' h:mm a")}</p>
 </div>

 {/* Actions */}
 <div className="flex justify-between pt-6 border-t">
 <Button
 variant="destructive"
 onClick={handleDelete}
 disabled={loading}
 >
 <Trash2 className="h-icon-xs w-icon-xs mr-2" />
 Delete
 </Button>
 <div className="flex gap-sm">
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
