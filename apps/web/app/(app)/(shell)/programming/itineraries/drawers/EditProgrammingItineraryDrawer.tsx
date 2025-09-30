"use client";

import { Calendar, Clock, MapPin, Plus, Save, X, DollarSign, Users } from "lucide-react";
import { useState, useEffect } from "react";
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
import type { ProgrammingItinerary, ItineraryProject, ItineraryEvent } from "../types";
import { TYPE_BADGE, TRANSPORTATION_TYPE_LABEL, CURRENCY_OPTIONS } from "../types";

const editItinerarySchema = z.object({
 name: z.string().min(1, "Name is required").max(255),
 description: z.string().optional(),
 type: z.enum(["travel", "daily", "event", "tour", "business", "personal", "crew", "training"]),
 status: z.enum(["draft", "confirmed", "in_progress", "completed", "cancelled"]),
 start_date: z.string().min(1, "Start date is required"),
 end_date: z.string().min(1, "End date is required"),
 location: z.string().optional(),
 transportation_type: z.enum(["flight", "car", "train", "bus", "ship", "walking", "other"]).optional(),
 total_cost: z.number().min(0).optional(),
 currency: z.string().length(3).optional(),
 participants_count: z.number().int().min(1).max(10000).optional(),
 project_id: z.string().uuid().optional(),
 event_id: z.string().uuid().optional(),
 destinations: z.array(z.object({
 name: z.string(),
 address: z.string().optional(),
 arrival_time: z.string().optional(),
 departure_time: z.string().optional(),
 notes: z.string().optional()
 })).optional(),
 accommodations: z.array(z.object({
 name: z.string(),
 address: z.string().optional(),
 check_in: z.string().optional(),
 check_out: z.string().optional(),
 confirmation_number: z.string().optional(),
 cost: z.number().optional()
 })).optional(),
 transportation: z.array(z.object({
 type: z.string(),
 provider: z.string().optional(),
 confirmation_number: z.string().optional(),
 departure_time: z.string().optional(),
 arrival_time: z.string().optional(),
 cost: z.number().optional()
 })).optional(),
 tags: z.array(z.string()).optional(),
 metadata: z.record(z.any()).optional(),
});

type EditItineraryFormData = z.infer<typeof editItinerarySchema>;

type EditProgrammingItineraryDrawerProps = {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 itinerary: ProgrammingItinerary;
 orgId: string;
 currentUserId: string;
 projects: ItineraryProject[];
 events: ItineraryEvent[];
 onSuccess: () => void;
};

