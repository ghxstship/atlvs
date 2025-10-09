"use client";

import { Calendar, Check, Clock, DollarSign, FileText, MapPin, Music, Plus, Settings, Tag, Users, X } from "lucide-react";
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
 Button,
 Input,
 Label,
 Textarea,
 Select,
 Drawer,
 DrawerContent,
 DrawerHeader,
 DrawerTitle,
 DrawerFooter,
 Badge,
 Separator
} from "@ghxstship/ui";
import type { ProgrammingPerformance, UpdatePerformanceData, PerformanceProject, PerformanceEvent } from "../types";
import { 
 PERFORMANCE_TYPE_BADGE, 
 STATUS_BADGE, 
 CURRENCY_OPTIONS, 
 EQUIPMENT_OPTIONS,
 VENUE_TYPES,
 DURATION_PRESETS,
 TARGET_DEMOGRAPHICS 
} from "../types";

const updatePerformanceSchema = z.object({
 event_id: z.string().min(1, "Event is required"),
 project_id: z.string().optional(),
 name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
 description: z.string().optional(),
 performance_type: z.enum(['concert', 'theater', 'dance', 'comedy', 'spoken_word', 'variety', 'festival', 'other']).optional(),
 status: z.enum(['planning', 'rehearsal', 'ready', 'live', 'completed', 'cancelled']).optional(),
 starts_at: z.string().min(1, "Start time is required"),
 ends_at: z.string().optional(),
 duration_minutes: z.coerce.number().int().min(1).max(1440).optional(),
 venue: z.string().max(255).optional(),
 venue_capacity: z.coerce.number().int().min(1).optional(),
 
 // Ticket info
 ticket_price_min: z.coerce.number().min(0).optional(),
 ticket_price_max: z.coerce.number().min(0).optional(),
 ticket_currency: z.string().length(3).optional(),
 ticket_sales_url: z.string().url().optional().or(z.literal("")),
 ticket_sold_out: z.boolean().optional(),
 
 // Technical requirements
 tech_sound_system: z.string().optional(),
 tech_lighting: z.string().optional(),
 tech_stage_setup: z.string().optional(),
 tech_equipment_needed: z.array(z.string()).optional(),
 tech_crew_requirements: z.string().optional(),
 
 // Production notes
 prod_rehearsal_schedule: z.string().optional(),
 prod_call_time: z.string().optional(),
 prod_sound_check: z.string().optional(),
 prod_special_instructions: z.string().optional(),
 
 // Audience info
 audience_expected_attendance: z.coerce.number().int().min(0).optional(),
 audience_target_demographic: z.string().optional(),
 audience_accessibility_notes: z.string().optional(),
 
 tags: z.array(z.string()).optional()
});

type FormData = z.infer<typeof updatePerformanceSchema>;

type EditProgrammingPerformanceDrawerProps = {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 performance: ProgrammingPerformance;
 orgId: string;
 currentUserId: string;
 projects: PerformanceProject[];
 events: PerformanceEvent[];
 onSuccess: () => void;
};

