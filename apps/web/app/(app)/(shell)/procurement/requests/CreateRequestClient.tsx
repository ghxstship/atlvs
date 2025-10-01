'use client';

import { X, Plus, Trash2, Save, Send } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@ghxstship/ui';
import { Input } from '@ghxstship/ui';
import { Textarea } from '@ghxstship/ui';
import { Select } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { toast } from '@ghxstship/ui';
import { RequestsService } from './lib/requestsService';
import { CreateProcurementRequestSchema, type CreateProcurementRequest, type ProcurementRequestItem } from './types';

interface CreateRequestClientProps {
 open: boolean;
 onClose: () => void;
 onSuccess: () => void;
 organizationId: string;
 initialData?: Partial<CreateProcurementRequest>;
}

export function CreateRequestClient({
 open,
 onClose,
 onSuccess,
 organizationId,
 initialData
}: CreateRequestClientProps) {
 const [loading, setLoading] = useState(false);
 const [currentStep, setCurrentStep] = useState(1);
 const requestsService = new RequestsService();

 const form = useForm<CreateProcurementRequest>({
 resolver: zodResolver(CreateProcurementRequestSchema),
 defaultValues: {
 organization_id: organizationId,
 requester_id: 'current-user-id', // This would come from auth context
 title: '',
 description: '',
 business_justification: '',
 category: 'equipment',
 priority: 'medium',
 status: 'draft',
 estimated_total: 0,
 currency: 'USD',
 requested_delivery_date: '',
 budget_code: '',
 department: '',
 items: [
 {
 name: '',
 description: '',
 category: 'equipment',
 quantity: 1,
 unit: 'each',
 estimated_unit_price: 0,
 estimated_total_price: 0,
 preferred_vendor: '',
 specifications: '',
 justification: ''
 }
 ],
 ...initialData
 }
 });

 const { fields, append, remove } = useFieldArray({
 control: form.control,
 name: 'items'
 });

 // Watch form values for calculations
 const watchedItems = form.watch('items');

 // Calculate total estimated cost
 useEffect(() => {
 const total = watchedItems?.reduce((sum, item) => {
 return sum + (item.estimated_total_price || 0);
 }, 0) || 0;
 form.setValue('estimated_total', total);
 }, [watchedItems, form]);

 // Handle item price calculation
 const handleItemPriceChange = (index: number, field: 'quantity' | 'estimated_unit_price', value: number) => {
 const currentItem = form.getValues(`items.${index}`);
 const quantity = field === 'quantity' ? value : currentItem.quantity;
 const unitPrice = field === 'estimated_unit_price' ? value : currentItem.estimated_unit_price;
 const totalPrice = quantity * unitPrice;
 
 form.setValue(`items.${index}.${field}`, value);
 form.setValue(`items.${index}.estimated_total_price`, totalPrice);
 };

 // Add new item
 const addItem = () => {
 append({
 name: '',
 description: '',
 category: 'equipment',
 quantity: 1,
 unit: 'each',
 estimated_unit_price: 0,
 estimated_total_price: 0,
 preferred_vendor: '',
 specifications: '',
 justification: ''
 });
 };

 // Remove item
 const removeItem = (index: number) => {
 if (fields.length > 1) {
 remove(index);
 }
 };

 // Handle form submission
 const onSubmit = async (data: CreateProcurementRequest, shouldSubmit = false) => {
 setLoading(true);
 try {
 // Set status based on action
 const requestData = {
 ...data,
 status: shouldSubmit ? 'submitted' : 'draft',
 submitted_at: shouldSubmit ? new Date().toISOString() : undefined
 };

 const { data: newRequest, error } = await requestsService.createRequest(requestData);

 if (error) {
 toast.error('Failed to create request', { description: error });
 return;
 }

 toast.success(
 shouldSubmit ? 'Request created and submitted for approval' : 'Request saved as draft'
 );
 
 form.reset();
 onSuccess();
 } catch (error) {
 console.error('Error creating request:', error);
 toast.error('Failed to create request');
 } finally {
 setLoading(false);
 }
 };

 // Handle save as draft
 const handleSaveDraft = () => {
 form.handleSubmit((data) => onSubmit(data, false))();
 };

 // Handle submit for approval
 const handleSubmit = () => {
 form.handleSubmit((data) => onSubmit(data, true))();
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
 <h2 className="text-lg font-semibold">Create Procurement Request</h2>
 <p className="text-sm text-muted-foreground">
 Submit a new purchase requisition for approval
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
 { step: 2, title: 'Items' },
 { step: 3, title: 'Review' }
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
 {step < 3 && <div className="ml-4 h-px w-icon-lg bg-border" />}
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
 <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
 <div className="md:col-span-2">
 <label className="text-sm font-medium">Request Title *</label>
 <Input
 {...form.register('title')}
 placeholder="Enter request title"
 />
 </div>

 <div>
 <label className="text-sm font-medium">Category *</label>
 <Select
 {...form.register('category')}
 >
 <option value="equipment">Equipment</option>
 <option value="supplies">Supplies</option>
 <option value="services">Services</option>
 <option value="materials">Materials</option>
 <option value="software">Software</option>
 <option value="maintenance">Maintenance</option>
 <option value="other">Other</option>
 </Select>
 </div>

 <div>
 <label className="text-sm font-medium">Priority</label>
 <Select {...form.register('priority')}>
 <option value="low">Low</option>
 <option value="medium">Medium</option>
 <option value="high">High</option>
 <option value="urgent">Urgent</option>
 </Select>
 </div>

 <div>
 <label className="text-sm font-medium">Requested Delivery Date</label>
 <Input
 type="date"
 {...form.register('requested_delivery_date')}
 />
 </div>

 <div>
 <label className="text-sm font-medium">Budget Code</label>
 <Input
 {...form.register('budget_code')}
 placeholder="Enter budget code"
 />
 </div>

 <div>
 <label className="text-sm font-medium">Department</label>
 <Input
 {...form.register('department')}
 placeholder="Enter department"
 />
 </div>

 <div className="md:col-span-2">
 <label className="text-sm font-medium">Description</label>
 <Textarea
 {...form.register('description')}
 placeholder="Provide a detailed description of the request"
 rows={3}
 />
 </div>

 <div className="md:col-span-2">
 <label className="text-sm font-medium">Business Justification *</label>
 <Textarea
 {...form.register('business_justification')}
 placeholder="Explain why this purchase is necessary for business operations"
 rows={4}
 />
 </div>
 </div>
 </div>
 )}

 {/* Step 2: Items */}
 {currentStep === 2 && (
 <div className="space-y-lg">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-medium">Request Items</h3>
 <Button type="button" variant="outline" onClick={addItem}>
 <Plus className="h-icon-xs w-icon-xs mr-2" />
 Add Item
 </Button>
 </div>

 {fields.map((field, index) => (
 <div key={field.id} className="border rounded-lg p-md space-y-md">
 <div className="flex items-center justify-between">
 <h4 className="font-medium">Item {index + 1}</h4>
 {fields.length > 1 && (
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => removeItem(index)}
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 </div>

 <div className="grid grid-cols-1 gap-md md:grid-cols-2">
 <div>
 <label className="text-sm font-medium">Item Name *</label>
 <Input
 {...form.register(`items.${index}.name`)}
 placeholder="Enter item name"
 />
 </div>

 <div>
 <label className="text-sm font-medium">Category</label>
 <Select {...form.register(`items.${index}.category`)}>
 <option value="equipment">Equipment</option>
 <option value="supplies">Supplies</option>
 <option value="services">Services</option>
 <option value="materials">Materials</option>
 <option value="software">Software</option>
 <option value="maintenance">Maintenance</option>
 <option value="other">Other</option>
 </Select>
 </div>

 <div>
 <label className="text-sm font-medium">Quantity *</label>
 <Input
 type="number"
 min="1"
 step="0.01"
 {...form.register(`items.${index}.quantity`, {
 valueAsNumber: true,
 onChange: (e) => handleItemPriceChange(index, 'quantity', parseFloat(e.target.value) || 0)
 })}
 />
 </div>

 <div>
 <label className="text-sm font-medium">Unit</label>
 <Input
 {...form.register(`items.${index}.unit`)}
 placeholder="e.g., each, box, hour"
 />
 </div>

 <div>
 <label className="text-sm font-medium">Estimated Unit Price</label>
 <Input
 type="number"
 min="0"
 step="0.01"
 {...form.register(`items.${index}.estimated_unit_price`, {
 valueAsNumber: true,
 onChange: (e) => handleItemPriceChange(index, 'estimated_unit_price', parseFloat(e.target.value) || 0)
 })}
 />
 </div>

 <div>
 <label className="text-sm font-medium">Total Price</label>
 <Input
 type="number"
 value={form.watch(`items.${index}.estimated_total_price`) || 0}
 disabled
 className="bg-muted"
 />
 </div>

 <div>
 <label className="text-sm font-medium">Preferred Vendor</label>
 <Input
 {...form.register(`items.${index}.preferred_vendor`)}
 placeholder="Enter preferred vendor"
 />
 </div>

 <div className="md:col-span-2">
 <label className="text-sm font-medium">Description</label>
 <Textarea
 {...form.register(`items.${index}.description`)}
 placeholder="Describe the item in detail"
 rows={2}
 />
 </div>

 <div className="md:col-span-2">
 <label className="text-sm font-medium">Specifications</label>
 <Textarea
 {...form.register(`items.${index}.specifications`)}
 placeholder="Enter technical specifications, model numbers, etc."
 rows={2}
 />
 </div>

 <div className="md:col-span-2">
 <label className="text-sm font-medium">Justification</label>
 <Textarea
 {...form.register(`items.${index}.justification`)}
 placeholder="Explain why this item is needed"
 rows={2}
 />
 </div>
 </div>
 </div>
 ))}

 {/* Total Summary */}
 <div className="border-t pt-4">
 <div className="flex justify-between items-center">
 <span className="text-lg font-medium">Total Estimated Cost:</span>
 <span className="text-lg font-semibold">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: form.watch('currency') || 'USD'
 }).format(form.watch('estimated_total') || 0)}
 </span>
 </div>
 </div>
 </div>
 )}

 {/* Step 3: Review */}
 {currentStep === 3 && (
 <div className="space-y-lg">
 <h3 className="text-lg font-medium">Review Request</h3>
 
 {/* Basic Info Summary */}
 <div className="border rounded-lg p-md">
 <h4 className="font-medium mb-4">Basic Information</h4>
 <div className="grid grid-cols-2 gap-md text-sm">
 <div>
 <span className="text-muted-foreground">Title:</span>
 <p className="font-medium">{form.watch('title')}</p>
 </div>
 <div>
 <span className="text-muted-foreground">Category:</span>
 <p className="font-medium">{form.watch('category')}</p>
 </div>
 <div>
 <span className="text-muted-foreground">Priority:</span>
 <Badge variant={
 form.watch('priority') === 'urgent' ? 'destructive' :
 form.watch('priority') === 'high' ? 'warning' :
 form.watch('priority') === 'medium' ? 'default' : 'secondary'
 }>
 {form.watch('priority')}
 </Badge>
 </div>
 <div>
 <span className="text-muted-foreground">Total Cost:</span>
 <p className="font-medium">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: form.watch('currency') || 'USD'
 }).format(form.watch('estimated_total') || 0)}
 </p>
 </div>
 </div>
 {form.watch('business_justification') && (
 <div className="mt-4">
 <span className="text-muted-foreground">Business Justification:</span>
 <p className="text-sm mt-1">{form.watch('business_justification')}</p>
 </div>
 )}
 </div>

 {/* Items Summary */}
 <div className="border rounded-lg p-md">
 <h4 className="font-medium mb-4">Items ({fields.length})</h4>
 <div className="space-y-sm">
 {form.watch('items')?.map((item, index) => (
 <div key={index} className="flex justify-between items-center p-sm bg-muted rounded">
 <div>
 <p className="font-medium">{item.name}</p>
 <p className="text-sm text-muted-foreground">
 {item.quantity} {item.unit} × {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: form.watch('currency') || 'USD'
 }).format(item.estimated_unit_price || 0)}
 </p>
 </div>
 <p className="font-medium">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: form.watch('currency') || 'USD'
 }).format(item.estimated_total_price || 0)}
 </p>
 </div>
 ))}
 </div>
 </div>
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
 {currentStep < 3 ? (
 <Button
 type="button"
 onClick={() => setCurrentStep(currentStep + 1)}
 >
 Next
 </Button>
 ) : (
 <>
 <Button
 type="button"
 variant="outline"
 onClick={handleSaveDraft}
 disabled={loading}
 className="flex items-center gap-xs"
 >
 <Save className="h-icon-xs w-icon-xs" />
 Save Draft
 </Button>
 <Button
 type="button"
 onClick={handleSubmit}
 disabled={loading}
 className="flex items-center gap-xs"
 >
 <Send className="h-icon-xs w-icon-xs" />
 Submit for Approval
 </Button>
 </>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