export default function EditProgrammingItineraryDrawer({
 open,
 onOpenChange,
 itinerary,
 orgId,
 currentUserId,
 projects,
 events,
 onSuccess,
}: EditProgrammingItineraryDrawerProps) {
 const handleClose = () => onOpenChange(false);
 const [loading, setLoading] = useState(false);
 const [newTag, setNewTag] = useState("");
 const [newDestination, setNewDestination] = useState({ name: "", address: "", notes: "" });
 const [newAccommodation, setNewAccommodation] = useState({ name: "", address: "", confirmation_number: "" });
 const [newTransportation, setNewTransportation] = useState({ type: "", provider: "", confirmation_number: "" });

 const {
 register,
 handleSubmit,
 watch,
 setValue,
 reset,
 formState: { errors },
 } = useForm<EditItineraryFormData>({
 resolver: zodResolver(editItinerarySchema),
 });

 const watchedTags = watch("tags");
 const watchedDestinations = watch("destinations");
 const watchedAccommodations = watch("accommodations");
 const watchedTransportation = watch("transportation");

 // Reset form when itinerary changes
 useEffect(() => {
 if (itinerary && open) {
 reset({
 name: itinerary.name,
 description: itinerary.description || "",
 type: itinerary.type,
 status: itinerary.status,
 start_date: itinerary.start_date ? new Date(itinerary.start_date).toISOString().slice(0, 16) : "",
 end_date: itinerary.end_date ? new Date(itinerary.end_date).toISOString().slice(0, 16) : "",
 location: itinerary.location || "",
 transportation_type: itinerary.transportation_type || undefined,
 total_cost: itinerary.total_cost || undefined,
 currency: itinerary.currency || undefined,
 participants_count: itinerary.participants_count || undefined,
 project_id: itinerary.project_id || undefined,
 event_id: itinerary.event_id || undefined,
 destinations: itinerary.destinations || [],
 accommodations: itinerary.accommodations || [],
 transportation: itinerary.transportation || [],
 tags: itinerary.tags || [],
 metadata: itinerary.metadata || {},
 });
 }
 }, [itinerary, open, reset]);

 const onSubmit = async (data: EditItineraryFormData) => {
 try {
 setLoading(true);
 
 const response = await fetch(`/api/v1/programming/itineraries/${itinerary.id}`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(data),
 });

 if (!response.ok) {
 const error = await response.json();
 throw new Error(error.error || "Failed to update itinerary");
 }

 onSuccess();
 handleClose();
 } catch (error) {
 console.error("Failed to update itinerary:", error);
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

 const addDestination = () => {
 if (newDestination.name.trim()) {
 setValue("destinations", [...(watchedDestinations || []), newDestination]);
 setNewDestination({ name: "", address: "", notes: "" });
 }
 };

 const removeDestination = (index: number) => {
 setValue("destinations", watchedDestinations?.filter((_, i) => i !== index) || []);
 };

 const addAccommodation = () => {
 if (newAccommodation.name.trim()) {
 setValue("accommodations", [...(watchedAccommodations || []), newAccommodation]);
 setNewAccommodation({ name: "", address: "", confirmation_number: "" });
 }
 };

 const removeAccommodation = (index: number) => {
 setValue("accommodations", watchedAccommodations?.filter((_, i) => i !== index) || []);
 };

 const addTransportation = () => {
 if (newTransportation.type.trim()) {
 setValue("transportation", [...(watchedTransportation || []), newTransportation]);
 setNewTransportation({ type: "", provider: "", confirmation_number: "" });
 }
 };

 const removeTransportation = (index: number) => {
 setValue("transportation", watchedTransportation?.filter((_, i) => i !== index) || []);
 };

 return (
 <Modal
 open={open}
 onClose={handleClose}
 title="Edit Programming Itinerary"
 size="2xl"
 >
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg p-lg">
 {/* Basic Information */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Basic Information</h3>
 <div className="space-y-md">
 <div>
 <Label htmlFor="name">Itinerary Name *</Label>
 <Input
 
 {...register("name")}
 placeholder="Enter itinerary name"
 />
 {errors.name && (
 <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
 )}
 </div>

 <div>
 <Label htmlFor="description">Description</Label>
 <Textarea
 
 {...register("description")}
 placeholder="Itinerary description"
 rows={3}
 />
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <Label htmlFor="type">Type *</Label>
 <Select {...register("type")}>
 {Object.entries(TYPE_BADGE).map(([value, config]) => (
 <option key={value} value={value}>
 {config.icon} {config.label}
 </option>
 ))}
 </Select>
 </div>

 <div>
 <Label htmlFor="status">Status</Label>
 <Select {...register("status")}>
 <option value="draft">Draft</option>
 <option value="confirmed">Confirmed</option>
 <option value="in_progress">In Progress</option>
 <option value="completed">Completed</option>
 <option value="cancelled">Cancelled</option>
 </Select>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-md">
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

 <div>
 <Label htmlFor="event_id">Related Event</Label>
 <Select {...register("event_id")}>
 <option value="">No event</option>
 {events.map((event) => (
 <option key={event.id} value={event.id}>
 {event.title}
 </option>
 ))}
 </Select>
 </div>
 </div>
 </div>
 </Card>

 {/* Date & Location */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Date & Location</h3>
 <div className="space-y-md">
 <div className="grid grid-cols-2 gap-md">
 <div>
 <Label htmlFor="start_date">Start Date *</Label>
 <Input
 
 type="datetime-local"
 {...register("start_date")}
 />
 {errors.start_date && (
 <p className="text-sm text-destructive mt-1">{errors.start_date.message}</p>
 )}
 </div>

 <div>
 <Label htmlFor="end_date">End Date *</Label>
 <Input
 
 type="datetime-local"
 {...register("end_date")}
 />
 {errors.end_date && (
 <p className="text-sm text-destructive mt-1">{errors.end_date.message}</p>
 )}
 </div>
 </div>

 <div>
 <Label htmlFor="location">Primary Location</Label>
 <Input
 
 {...register("location")}
 placeholder="Enter primary location"
 />
 </div>

 <div>
 <Label htmlFor="transportation_type">Transportation Type</Label>
 <Select {...register("transportation_type")}>
 <option value="">Select transportation</option>
 {Object.entries(TRANSPORTATION_TYPE_LABEL).map(([value, label]) => (
 <option key={value} value={value}>
 {label}
 </option>
 ))}
 </Select>
 </div>
 </div>
 </Card>

 {/* Cost & Participants */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Cost & Participants</h3>
 <div className="space-y-md">
 <div className="grid grid-cols-3 gap-md">
 <div>
 <Label htmlFor="total_cost">Total Cost</Label>
 <Input
 
 type="number"
 min="0"
 step="0.01"
 {...register("total_cost", { valueAsNumber: true })}
 placeholder="0.00"
 />
 </div>

 <div>
 <Label htmlFor="currency">Currency</Label>
 <Select {...register("currency")}>
 <option value="">Select currency</option>
 {CURRENCY_OPTIONS.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </Select>
 </div>

 <div>
 <Label htmlFor="participants_count">Participants</Label>
 <Input
 
 type="number"
 min="1"
 {...register("participants_count", { valueAsNumber: true })}
 placeholder="Number of participants"
 />
 </div>
 </div>
 </div>
 </Card>

 {/* Destinations */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Destinations</h3>
 <div className="space-y-md">
 <div className="grid grid-cols-3 gap-sm">
 <Input
 value={newDestination.name}
 onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })}
 placeholder="Destination name"
 />
 <Input
 value={newDestination.address}
 onChange={(e) => setNewDestination({ ...newDestination, address: e.target.value })}
 placeholder="Address (optional)"
 />
 <div className="flex gap-sm">
 <Input
 value={newDestination.notes}
 onChange={(e) => setNewDestination({ ...newDestination, notes: e.target.value })}
 placeholder="Notes (optional)"
 />
 <Button type="button" onClick={addDestination} size="sm">
 <Plus className="h-4 w-4" />
 </Button>
 </div>
 </div>
 {watchedDestinations && watchedDestinations.length > 0 && (
 <div className="space-y-sm">
 {watchedDestinations.map((destination, index) => (
 <div key={index} className="flex items-center justify-between p-sm border rounded">
 <div>
 <div className="font-medium">{destination.name}</div>
 {destination.address && <div className="text-sm text-muted-foreground">{destination.address}</div>}
 {destination.notes && <div className="text-sm text-muted-foreground">{destination.notes}</div>}
 </div>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => removeDestination(index)}
 >
 <X className="h-4 w-4" />
 </Button>
 </div>
 ))}
 </div>
 )}
 </div>
 </Card>

 {/* Accommodations */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Accommodations</h3>
 <div className="space-y-md">
 <div className="grid grid-cols-3 gap-sm">
 <Input
 value={newAccommodation.name}
 onChange={(e) => setNewAccommodation({ ...newAccommodation, name: e.target.value })}
 placeholder="Hotel/accommodation name"
 />
 <Input
 value={newAccommodation.address}
 onChange={(e) => setNewAccommodation({ ...newAccommodation, address: e.target.value })}
 placeholder="Address (optional)"
 />
 <div className="flex gap-sm">
 <Input
 value={newAccommodation.confirmation_number}
 onChange={(e) => setNewAccommodation({ ...newAccommodation, confirmation_number: e.target.value })}
 placeholder="Confirmation # (optional)"
 />
 <Button type="button" onClick={addAccommodation} size="sm">
 <Plus className="h-4 w-4" />
 </Button>
 </div>
 </div>
 {watchedAccommodations && watchedAccommodations.length > 0 && (
 <div className="space-y-sm">
 {watchedAccommodations.map((accommodation, index) => (
 <div key={index} className="flex items-center justify-between p-sm border rounded">
 <div>
 <div className="font-medium">{accommodation.name}</div>
 {accommodation.address && <div className="text-sm text-muted-foreground">{accommodation.address}</div>}
 {accommodation.confirmation_number && <div className="text-sm text-muted-foreground">Confirmation: {accommodation.confirmation_number}</div>}
 </div>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => removeAccommodation(index)}
 >
 <X className="h-4 w-4" />
 </Button>
 </div>
 ))}
 </div>
 )}
 </div>
 </Card>

 {/* Transportation */}
 <Card className="p-md">
 <h3 className="text-heading-5 mb-md">Transportation Details</h3>
 <div className="space-y-md">
 <div className="grid grid-cols-3 gap-sm">
 <Input
 value={newTransportation.type}
 onChange={(e) => setNewTransportation({ ...newTransportation, type: e.target.value })}
 placeholder="Transportation type"
 />
 <Input
 value={newTransportation.provider}
 onChange={(e) => setNewTransportation({ ...newTransportation, provider: e.target.value })}
 placeholder="Provider (optional)"
 />
 <div className="flex gap-sm">
 <Input
 value={newTransportation.confirmation_number}
 onChange={(e) => setNewTransportation({ ...newTransportation, confirmation_number: e.target.value })}
 placeholder="Confirmation # (optional)"
 />
 <Button type="button" onClick={addTransportation} size="sm">
 <Plus className="h-4 w-4" />
 </Button>
 </div>
 </div>
 {watchedTransportation && watchedTransportation.length > 0 && (
 <div className="space-y-sm">
 {watchedTransportation.map((transport, index) => (
 <div key={index} className="flex items-center justify-between p-sm border rounded">
 <div>
 <div className="font-medium">{transport.type}</div>
 {transport.provider && <div className="text-sm text-muted-foreground">Provider: {transport.provider}</div>}
 {transport.confirmation_number && <div className="text-sm text-muted-foreground">Confirmation: {transport.confirmation_number}</div>}
 </div>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => removeTransportation(index)}
 >
 <X className="h-4 w-4" />
 </Button>
 </div>
 ))}
 </div>
 )}
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
 {watchedTags && watchedTags.length > 0 && (
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
 {loading ? "Saving..." : "Save Changes"}
 </Button>
 </div>
 </form>
 </Modal>
 );
}
