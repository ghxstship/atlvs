'use client';

import { Edit, Trash2, Eye, Search, Filter, Download, Shield, Key, User, Globe } from "lucide-react";
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
import type { AccountGridViewProps, AccountRecord, AccountRecordType, AccountStatus } from '../types';

export default function AccountGridView({
 records,
 loading,
 onEdit,
 onDelete,
 onSelect,
 selectedIds
}: AccountGridViewProps) {
 const { toast } = useToastContext();
 const [searchQuery, setSearchQuery] = useState('');
 const [typeFilter, setTypeFilter] = useState<AccountRecordType | 'all'>('all');
 const [statusFilter, setStatusFilter] = useState<AccountStatus | 'all'>('all');
 const [sortField, setSortField] = useState<keyof AccountRecord>('updated_at');
 const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

 // Filter and sort records
 const filteredRecords = useMemo(() => {
 let filtered = records;

 // Apply search filter
 if (searchQuery) {
 filtered = filtered.filter(record =>
 record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
 record.value.toLowerCase().includes(searchQuery.toLowerCase())
 );
 }

 // Apply type filter
 if (typeFilter !== 'all') {
 filtered = filtered.filter(record => record.type === typeFilter);
 }

 // Apply status filter
 if (statusFilter !== 'all') {
 filtered = filtered.filter(record => record.status === statusFilter);
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
 }, [records, searchQuery, typeFilter, statusFilter, sortField, sortDirection]);

 const handleSort = (field: keyof AccountRecord) => {
 if (sortField === field) {
 setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
 } else {
 setSortField(field);
 setSortDirection('asc');
 }
 };

 const handleSelectAll = (checked: boolean) => {
 if (checked) {
 onSelect(filteredRecords.map(record => record.id));
 } else {
 onSelect([]);
 }
 };

 const handleSelectRecord = (recordId: string, checked: boolean) => {
 if (checked) {
 onSelect([...selectedIds, recordId]);
 } else {
 onSelect(selectedIds.filter(id => id !== recordId));
 }
 };

 const getTypeIcon = (type: AccountRecordType) => {
 const icons = {
 profile: User,
 session: Globe,
 api_key: Key,
 security: Shield,
 preference: User
 };
 
 return icons[type] || User;
 };

 const getTypeBadgeVariant = (type: AccountRecordType) => {
 const variants = {
 profile: 'default',
 session: 'secondary',
 api_key: 'outline',
 security: 'destructive',
 preference: 'default'
 } as const;
 
 return variants[type] || 'default';
 };

 const getStatusBadgeVariant = (status: AccountStatus) => {
 const variants = {
 active: 'default',
 inactive: 'secondary',
 expired: 'destructive',
 revoked: 'destructive'
 } as const;
 
 return variants[status] || 'secondary';
 };

 const formatValue = (value: string, type: AccountRecordType) => {
 if (type === 'api_key' && value.includes('***')) {
 return value; // Already masked
 }
 
 if (value.length > 50) {
 return value.substring(0, 50) + '...';
 }

 return value;
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
 placeholder="Search account records..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-10"
 />
 </div>
 
 <Select value={typeFilter} onValueChange={(value: unknown) => setTypeFilter(value)}>
 <SelectTrigger className="w-full sm:w-container-xs">
 <Filter className="h-icon-xs w-icon-xs mr-2" />
 <SelectValue placeholder="Type" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Types</SelectItem>
 <SelectItem value="profile">Profile</SelectItem>
 <SelectItem value="session">Sessions</SelectItem>
 <SelectItem value="api_key">API Keys</SelectItem>
 <SelectItem value="security">Security</SelectItem>
 <SelectItem value="preference">Preferences</SelectItem>
 </SelectContent>
 </Select>

 <Select value={statusFilter} onValueChange={(value: unknown) => setStatusFilter(value)}>
 <SelectTrigger className="w-full sm:w-component-xl">
 <SelectValue placeholder="Status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Status</SelectItem>
 <SelectItem value="active">Active</SelectItem>
 <SelectItem value="inactive">Inactive</SelectItem>
 <SelectItem value="expired">Expired</SelectItem>
 <SelectItem value="revoked">Revoked</SelectItem>
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
 if (window.confirm(`Delete ${selectedIds.length} records?`)) {
 selectedIds.forEach(id => onDelete(id));
 onSelect([]);
 toast.success(`Deleted ${selectedIds.length} records`);
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

 {/* Records Table */}
 <div className="border rounded-lg overflow-hidden">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-icon-2xl">
 <Checkbox
 checked={selectedIds.length === filteredRecords.length && filteredRecords.length > 0}
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
 onClick={() => handleSort('type')}
 >
 Type
 {sortField === 'type' && (
 <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
 )}
 </TableHead>
 <TableHead>Value</TableHead>
 <TableHead>Description</TableHead>
 <TableHead 
 className="cursor-pointer hover:bg-muted"
 onClick={() => handleSort('status')}
 >
 Status
 {sortField === 'status' && (
 <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
 )}
 </TableHead>
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
 {filteredRecords.length === 0 ? (
 <TableRow>
 <TableCell colSpan={8} className="text-center py-xl text-muted-foreground">
 {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' 
 ? 'No records match your filters'
 : 'No account records found'
 }
 </TableCell>
 </TableRow>
 ) : (
 filteredRecords.map((record) => {
 const TypeIcon = getTypeIcon(record.type);
 
 return (
 <TableRow key={record.id}>
 <TableCell>
 <Checkbox
 checked={selectedIds.includes(record.id)}
 onCheckedChange={(checked) => handleSelectRecord(record.id, checked)}
 />
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-xs">
 <TypeIcon className="h-icon-xs w-icon-xs text-muted-foreground" />
 <div>
 <div className="font-medium">{record.name}</div>
 <div className="text-sm text-muted-foreground">
 ID: {record.id.substring(0, 12)}...
 </div>
 </div>
 </div>
 </TableCell>
 <TableCell>
 <Badge variant={getTypeBadgeVariant(record.type)}>
 {record.type.replace('_', ' ')}
 </Badge>
 </TableCell>
 <TableCell>
 <code className="text-sm bg-muted px-xs py-xs rounded">
 {formatValue(record.value, record.type)}
 </code>
 </TableCell>
 <TableCell>
 <div className="max-w-xs">
 <div className="text-sm">
 {record.description}
 </div>
 </div>
 </TableCell>
 <TableCell>
 <Badge variant={getStatusBadgeVariant(record.status)}>
 {record.status}
 </Badge>
 </TableCell>
 <TableCell>
 <div className="text-sm text-muted-foreground">
 {new Date(record.updated_at).toLocaleDateString()}
 </div>
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-xs">
 <Button
 size="sm"
 variant="ghost"
 onClick={() => onEdit(record)}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 {record.type !== 'profile' && (
 <Button
 size="sm"
 variant="ghost"
 onClick={() => {
 if (window.confirm('Delete this record?')) {
 onDelete(record.id);
 }
 }}
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 </div>
 </TableCell>
 </TableRow>
 );
 })
 )}
 </TableBody>
 </Table>
 </div>

 {/* Results Summary */}
 <div className="text-sm text-muted-foreground">
 Showing {filteredRecords.length} of {records.length} account records
 </div>
 </div>
 );
}
