'use client';

import { Download, FileText, Database, Table, FileSpreadsheet, CheckCircle, Users } from "lucide-react";
import { useState } from 'react';
import {
 Drawer,
 Button,
 Card,
 Badge,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Label,
 Checkbox,
 Input,
 useToast,
} from '@ghxstship/ui';

import type { UserProfile, ExportConfig, FieldConfig } from '../types';

const EXPORT_FORMATS = [
 {
 value: 'csv',
 label: 'CSV (Comma Separated Values)',
 description: 'Compatible with Excel and Google Sheets',
 icon: <Table className="h-icon-xs w-icon-xs" />,
 },
 {
 value: 'json',
 label: 'JSON (JavaScript Object Notation)',
 description: 'Structured data format for developers',
 icon: <Database className="h-icon-xs w-icon-xs" />,
 },
 {
 value: 'excel',
 label: 'Excel Workbook (.xlsx)',
 description: 'Native Microsoft Excel format',
 icon: <FileSpreadsheet className="h-icon-xs w-icon-xs" />,
 },
 {
 value: 'pdf',
 label: 'PDF Report',
 description: 'Formatted report for printing or sharing',
 icon: <FileText className="h-icon-xs w-icon-xs" />,
 },
];

const DEFAULT_FIELDS = [
 { key: 'full_name', label: 'Full Name', selected: true },
 { key: 'email', label: 'Email', selected: true },
 { key: 'phone', label: 'Phone', selected: true },
 { key: 'department', label: 'Department', selected: true },
 { key: 'position', label: 'Position', selected: true },
 { key: 'status', label: 'Status', selected: true },
 { key: 'completion_percentage', label: 'Profile Completion', selected: true },
 { key: 'hire_date', label: 'Hire Date', selected: false },
 { key: 'employment_type', label: 'Employment Type', selected: false },
 { key: 'manager_id', label: 'Manager ID', selected: false },
 { key: 'address_line1', label: 'Address', selected: false },
 { key: 'city', label: 'City', selected: false },
 { key: 'state', label: 'State', selected: false },
 { key: 'country', label: 'Country', selected: false },
 { key: 'emergency_contact_name', label: 'Emergency Contact', selected: false },
 { key: 'last_login', label: 'Last Login', selected: false },
 { key: 'created_at', label: 'Created Date', selected: false },
 { key: 'updated_at', label: 'Updated Date', selected: false },
];

interface ExportDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 selectedProfiles: UserProfile[];
 totalProfiles: number;
 onExport: (config: ExportConfig) => Promise<void>;
}

