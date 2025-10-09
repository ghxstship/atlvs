'use client';

import { Edit, Trash2, Eye, Search, Filter, Download, Upload, MoreHorizontal } from "lucide-react";
import { useState, useMemo } from 'react';
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
 Button,
 Badge,
 Checkbox,
 Input,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Skeleton,
 useToastContext
} from '@ghxstship/ui';
import type { SettingsGridViewProps, SettingRecord, SettingCategory, SettingType } from '../types';

export default function SettingsGridView({
 settings,
 loading,
 onEdit,
 onDelete,
 onSelect,
 selectedIds
}: SettingsGridViewProps) {
 const { toast } = useToastContext();
 const [searchQuery, setSearchQuery] = useState('');
 const [categoryFilter, setCategoryFilter] = useState<SettingCategory | 'all'>('all');
 const [typeFilter, setTypeFilter] = useState<SettingType | 'all'>('all');
 const [sortField, setSortField] = useState<keyof SettingRecord>('updated_at');
 const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

 // Filter and sort settings
 const filteredSettings = useMemo(() => {
 let filtered = settings;

 // Apply search filter
 if (searchQuery) {
 filtered = filtered.filter(setting =>
 setting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 setting.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
 setting.value.toLowerCase().includes(searchQuery.toLowerCase())
 );
 }

 // Apply category filter
 if (categoryFilter !== 'all') {
 filtered = filtered.filter(setting => setting.category === categoryFilter);
 }

 // Apply type filter
 if (typeFilter !== 'all') {
 filtered = filtered.filter(setting => setting.type === typeFilter);
 }

 // Apply sorting
 filtered.sort((a, b) => {
 const aValue = a[sortField];
 const bValue = b[sortField];
 
 if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
 if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
 return 0;
 });

 return filtered;
 }, [settings, searchQuery, categoryFilter, typeFilter, sortField, sortDirection]);

 const handleSort = (field: keyof SettingRecord) => {
 if (sortField === field) {
 setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
 } else {
 setSortField(field);
 setSortDirection('asc');
 }
 };

 const handleSelectAll = (checked: boolean) => {
 if (checked) {
 onSelect(filteredSettings.map(setting => setting.id));
 } else {
 onSelect([]);
 }
 };

 const handleSelectSetting = (settingId: string, checked: boolean) => {
 if (checked) {
 onSelect([...selectedIds, settingId]);
 } else {
 onSelect(selectedIds.filter(id => id !== settingId));
 }
 };

 const getCategoryBadgeVariant = (category: SettingCategory) => {
 const variants = {
 organization: 'default',
 security: 'destructive',
 notifications: 'secondary',
 integrations: 'outline',
 billing: 'default',
 permissions: 'destructive',
 automations: 'secondary',
 compliance: 'outline',
 backup: 'secondary'
 } as const;
 
 return variants[category] || 'default';
 };

 const getTypeBadge = (type: SettingType) => {
 const colors = {
 string: 'bg-blue-100 text-blue-800',
 number: 'bg-green-100 text-green-800',
 boolean: 'bg-purple-100 text-purple-800',
 json: 'bg-orange-100 text-orange-800',
 array: 'bg-pink-100 text-pink-800'
 };

 return (
 <span className={`px-xs py-xs rounded-full text-xs font-medium ${colors[type]}`}>
 {type}
 </span>
 );
 };

 const formatValue = (value: string, type: SettingType) => {
 if (type === 'boolean') {
 return value === 'true' ? '✓ Yes' : '✗ No';
 }
 
 if (type === 'json' || type === 'array') {
 try {
 const parsed = JSON.parse(value);
 return JSON.stringify(parsed, null, 2).substring(0, 100) + (value.length > 100 ? '...' : '');
 } catch {
 return value.substring(0, 100) + (value.length > 100 ? '...' : '');
 }
 }

 return value.length > 50 ? value.substring(0, 50) + '...' : value;
 };

 if (loading) {
 return (
 <div className="space-y-md">
 <div className="flex gap-md">
 <Skeleton className="h-icon-xl w-container-sm" />
 <Skeleton className="h-icon-xl w-component-xl" />
 <Skeleton className="h-icon-xl w-component-xl" />
 </div>
 <div className="space-y-xs">
 {[...Array(10)].map((_, i) => (
 <Skeleton key={i} className="h-component-md w-full" />
 ))}
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-md">
 {/* Filters and Search */}
 <div className="flex flex-col sm:flex-row gap-md">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 text-muted-foreground h-icon-xs w-icon-xs" />
 <Input
 placeholder="Search settings..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-10"
 />
 </div>
 
 <Select value={categoryFilter} onChange={(value: unknown) => setCategoryFilter(value)}>
 <SelectTrigger className="w-full sm:w-container-xs">
 <Filter className="h-icon-xs w-icon-xs mr-2" />
 <SelectValue placeholder="Category" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Categories</SelectItem>
 <SelectItem value="organization">Organization</SelectItem>
 <SelectItem value="security">Security</SelectItem>
 <SelectItem value="notifications">Notifications</SelectItem>
 <SelectItem value="integrations">Integrations</SelectItem>
 <SelectItem value="billing">Billing</SelectItem>
 <SelectItem value="permissions">Permissions</SelectItem>
 <SelectItem value="automations">Automations</SelectItem>
 <SelectItem value="compliance">Compliance</SelectItem>
 <SelectItem value="backup">Backup</SelectItem>
 </SelectContent>
 </Select>

 <Select value={typeFilter} onChange={(value: unknown) => setTypeFilter(value)}>
 <SelectTrigger className="w-full sm:w-component-xl">
 <SelectValue placeholder="Type" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Types</SelectItem>
 <SelectItem value="string">String</SelectItem>
 <SelectItem value="number">Number</SelectItem>
 <SelectItem value="boolean">Boolean</SelectItem>
 <SelectItem value="json">JSON</SelectItem>
 <SelectItem value="array">Array</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {/* Bulk Actions */}
 {selectedIds.length > 0 && (
 <div className="flex items-center gap-xs p-sm bg-muted rounded-lg">
 <span className="text-sm font-medium">
 {selectedIds.length} selected
 </span>
 <Button
 size="sm"
 variant="destructive"
 onClick={() => {
 if (window.confirm(`Delete ${selectedIds.length} settings?`)) {
 selectedIds.forEach(id => onDelete(id));
 onSelect([]);
 toast.success(`Deleted ${selectedIds.length} settings`);
 }
 }}
 >
 <Trash2 className="h-icon-xs w-icon-xs mr-2" />
 Delete Selected
 </Button>
 <Button size="sm" variant="outline">
 <Download className="h-icon-xs w-icon-xs mr-2" />
 Export Selected
 </Button>
 </div>
 )}

 {/* Settings Table */}
 <div className="border rounded-lg overflow-hidden">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-icon-2xl">
 <Checkbox
 checked={selectedIds.length === filteredSettings.length && filteredSettings.length > 0}
 onCheckedChange={handleSelectAll}
 />
 </TableHead>
 <TableHead 
 className="cursor-pointer hover:bg-muted"
 onClick={() => handleSort('name')}
 >
 Name
 {sortField === 'name' && (
 <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
 )}
 </TableHead>
 <TableHead 
 className="cursor-pointer hover:bg-muted"
 onClick={() => handleSort('category')}
 >
 Category
 {sortField === 'category' && (
 <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
 )}
 </TableHead>
 <TableHead>Type</TableHead>
 <TableHead>Value</TableHead>
 <TableHead>Status</TableHead>
 <TableHead 
 className="cursor-pointer hover:bg-muted"
 onClick={() => handleSort('updated_at')}
 >
 Updated
 {sortField === 'updated_at' && (
 <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
 )}
 </TableHead>
 <TableHead className="w-component-lg">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {filteredSettings.length === 0 ? (
 <TableRow>
 <TableCell colSpan={8} className="text-center py-xl text-muted-foreground">
 {searchQuery || categoryFilter !== 'all' || typeFilter !== 'all' 
 ? 'No settings match your filters'
 : 'No settings found'
 }
 </TableCell>
 </TableRow>
 ) : (
 filteredSettings.map((setting) => (
 <TableRow key={setting.id}>
 <TableCell>
 <Checkbox
 checked={selectedIds.includes(setting.id)}
 onCheckedChange={(checked) => handleSelectSetting(setting.id, checked)}
 />
 </TableCell>
 <TableCell>
 <div>
 <div className="font-medium">{setting.name}</div>
 {setting.description && (
 <div className="text-sm text-muted-foreground">
 {setting.description}
 </div>
 )}
 </div>
 </TableCell>
 <TableCell>
 <Badge variant={getCategoryBadgeVariant(setting.category)}>
 {setting.category}
 </Badge>
 </TableCell>
 <TableCell>
 {getTypeBadge(setting.type)}
 </TableCell>
 <TableCell>
 <div className="max-w-xs">
 <code className="text-sm bg-muted px-xs py-xs rounded">
 {formatValue(setting.value, setting.type)}
 </code>
 </div>
 </TableCell>
 <TableCell>
 <div className="flex gap-xs">
 <Badge variant={setting.is_public === 'true' ? 'default' : 'secondary'}>
 {setting.is_public === 'true' ? 'Public' : 'Private'}
 </Badge>
 <Badge variant={setting.is_editable === 'true' ? 'default' : 'outline'}>
 {setting.is_editable === 'true' ? 'Editable' : 'Read-only'}
 </Badge>
 </div>
 </TableCell>
 <TableCell>
 <div className="text-sm text-muted-foreground">
 {new Date(setting.updated_at).toLocaleDateString()}
 </div>
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-xs">
 <Button
 size="sm"
 variant="ghost"
 onClick={() => onEdit(setting)}
 disabled={setting.is_editable === 'false'}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 size="sm"
 variant="ghost"
 onClick={() => {
 if (window.confirm('Delete this setting?')) {
 onDelete(setting.id);
 }
 }}
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 ))
 )}
 </TableBody>
 </Table>
 </div>

 {/* Results Summary */}
 <div className="text-sm text-muted-foreground">
 Showing {filteredSettings.length} of {settings.length} settings
 </div>
 </div>
 );
}
