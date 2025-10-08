"use client";

import { Calendar, Clock, MapPin, Plus, Save, X, DollarSign, Users, Music, Phone, Mail } from "lucide-react";
import { useState, useEffect } from 'react';
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
 Checkbox
} from "@ghxstship/ui";
import type { ProgrammingLineup, LineupProject, LineupEvent } from "../types";
import { PERFORMER_TYPE_BADGE, CURRENCY_OPTIONS, EQUIPMENT_OPTIONS, STAGE_OPTIONS, DURATION_PRESETS } from "../types";

const editLineupSchema = z.object({
 event_id: z.string().uuid().optional(),
 project_id: z.string().uuid().optional(),
 performer_name: z.string().min(1, "Performer name is required").max(255).optional(),
 performer_type: z.enum(['artist', 'band', 'dj', 'speaker', 'host', 'comedian', 'dancer', 'other']).optional(),
 role: z.string().max(100).optional(),
 stage: z.string().max(100).optional(),
 set_time: z.string().datetime().optional(),
 duration_minutes: z.number().int().min(1).max(1440).optional(),
 status: z.enum(['confirmed', 'tentative', 'cancelled', 'pending']).optional(),
 contact_info: z.object({
 email: z.string().email().optional().or(z.literal("")),
 phone: z.string().optional(),
 agent: z.string().optional(),
 manager: z.string().optional()
 }).optional(),
 technical_requirements: z.object({
 sound_check: z.string().datetime().optional(),
 equipment: z.array(z.string()).optional(),
 special_requests: z.string().optional()
 }).optional(),
 contract_details: z.object({
 fee: z.number().min(0).optional(),
 currency: z.string().length(3).optional(),
 payment_terms: z.string().optional(),
 contract_signed: z.boolean().optional()
 }).optional(),
 notes: z.string().optional(),
 tags: z.array(z.string().max(32)).optional(),
 metadata: z.record(z.any()).optional()
});

type EditLineupFormData = z.infer<typeof editLineupSchema>;

type EditProgrammingLineupDrawerProps = {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 lineup: ProgrammingLineup;
 orgId: string;
 currentUserId: string;
 projects: LineupProject[];
 events: LineupEvent[];
 onSuccess: () => void;
};

