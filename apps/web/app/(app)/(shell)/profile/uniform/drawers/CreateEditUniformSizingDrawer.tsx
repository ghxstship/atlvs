'use client';

import { Save, User, Ruler, Shirt } from "lucide-react";
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import {
 Drawer,
 Button,
 Input,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Textarea,
 Badge,
 Card
} from '@ghxstship/ui';
import type { UniformSizing } from '../types';
import { SIZE_CATEGORIES, EQUIPMENT_TYPES, formatMeasurement, calculateBMI, getBMICategory } from '../types';

// Form validation schema
const uniformSizingSchema = z.object({
 user_id: z.string().min(1, 'User ID is required'),
 first_name: z.string().min(1, 'First name is required'),
 last_name: z.string().min(1, 'Last name is required'),
 size_category: z.enum(['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'] as const).optional(),
 
 // Body measurements
 height: z.number().min(36).max(96).optional(), // inches
 weight: z.number().min(50).max(500).optional(), // pounds
 chest: z.number().min(20).max(60).optional(), // inches
 waist: z.number().min(20).max(60).optional(), // inches
 neck: z.number().min(10).max(25).optional(), // inches
 sleeve_length: z.number().min(20).max(40).optional(), // inches
 inseam: z.number().min(20).max(40).optional(), // inches
 
 // Clothing sizes
 shirt_size: z.string().optional(),
 pants_size: z.string().optional(),
 shoe_size: z.string().optional(),
 hat_size: z.string().optional(),
 glove_size: z.string().optional(),
 
 // Equipment preferences
 equipment_preferences: z.record(z.string()).optional(),
 
 // Additional info
 notes: z.string().optional()
});

type UniformSizingFormData = z.infer<typeof uniformSizingSchema>;

interface CreateEditUniformSizingDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 mode: 'create' | 'edit' | 'view';
 sizing?: UniformSizing | null;
 onSave: (data: UniformSizingFormData) => Promise<void>;
}

