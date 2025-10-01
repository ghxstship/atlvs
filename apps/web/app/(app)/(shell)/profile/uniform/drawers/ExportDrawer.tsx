'use client';

import { Download, FileText, Settings, CheckCircle, FileSpreadsheet, FileJson, FileImage } from "lucide-react";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import {
 Drawer,
 Button,
 Badge,
 Card,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Checkbox,
 Input,
 Textarea
} from '@ghxstship/ui';
import type { UniformSizing } from '../types';
import { EXPORT_FORMATS } from '../types';

// Export configuration schema
const exportConfigSchema = z.object({
 format: z.enum(['csv', 'xlsx', 'json', 'pdf']),
 scope: z.enum(['selected', 'filtered', 'all']),
 includeFields: z.array(z.string()).min(1, 'Select at least one field to export'),
 filename: z.string().min(1, 'Filename is required'),
 includeHeaders: z.boolean().default(true),
 includeMetadata: z.boolean().default(false),
 notes: z.string().optional(),
});

type ExportConfigFormData = z.infer<typeof exportConfigSchema>;

interface ExportDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 selectedSizings: UniformSizing[];
 totalCount: number;
 onExport: (config: ExportConfigFormData) => Promise<void>;
}

const AVAILABLE_FIELDS = [
 { id: 'personal', label: 'Personal Information', fields: ['first_name', 'last_name', 'user_id'] },
 { id: 'measurements', label: 'Body Measurements', fields: ['height', 'weight', 'chest', 'waist', 'neck', 'sleeve_length', 'inseam'] },
 { id: 'clothing', label: 'Clothing Sizes', fields: ['shirt_size', 'pants_size', 'shoe_size', 'hat_size', 'glove_size'] },
 { id: 'preferences', label: 'Equipment Preferences', fields: ['equipment_preferences'] },
 { id: 'metadata', label: 'Metadata', fields: ['size_category', 'notes', 'created_at', 'updated_at'] },
];

const FORMAT_ICONS = {
 csv: FileSpreadsheet,
 xlsx: FileSpreadsheet,
 json: FileJson,
 pdf: FileImage,
};

