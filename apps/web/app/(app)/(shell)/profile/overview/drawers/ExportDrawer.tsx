'use client';

import { Download, FileText, FileSpreadsheet, FileJson, File, Users, Filter, Columns, X, CheckCircle } from "lucide-react";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import {
 Drawer,
 Form,
 FormField,
 FormItem,
 FormLabel,
 FormControl,
 FormMessage,
 Button,
 Badge,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Checkbox,
 RadioGroup,
 RadioGroupItem,
 Label,
} from '@ghxstship/ui';
import type { ProfileOverview } from '../types';
import { EXPORT_FORMATS, PROFILE_OVERVIEW_FIELD_CONFIG } from '../types';

const exportSchema = z.object({
 format: z.enum(['csv', 'xlsx', 'json', 'pdf']),
 scope: z.enum(['selected', 'filtered', 'all']),
 fields: z.array(z.string()).min(1, 'Select at least one field to export'),
 includeMetadata: z.boolean().default(false),
});

type ExportFormData = z.infer<typeof exportSchema>;

interface ExportDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 selectedProfiles: ProfileOverview[];
 totalProfiles: number;
 onExport: (config: ExportFormData & { profileIds?: string[] }) => Promise<void>;
 loading?: boolean;
}

export default function ExportDrawer({
 isOpen,
 onClose,
 selectedProfiles,
 totalProfiles,
 onExport,
 loading = false,
}: ExportDrawerProps) {
 const [selectedFields, setSelectedFields] = useState<string[]>([
 'full_name',
 'email',
 'job_title',
 'department',
 'status',
 'profile_completion_percentage'
 ]);

 const form = useForm<ExportFormData>({
 resolver: zodResolver(exportSchema),
 defaultValues: {
 format: 'csv',
 scope: selectedProfiles.length > 0 ? 'selected' : 'all',
 fields: selectedFields,
 includeMetadata: false,
 },
 });

 const watchedScope = form.watch('scope');
 const watchedFormat = form.watch('format');

 const handleSubmit = async (data: ExportFormData) => {
 try {
 const exportConfig = {
 ...data,
 profileIds: data.scope === 'selected' ? selectedProfiles.map(p => p.id) : undefined,
 };
 await onExport(exportConfig);
 onClose();
 } catch (error) {
 console.error('Error exporting profiles:', error);
 }
 };

 const handleFieldToggle = (fieldKey: string, checked: boolean) => {
 const newFields = checked
 ? [...selectedFields, fieldKey]
 : selectedFields.filter(f => f !== fieldKey);
 
 setSelectedFields(newFields);
 form.setValue('fields', newFields);
 };

 const handleSelectAllFields = () => {
 const allFields = PROFILE_OVERVIEW_FIELD_CONFIG.map(f => f.key);
 setSelectedFields(allFields);
 form.setValue('fields', allFields);
 };

 const handleSelectNoFields = () => {
 setSelectedFields([]);
 form.setValue('fields', []);
 };

 const getFormatIcon = (format: string) => {
 const icons = {
 csv: FileText,
 xlsx: FileSpreadsheet,
 json: FileJson,
 pdf: File,
 };
 const IconComponent = icons[format as keyof typeof icons] || File;
 return <IconComponent className="h-4 w-4" />;
 };

 const getExportCount = () => {
 switch (watchedScope) {
 case 'selected':
 return selectedProfiles.length;
 case 'filtered':
 return totalProfiles; // This would be the filtered count in a real implementation
 case 'all':
 return totalProfiles;
 default:
 return 0;
 }
 };

 const fieldsBySection = PROFILE_OVERVIEW_FIELD_CONFIG.reduce((acc, field) => {
 if (!acc[field.section]) {
 acc[field.section] = [];
 }
 acc[field.section].push(field);
 return acc;
 }, {} as Record<string, typeof PROFILE_OVERVIEW_FIELD_CONFIG>);

 return (
 <Drawer
 isOpen={isOpen}
 onClose={onClose}
 title="Export Profile Overviews"
 size="lg"
 >
 <div className="stack-lg">
 {/* Export Summary */}
 <div className="p-lg bg-secondary/30 rounded-lg">
 <div className="flex items-center gap-md mb-md">
 <div className="p-sm bg-accent/10 rounded-lg">
 <Download className="h-5 w-5 color-accent" />
 </div>
 <div>
 <h3 className="text-heading-4">Export Configuration</h3>
 <p className="text-body-sm color-muted">
 Configure your export settings and field selection
 </p>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-md">
 <div className="text-center p-sm bg-background rounded">
 <div className="text-body-sm font-medium">{selectedProfiles.length}</div>
 <div className="text-body-xs color-muted">Selected</div>
 </div>
 <div className="text-center p-sm bg-background rounded">
 <div className="text-body-sm font-medium">{totalProfiles}</div>
 <div className="text-body-xs color-muted">Total</div>
 </div>
 <div className="text-center p-sm bg-background rounded">
 <div className="text-body-sm font-medium">{selectedFields.length}</div>
 <div className="text-body-xs color-muted">Fields</div>
 </div>
 </div>
 </div>

 <Form {...form}>
 <form onSubmit={form.handleSubmit(handleSubmit)} className="stack-lg">
 {/* Export Format */}
 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Export Format</FormLabel>
 <FormControl>
 <RadioGroup
 value={field.value}
 onValueChange={field.onChange}
 className="grid grid-cols-2 gap-md"
 >
 {EXPORT_FORMATS.map((format) => (
 <div key={format.value} className="flex items-center space-x-2">
 <RadioGroupItem value={format.value} id={format.value} />
 <Label 
 htmlFor={format.value}
 className="flex items-center gap-md cursor-pointer flex-1 p-md border rounded-lg hover:bg-muted/50"
 >
 {getFormatIcon(format.value)}
 <div>
 <div className="font-medium">{format.label}</div>
 <div className="text-body-xs color-muted">{format.description}</div>
 </div>
 </Label>
 </div>
 ))}
 </RadioGroup>
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 {/* Export Scope */}
 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Export Scope</FormLabel>
 <FormControl>
 <Select value={field.value} onValueChange={field.onChange}>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {selectedProfiles.length > 0 && (
 <SelectItem value="selected">
 <div className="flex items-center gap-md">
 <CheckCircle className="h-4 w-4 color-accent" />
 <div>
 <div className="font-medium">Selected Profiles</div>
 <div className="text-body-xs color-muted">
 Export {selectedProfiles.length} selected profiles
 </div>
 </div>
 </div>
 </SelectItem>
 )}
 <SelectItem value="filtered">
 <div className="flex items-center gap-md">
 <Filter className="h-4 w-4 color-info" />
 <div>
 <div className="font-medium">Filtered Results</div>
 <div className="text-body-xs color-muted">
 Export current filtered results ({totalProfiles} profiles)
 </div>
 </div>
 </div>
 </SelectItem>
 <SelectItem value="all">
 <div className="flex items-center gap-md">
 <Users className="h-4 w-4 color-secondary" />
 <div>
 <div className="font-medium">All Profiles</div>
 <div className="text-body-xs color-muted">
 Export all profiles ({totalProfiles} profiles)
 </div>
 </div>
 </div>
 </SelectItem>
 </SelectContent>
 </Select>
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 {/* Field Selection */}
 <div>
 <div className="flex items-center justify-between mb-md">
 <FormLabel>Fields to Export</FormLabel>
 <div className="flex gap-sm">
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={handleSelectAllFields}
 >
 Select All
 </Button>
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={handleSelectNoFields}
 >
 Select None
 </Button>
 </div>
 </div>

 <div className="border rounded-lg p-md max-h-64 overflow-y-auto">
 {Object.entries(fieldsBySection).map(([section, fields]) => (
 <div key={section} className="mb-lg last:mb-0">
 <h4 className="text-body-sm font-medium mb-md capitalize">
 {section.replace('_', ' ')} Information
 </h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
 {fields.map((field) => (
 <div key={field.key} className="flex items-center space-x-2">
 <Checkbox
 id={field.key}
 checked={selectedFields.includes(field.key)}
 onCheckedChange={(checked) => 
 handleFieldToggle(field.key, checked as boolean)
 }
 />
 <Label 
 htmlFor={field.key}
 className="text-body-sm cursor-pointer flex-1"
 >
 {field.label}
 </Label>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>

 {selectedFields.length === 0 && (
 <p className="text-body-sm color-destructive mt-sm">
 Please select at least one field to export
 </p>
 )}
 </div>

 {/* Additional Options */}
 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem className="flex flex-row items-start space-x-3 space-y-0">
 <FormControl>
 <Checkbox
 checked={field.value}
 onCheckedChange={field.onChange}
 />
 </FormControl>
 <div className="space-y-1 leading-none">
 <FormLabel className="text-body-sm">
 Include metadata
 </FormLabel>
 <div className="text-body-xs color-muted">
 Add export timestamp, user info, and field descriptions
 </div>
 </div>
 </FormItem>
 )}
 />

 {/* Export Preview */}
 <div className="p-md bg-info/10 rounded-lg border border-info/20">
 <h5 className="text-body-sm font-medium mb-sm color-info">
 Export Preview
 </h5>
 <div className="text-body-sm color-muted stack-xs">
 <div>• Format: {EXPORT_FORMATS.find(f => f.value === watchedFormat)?.label}</div>
 <div>• Profiles: {getExportCount()} records</div>
 <div>• Fields: {selectedFields.length} columns</div>
 <div>• Estimated file size: {Math.ceil(getExportCount() * selectedFields.length / 100)} KB</div>
 </div>
 </div>

 {/* Form Actions */}
 <div className="flex items-center justify-end gap-md pt-lg border-t">
 <Button
 type="button"
 variant="outline"
 onClick={onClose}
 disabled={loading}
 >
 <X className="h-4 w-4 mr-sm" />
 Cancel
 </Button>
 
 <Button
 type="submit"
 disabled={loading || selectedFields.length === 0}
 loading={loading}
 >
 <Download className="h-4 w-4 mr-sm" />
 Export {getExportCount()} Profile{getExportCount() !== 1 ? 's' : ''}
 </Button>
 </div>
 </form>
 </Form>
 </div>
 </Drawer>
 );
}
