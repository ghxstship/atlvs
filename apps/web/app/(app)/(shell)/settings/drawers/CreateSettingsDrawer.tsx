'use client';

import { Save, X } from "lucide-react";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import {
 Drawer,
 Form,
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
 Input,
 Textarea,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Switch,
 Button,
 useToastContext,
 Tabs,
 TabsContent,
 TabsList,
 TabsTrigger,
} from '@ghxstship/ui';
import type { SettingsDrawerProps, SettingsFormData, SettingCategory, SettingType } from '../types';
import { settingsService } from '../lib/settings-service';

const settingsFormSchema = z.object({
 name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
 category: z.enum([
 'organization',
 'security', 
 'notifications',
 'integrations',
 'billing',
 'permissions',
 'automations',
 'compliance',
 'backup'
 ]),
 type: z.enum(['string', 'number', 'boolean', 'json', 'array']),
 value: z.string().min(1, 'Value is required'),
 description: z.string().optional(),
 is_public: z.boolean().default(false),
 is_editable: z.boolean().default(true),
});

const CATEGORY_OPTIONS = [
 { value: 'organization', label: 'Organization' },
 { value: 'security', label: 'Security' },
 { value: 'notifications', label: 'Notifications' },
 { value: 'integrations', label: 'Integrations' },
 { value: 'billing', label: 'Billing' },
 { value: 'permissions', label: 'Permissions' },
 { value: 'automations', label: 'Automations' },
 { value: 'compliance', label: 'Compliance' },
 { value: 'backup', label: 'Backup' },
];

const TYPE_OPTIONS = [
 { value: 'string', label: 'String', description: 'Text value' },
 { value: 'number', label: 'Number', description: 'Numeric value' },
 { value: 'boolean', label: 'Boolean', description: 'True/false value' },
 { value: 'json', label: 'JSON', description: 'JSON object' },
 { value: 'array', label: 'Array', description: 'Array of values' },
];

interface CreateSettingsDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 onSuccess: () => void;
}

