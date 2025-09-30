"use client";

import { X, Calendar, DollarSign, MapPin, Tag } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
 Drawer,
 DrawerContent,
 DrawerHeader,
 DrawerTitle,
 DrawerFooter,
 Button,
 Input,
 Textarea,
 Select,
 Label,
 Badge,
 toast,
} from "@ghxstship/ui";
import { format } from "date-fns";
import { projectsService } from "../lib/projects-service";
import type { CreateProjectData } from "../types";

const createProjectSchema = z.object({
 name: z.string().min(1, "Project name is required").max(255, "Name too long"),
 description: z.string().optional(),
 status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).default('planning'),
 priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
 budget: z.number().positive().optional(),
 currency: z.string().default('USD'),
 starts_at: z.string().optional(),
 ends_at: z.string().optional(),
 location: z.string().optional(),
 tags: z.array(z.string()).optional(),
 notes: z.string().optional(),
});

interface CreateProjectDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 orgId: string;
 userId: string;
 onSuccess?: () => void;
}

export default function CreateProjectDrawer({
 open,
 onOpenChange,
 orgId,
 userId,
 onSuccess,
}: CreateProjectDrawerProps) {
 const [loading, setLoading] = useState(false);
 const [tagInput, setTagInput] = useState("");

 const form = useForm<CreateProjectData>({
 resolver: zodResolver(createProjectSchema),
 defaultValues: {
 name: "",
 description: "",
 status: "planning",
 priority: "medium",
 currency: "USD",
 tags: [],
 },
 });

 const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = form;
 const watchedTags = watch("tags") || [];

 const handleAddTag = () => {
 if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
 setValue("tags", [...watchedTags, tagInput.trim()]);
 setTagInput("");
 }
 };

 const handleRemoveTag = (tagToRemove: string) => {
 setValue("tags", watchedTags.filter(tag => tag !== tagToRemove));
 };

 const onSubmit = async (data: CreateProjectData) => {
 setLoading(true);
 try {
 const result = await projectsService.createProject(data, orgId, userId);
 
 if (result.error) {
 toast.error(result.error);
 return;
 }

 toast.success("Project created successfully");
 reset();
 onOpenChange(false);
 onSuccess?.();
 } catch (error) {
 toast.error("Failed to create project");
 console.error("Error creating project:", error);
 } finally {
 setLoading(false);
 }
 };

 const handleClose = () => {
 reset();
 setTagInput("");
 onOpenChange(false);
 };

 return (
 <Drawer open={open} onClose={() => onOpenChange(false)}>
 <DrawerContent className="max-w-2xl mx-auto">
 <DrawerHeader>
 <div className="flex items-center justify-between">
 <DrawerTitle>Create New Project</DrawerTitle>
 <Button
 variant="ghost"
 size="sm"
 onClick={handleClose}
 className="h-8 w-8 p-0"
 >
 <X className="h-4 w-4" />
 </Button>
 </div>
 </DrawerHeader>

 <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg px-lg">
 {/* Basic Information */}
 <div className="space-y-md">
 <h3 className="font-semibold text-lg">Basic Information</h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-sm">
 <Label htmlFor="name">Project Name *</Label>
 <Input
 
 {...register("name")}
 placeholder="Enter project name"
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="status">Status</Label>
 <Select {...register("status")}>
 <option value="planning">Planning</option>
 <option value="active">Active</option>
 <option value="on_hold">On Hold</option>
 <option value="completed">Completed</option>
 <option value="cancelled">Cancelled</option>
 </Select>
 </div>
 </div>

 <div className="space-y-sm">
 <Label htmlFor="description">Description</Label>
 <Textarea
 
 {...register("description")}
 placeholder="Describe the project objectives and scope"
 rows={3}
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-sm">
 <Label htmlFor="priority">Priority</Label>
 <Select {...register("priority")}>
 <option value="low">Low</option>
 <option value="medium">Medium</option>
 <option value="high">High</option>
 <option value="critical">Critical</option>
 </Select>
 </div>

 <div className="space-y-sm">
 <Label htmlFor="location">Location</Label>
 <div className="relative">
 <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 
 {...register("location")}
 placeholder="Project location"
 className="pl-10"
 />
 </div>
 </div>
 </div>
 </div>

 {/* Budget & Timeline */}
 <div className="space-y-md">
 <h3 className="font-semibold text-lg">Budget & Timeline</h3>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
 <div className="space-y-sm">
 <Label htmlFor="budget">Budget</Label>
 <div className="relative">
 <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 
 type="number"
 {...register("budget", { valueAsNumber: true })}
 placeholder="0.00"
 className="pl-10"
 />
 </div>
 </div>

 <div className="space-y-sm">
 <Label htmlFor="currency">Currency</Label>
 <Select {...register("currency")}>
 <option value="USD">USD</option>
 <option value="EUR">EUR</option>
 <option value="GBP">GBP</option>
 <option value="CAD">CAD</option>
 <option value="AUD">AUD</option>
 </Select>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-sm">
 <Label htmlFor="starts_at">Start Date</Label>
 <div className="relative">
 <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 
 type="date"
 {...register("starts_at")}
 className="pl-10"
 />
 </div>
 </div>

 <div className="space-y-sm">
 <Label htmlFor="ends_at">End Date</Label>
 <div className="relative">
 <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 
 type="date"
 {...register("ends_at")}
 className="pl-10"
 />
 </div>
 </div>
 </div>
 </div>

 {/* Tags */}
 <div className="space-y-md">
 <h3 className="font-semibold text-lg">Tags</h3>
 
 <div className="space-y-sm">
 <Label>Project Tags</Label>
 <div className="flex gap-sm">
 <div className="relative flex-1">
 <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 value={tagInput}
 onChange={(e) => setTagInput(e.target.value)}
 placeholder="Add a tag"
 className="pl-10"
 onKeyPress={(e) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 handleAddTag();
 }
 }}
 />
 </div>
 <Button
 type="button"
 variant="outline"
 onClick={handleAddTag}
 disabled={!tagInput.trim()}
 >
 Add
 </Button>
 </div>
 
 {watchedTags.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {watchedTags.map((tag) => (
 <Badge
 key={tag}
 variant="secondary"
 className="cursor-pointer"
 onClick={() => handleRemoveTag(tag)}
 >
 {tag}
 <X className="ml-xs h-3 w-3" />
 </Badge>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Notes */}
 <div className="space-y-md">
 <h3 className="font-semibold text-lg">Additional Notes</h3>
 
 <div className="space-y-sm">
 <Label htmlFor="notes">Notes</Label>
 <Textarea
 
 {...register("notes")}
 placeholder="Any additional notes or requirements"
 rows={3}
 />
 </div>
 </div>
 </form>

 <DrawerFooter>
 <div className="flex gap-sm">
 <Button
 variant="outline"
 onClick={handleClose}
 disabled={loading}
 className="flex-1"
 >
 Cancel
 </Button>
 <Button
 onClick={handleSubmit(onSubmit)}
 disabled={loading}
 className="flex-1"
 >
 {loading ? "Creating..." : "Create Project"}
 </Button>
 </div>
 </DrawerFooter>
 </DrawerContent>
 </Drawer>
 );
}
