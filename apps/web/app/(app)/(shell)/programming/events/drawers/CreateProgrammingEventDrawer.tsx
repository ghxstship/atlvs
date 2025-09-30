"use client";

import { Calendar, Clock, MapPin, Plus, Save, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
 Button,
 Card,
 Modal,
 Input,
 Label,
 Select,
 Textarea,
 Badge,
} from "@ghxstship/ui";
import type { ProgrammingEventProject } from "../types";

const createEventSchema = z.object({
 title: z.string().min(1, "Title is required").max(255),
 description: z.string().optional(),
 project_id: z.string().uuid().nullable().optional(),
 event_type: z.enum([
 "performance",
 "activation", 
 "workshop",
 "meeting",
 "rehearsal",
 "setup",
 "breakdown",
 "other",
 ]),
 status: z.enum(["draft", "scheduled", "in_progress", "completed", "cancelled"]).default("draft"),
 location: z.string().optional(),
 capacity: z.number().min(0).max(100000).nullable().optional(),
 start_at: z.string().min(1, "Start date/time is required"),
 end_at: z.string().nullable().optional(),
 setup_start: z.string().nullable().optional(),
 teardown_end: z.string().nullable().optional(),
 timezone: z.string().default("UTC"),
 is_all_day: z.boolean().default(false),
 broadcast_url: z.string().url().nullable().optional(),
 tags: z.array(z.string()).default([]),
 resources: z.array(z.object({
 name: z.string(),
 quantity: z.number().min(1),
 })).default([]),
 staffing: z.array(z.object({
 role: z.string(),
 user_id: z.string().uuid().optional(),
 notes: z.string().optional(),
 })).default([]),
 metadata: z.record(z.any()).optional(),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

type CreateProgrammingEventDrawerProps = {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 orgId: string;
 currentUserId: string;
 projects: ProgrammingEventProject[];
 onSuccess: () => void;
};

export default function CreateProgrammingEventDrawer({
 open,
 onOpenChange,
 orgId,
 currentUserId,
 projects,
 onSuccess,
}: CreateProgrammingEventDrawerProps) {
 const handleClose = () => onOpenChange(false);
 const [loading, setLoading] = useState(false);
 const [newTag, setNewTag] = useState("");
 const [newResource, setNewResource] = useState({ name: "", quantity: 1 });
 const [newStaff, setNewStaff] = useState({ role: "", notes: "" });

 const {
 register,
 handleSubmit,
 watch,
 setValue,
 reset,
 formState: { errors },
 } = useForm<CreateEventFormData>({
 resolver: zodResolver(createEventSchema),
 defaultValues: {
 event_type: "performance",
 status: "draft",
 timezone: "UTC",
 is_all_day: false,
 tags: [],
 resources: [],
 staffing: [],
 },
 });

 const watchedTags = watch("tags");
 const watchedResources = watch("resources");
 const watchedStaffing = watch("staffing");
 const watchedIsAllDay = watch("is_all_day");

 const onSubmit = async (data: CreateEventFormData) => {
 try {
 setLoading(true);
 
 const response = await fetch("/api/v1/programming/events", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(data),
 });

 if (!response.ok) {
 const error = await response.json();
 throw new Error(error.error || "Failed to create event");
 }

 onSuccess();
 handleClose();
 reset();
 } catch (error) {
 console.error("Failed to create event:", error);
 } finally {
 setLoading(false);
 }
 };

 const addTag = () => {
 if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
 setValue("tags", [...watchedTags, newTag.trim()]);
 setNewTag("");
 }
 };

 const removeTag = (tagToRemove: string) => {
 setValue("tags", watchedTags.filter(tag => tag !== tagToRemove));
 };

 const addResource = () => {
 if (newResource.name.trim()) {
 setValue("resources", [...watchedResources, newResource]);
 setNewResource({ name: "", quantity: 1 });
 }
 };

 const removeResource = (index: number) => {
 setValue("resources", watchedResources.filter((_, i) => i !== index));
 };

 const addStaff = () => {
 if (newStaff.role.trim()) {
 setValue("staffing", [...watchedStaffing, newStaff]);
 setNewStaff({ role: "", notes: "" });
 }
 };

 const removeStaff = (index: number) => {
 setValue("staffing", watchedStaffing.filter((_, i) => i !== index));
 };

 return (
 <Modal
 open={open}
 onClose={handleClose}
 title="Create Programming Event"
 size="2xl"
 >

 <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg p-lg">
 {/* Basic Information */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Basic Information</h3>
 <div className="space-y-md">
 <div>
 <Label htmlFor="title">Event Title *</Label>
 <Input
 
 {...register("title")}
 placeholder="Enter event title"
 />
 {errors.title && (
 <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
 )}
 </div>

 <div>
 <Label htmlFor="description">Description</Label>
 <Textarea
 
 {...register("description")}
 placeholder="Event description"
 rows={3}
 />
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <Label htmlFor="event_type">Event Type *</Label>
 <Select {...register("event_type")}>
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

 <div>
 <Label htmlFor="status">Status</Label>
 <Select {...register("status")}>
 <option value="draft">Draft</option>
 <option value="scheduled">Scheduled</option>
 <option value="in_progress">In Progress</option>
 <option value="completed">Completed</option>
 <option value="cancelled">Cancelled</option>
 </Select>
 </div>
 </div>

 <div>
 <Label htmlFor="project_id">Project</Label>
 <Select {...register("project_id")}>
 <option value="">No project</option>
 {projects.map((project) => (
 <option key={project.id} value={project.id}>
 {project.name}
 </option>
 ))}
 </Select>
 </div>
 </div>
 </Card>

 {/* Date & Time */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Date & Time</h3>
 <div className="space-y-md">
 <div className="flex items-center gap-md">
 <input
 type="checkbox"
 
 {...register("is_all_day")}
 />
 <Label htmlFor="is_all_day">All day event</Label>
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <Label htmlFor="start_at">Start Date/Time *</Label>
 <Input
 
 type={watchedIsAllDay ? "date" : "datetime-local"}
 {...register("start_at")}
 />
 {errors.start_at && (
 <p className="text-sm text-destructive mt-1">{errors.start_at.message}</p>
 )}
 </div>

 <div>
 <Label htmlFor="end_at">End Date/Time</Label>
 <Input
 
 type={watchedIsAllDay ? "date" : "datetime-local"}
 {...register("end_at")}
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <Label htmlFor="setup_start">Setup Start</Label>
 <Input
 
 type="datetime-local"
 {...register("setup_start")}
 />
 </div>

 <div>
 <Label htmlFor="teardown_end">Teardown End</Label>
 <Input
 
 type="datetime-local"
 {...register("teardown_end")}
 />
 </div>
 </div>
 </div>
 </Card>

 {/* Location & Capacity */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Location & Capacity</h3>
 <div className="space-y-md">
 <div>
 <Label htmlFor="location">Location</Label>
 <Input
 
 {...register("location")}
 placeholder="Event location"
 />
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <Label htmlFor="capacity">Capacity</Label>
 <Input
 
 type="number"
 min="0"
 {...register("capacity", { valueAsNumber: true })}
 placeholder="Maximum attendees"
 />
 </div>

 <div>
 <Label htmlFor="broadcast_url">Broadcast URL</Label>
 <Input
 
 type="url"
 {...register("broadcast_url")}
 placeholder="https://..."
 />
 </div>
 </div>
 </div>
 </Card>

 {/* Tags */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Tags</h3>
 <div className="space-y-md">
 <div className="flex gap-sm">
 <Input
 value={newTag}
 onChange={(e) => setNewTag(e.target.value)}
 placeholder="Add tag"
 onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
 />
 <Button type="button" onClick={addTag} size="sm">
 <Plus className="h-4 w-4" />
 </Button>
 </div>
 {watchedTags.length > 0 && (
 <div className="flex flex-wrap gap-sm">
 {watchedTags.map((tag) => (
 <Badge key={tag} variant="secondary" className="gap-1">
 {tag}
 <button
 type="button"
 onClick={() => removeTag(tag)}
 className="hover:text-destructive"
 >
 <X className="h-3 w-3" />
 </button>
 </Badge>
 ))}
 </div>
 )}
 </div>
 </Card>

 {/* Resources */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Resources</h3>
 <div className="space-y-md">
 <div className="flex gap-sm">
 <Input
 value={newResource.name}
 onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
 placeholder="Resource name"
 />
 <Input
 type="number"
 min="1"
 value={newResource.quantity}
 onChange={(e) => setNewResource({ ...newResource, quantity: parseInt(e.target.value) || 1 })}
 className="w-24"
 />
 <Button type="button" onClick={addResource} size="sm">
 <Plus className="h-4 w-4" />
 </Button>
 </div>
 {watchedResources.length > 0 && (
 <div className="space-y-sm">
 {watchedResources.map((resource, index) => (
 <div key={index} className="flex items-center justify-between p-sm border rounded">
 <span>{resource.name} ({resource.quantity})</span>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => removeResource(index)}
 >
 <X className="h-4 w-4" />
 </Button>
 </div>
 ))}
 </div>
 )}
 </div>
 </Card>

 {/* Staffing */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Staffing</h3>
 <div className="space-y-md">
 <div className="flex gap-sm">
 <Input
 value={newStaff.role}
 onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
 placeholder="Role/Position"
 />
 <Input
 value={newStaff.notes}
 onChange={(e) => setNewStaff({ ...newStaff, notes: e.target.value })}
 placeholder="Notes (optional)"
 />
 <Button type="button" onClick={addStaff} size="sm">
 <Plus className="h-4 w-4" />
 </Button>
 </div>
 {watchedStaffing.length > 0 && (
 <div className="space-y-sm">
 {watchedStaffing.map((staff, index) => (
 <div key={index} className="flex items-center justify-between p-sm border rounded">
 <div>
 <div className="font-medium">{staff.role}</div>
 {staff.notes && <div className="text-sm text-muted-foreground">{staff.notes}</div>}
 </div>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => removeStaff(index)}
 >
 <X className="h-4 w-4" />
 </Button>
 </div>
 ))}
 </div>
 )}
 </div>
 </Card>

 {/* Actions */}
 <div className="flex justify-end gap-sm pt-md border-t">
 <Button
 type="button"
 variant="outline"
 onClick={handleClose}
 disabled={loading}
 >
 Cancel
 </Button>
 <Button type="submit" disabled={loading}>
 <Save className="mr-2 h-4 w-4" />
 {loading ? "Creating..." : "Create Event"}
 </Button>
 </div>
 </form>
 </Modal>
 );
}
