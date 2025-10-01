'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@ghxstship/ui';
import { Input } from '@ghxstship/ui';
import { Textarea } from '@ghxstship/ui';
import { Select } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Card } from '@ghxstship/ui';
import { useToastContext } from '@ghxstship/ui';
import { ApprovalsService } from './lib/approvalsService';
import { CreateApprovalPolicySchema, type CreateApprovalPolicy } from './types';

interface CreatePolicyClientProps {
 open: boolean;
 onClose: () => void;
 onSuccess: () => void;
 organizationId: string;
 initialData?: Partial<CreateApprovalPolicy>;
}

export function CreatePolicyClient({
 open,
 onClose,
 onSuccess,
 organizationId,
 initialData
}: CreatePolicyClientProps) {
 const [loading, setLoading] = useState(false);
 const [currentStep, setCurrentStep] = useState(1);
 const { toast } = useToastContext();
 const approvalsService = new ApprovalsService();

 const form = useForm<CreateApprovalPolicy>({
 resolver: zodResolver(CreateApprovalPolicySchema),
 defaultValues: {
 organization_id: organizationId,
 name: '',
 description: '',
 conditions: {},
 approval_steps: [
 {
 step: 1,
 role: 'manager',
 description: 'Manager approval',
 conditions: {}
 }
 ],
 is_active: true,
 ...initialData
 }
 });

 const { fields, append, remove } = useFieldArray({
 control: form.control,
 name: 'approval_steps'
 });

 // Add new approval step
 const addApprovalStep = () => {
 const nextStep = fields.length + 1;
 append({
 step: nextStep,
 role: 'admin',
 description: `Step ${nextStep} approval`,
 conditions: {}
 });
 };

 // Remove approval step
 const removeApprovalStep = (index: number) => {
 if (fields.length > 1) {
 remove(index);
 // Reorder remaining steps
 const currentSteps = form.getValues('approval_steps');
 currentSteps.forEach((step, idx) => {
 form.setValue(`approval_steps.${idx}.step`, idx + 1);
 });
 }
 };

 // Handle form submission
 const onSubmit = async (data: CreateApprovalPolicy) => {
 setLoading(true);
 try {
 const { data: newPolicy, error } = await approvalsService.createPolicy(data);

 if (error) {
 toast.error('Failed to create policy', error);
 return;
 }

 toast.success('Approval policy created successfully');
 form.reset();
 onSuccess();
 } catch (error) {
 console.error('Error creating policy:', error);
 toast.error('Failed to create policy');
 } finally {
 setLoading(false);
 }
 };

 if (!open) return null;

 return (
 <div className="fixed inset-0 z-50 overflow-hidden">
 <div className="absolute inset-0 bg-black/50" onClick={onClose} />
 <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-background shadow-xl">
 <div className="flex h-full flex-col">
 {/* Header */}
 <div className="flex items-center justify-between border-b p-lg">
 <div>
 <h2 className="text-lg font-semibold">Create Approval Policy</h2>
 <p className="text-sm text-muted-foreground">
 Configure approval workflows for procurement requests
 </p>
 </div>
 <Button variant="ghost" size="sm" onClick={onClose}>
 <X className="h-icon-xs w-icon-xs" />
 </Button>
 </div>

 {/* Progress Steps */}
 <div className="border-b p-lg">
 <div className="flex items-center space-x-md">
 {[
 { step: 1, title: 'Basic Info' },
 { step: 2, title: 'Conditions' },
 { step: 3, title: 'Approval Steps' },
 { step: 4, title: 'Review' }
 ].map(({ step, title }) => (
 <div key={step} className="flex items-center">
 <div
 className={`flex h-icon-lg w-icon-lg items-center justify-center rounded-full text-sm font-medium ${
 currentStep >= step
 ? 'bg-primary text-primary-foreground'
 : 'bg-muted text-muted-foreground'
 }`}
 >
 {step}
 </div>
 <span className="ml-2 text-sm font-medium">{title}</span>
 {step < 4 && <div className="ml-4 h-px w-icon-lg bg-border" />}
 </div>
 ))}
 </div>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto p-lg">
 <form className="space-y-lg">
 {/* Step 1: Basic Information */}
 {currentStep === 1 && (
 <div className="space-y-lg">
 <div>
 <label className="text-sm font-medium">Policy Name *</label>
 <Input
 {...form.register('name')}
 placeholder="Enter policy name"
 />
 </div>

 <div>
 <label className="text-sm font-medium">Description</label>
 <Textarea
 {...form.register('description')}
 placeholder="Describe when this policy applies"
 rows={3}
 />
 </div>

 <div className="flex items-center space-x-xs">
 <input
 type="checkbox"
 {...form.register('is_active')}
 className="rounded border-border"
 />
 <label className="text-sm font-medium">Active Policy</label>
 </div>
 </div>
 )}

 {/* Step 2: Conditions */}
 {currentStep === 2 && (
 <div className="space-y-lg">
 <div>
 <h3 className="text-lg font-medium mb-4">Policy Conditions</h3>
 <p className="text-sm text-muted-foreground mb-6">
 Define when this approval policy should be applied to procurement requests.
 </p>
 </div>

 <Card className="p-md">
 <h4 className="font-medium mb-4">Amount Threshold</h4>
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium">Minimum Amount</label>
 <Input
 type="number"
 min="0"
 step="0.01"
 placeholder="0.00"
 onChange={(e) => {
 const conditions = form.getValues('conditions') || {};
 conditions.min_amount = parseFloat(e.target.value) || 0;
 form.setValue('conditions', conditions);
 }}
 />
 </div>
 <div>
 <label className="text-sm font-medium">Maximum Amount</label>
 <Input
 type="number"
 min="0"
 step="0.01"
 placeholder="No limit"
 onChange={(e) => {
 const conditions = form.getValues('conditions') || {};
 conditions.max_amount = parseFloat(e.target.value) || undefined;
 form.setValue('conditions', conditions);
 }}
 />
 </div>
 </div>
 </Card>

 <Card className="p-md">
 <h4 className="font-medium mb-4">Categories</h4>
 <div className="space-y-xs">
 {['equipment', 'supplies', 'services', 'materials', 'software', 'maintenance'].map(category => (
 <div key={category} className="flex items-center space-x-xs">
 <input
 type="checkbox"
 className="rounded border-border"
 onChange={(e) => {
 const conditions = form.getValues('conditions') || {};
 const categories = conditions.categories || [];
 if (e.target.checked) {
 categories.push(category);
 } else {
 const index = categories.indexOf(category);
 if (index > -1) categories.splice(index, 1);
 }
 conditions.categories = categories;
 form.setValue('conditions', conditions);
 }}
 />
 <label className="text-sm capitalize">{category}</label>
 </div>
 ))}
 </div>
 </Card>

 <Card className="p-md">
 <h4 className="font-medium mb-4">Departments</h4>
 <Input
 placeholder="Enter departments (comma-separated)"
 onChange={(e) => {
 const conditions = form.getValues('conditions') || {};
 conditions.departments = e.target.value.split(',').map(d => d.trim()).filter(Boolean);
 form.setValue('conditions', conditions);
 }}
 />
 </Card>
 </div>
 )}

 {/* Step 3: Approval Steps */}
 {currentStep === 3 && (
 <div className="space-y-lg">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-medium">Approval Steps</h3>
 <Button type="button" variant="outline" onClick={addApprovalStep}>
 <Plus className="h-icon-xs w-icon-xs mr-2" />
 Add Step
 </Button>
 </div>

 {fields.map((field, index) => (
 <Card key={field.id} className="p-md">
 <div className="flex items-center justify-between mb-4">
 <h4 className="font-medium">Step {index + 1}</h4>
 {fields.length > 1 && (
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => removeApprovalStep(index)}
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 </div>

 <div className="grid grid-cols-1 gap-md md:grid-cols-2">
 <div>
 <label className="text-sm font-medium">Approver Role *</label>
 <Select {...form.register(`approval_steps.${index}.role`)}>
 <option value="manager">Manager</option>
 <option value="admin">Admin</option>
 <option value="owner">Owner</option>
 <option value="finance">Finance Team</option>
 <option value="procurement">Procurement Team</option>
 </Select>
 </div>

 <div>
 <label className="text-sm font-medium">Step Order</label>
 <Input
 type="number"
 min="1"
 value={index + 1}
 disabled
 className="bg-muted"
 />
 </div>

 <div className="md:col-span-2">
 <label className="text-sm font-medium">Description *</label>
 <Input
 {...form.register(`approval_steps.${index}.description`)}
 placeholder="Describe this approval step"
 />
 </div>
 </div>

 {/* Step-specific conditions */}
 <div className="mt-4 p-sm bg-muted rounded">
 <h5 className="text-sm font-medium mb-2">Step Conditions (Optional)</h5>
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-xs text-muted-foreground">Min Amount for this step</label>
 <Input
 type="number"
 min="0"
 step="0.01"
 placeholder="0.00"
 onChange={(e) => {
 const currentSteps = form.getValues('approval_steps');
 currentSteps[index].conditions = {
 ...currentSteps[index].conditions,
 min_amount: parseFloat(e.target.value) || 0
 };
 form.setValue('approval_steps', currentSteps);
 }}
 />
 </div>
 <div>
 <label className="text-xs text-muted-foreground">Required</label>
 <div className="flex items-center mt-2">
 <input
 type="checkbox"
 defaultChecked={true}
 className="rounded border-border"
 onChange={(e) => {
 const currentSteps = form.getValues('approval_steps');
 currentSteps[index].conditions = {
 ...currentSteps[index].conditions,
 required: e.target.checked
 };
 form.setValue('approval_steps', currentSteps);
 }}
 />
 <span className="ml-2 text-xs">Required step</span>
 </div>
 </div>
 </div>
 </div>
 </Card>
 ))}
 </div>
 )}

 {/* Step 4: Review */}
 {currentStep === 4 && (
 <div className="space-y-lg">
 <h3 className="text-lg font-medium">Review Policy</h3>
 
 {/* Basic Info Summary */}
 <Card className="p-md">
 <h4 className="font-medium mb-4">Basic Information</h4>
 <div className="grid grid-cols-2 gap-md text-sm">
 <div>
 <span className="text-muted-foreground">Name:</span>
 <p className="font-medium">{form.watch('name')}</p>
 </div>
 <div>
 <span className="text-muted-foreground">Status:</span>
 <Badge variant={form.watch('is_active') ? 'success' : 'secondary'}>
 {form.watch('is_active') ? 'Active' : 'Inactive'}
 </Badge>
 </div>
 </div>
 {form.watch('description') && (
 <div className="mt-4">
 <span className="text-muted-foreground">Description:</span>
 <p className="text-sm mt-1">{form.watch('description')}</p>
 </div>
 )}
 </Card>

 {/* Conditions Summary */}
 <Card className="p-md">
 <h4 className="font-medium mb-4">Conditions</h4>
 <div className="space-y-xs text-sm">
 {form.watch('conditions.min_amount') && (
 <p>• Minimum amount: ${form.watch('conditions.min_amount')}</p>
 )}
 {form.watch('conditions.max_amount') && (
 <p>• Maximum amount: ${form.watch('conditions.max_amount')}</p>
 )}
 {form.watch('conditions.categories')?.length > 0 && (
 <p>• Categories: {form.watch('conditions.categories').join(', ')}</p>
 )}
 {form.watch('conditions.departments')?.length > 0 && (
 <p>• Departments: {form.watch('conditions.departments').join(', ')}</p>
 )}
 </div>
 </Card>

 {/* Approval Steps Summary */}
 <Card className="p-md">
 <h4 className="font-medium mb-4">Approval Workflow ({fields.length} steps)</h4>
 <div className="space-y-sm">
 {form.watch('approval_steps')?.map((step, index) => (
 <div key={index} className="flex items-center justify-between p-sm bg-muted rounded">
 <div>
 <p className="font-medium">Step {step.step}: {step.description}</p>
 <p className="text-sm text-muted-foreground">
 Role: {step.role} • 
 {step.conditions?.min_amount && ` Min: $${step.conditions.min_amount} •`}
 {step.conditions?.required !== false ? ' Required' : ' Optional'}
 </p>
 </div>
 <Badge variant="outline">
 {step.role}
 </Badge>
 </div>
 ))}
 </div>
 </Card>
 </div>
 )}
 </form>
 </div>

 {/* Footer */}
 <div className="border-t p-lg">
 <div className="flex items-center justify-between">
 <div className="flex space-x-xs">
 {currentStep > 1 && (
 <Button
 type="button"
 variant="outline"
 onClick={() => setCurrentStep(currentStep - 1)}
 >
 Previous
 </Button>
 )}
 </div>
 
 <div className="flex space-x-xs">
 {currentStep < 4 ? (
 <Button
 type="button"
 onClick={() => setCurrentStep(currentStep + 1)}
 >
 Next
 </Button>
 ) : (
 <Button
 type="button"
 onClick={form.handleSubmit(onSubmit)}
 disabled={loading}
 className="flex items-center gap-xs"
 >
 <Save className="h-icon-xs w-icon-xs" />
 Create Policy
 </Button>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