export default function EditProgrammingLineupDrawer({
 open,
 onOpenChange,
 lineup,
 orgId,
 currentUserId,
 projects,
 events,
 onSuccess
}: EditProgrammingLineupDrawerProps) {
 const handleClose = () => onOpenChange(false);
 const [loading, setLoading] = useState(false);
 const [newTag, setNewTag] = useState("");
 const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

 const {
 register,
 handleSubmit,
 watch,
 setValue,
 reset,
 formState: { errors }
 } = useForm<EditLineupFormData>({
 resolver: zodResolver(editLineupSchema)
 });

 const watchedTags = watch("tags");

 // Reset form when lineup changes
 useEffect(() => {
 if (lineup && open) {
 reset({
 event_id: lineup.event_id,
 project_id: lineup.project_id || undefined,
 performer_name: lineup.performer_name,
 performer_type: lineup.performer_type,
 role: lineup.role || "",
 stage: lineup.stage || "",
 set_time: lineup.set_time ? new Date(lineup.set_time).toISOString().slice(0, 16) : "",
 duration_minutes: lineup.duration_minutes || undefined,
 status: lineup.status,
 contact_info: {
 email: lineup.contact_info.email || "",
 phone: lineup.contact_info.phone || "",
 agent: lineup.contact_info.agent || "",
 manager: lineup.contact_info.manager || ""
 },
 technical_requirements: {
 sound_check: lineup.technical_requirements.sound_check 
 ? new Date(lineup.technical_requirements.sound_check).toISOString().slice(0, 16) 
 : "",
 special_requests: lineup.technical_requirements.special_requests || ""
 },
 contract_details: {
 fee: lineup.contract_details.fee || undefined,
 currency: lineup.contract_details.currency || "",
 payment_terms: lineup.contract_details.payment_terms || "",
 contract_signed: lineup.contract_details.contract_signed || false
 },
 notes: lineup.notes || "",
 tags: lineup.tags || [],
 metadata: lineup.metadata || {}
 });
 
 setSelectedEquipment(lineup.technical_requirements.equipment || []);
 }
 }, [lineup, open, reset]);

 const onSubmit = async (data: EditLineupFormData) => {
 try {
 setLoading(true);
 
 // Clean up the data
 const payload = {
 ...data,
 contact_info: {
 email: data.contact_info?.email || undefined,
 phone: data.contact_info?.phone || undefined,
 agent: data.contact_info?.agent || undefined,
 manager: data.contact_info?.manager || undefined
 },
 technical_requirements: {
 sound_check: data.technical_requirements?.sound_check || undefined,
 equipment: selectedEquipment.length > 0 ? selectedEquipment : undefined,
 special_requests: data.technical_requirements?.special_requests || undefined
 },
 contract_details: {
 fee: data.contract_details?.fee || undefined,
 currency: data.contract_details?.currency || undefined,
 payment_terms: data.contract_details?.payment_terms || undefined,
 contract_signed: data.contract_details?.contract_signed || false
 }
 };
 
 const response = await fetch(`/api/v1/programming/lineups/${lineup.id}`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(payload)
 });

 if (!response.ok) {
 const error = await response.json();
 throw new Error(error.error || "Failed to update lineup");
 }

 onSuccess();
 handleClose();
 } catch (error) {
 console.error("Failed to update lineup:", error);
 } finally {
 setLoading(false);
 }
 };

 const addTag = () => {
 if (newTag.trim() && !watchedTags?.includes(newTag.trim())) {
 setValue("tags", [...(watchedTags || []), newTag.trim()]);
 setNewTag("");
 }
 };

 const removeTag = (tagToRemove: string) => {
 setValue("tags", watchedTags?.filter(tag => tag !== tagToRemove) || []);
 };

 const toggleEquipment = (equipment: string) => {
 setSelectedEquipment(prev => 
 prev.includes(equipment) 
 ? prev.filter(e => e !== equipment)
 : [...prev, equipment]
 );
 };

 const setDurationPreset = (minutes: number) => {
 setValue("duration_minutes", minutes);
 };

 return (
 <Modal
 open={open}
 onClose={handleClose}
 title="Edit Lineup Entry"
 size="2xl"
 >
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg p-lg">
 {/* Basic Information */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <Music className="h-icon-xs w-icon-xs" />
 Performer Information
 </h3>
 <div className="space-y-md">
 <div>
 <Label htmlFor="performer_name">Performer Name *</Label>
 <Input
 
 {...register("performer_name")}
 placeholder="Enter performer name"
 />
 {errors.performer_name && (
 <p className="text-sm text-destructive mt-1">{errors.performer_name.message}</p>
 )}
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <Label htmlFor="performer_type">Type</Label>
 <Select {...register("performer_type")}>
 {Object.entries(PERFORMER_TYPE_BADGE).map(([value, config]) => (
 <option key={value} value={value}>
 {config.icon} {config.label}
 </option>
 ))}
 </Select>
 </div>

 <div>
 <Label htmlFor="status">Status</Label>
 <Select {...register("status")}>
 <option value="pending">Pending</option>
 <option value="tentative">Tentative</option>
 <option value="confirmed">Confirmed</option>
 <option value="cancelled">Cancelled</option>
 </Select>
 </div>
 </div>

 <div>
 <Label htmlFor="role">Role/Description</Label>
 <Input
 
 {...register("role")}
 placeholder="e.g., Headliner, Opening Act, Keynote Speaker"
 />
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <Label htmlFor="event_id">Event</Label>
 <Select {...register("event_id")}>
 <option value="">Select event</option>
 {events.map((event) => (
 <option key={event.id} value={event.id}>
 {event.title}
 </option>
 ))}
 </Select>
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
 </div>
 </Card>

 {/* Schedule & Venue */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <Calendar className="h-icon-xs w-icon-xs" />
 Schedule & Venue
 </h3>
 <div className="space-y-md">
 <div className="grid grid-cols-2 gap-md">
 <div>
 <Label htmlFor="set_time">Set Time</Label>
 <Input
 
 type="datetime-local"
 {...register("set_time")}
 />
 </div>

 <div>
 <Label htmlFor="duration_minutes">Duration (minutes)</Label>
 <Input
 
 type="number"
 min="1"
 max="1440"
 {...register("duration_minutes", { valueAsNumber: true })}
 placeholder="Duration in minutes"
 />
 <div className="flex flex-wrap gap-xs mt-1">
 {DURATION_PRESETS.map((preset) => (
 <Button
 key={preset.value}
 type="button"
 variant="outline"
 size="sm"
 onClick={() => setDurationPreset(preset.value)}
 className="text-xs"
 >
 {preset.label}
 </Button>
 ))}
 </div>
 </div>
 </div>

 <div>
 <Label htmlFor="stage">Stage/Location</Label>
 <Select {...register("stage")}>
 <option value="">Select stage</option>
 {STAGE_OPTIONS.map((stage) => (
 <option key={stage} value={stage}>
 {stage}
 </option>
 ))}
 </Select>
 </div>
 </div>
 </Card>

 {/* Contact Information */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <Phone className="h-icon-xs w-icon-xs" />
 Contact Information
 </h3>
 <div className="space-y-md">
 <div className="grid grid-cols-2 gap-md">
 <div>
 <Label htmlFor="contact_email">Email</Label>
 <Input
 
 type="email"
 {...register("contact_info.email")}
 placeholder="performer@example.com"
 />
 </div>

 <div>
 <Label htmlFor="contact_phone">Phone</Label>
 <Input
 
 {...register("contact_info.phone")}
 placeholder="+1 (555) 123-4567"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <Label htmlFor="contact_agent">Agent</Label>
 <Input
 
 {...register("contact_info.agent")}
 placeholder="Agent name"
 />
 </div>

 <div>
 <Label htmlFor="contact_manager">Manager</Label>
 <Input
 
 {...register("contact_info.manager")}
 placeholder="Manager name"
 />
 </div>
 </div>
 </div>
 </Card>

 {/* Technical Requirements */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Technical Requirements</h3>
 <div className="space-y-md">
 <div>
 <Label htmlFor="sound_check">Sound Check Time</Label>
 <Input
 
 type="datetime-local"
 {...register("technical_requirements.sound_check")}
 />
 </div>

 <div>
 <Label>Equipment Needed</Label>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-sm mt-2">
 {EQUIPMENT_OPTIONS.map((equipment) => (
 <div key={equipment} className="flex items-center space-x-xs">
 <Checkbox
 id={equipment}
 checked={selectedEquipment.includes(equipment)}
 onChange={(checked) => {
 if (checked) {
 toggleEquipment(equipment);
 } else {
 toggleEquipment(equipment);
 }
 }}
 />
 <Label htmlFor={equipment} className="text-sm">
 {equipment}
 </Label>
 </div>
 ))}
 </div>
 </div>

 <div>
 <Label htmlFor="special_requests">Special Requests</Label>
 <Textarea
 
 {...register("technical_requirements.special_requests")}
 placeholder="Any special technical requirements or requests"
 rows={3}
 />
 </div>
 </div>
 </Card>

 {/* Contract Details */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md flex items-center gap-sm">
 <DollarSign className="h-icon-xs w-icon-xs" />
 Contract Details
 </h3>
 <div className="space-y-md">
 <div className="grid grid-cols-2 gap-md">
 <div>
 <Label htmlFor="fee">Performance Fee</Label>
 <Input
 
 type="number"
 min="0"
 step="0.01"
 {...register("contract_details.fee", { valueAsNumber: true })}
 placeholder="0.00"
 />
 </div>

 <div>
 <Label htmlFor="currency">Currency</Label>
 <Select {...register("contract_details.currency")}>
 <option value="">Select currency</option>
 {CURRENCY_OPTIONS.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </Select>
 </div>
 </div>

 <div>
 <Label htmlFor="payment_terms">Payment Terms</Label>
 <Textarea
 
 {...register("contract_details.payment_terms")}
 placeholder="e.g., 50% deposit, 50% on completion"
 rows={2}
 />
 </div>

 <div className="flex items-center space-x-xs">
 <Checkbox
 
 {...register("contract_details.contract_signed")}
 />
 <Label htmlFor="contract_signed">Contract signed</Label>
 </div>
 </div>
 </Card>

 {/* Notes & Tags */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Additional Information</h3>
 <div className="space-y-md">
 <div>
 <Label htmlFor="notes">Notes</Label>
 <Textarea
 
 {...register("notes")}
 placeholder="Additional notes about the performer or performance"
 rows={3}
 />
 </div>

 <div>
 <Label>Tags</Label>
 <div className="flex gap-sm mb-2">
 <Input
 value={newTag}
 onChange={(e) => setNewTag(e.target.value)}
 placeholder="Add tag"
 onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
 />
 <Button type="button" onClick={addTag} size="sm">
 <Plus className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 {watchedTags && watchedTags.length > 0 && (
 <div className="flex flex-wrap gap-sm">
 {watchedTags.map((tag) => (
 <Badge key={tag} variant="secondary" className="gap-xs">
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
 <Save className="mr-2 h-icon-xs w-icon-xs" />
 {loading ? "Saving..." : "Save Changes"}
 </Button>
 </div>
 </form>
 </Modal>
 );
}