export default function ExportDrawer({
 isOpen,
 onClose,
 selectedSizings,
 totalCount,
 onExport,
}: ExportDrawerProps) {
 const [currentStep, setCurrentStep] = useState(0);
 
 const {
 register,
 handleSubmit,
 watch,
 setValue,
 reset,
 formState: { errors, isSubmitting }
 } = useForm<ExportConfigFormData>({
 resolver: zodResolver(exportConfigSchema),
 defaultValues: {
 format: 'csv',
 scope: selectedSizings.length > 0 ? 'selected' : 'all',
 includeFields: ['first_name', 'last_name', 'height', 'weight', 'shirt_size', 'pants_size'],
 filename: `uniform-sizing-export-${new Date().toISOString().split('T')[0]}`,
 includeHeaders: true,
 includeMetadata: false,
 },
 });

 const watchedFormat = watch('format');
 const watchedScope = watch('scope');
 const watchedFields = watch('includeFields');

 const handleClose = () => {
 if (!isSubmitting) {
 onClose();
 reset();
 setCurrentStep(0);
 }
 };

 const onSubmit = async (data: ExportConfigFormData) => {
 try {
 await onExport(data);
 handleClose();
 } catch (error) {
 console.error('Error exporting data:', error);
 }
 };

 const toggleFieldGroup = (groupFields: string[], checked: boolean) => {
 const currentFields = watchedFields || [];
 if (checked) {
 const newFields = [...new Set([...currentFields, ...groupFields])];
 setValue('includeFields', newFields);
 } else {
 const newFields = currentFields.filter(field => !groupFields.includes(field));
 setValue('includeFields', newFields);
 }
 };

 const toggleField = (field: string, checked: boolean) => {
 const currentFields = watchedFields || [];
 if (checked) {
 setValue('includeFields', [...currentFields, field]);
 } else {
 setValue('includeFields', currentFields.filter(f => f !== field));
 }
 };

 const getRecordCount = () => {
 switch (watchedScope) {
 case 'selected':
 return selectedSizings.length;
 case 'all':
 return totalCount;
 default:
 return totalCount; // filtered - would need actual filtered count
 }
 };

 const selectedFormat = EXPORT_FORMATS.find(f => f.id === watchedFormat);
 const FormatIcon = FORMAT_ICONS[watchedFormat];

 const tabs = [
 {
 key: 'format',
 label: 'Format & Scope',
 icon: FileText,
 content: (
 <div className="space-y-lg">
 {/* Export Format */}
 <div>
 <label className="block text-sm font-medium mb-sm">Export Format</label>
 <div className="grid grid-cols-2 gap-sm">
 {EXPORT_FORMATS.map((format) => {
 const Icon = FORMAT_ICONS[format.id as keyof typeof FORMAT_ICONS];
 return (
 <Card
 key={format.id}
 className={`p-md cursor-pointer transition-all hover:shadow-sm ${
 watchedFormat === format.id ? 'ring-2 ring-primary bg-primary/5' : ''
 }`}
 onClick={() => setValue('format', format.id as unknown)}
 >
 <div className="flex items-center space-x-sm">
 <Icon className="h-icon-sm w-icon-sm text-primary" />
 <div>
 <div className="font-medium">{format.label}</div>
 <div className="text-xs text-muted-foreground">{format.description}</div>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 </div>

 {/* Export Scope */}
 <div>
 <label className="block text-sm font-medium mb-sm">Export Scope</label>
 <Select value={watchedScope} onValueChange={(value) => setValue('scope', value as unknown)}>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="selected" disabled={selectedSizings.length === 0}>
 Selected Records ({selectedSizings.length})
 </SelectItem>
 <SelectItem value="filtered">
 Current Filter Results ({totalCount})
 </SelectItem>
 <SelectItem value="all">
 All Records ({totalCount})
 </SelectItem>
 </SelectContent>
 </Select>
 </div>

 {/* Export Summary */}
 <Card className="p-md bg-muted/50">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-sm">
 <FormatIcon className="h-icon-sm w-icon-sm text-primary" />
 <span className="font-medium">Export Summary</span>
 </div>
 <Badge variant="secondary">
 {getRecordCount()} records
 </Badge>
 </div>
 <div className="mt-sm text-sm text-muted-foreground">
 Exporting {getRecordCount()} uniform sizing records as {selectedFormat?.label}
 </div>
 </Card>

 {/* Filename */}
 <div>
 <label className="block text-sm font-medium mb-xs">Filename</label>
 <Input
 {...register('filename')}
 placeholder="Enter filename"
 />
 <p className="text-xs text-muted-foreground mt-xs">
 File extension will be added automatically
 </p>
 </div>
 </div>
 ),
 },
 {
 key: 'fields',
 label: 'Field Selection',
 icon: Settings,
 content: (
 <div className="space-y-lg">
 <div>
 <h3 className="font-medium mb-sm">Select Fields to Export</h3>
 <p className="text-sm text-muted-foreground mb-md">
 Choose which information to include in your export file.
 </p>
 </div>

 {AVAILABLE_FIELDS.map((group) => {
 const groupFields = group.fields;
 const selectedInGroup = groupFields.filter(field => watchedFields?.includes(field));
 const allSelected = selectedInGroup.length === groupFields.length;
 const someSelected = selectedInGroup.length > 0 && selectedInGroup.length < groupFields.length;

 return (
 <Card key={group.id} className="p-md">
 <div className="flex items-center justify-between mb-sm">
 <div className="flex items-center space-x-sm">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected}
 onCheckedChange={(checked) => toggleFieldGroup(groupFields, checked as boolean)}
 />
 <span className="font-medium">{group.label}</span>
 </div>
 <Badge variant="outline">
 {selectedInGroup.length}/{groupFields.length}
 </Badge>
 </div>
 
 <div className="grid grid-cols-2 gap-xs ml-6">
 {groupFields.map((field) => (
 <div key={field} className="flex items-center space-x-xs">
 <Checkbox
 checked={watchedFields?.includes(field) || false}
 onCheckedChange={(checked) => toggleField(field, checked as boolean)}
 />
 <span className="text-sm capitalize">
 {field.replace(/_/g, ' ')}
 </span>
 </div>
 ))}
 </div>
 </Card>
 );
 })}

 {errors.includeFields && (
 <p className="text-sm text-destructive">{errors.includeFields.message}</p>
 )}
 </div>
 ),
 },
 {
 key: 'options',
 label: 'Export Options',
 icon: CheckCircle,
 content: (
 <div className="space-y-lg">
 {/* Export Options */}
 <div className="space-y-md">
 <div className="flex items-center space-x-sm">
 <Checkbox
 {...register('includeHeaders')}
 defaultChecked={true}
 />
 <div>
 <span className="font-medium">Include Headers</span>
 <p className="text-xs text-muted-foreground">
 Add column headers to the export file
 </p>
 </div>
 </div>

 <div className="flex items-center space-x-sm">
 <Checkbox
 {...register('includeMetadata')}
 />
 <div>
 <span className="font-medium">Include Metadata</span>
 <p className="text-xs text-muted-foreground">
 Add export timestamp and configuration details
 </p>
 </div>
 </div>
 </div>

 {/* Export Notes */}
 <div>
 <label className="block text-sm font-medium mb-xs">Export Notes (Optional)</label>
 <Textarea
 {...register('notes')}
 placeholder="Add any notes about this export..."
 rows={3}
 />
 </div>

 {/* Final Summary */}
 <Card className="p-md bg-primary/5 border-primary/20">
 <h4 className="font-medium mb-sm">Export Configuration</h4>
 <div className="space-y-xs text-sm">
 <div className="flex justify-between">
 <span className="text-muted-foreground">Format:</span>
 <span>{selectedFormat?.label}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Records:</span>
 <span>{getRecordCount()}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Fields:</span>
 <span>{watchedFields?.length || 0} selected</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Filename:</span>
 <span className="truncate max-w-40">{watch('filename')}.{watchedFormat}</span>
 </div>
 </div>
 </Card>
 </div>
 ),
 },
 ];

 return (
 <Drawer
 isOpen={isOpen}
 onClose={handleClose}
 title="Export Uniform Sizing Data"
 tabs={tabs}
 actions={
 <div className="flex items-center space-x-sm">
 <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
 Cancel
 </Button>
 <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
 <Download className="h-icon-xs w-icon-xs mr-sm" />
 {isSubmitting ? 'Exporting...' : 'Export Data'}
 </Button>
 </div>
 }
 />
 );
}