export default function EditProgrammingPerformanceDrawer({
 open,
 onOpenChange,
 performance,
 orgId,
 currentUserId,
 projects,
 events,
 onSuccess
}: EditProgrammingPerformanceDrawerProps) {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [newTag, setNewTag] = useState("");
 const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

 const {
 register,
 handleSubmit,
 watch,
 setValue,
 reset,
 formState: { errors }
 } = useForm<FormData>({
 resolver: zodResolver(updatePerformanceSchema)
 });

 const watchedTags = watch("tags") || [];
 const watchedDuration = watch("duration_minutes");

 // Initialize form with performance data
 useEffect(() => {
 if (performance && open) {
 const formData: Partial<FormData> = {
 event_id: performance.event_id,
 project_id: performance.project_id || "",
 name: performance.name,
 description: performance.description || "",
 performance_type: performance.performance_type,
 status: performance.status,
 starts_at: performance.starts_at ? new Date(performance.starts_at).toISOString().slice(0, 16) : "",
 ends_at: performance.ends_at ? new Date(performance.ends_at).toISOString().slice(0, 16) : "",
 duration_minutes: performance.duration_minutes || undefined,
 venue: performance.venue || "",
 venue_capacity: performance.venue_capacity || undefined,
 
 ticket_price_min: performance.ticket_info.price_min || undefined,
 ticket_price_max: performance.ticket_info.price_max || undefined,
 ticket_currency: performance.ticket_info.currency || "USD",
 ticket_sales_url: performance.ticket_info.sales_url || "",
 ticket_sold_out: performance.ticket_info.sold_out || false,
 
 tech_sound_system: performance.technical_requirements.sound_system || "",
 tech_lighting: performance.technical_requirements.lighting || "",
 tech_stage_setup: performance.technical_requirements.stage_setup || "",
 tech_equipment_needed: performance.technical_requirements.equipment_needed || [],
 tech_crew_requirements: performance.technical_requirements.crew_requirements || "",
 
 prod_rehearsal_schedule: performance.production_notes.rehearsal_schedule || "",
 prod_call_time: performance.production_notes.call_time ? new Date(performance.production_notes.call_time).toISOString().slice(0, 16) : "",
 prod_sound_check: performance.production_notes.sound_check ? new Date(performance.production_notes.sound_check).toISOString().slice(0, 16) : "",
 prod_special_instructions: performance.production_notes.special_instructions || "",
 
 audience_expected_attendance: performance.audience_info.expected_attendance || undefined,
 audience_target_demographic: performance.audience_info.target_demographic || "",
 audience_accessibility_notes: performance.audience_info.accessibility_notes || "",
 
 tags: performance.tags || []
 };

 reset(formData);
 setSelectedEquipment(performance.technical_requirements.equipment_needed || []);
 }
 }, [performance, open, reset]);

 const handleClose = () => {
 setError(null);
 setNewTag("");
 onOpenChange(false);
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

 const toggleEquipment = (equipment: string) => {
 const newEquipment = selectedEquipment.includes(equipment)
 ? selectedEquipment.filter(e => e !== equipment)
 : [...selectedEquipment, equipment];
 
 setSelectedEquipment(newEquipment);
 setValue("tech_equipment_needed", newEquipment);
 };

 const setDurationPreset = (minutes: number) => {
 setValue("duration_minutes", minutes);
 };

 const onSubmit = async (data: FormData) => {
 try {
 setLoading(true);
 setError(null);

 const payload: UpdatePerformanceData = {
 event_id: data.event_id,
 project_id: data.project_id || undefined,
 name: data.name,
 description: data.description || undefined,
 performance_type: data.performance_type,
 status: data.status,
 starts_at: data.starts_at,
 ends_at: data.ends_at || undefined,
 duration_minutes: data.duration_minutes || undefined,
 venue: data.venue || undefined,
 venue_capacity: data.venue_capacity || undefined,
 
 ticket_info: {
 price_min: data.ticket_price_min,
 price_max: data.ticket_price_max,
 currency: data.ticket_currency,
 sales_url: data.ticket_sales_url || undefined,
 sold_out: data.ticket_sold_out
 },
 
 technical_requirements: {
 sound_system: data.tech_sound_system,
 lighting: data.tech_lighting,
 stage_setup: data.tech_stage_setup,
 equipment_needed: data.tech_equipment_needed,
 crew_requirements: data.tech_crew_requirements
 },
 
 production_notes: {
 rehearsal_schedule: data.prod_rehearsal_schedule,
 call_time: data.prod_call_time,
 sound_check: data.prod_sound_check,
 special_instructions: data.prod_special_instructions
 },
 
 audience_info: {
 expected_attendance: data.audience_expected_attendance,
 target_demographic: data.audience_target_demographic,
 accessibility_notes: data.audience_accessibility_notes
 },
 
 tags: data.tags || []
 };

 const response = await fetch(`/api/v1/programming/performances/${performance.id}`, {
 method: "PATCH",
 headers: {
 "Content-Type": "application/json"
 },
 body: JSON.stringify(payload)
 });

 if (!response.ok) {
 const errorData = await response.json();
 throw new Error(errorData.error || "Failed to update performance");
 }

 onSuccess();
 handleClose();
 } catch (err) {
 console.error("Error updating performance:", err);
 setError(err instanceof Error ? err.message : "Failed to update performance");
 } finally {
 setLoading(false);
 }
 };

 return (
 <Drawer open={open} onClose={() => onOpenChange(false)}>
 <DrawerContent className="max-w-4xl mx-auto">
 <DrawerHeader>
 <DrawerTitle>Edit Performance: {performance.name}</DrawerTitle>
 </DrawerHeader>

 <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
 <div className="flex-1 overflow-y-auto px-lg space-y-lg">
 {/* Basic Information */}
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <Music className="h-icon-xs w-icon-xs" />
 <h3 className="text-lg font-medium">Basic Information</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="event_id">Event *</Label>
 <Select {...register("event_id")}>
 <option value="">Select an event</option>
 {events.map((event) => (
 <option key={event.id} value={event.id}>
 {event.title} - {new Date(event.start_at).toLocaleDateString()}
 </option>
 ))}
 </Select>
 {errors.event_id && (
 <p className="text-sm text-destructive">{errors.event_id.message}</p>
 )}
 </div>

 <div className="space-y-xs">
 <Label htmlFor="project_id">Project</Label>
 <Select {...register("project_id")}>
 <option value="">Select a project (optional)</option>
 {projects.map((project) => (
 <option key={project.id} value={project.id}>
 {project.name}
 </option>
 ))}
 </Select>
 </div>

 <div className="space-y-xs">
 <Label htmlFor="name">Performance Name *</Label>
 <Input
 
 {...register("name")}
 placeholder="Enter performance name"
 />
 {errors.name && (
 <p className="text-sm text-destructive">{errors.name.message}</p>
 )}
 </div>

 <div className="space-y-xs">
 <Label htmlFor="performance_type">Type</Label>
 <Select {...register("performance_type")}>
 {Object.entries(PERFORMANCE_TYPE_BADGE).map(([value, config]) => (
 <option key={value} value={value}>
 {config.icon} {config.label}
 </option>
 ))}
 </Select>
 </div>

 <div className="space-y-xs">
 <Label htmlFor="status">Status</Label>
 <Select {...register("status")}>
 {Object.entries(STATUS_BADGE).map(([value, config]) => (
 <option key={value} value={value}>
 {config.label}
 </option>
 ))}
 </Select>
 </div>
 </div>

 <div className="space-y-xs">
 <Label htmlFor="description">Description</Label>
 <Textarea
 
 {...register("description")}
 placeholder="Enter performance description"
 rows={3}
 />
 </div>
 </div>

 <Separator />

 {/* Schedule */}
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <Calendar className="h-icon-xs w-icon-xs" />
 <h3 className="text-lg font-medium">Schedule</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="starts_at">Start Time *</Label>
 <Input
 
 type="datetime-local"
 {...register("starts_at")}
 />
 {errors.starts_at && (
 <p className="text-sm text-destructive">{errors.starts_at.message}</p>
 )}
 </div>

 <div className="space-y-xs">
 <Label htmlFor="ends_at">End Time</Label>
 <Input
 
 type="datetime-local"
 {...register("ends_at")}
 />
 </div>

 <div className="space-y-xs">
 <Label htmlFor="duration_minutes">Duration (minutes)</Label>
 <Input
 
 type="number"
 {...register("duration_minutes")}
 placeholder="Duration in minutes"
 />
 <div className="flex flex-wrap gap-xs">
 {DURATION_PRESETS.map(({ value, label }) => (
 <Button
 key={value}
 type="button"
 variant="outline"
 size="sm"
 onClick={() => setDurationPreset(value)}
 className={watchedDuration === value ? "bg-primary/10" : ""}
 >
 {label}
 </Button>
 ))}
 </div>
 </div>
 </div>
 </div>

 <Separator />

 {/* Venue */}
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <MapPin className="h-icon-xs w-icon-xs" />
 <h3 className="text-lg font-medium">Venue</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="venue">Venue Name</Label>
 <Input
 
 {...register("venue")}
 placeholder="Enter venue name"
 />
 </div>

 <div className="space-y-xs">
 <Label htmlFor="venue_capacity">Venue Capacity</Label>
 <Input
 
 type="number"
 {...register("venue_capacity")}
 placeholder="Maximum capacity"
 />
 </div>
 </div>
 </div>

 <Separator />

 {/* Ticket Information */}
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <DollarSign className="h-icon-xs w-icon-xs" />
 <h3 className="text-lg font-medium">Ticket Information</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="ticket_price_min">Min Price</Label>
 <Input
 
 type="number"
 step="0.01"
 {...register("ticket_price_min")}
 placeholder="0.00"
 />
 </div>

 <div className="space-y-xs">
 <Label htmlFor="ticket_price_max">Max Price</Label>
 <Input
 
 type="number"
 step="0.01"
 {...register("ticket_price_max")}
 placeholder="0.00"
 />
 </div>

 <div className="space-y-xs">
 <Label htmlFor="ticket_currency">Currency</Label>
 <Select {...register("ticket_currency")}>
 {CURRENCY_OPTIONS.map(({ value, label }) => (
 <option key={value} value={value}>
 {label}
 </option>
 ))}
 </Select>
 </div>

 <div className="space-y-xs">
 <Label>
 <input
 type="checkbox"
 {...register("ticket_sold_out")}
 className="mr-2"
 />
 Sold Out
 </Label>
 </div>
 </div>

 <div className="space-y-xs">
 <Label htmlFor="ticket_sales_url">Sales URL</Label>
 <Input
 
 type="url"
 {...register("ticket_sales_url")}
 placeholder="https://tickets.example.com"
 />
 </div>
 </div>

 <Separator />

 {/* Audience Information */}
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <Users className="h-icon-xs w-icon-xs" />
 <h3 className="text-lg font-medium">Audience Information</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="audience_expected_attendance">Expected Attendance</Label>
 <Input
 
 type="number"
 {...register("audience_expected_attendance")}
 placeholder="Expected number of attendees"
 />
 </div>

 <div className="space-y-xs">
 <Label htmlFor="audience_target_demographic">Target Demographic</Label>
 <Select {...register("audience_target_demographic")}>
 <option value="">Select target demographic</option>
 {TARGET_DEMOGRAPHICS.map((demo) => (
 <option key={demo} value={demo}>
 {demo}
 </option>
 ))}
 </Select>
 </div>
 </div>

 <div className="space-y-xs">
 <Label htmlFor="audience_accessibility_notes">Accessibility Notes</Label>
 <Textarea
 
 {...register("audience_accessibility_notes")}
 placeholder="Accessibility information and accommodations"
 rows={2}
 />
 </div>
 </div>

 <Separator />

 {/* Technical Requirements */}
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <Settings className="h-icon-xs w-icon-xs" />
 <h3 className="text-lg font-medium">Technical Requirements</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="tech_sound_system">Sound System</Label>
 <Input
 
 {...register("tech_sound_system")}
 placeholder="Sound system requirements"
 />
 </div>

 <div className="space-y-xs">
 <Label htmlFor="tech_lighting">Lighting</Label>
 <Input
 
 {...register("tech_lighting")}
 placeholder="Lighting requirements"
 />
 </div>
 </div>

 <div className="space-y-xs">
 <Label htmlFor="tech_stage_setup">Stage Setup</Label>
 <Textarea
 
 {...register("tech_stage_setup")}
 placeholder="Stage setup and configuration"
 rows={2}
 />
 </div>

 <div className="space-y-xs">
 <Label>Equipment Needed</Label>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-xs max-h-40 overflow-y-auto">
 {EQUIPMENT_OPTIONS.map((equipment) => (
 <label key={equipment} className="flex items-center space-x-xs text-sm">
 <input
 type="checkbox"
 checked={selectedEquipment.includes(equipment)}
 onChange={() => toggleEquipment(equipment)}
 />
 <span>{equipment}</span>
 </label>
 ))}
 </div>
 </div>

 <div className="space-y-xs">
 <Label htmlFor="tech_crew_requirements">Crew Requirements</Label>
 <Textarea
 
 {...register("tech_crew_requirements")}
 placeholder="Crew and staffing requirements"
 rows={2}
 />
 </div>
 </div>

 <Separator />

 {/* Production Notes */}
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <FileText className="h-icon-xs w-icon-xs" />
 <h3 className="text-lg font-medium">Production Notes</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="prod_call_time">Call Time</Label>
 <Input
 
 type="datetime-local"
 {...register("prod_call_time")}
 />
 </div>

 <div className="space-y-xs">
 <Label htmlFor="prod_sound_check">Sound Check</Label>
 <Input
 
 type="datetime-local"
 {...register("prod_sound_check")}
 />
 </div>
 </div>

 <div className="space-y-xs">
 <Label htmlFor="prod_rehearsal_schedule">Rehearsal Schedule</Label>
 <Textarea
 
 {...register("prod_rehearsal_schedule")}
 placeholder="Rehearsal schedule and timeline"
 rows={2}
 />
 </div>

 <div className="space-y-xs">
 <Label htmlFor="prod_special_instructions">Special Instructions</Label>
 <Textarea
 
 {...register("prod_special_instructions")}
 placeholder="Special instructions and notes"
 rows={2}
 />
 </div>
 </div>

 <Separator />

 {/* Tags */}
 <div className="space-y-md">
 <div className="flex items-center gap-xs">
 <Tag className="h-icon-xs w-icon-xs" />
 <h3 className="text-lg font-medium">Tags</h3>
 </div>

 <div className="space-y-xs">
 <div className="flex gap-xs">
 <Input
 value={newTag}
 onChange={(e) => setNewTag(e.target.value)}
 placeholder="Add a tag"
 onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
 />
 <Button type="button" onClick={addTag} size="sm">
 <Plus className="h-icon-xs w-icon-xs" />
 </Button>
 </div>

 {watchedTags.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {watchedTags.map((tag) => (
 <Badge key={tag} variant="secondary" className="text-xs">
 {tag}
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => removeTag(tag)}
 className="ml-1 h-auto p-0 text-xs"
 >
 <X className="h-3 w-3" />
 </Button>
 </Badge>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>

 {error && (
 <div className="px-lg py-xs">
 <div className="rounded-md bg-destructive/15 p-sm">
 <p className="text-sm text-destructive">{error}</p>
 </div>
 </div>
 )}

 <DrawerFooter>
 <div className="flex gap-xs">
 <Button type="button" variant="outline" onClick={handleClose}>
 Cancel
 </Button>
 <Button type="submit" disabled={loading}>
 {loading ? "Updating..." : "Update Performance"}
 </Button>
 </div>
 </DrawerFooter>
 </form>
 </DrawerContent>
 </Drawer>
 );
}