export default function CreateSettingsDrawer({
 isOpen,
 onClose,
 onSuccess,
}: CreateSettingsDrawerProps) {
 const { toast } = useToastContext();
 const [saving, setSaving] = useState(false);
 const [activeTab, setActiveTab] = useState('basic');

 const form = useForm<SettingsFormData>({
 resolver: zodResolver(settingsFormSchema),
 defaultValues: {
 name: '',
 category: 'organization',
 type: 'string',
 value: '',
 description: '',
 is_public: false,
 is_editable: true,
 },
 });

 const watchedType = form.watch('type');

 const handleSave = async (data: SettingsFormData) => {
 try {
 setSaving(true);

 // Validate JSON/Array values
 if (data.type === 'json' || data.type === 'array') {
 try {
 JSON.parse(data.value);
 } catch {
 form.setError('value', { 
 message: `Invalid ${data.type.toUpperCase()} format` 
 });
 return;
 }
 }

 // Validate number values
 if (data.type === 'number') {
 if (isNaN(Number(data.value))) {
 form.setError('value', { 
 message: 'Invalid number format' 
 });
 return;
 }
 }

 // Validate boolean values
 if (data.type === 'boolean') {
 if (!['true', 'false'].includes(data.value.toLowerCase())) {
 form.setError('value', { 
 message: 'Boolean value must be "true" or "false"' 
 });
 return;
 }
 }

 await settingsService.createSetting(data);
 
 toast.success('Setting created successfully');
 form.reset();
 onSuccess();
 onClose();
 } catch (error) {
 console.error('Error creating setting:', error);
 toast.error('Failed to create setting');
 } finally {
 setSaving(false);
 }
 };

 const handleClose = () => {
 form.reset();
 setActiveTab('basic');
 onClose();
 };

 const getValuePlaceholder = (type: SettingType) => {
 switch (type) {
 case 'string':
 return 'Enter text value...';
 case 'number':
 return 'Enter numeric value...';
 case 'boolean':
 return 'true or false';
 case 'json':
 return '{"key": "value"}';
 case 'array':
 return '["item1", "item2"]';
 default:
 return 'Enter value...';
 }
 };

 const getValueHelperText = (type: SettingType) => {
 switch (type) {
 case 'json':
 return 'Enter a valid JSON object';
 case 'array':
 return 'Enter a valid JSON array';
 case 'boolean':
 return 'Enter "true" or "false"';
 case 'number':
 return 'Enter a numeric value';
 default:
 return '';
 }
 };

 return (
 <Drawer
 isOpen={isOpen}
 onClose={handleClose}
 title="Create New Setting"
 description="Add a new configuration setting to your organization"
 >
 <Form {...form}>
 <form onSubmit={form.handleSubmit(handleSave)} className="space-y-lg">
 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList className="grid w-full grid-cols-2">
 <TabsTrigger value="basic">Basic Information</TabsTrigger>
 <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
 </TabsList>

 <TabsContent value="basic" className="space-y-md">
 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Setting Name</FormLabel>
 <FormControl>
 <Input 
 placeholder="e.g., Organization Name, API Rate Limit"
 {...field} 
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Description (Optional)</FormLabel>
 <FormControl>
 <Textarea 
 placeholder="Describe what this setting controls..."
 rows={3}
 {...field} 
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <div className="grid grid-cols-2 gap-md">
 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Category</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Select category" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 {CATEGORY_OPTIONS.map((option) => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Data Type</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
 <FormControl>
 <SelectTrigger>
 <SelectValue placeholder="Select type" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 {TYPE_OPTIONS.map((option) => (
 <SelectItem key={option.value} value={option.value}>
 <div>
 <div className="font-medium">{option.label}</div>
 <div className="text-xs text-muted-foreground">
 {option.description}
 </div>
 </div>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Value</FormLabel>
 <FormControl>
 {watchedType === 'json' || watchedType === 'array' ? (
 <Textarea
 placeholder={getValuePlaceholder(watchedType)}
 rows={6}
 className="font-mono text-sm"
 {...field}
 />
 ) : (
 <Input
 placeholder={getValuePlaceholder(watchedType)}
 {...field}
 />
 )}
 </FormControl>
 {getValueHelperText(watchedType) && (
 <p className="text-xs text-muted-foreground">
 {getValueHelperText(watchedType)}
 </p>
 )}
 <FormMessage />
 </FormItem>
 )}
 />
 </TabsContent>

 <TabsContent value="advanced" className="space-y-md">
 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-md">
 <div className="space-y-0.5">
 <FormLabel className="text-base">Public Setting</FormLabel>
 <div className="text-sm text-muted-foreground">
 Allow this setting to be visible to all organization members
 </div>
 </div>
 <FormControl>
 <Switch
 checked={field.value}
 onCheckedChange={field.onChange}
 />
 </FormControl>
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-md">
 <div className="space-y-0.5">
 <FormLabel className="text-base">Editable Setting</FormLabel>
 <div className="text-sm text-muted-foreground">
 Allow this setting to be modified after creation
 </div>
 </div>
 <FormControl>
 <Switch
 checked={field.value}
 onCheckedChange={field.onChange}
 />
 </FormControl>
 </FormItem>
 )}
 />

 <div className="bg-muted p-md rounded-lg">
 <h4 className="font-medium mb-2">Setting Preview</h4>
 <div className="space-y-xs text-sm">
 <div>
 <span className="font-medium">Name:</span> {form.watch('name') || 'Untitled Setting'}
 </div>
 <div>
 <span className="font-medium">Category:</span> {form.watch('category')}
 </div>
 <div>
 <span className="font-medium">Type:</span> {form.watch('type')}
 </div>
 <div>
 <span className="font-medium">Visibility:</span> {form.watch('is_public') ? 'Public' : 'Private'}
 </div>
 <div>
 <span className="font-medium">Access:</span> {form.watch('is_editable') ? 'Editable' : 'Read-only'}
 </div>
 </div>
 </div>
 </TabsContent>
 </Tabs>

 <div className="flex justify-end gap-sm pt-4 border-t">
 <Button
 type="button"
 variant="outline"
 onClick={handleClose}
 disabled={saving}
 >
 <X className="h-icon-xs w-icon-xs mr-2" />
 Cancel
 </Button>
 <Button
 type="submit"
 disabled={saving}
 >
 <Save className="h-icon-xs w-icon-xs mr-2" />
 {saving ? 'Creating...' : 'Create Setting'}
 </Button>
 </div>
 </form>
 </Form>
 </Drawer>
 );
}