export default function ExportDrawer({
 isOpen,
 onClose,
 selectedProfiles,
 totalProfiles,
 onExport
}: ExportDrawerProps) {
 const { toast } = useToast();
 const [loading, setLoading] = useState(false);
 const [exportScope, setExportScope] = useState<'selected' | 'all'>('selected');
 const [format, setFormat] = useState<'csv' | 'json' | 'excel' | 'pdf'>('csv');
 const [includeHeaders, setIncludeHeaders] = useState(true);
 const [filename, setFilename] = useState('');
 const [selectedFields, setSelectedFields] = useState(
 DEFAULT_FIELDS.reduce((acc, field) => {
 acc[field.key] = field.selected;
 return acc;
 }, {} as Record<string, boolean>)
 );

 const selectedFormat = EXPORT_FORMATS.find(f => f.value === format);
 const selectedFieldKeys = Object.entries(selectedFields)
 .filter(([, selected]) => selected)
 .map(([key]) => key);

 const handleFieldToggle = (fieldKey: string, checked: boolean) => {
 setSelectedFields(prev => ({
 ...prev,
 [fieldKey]: checked
 }));
 };

 const handleSelectAllFields = (checked: boolean) => {
 const newSelectedFields = DEFAULT_FIELDS.reduce((acc, field) => {
 acc[field.key] = checked;
 return acc;
 }, {} as Record<string, boolean>);
 setSelectedFields(newSelectedFields);
 };

 const handleExport = async () => {
 if (selectedFieldKeys.length === 0) {
 toast({
 title: 'No Fields Selected',
 description: 'Please select at least one field to export',
 variant: 'destructive',
 });
 return;
 }

 const config: ExportConfig = {
 format,
 fields: selectedFieldKeys,
 includeHeaders,
 filename: filename || `profiles-export-${new Date().toISOString().split('T')[0]}`,
 };

 try {
 setLoading(true);
 await onExport(config);
 toast({
 title: 'Export Started',
 description: 'Your export is being prepared and will download shortly',
 });
 onClose();
 } catch (error) {
 toast({
 title: 'Export Failed',
 description: 'There was an error preparing your export',
 variant: 'destructive',
 });
 } finally {
 setLoading(false);
 }
 };

 const handleClose = () => {
 setExportScope('selected');
 setFormat('csv');
 setIncludeHeaders(true);
 setFilename('');
 setSelectedFields(
 DEFAULT_FIELDS.reduce((acc, field) => {
 acc[field.key] = field.selected;
 return acc;
 }, {} as Record<string, boolean>)
 );
 onClose();
 };

 const exportCount = exportScope === 'selected' ? selectedProfiles.length : totalProfiles;

 return (
 <Drawer
 isOpen={isOpen}
 onClose={handleClose}
 title="Export Profiles"
 description="Configure and download profile data"
 size="lg"
 >
 <div className="space-y-lg">
 {/* Export Scope */}
 <Card className="p-md">
 <div className="flex items-center gap-sm mb-md">
 <Users className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="font-semibold">Export Scope</h3>
 </div>
 
 <div className="space-y-sm">
 <div className="flex items-center gap-sm">
 <input
 type="radio"
 
 
 checked={exportScope === 'selected'}
 onChange={() => setExportScope('selected')}
 className="w-icon-xs h-icon-xs"
 />
 <Label htmlFor="selected" className="cursor-pointer">
 Selected profiles ({selectedProfiles.length})
 </Label>
 </div>
 
 <div className="flex items-center gap-sm">
 <input
 type="radio"
 
 
 checked={exportScope === 'all'}
 onChange={() => setExportScope('all')}
 className="w-icon-xs h-icon-xs"
 />
 <Label htmlFor="all" className="cursor-pointer">
 All profiles ({totalProfiles})
 </Label>
 </div>
 </div>
 
 <div className="mt-sm p-sm bg-muted/50 rounded">
 <p className="text-sm text-muted-foreground">
 Exporting {exportCount} profile{exportCount !== 1 ? 's' : ''}
 </p>
 </div>
 </Card>

 {/* Format Selection */}
 <div className="space-y-sm">
 <Label htmlFor="format">Export Format</Label>
 <Select value={format} onValueChange={(value) => setFormat(value as unknown)}>
 <SelectTrigger>
 <SelectValue placeholder="Select export format" />
 </SelectTrigger>
 <SelectContent>
 {EXPORT_FORMATS.map((fmt) => (
 <SelectItem key={fmt.value} value={fmt.value}>
 <div className="flex items-center gap-sm">
 {fmt.icon}
 <div>
 <p className="font-medium">{fmt.label}</p>
 <p className="text-xs text-muted-foreground">{fmt.description}</p>
 </div>
 </div>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 
 {selectedFormat && (
 <div className="p-sm bg-muted/50 rounded">
 <p className="text-sm text-muted-foreground">
 {selectedFormat.description}
 </p>
 </div>
 )}
 </div>

 {/* Field Selection */}
 <Card className="p-md">
 <div className="flex items-center justify-between mb-md">
 <h3 className="font-semibold">Fields to Export</h3>
 <div className="flex items-center gap-sm">
 <Checkbox
 
 checked={selectedFieldKeys.length === DEFAULT_FIELDS.length}
 onCheckedChange={handleSelectAllFields}
 indeterminate={selectedFieldKeys.length > 0 && selectedFieldKeys.length < DEFAULT_FIELDS.length}
 />
 <Label htmlFor="select-all" className="text-sm cursor-pointer">
 Select All ({selectedFieldKeys.length}/{DEFAULT_FIELDS.length})
 </Label>
 </div>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-sm max-h-container-xs overflow-y-auto">
 {DEFAULT_FIELDS.map((field) => (
 <div key={field.key} className="flex items-center gap-sm">
 <Checkbox
 id={field.key}
 checked={selectedFields[field.key] || false}
 onCheckedChange={(checked) => handleFieldToggle(field.key, checked as boolean)}
 />
 <Label htmlFor={field.key} className="text-sm cursor-pointer flex-1">
 {field.label}
 </Label>
 </div>
 ))}
 </div>
 </Card>

 {/* Export Options */}
 <div className="space-y-md">
 <div className="flex items-center gap-sm">
 <Checkbox
 
 checked={includeHeaders}
 onCheckedChange={setIncludeHeaders}
 />
 <Label htmlFor="headers" className="cursor-pointer">
 Include column headers
 </Label>
 </div>
 
 <div className="space-y-sm">
 <Label htmlFor="filename">Filename (optional)</Label>
 <Input
 
 value={filename}
 onChange={(e) => setFilename(e.target.value)}
 placeholder={`profiles-export-${new Date().toISOString().split('T')[0]}`}
 />
 <p className="text-xs text-muted-foreground">
 File extension will be added automatically based on format
 </p>
 </div>
 </div>

 {/* Export Summary */}
 <Card className="p-md bg-muted/50">
 <div className="flex items-start gap-sm">
 <CheckCircle className="h-icon-sm w-icon-sm text-green-600 mt-xs" />
 <div>
 <h4 className="font-semibold">Export Summary</h4>
 <ul className="text-sm text-muted-foreground space-y-xs mt-xs">
 <li>• {exportCount} profile{exportCount !== 1 ? 's' : ''} will be exported</li>
 <li>• {selectedFieldKeys.length} field{selectedFieldKeys.length !== 1 ? 's' : ''} selected</li>
 <li>• Format: {selectedFormat?.label}</li>
 <li>• Headers: {includeHeaders ? 'Included' : 'Not included'}</li>
 </ul>
 </div>
 </div>
 </Card>

 {/* Action Buttons */}
 <div className="flex justify-end gap-sm pt-md border-t border-border">
 <Button
 variant="outline"
 onClick={handleClose}
 disabled={loading}
 >
 Cancel
 </Button>
 <Button
 onClick={handleExport}
 loading={loading}
 disabled={selectedFieldKeys.length === 0}
 >
 <Download className="h-icon-xs w-icon-xs mr-sm" />
 Export {exportCount} Profile{exportCount !== 1 ? 's' : ''}
 </Button>
 </div>
 </div>
 </Drawer>
 );
}