export default function CreateEditUniformSizingDrawer({
 isOpen,
 onClose,
 mode,
 sizing,
 onSave
}: CreateEditUniformSizingDrawerProps) {
 const {
 register,
 handleSubmit,
 watch,
 setValue,
 reset,
 formState: { errors, isSubmitting }
 } = useForm<UniformSizingFormData>({
 resolver: zodResolver(uniformSizingSchema),
 defaultValues: {
 equipment_preferences: {}
 }
 });

 const watchedHeight = watch('height');
 const watchedWeight = watch('weight');

 // Calculate BMI when height and weight change
 const bmi = watchedHeight && watchedWeight ? calculateBMI(watchedHeight, watchedWeight) : null;
 const bmiCategory = bmi ? getBMICategory(watchedHeight!, watchedWeight!) : null;

 // Reset form when sizing changes
 useEffect(() => {
 if (sizing) {
 reset({
 user_id: sizing.user_id,
 first_name: sizing.first_name || '',
 last_name: sizing.last_name || '',
 size_category: sizing.size_category,
 height: sizing.height || undefined,
 weight: sizing.weight || undefined,
 chest: sizing.chest || undefined,
 waist: sizing.waist || undefined,
 neck: sizing.neck || undefined,
 sleeve_length: sizing.sleeve_length || undefined,
 inseam: sizing.inseam || undefined,
 shirt_size: sizing.shirt_size || '',
 pants_size: sizing.pants_size || '',
 shoe_size: sizing.shoe_size || '',
 hat_size: sizing.hat_size || '',
 glove_size: sizing.glove_size || '',
 equipment_preferences: sizing.equipment_preferences || {},
 notes: sizing.notes || ''
 });
 } else {
 reset({
 user_id: '',
 first_name: '',
 last_name: '',
 equipment_preferences: {}
 });
 }
 }, [sizing, reset]);

 const onSubmit = async (data: UniformSizingFormData) => {
 try {
 await onSave(data);
 onClose();
 } catch (error) {
 // Error handling is done in the parent component
 console.error('Error saving uniform sizing:', error);
 }
 };

 const title = mode === 'create' ? 'Add Uniform Sizing' : 
 mode === 'edit' ? 'Edit Uniform Sizing' : 
 'View Uniform Sizing';

 const tabs = [
 {
 key: 'basic',
 label: 'Basic Info',
 icon: User,
 content: (
 <div className="space-y-lg">
 {/* Personal Information */}
 <div>
 <h3 className="text-lg font-semibold mb-md flex items-center">
 <User className="h-icon-sm w-icon-sm mr-sm" />
 Personal Information
 </h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <label className="block text-sm font-medium mb-xs">First Name</label>
 <Input
 {...register('first_name')}
 placeholder="Enter first name"
 disabled={mode === 'view'}
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-xs">Last Name</label>
 <Input
 {...register('last_name')}
 placeholder="Enter last name"
 disabled={mode === 'view'}
 />
 </div>
 </div>

 <div className="mt-md">
 <label className="block text-sm font-medium mb-xs">Size Category</label>
 <Select
 value={watch('size_category') || ''}
 onChange={(e) => setValue('size_category', e.target.value as unknown)}
 disabled={mode === 'view'}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select size category" />
 </SelectTrigger>
 <SelectContent>
 {SIZE_CATEGORIES.map((category) => (
 <SelectItem key={category} value={category}>
 {category.toUpperCase()}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>
 )
 },
 {
 key: 'measurements',
 label: 'Measurements',
 icon: Ruler,
 content: (
 <div className="space-y-lg">
 {/* Body Measurements */}
 <div>
 <h3 className="text-lg font-semibold mb-md flex items-center">
 <Ruler className="h-icon-sm w-icon-sm mr-sm" />
 Body Measurements
 </h3>
 
 {/* BMI Display */}
 {bmi && (
 <Card className="p-md mb-md bg-muted/50">
 <div className="flex items-center justify-between">
 <div>
 <span className="text-sm font-medium">BMI: {bmi.toFixed(1)}</span>
 {bmiCategory && (
 <Badge variant="outline" className="ml-sm">
 {bmiCategory}
 </Badge>
 )}
 </div>
 <span className="text-xs text-muted-foreground">
 Calculated from height and weight
 </span>
 </div>
 </Card>
 )}
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <label className="block text-sm font-medium mb-xs">Height (inches)</label>
 <Input
 type="number"
 {...register('height', { valueAsNumber: true })}
 placeholder="e.g., 70"
 disabled={mode === 'view'}
 />
 {watchedHeight && (
 <p className="text-xs text-muted-foreground mt-xs">
 {Math.floor(watchedHeight / 12)}' {watchedHeight % 12}"
 </p>
 )}
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-xs">Weight (lbs)</label>
 <Input
 type="number"
 {...register('weight', { valueAsNumber: true })}
 placeholder="e.g., 180"
 disabled={mode === 'view'}
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-xs">Chest (inches)</label>
 <Input
 type="number"
 {...register('chest', { valueAsNumber: true })}
 placeholder="e.g., 42"
 disabled={mode === 'view'}
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-xs">Waist (inches)</label>
 <Input
 type="number"
 {...register('waist', { valueAsNumber: true })}
 placeholder="e.g., 34"
 disabled={mode === 'view'}
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-xs">Neck (inches)</label>
 <Input
 type="number"
 {...register('neck', { valueAsNumber: true })}
 placeholder="e.g., 16"
 disabled={mode === 'view'}
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-xs">Sleeve Length (inches)</label>
 <Input
 type="number"
 {...register('sleeve_length', { valueAsNumber: true })}
 placeholder="e.g., 34"
 disabled={mode === 'view'}
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-xs">Inseam (inches)</label>
 <Input
 type="number"
 {...register('inseam', { valueAsNumber: true })}
 placeholder="e.g., 32"
 disabled={mode === 'view'}
 />
 </div>
 </div>
 </div>
 </div>
 )
 },
 {
 key: 'clothing',
 label: 'Clothing Sizes',
 icon: Shirt,
 content: (
 <div className="space-y-lg">
 {/* Clothing Sizes */}
 <div>
 <h3 className="text-lg font-semibold mb-md flex items-center">
 <Shirt className="h-icon-sm w-icon-sm mr-sm" />
 Clothing Sizes
 </h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <label className="block text-sm font-medium mb-xs">Shirt Size</label>
 <Input
 {...register('shirt_size')}
 placeholder="e.g., L, XL, 16.5"
 disabled={mode === 'view'}
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-xs">Pants Size</label>
 <Input
 {...register('pants_size')}
 placeholder="e.g., 34x32, L"
 disabled={mode === 'view'}
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-xs">Shoe Size</label>
 <Input
 {...register('shoe_size')}
 placeholder="e.g., 10.5, 11"
 disabled={mode === 'view'}
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-xs">Hat Size</label>
 <Input
 {...register('hat_size')}
 placeholder="e.g., 7 1/4, L"
 disabled={mode === 'view'}
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-xs">Glove Size</label>
 <Input
 {...register('glove_size')}
 placeholder="e.g., M, L, 9"
 disabled={mode === 'view'}
 />
 </div>
 </div>
 </div>

 {/* Equipment Preferences */}
 <div>
 <h4 className="font-medium mb-sm">Equipment Preferences</h4>
 <div className="space-y-sm">
 {EQUIPMENT_TYPES.map((equipment) => (
 <div key={equipment} className="flex items-center space-x-sm">
 <label className="text-sm font-medium w-component-xl capitalize">
 {equipment.replace('_', ' ')}:
 </label>
 <Input
 placeholder={`Preferred ${equipment.replace('_', ' ')}`}
 disabled={mode === 'view'}
 onChange={(e) => {
 const current = watch('equipment_preferences') || {};
 setValue('equipment_preferences', {
 ...current,
 [equipment]: e.target.value
 });
 }}
 value={watch('equipment_preferences')?.[equipment] || ''}
 />
 </div>
 ))}
 </div>
 </div>

 {/* Notes */}
 <div>
 <label className="block text-sm font-medium mb-xs">Notes</label>
 <Textarea
 {...register('notes')}
 placeholder="Additional notes about sizing preferences, fit issues, etc."
 rows={3}
 disabled={mode === 'view'}
 />
 </div>
 </div>
 )
 },
 ];

 return (
 <Drawer
 isOpen={isOpen}
 onClose={onClose}
 title={title}
 tabs={tabs}
 actions={
 mode !== 'view' ? (
 <div className="flex items-center space-x-sm">
 <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
 Cancel
 </Button>
 <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
 <Save className="h-icon-xs w-icon-xs mr-sm" />
 {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
 </Button>
 </div>
 ) : undefined
 }
 />
 );
}
