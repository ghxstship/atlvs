"use client";

import { Edit } from "lucide-react";
import { useState, useEffect } from 'react';
import { createBrowserClient } from "@ghxstship/auth";
import {
 Drawer,
 DrawerContent,
 DrawerHeader,
 DrawerTitle,
 DrawerDescription,
 DrawerFooter,
 Button,
 Input,
 Label,
 Select,
 Textarea,
 toast
} from "@ghxstship/ui";
import type { Activation } from "./ActivationsClient";

interface EditActivationDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 activation: Activation;
 projects?: Array<{ id: string; name: string }>;
 onSuccess?: () => void;
}

export default function EditActivationDrawer({
 open,
 onOpenChange,
 activation,
 projects = [],
 onSuccess
}: EditActivationDrawerProps) {
 const supabase = createBrowserClient();
 const [loading, setLoading] = useState(false);

 // Form state
 const [formData, setFormData] = useState({
 name: "",
 description: "",
 status: "planning",
 activation_type: "full_launch",
 project_id: "",
 scheduled_date: "",
 actual_date: "",
 completion_date: "",
 location: "",
 budget: "",
 actual_cost: "",
 notes: "",
 success_metrics: {},
 stakeholders: [] as string[],
 dependencies: [] as string[],
 risks: [] as string[]
 });

 // Initialize form with activation data
 useEffect(() => {
 if (activation) {
 setFormData({
 name: activation.name || "",
 description: activation.description || "",
 status: activation.status || "planning",
 activation_type: activation.activation_type || "full_launch",
 project_id: activation.project_id || "",
 scheduled_date: activation.scheduled_date?.split("T")[0] || "",
 actual_date: activation.actual_date?.split("T")[0] || "",
 completion_date: activation.completion_date?.split("T")[0] || "",
 location: activation.location || "",
 budget: activation.budget?.toString() || "",
 actual_cost: activation.actual_cost?.toString() || "",
 notes: activation.notes || "",
 success_metrics: activation.success_metrics || {},
 stakeholders: activation.stakeholders || [],
 dependencies: activation.dependencies || [],
 risks: activation.risks || []
 });
 }
 }, [activation]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 
 if (!formData.name) {
 toast.error("Please enter an activation name");
 return;
 }

 setLoading(true);
 try {
 const updates: unknown = {
 name: formData.name,
 description: formData.description || null,
 status: formData.status,
 activation_type: formData.activation_type,
 project_id: formData.project_id || null,
 scheduled_date: formData.scheduled_date || null,
 actual_date: formData.actual_date || null,
 completion_date: formData.completion_date || null,
 location: formData.location || null,
 budget: formData.budget ? parseFloat(formData.budget) : null,
 actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : null,
 notes: formData.notes || null,
 success_metrics: formData.success_metrics,
 stakeholders: formData.stakeholders,
 dependencies: formData.dependencies,
 risks: formData.risks,
 updated_at: new Date().toISOString()
 };

 const { error } = await supabase
 .from("project_activations")
 .update(updates)
 .eq("id", activation.id);

 if (error) throw error;

 toast.success("Activation updated successfully");
 onOpenChange(false);
 onSuccess?.();
 } catch (error) {
 console.error("Error updating activation:", error);
 toast.error("Failed to update activation");
 } finally {
 setLoading(false);
 }
 };

 return (
 <Drawer open={open} onClose={() => onOpenChange(false)}>
 <DrawerContent className="max-w-2xl mx-auto">
 <DrawerHeader>
 <DrawerTitle className="flex items-center gap-sm">
 <Edit className="h-icon-sm w-icon-sm" />
 Edit Activation
 </DrawerTitle>
 <DrawerDescription>
 Update activation details and configuration
 </DrawerDescription>
 </DrawerHeader>

 <form onSubmit={handleSubmit} className="p-lg space-y-md max-h-[60vh] overflow-y-auto">
 {/* Basic Information */}
 <div className="space-y-sm">
 <h3 className="font-semibold">Basic Information</h3>
 
 <div>
 <Label htmlFor="name">Activation Name *</Label>
 <Input
 
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 placeholder="Enter activation name"
 required
 />
 </div>

 <div>
 <Label htmlFor="description">Description</Label>
 <Textarea
 
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 placeholder="Describe the activation objectives and scope"
 rows={3}
 />
 </div>

 <div className="grid grid-cols-2 gap-sm">
 <div>
 <Label htmlFor="status">Status</Label>
 <Select
 
 value={formData.status}
 onChange={(e) => setFormData({ ...formData, status: e.target.e.target.value as unknown })}
 >
 <option value="planning">Planning</option>
 <option value="ready">Ready</option>
 <option value="active">Active</option>
 <option value="completed">Completed</option>
 <option value="cancelled">Cancelled</option>
 </Select>
 </div>

 <div>
 <Label htmlFor="activation_type">Type</Label>
 <Select
 
 value={formData.activation_type}
 onChange={(e) => setFormData({ ...formData, activation_type: e.target.e.target.value as unknown })}
 >
 <option value="full_launch">Full Launch</option>
 <option value="soft_launch">Soft Launch</option>
 <option value="beta">Beta</option>
 <option value="pilot">Pilot</option>
 <option value="rollout">Rollout</option>
 </Select>
 </div>
 </div>
 </div>

 {/* Project and Schedule */}
 <div className="space-y-sm">
 <h3 className="font-semibold">Project & Schedule</h3>
 
 {projects.length > 0 && (
 <div>
 <Label htmlFor="project_id">Associated Project</Label>
 <Select
 
 value={formData.project_id}
 onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
 >
 <option value="">Select a project</option>
 {projects.map((project) => (
 <option key={project.id} value={project.id}>
 {project.name}
 </option>
 ))}
 </Select>
 </div>
 )}

 <div className="grid grid-cols-2 gap-sm">
 <div>
 <Label htmlFor="scheduled_date">Scheduled Date</Label>
 <Input
 
 type="date"
 value={formData.scheduled_date}
 onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
 />
 </div>

 <div>
 <Label htmlFor="actual_date">Actual Date</Label>
 <Input
 
 type="date"
 value={formData.actual_date}
 onChange={(e) => setFormData({ ...formData, actual_date: e.target.value })}
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-sm">
 <div>
 <Label htmlFor="completion_date">Completion Date</Label>
 <Input
 
 type="date"
 value={formData.completion_date}
 onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
 />
 </div>

 <div>
 <Label htmlFor="location">Location</Label>
 <Input
 
 value={formData.location}
 onChange={(e) => setFormData({ ...formData, location: e.target.value })}
 placeholder="Enter location"
 />
 </div>
 </div>
 </div>

 {/* Budget and Resources */}
 <div className="space-y-sm">
 <h3 className="font-semibold">Budget & Resources</h3>
 
 <div className="grid grid-cols-2 gap-sm">
 <div>
 <Label htmlFor="budget">Budget</Label>
 <Input
 
 type="number"
 value={formData.budget}
 onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
 placeholder="0.00"
 step="0.01"
 />
 </div>

 <div>
 <Label htmlFor="actual_cost">Actual Cost</Label>
 <Input
 
 type="number"
 value={formData.actual_cost}
 onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })}
 placeholder="0.00"
 step="0.01"
 />
 </div>
 </div>

 <div>
 <Label htmlFor="stakeholders">Stakeholders (comma-separated)</Label>
 <Input
 
 value={formData.stakeholders.join(", ")}
 onChange={(e) => setFormData({ 
 ...formData, 
 stakeholders: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
 })}
 placeholder="John Doe, Jane Smith, Marketing Team"
 />
 </div>
 </div>

 {/* Risk Management */}
 <div className="space-y-sm">
 <h3 className="font-semibold">Risk Management</h3>
 
 <div>
 <Label htmlFor="dependencies">Dependencies (comma-separated)</Label>
 <Textarea
 
 value={formData.dependencies.join(", ")}
 onChange={(e) => setFormData({ 
 ...formData, 
 dependencies: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
 })}
 placeholder="List key dependencies"
 rows={2}
 />
 </div>

 <div>
 <Label htmlFor="risks">Risks (comma-separated)</Label>
 <Textarea
 
 value={formData.risks.join(", ")}
 onChange={(e) => setFormData({ 
 ...formData, 
 risks: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
 })}
 placeholder="List potential risks"
 rows={2}
 />
 </div>
 </div>

 {/* Additional Notes */}
 <div className="space-y-sm">
 <h3 className="font-semibold">Additional Information</h3>
 
 <div>
 <Label htmlFor="notes">Notes</Label>
 <Textarea
 
 value={formData.notes}
 onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
 placeholder="Add any additional notes or comments"
 rows={3}
 />
 </div>
 </div>
 </form>

 <DrawerFooter>
 <div className="flex gap-sm justify-end">
 <Button
 variant="outline"
 onClick={() => onOpenChange(false)}
 disabled={loading}
 >
 Cancel
 </Button>
 <Button onClick={handleSubmit} disabled={loading}>
 {loading ? "Updating..." : "Update Activation"}
 </Button>
 </div>
 </DrawerFooter>
 </DrawerContent>
 </Drawer>
 );
}
