'use client';

import { Save, X, Trash2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from 'react';
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
 Alert,
 AlertDescription
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
 is_editable: z.boolean().default(true)
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

export default function EditSettingsDrawer({
 mode,
 setting,
 isOpen,
 onClose,
 onSave,
 onDelete
}: SettingsDrawerProps) {
 const { toast } = useToastContext();
 const [saving, setSaving] = useState(false);
 const [deleting, setDeleting] = useState(false);
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
 is_editable: true
 }
 });

 const watchedType = form.watch('type');
 const isReadOnly = mode === 'view' || setting?.is_editable === 'false';

 // Load setting data when drawer opens
 useEffect(() => {
 if (setting && isOpen) {
 form.reset({
 name: setting.name,
 category: setting.category,
 type: setting.type,
 value: setting.value,
 description: setting.description || '',
 is_public: setting.is_public === 'true',
 is_editable: setting.is_editable === 'true'
 });
 }
 }, [setting, isOpen, form]);

 const handleSave = async (data: SettingsFormData) => {
 if (!setting || !onSave) return;

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

 await onSave(data);
 
 toast.success('Setting updated successfully');
 onClose();
 } catch (error) {
 console.error('Error updating setting:', error);
 toast.error('Failed to update setting');
 } finally {
 setSaving(false);
 }
 };

 const handleDelete = async () => {
 if (!setting || !onDelete) return;

 if (!window.confirm('Are you sure you want to delete this setting? This action cannot be undone.')) {
 return;
 }

 try {
 setDeleting(true);
 await onDelete(setting.id);
 toast.success('Setting deleted successfully');
 onClose();
 } catch (error) {
 console.error('Error deleting setting:', error);
 toast.error('Failed to delete setting');
 } finally {
 setDeleting(false);
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

 const getDrawerTitle = () => {
 if (mode === 'view') return 'View Setting';
 if (mode === 'edit') return 'Edit Setting';
 return 'Setting Details';
 };

 const getDrawerDescription = () => {
 if (mode === 'view') return 'View setting configuration and details';
 if (mode === 'edit') return 'Modify setting configuration and values';
 return 'Setting configuration details';
 };

 return (
 <Drawer
 isOpen={isOpen}
 onClose={handleClose}
 title={getDrawerTitle()}
 description={getDrawerDescription()}
 >
 <Form {...form}>
 <form onSubmit={form.handleSubmit(handleSave)} className="space-y-lg">
 {isReadOnly && (
 <Alert>
 <AlertTriangle className="h-icon-xs w-icon-xs" />
 <AlertDescription>
 {mode === 'view' 
 ? 'This setting is in view-only mode.'
 : 'This setting is marked as read-only and cannot be modified.'
 }
 </AlertDescription>
 </Alert>
 )}

 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList className="grid w-full grid-cols-3">
 <TabsTrigger value="basic">Basic Information</TabsTrigger>
 <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
 <TabsTrigger value="metadata">Metadata</TabsTrigger>
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
 disabled={isReadOnly}
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
 disabled={isReadOnly}
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
 <Select 
 onValueChange={field.onChange} 
 defaultValue={field.value}
 disabled={isReadOnly}
 >
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
 <Select 
 onValueChange={field.onChange} 
 defaultValue={field.value}
 disabled={isReadOnly}
 >
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
 disabled={isReadOnly}
 {...field}
 />
 ) : (
 <Input
 placeholder={getValuePlaceholder(watchedType)}
 disabled={isReadOnly}
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
 disabled={isReadOnly}
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
 disabled={isReadOnly}
 />
 </FormControl>
 </FormItem>
 )}
 />
 </TabsContent>

 <TabsContent value="metadata" className="space-y-md">
 {setting && (
 <div className="space-y-md">
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium">Setting ID</label>
 <div className="text-sm text-muted-foreground font-mono">
 {setting.id}
 </div>
 </div>
 <div>
 <label className="text-sm font-medium">Created</label>
 <div className="text-sm text-muted-foreground">
 {new Date(setting.created_at).toLocaleString()}
 </div>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium">Last Updated</label>
 <div className="text-sm text-muted-foreground">
 {new Date(setting.updated_at).toLocaleString()}
 </div>
 </div>
 <div>
 <label className="text-sm font-medium">Status</label>
 <div className="flex gap-xs">
 <span className={`px-xs py-xs rounded text-xs ${
 setting.is_public === 'true' 
 ? 'bg-green-100 text-green-800' 
 : 'bg-gray-100 text-gray-800'
 }`}>
 {setting.is_public === 'true' ? 'Public' : 'Private'}
 </span>
 <span className={`px-xs py-xs rounded text-xs ${
 setting.is_editable === 'true' 
 ? 'bg-blue-100 text-blue-800' 
 : 'bg-orange-100 text-orange-800'
 }`}>
 {setting.is_editable === 'true' ? 'Editable' : 'Read-only'}
 </span>
 </div>
 </div>
 </div>
 </div>
 )}
 </TabsContent>
 </Tabs>

 <div className="flex justify-between pt-4 border-t">
 <div>
 {mode === 'edit' && onDelete && (
 <Button
 type="button"
 variant="destructive"
 onClick={handleDelete}
 disabled={deleting || saving}
 >
 <Trash2 className="h-icon-xs w-icon-xs mr-2" />
 {deleting ? 'Deleting...' : 'Delete Setting'}
 </Button>
 )}
 </div>
 
 <div className="flex gap-sm">
 <Button
 type="button"
 variant="outline"
 onClick={handleClose}
 disabled={saving || deleting}
 >
 <X className="h-icon-xs w-icon-xs mr-2" />
 {mode === 'view' ? 'Close' : 'Cancel'}
 </Button>
 {mode === 'edit' && !isReadOnly && (
 <Button
 type="submit"
 disabled={saving || deleting}
 >
 <Save className="h-icon-xs w-icon-xs mr-2" />
 {saving ? 'Saving...' : 'Save Changes'}
 </Button>
 )}
 </div>
 </div>
 </form>
 </Form>
 </Drawer>
 );
}
