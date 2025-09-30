'use client';

import { Edit, Eye, Search, User, Globe, Key, Shield, Calendar, Activity } from "lucide-react";
import { useState } from 'react';
import {
 Card,
 CardContent,
 CardHeader,
 Badge,
 Button,
 Input,
 Skeleton,
} from '@ghxstship/ui';
import type { AccountListViewProps, AccountRecord, AccountRecordType } from '../types';

export default function AccountListView({
 records,
 loading,
 onEdit,
 onView,
}: AccountListViewProps) {
 const [searchQuery, setSearchQuery] = useState('');

 const filteredRecords = records.filter(record =>
 record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
 record.value.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const getTypeIcon = (type: AccountRecordType) => {
 const icons = {
 profile: User,
 session: Globe,
 api_key: Key,
 security: Shield,
 preference: User,
 };
 
 return icons[type] || User;
 };

 const getTypeColor = (type: AccountRecordType) => {
 const colors = {
 profile: 'text-blue-600 bg-blue-100',
 session: 'text-green-600 bg-green-100',
 api_key: 'text-purple-600 bg-purple-100',
 security: 'text-red-600 bg-red-100',
 preference: 'text-gray-600 bg-gray-100',
 };
 
 return colors[type] || 'text-gray-600 bg-gray-100';
 };

 const getStatusColor = (status: string) => {
 const colors = {
 active: 'text-green-700 bg-green-100',
 inactive: 'text-gray-700 bg-gray-100',
 expired: 'text-red-700 bg-red-100',
 revoked: 'text-red-700 bg-red-100',
 };
 
 return colors[status as keyof typeof colors] || 'text-gray-700 bg-gray-100';
 };

 const formatValue = (value: string, type: AccountRecordType) => {
 if (type === 'api_key' && value.includes('***')) {
 return value; // Already masked
 }
 
 if (type === 'security' && (value === 'Enabled' || value === 'Disabled')) {
 return value;
 }

 return value.length > 100 ? value.substring(0, 100) + '...' : value;
 };

 const getRecordPriority = (record: AccountRecord) => {
 // Profile and security records are high priority
 if (record.type === 'profile' || record.type === 'security') return 'high';
 // Active sessions and API keys are medium priority
 if ((record.type === 'session' || record.type === 'api_key') && record.status === 'active') return 'medium';
 return 'low';
 };

 const sortedRecords = filteredRecords.sort((a, b) => {
 const priorityOrder = { high: 3, medium: 2, low: 1 };
 const aPriority = priorityOrder[getRecordPriority(a)];
 const bPriority = priorityOrder[getRecordPriority(b)];
 
 if (aPriority !== bPriority) {
 return bPriority - aPriority;
 }
 
 return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
 });

 if (loading) {
 return (
 <div className="space-y-4">
 <Skeleton className="h-10 w-64" />
 <div className="space-y-4">
 {[...Array(6)].map((_, i) => (
 <Skeleton key={i} className="h-32 w-full" />
 ))}
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Search */}
 <div className="relative">
 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
 <Input
 placeholder="Search account records..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-10"
 />
 </div>

 {/* Records List */}
 <div className="space-y-4">
 {sortedRecords.length === 0 ? (
 <Card>
 <CardContent className="py-12 text-center text-muted-foreground">
 {searchQuery ? 'No records match your search' : 'No account records found'}
 </CardContent>
 </Card>
 ) : (
 sortedRecords.map((record) => {
 const TypeIcon = getTypeIcon(record.type);
 const typeColor = getTypeColor(record.type);
 const statusColor = getStatusColor(record.status);
 const priority = getRecordPriority(record);
 
 return (
 <Card 
 key={record.id} 
 className={`hover:shadow-md transition-shadow ${
 priority === 'high' ? 'border-l-4 border-l-blue-500' :
 priority === 'medium' ? 'border-l-4 border-l-yellow-500' : ''
 }`}
 >
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-3">
 <div className={`p-2 rounded-lg ${typeColor}`}>
 <TypeIcon className="h-5 w-5" />
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <h3 className="font-semibold text-lg">{record.name}</h3>
 <Badge variant="outline" className="text-xs">
 {record.type.replace('_', ' ')}
 </Badge>
 {priority === 'high' && (
 <Badge variant="destructive" className="text-xs">
 Critical
 </Badge>
 )}
 </div>
 <p className="text-muted-foreground text-sm">
 {record.description}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Button
 size="sm"
 variant="ghost"
 onClick={() => onView(record)}
 >
 <Eye className="h-4 w-4" />
 </Button>
 <Button
 size="sm"
 variant="ghost"
 onClick={() => onEdit(record)}
 >
 <Edit className="h-4 w-4" />
 </Button>
 </div>
 </div>
 </CardHeader>
 <CardContent className="pt-0">
 <div className="space-y-3">
 {/* Status and Category */}
 <div className="flex items-center gap-2 flex-wrap">
 <div className="flex items-center gap-1">
 <Activity className="h-3 w-3 text-muted-foreground" />
 <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
 {record.status}
 </span>
 </div>
 <Badge variant="secondary" className="text-xs">
 {record.category}
 </Badge>
 </div>

 {/* Value Display */}
 <div className="space-y-1">
 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
 {record.type === 'profile' ? 'Email' :
 record.type === 'session' ? 'IP Address' :
 record.type === 'api_key' ? 'Key' :
 record.type === 'security' ? 'Status' : 'Value'}
 </label>
 <div className="bg-muted p-3 rounded-md">
 <code className="text-sm font-mono">
 {formatValue(record.value, record.type)}
 </code>
 </div>
 </div>

 {/* Additional Information */}
 {record.metadata && (
 <div className="space-y-2">
 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
 Additional Information
 </label>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
 {record.type === 'session' && record.metadata.user_agent && (
 <div>
 <span className="font-medium">Device:</span>
 <span className="ml-1 text-muted-foreground">
 {record.metadata.user_agent.substring(0, 50)}...
 </span>
 </div>
 )}
 {record.type === 'api_key' && record.metadata.permissions && (
 <div>
 <span className="font-medium">Permissions:</span>
 <span className="ml-1 text-muted-foreground">
 {record.metadata.permissions.length} permissions
 </span>
 </div>
 )}
 {record.type === 'security' && record.metadata.backup_codes && (
 <div>
 <span className="font-medium">Backup Codes:</span>
 <span className="ml-1 text-muted-foreground">
 {record.metadata.backup_codes.length} codes available
 </span>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Timestamps */}
 <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
 <div className="flex items-center gap-1">
 <Calendar className="h-3 w-3" />
 <span>
 Created {new Date(record.created_at).toLocaleDateString()}
 </span>
 </div>
 <span>
 Updated {new Date(record.updated_at).toLocaleDateString()}
 </span>
 </div>
 </div>
 </CardContent>
 </Card>
 );
 })
 )}
 </div>

 {/* Results Summary */}
 {sortedRecords.length > 0 && (
 <div className="text-sm text-muted-foreground text-center">
 Showing {sortedRecords.length} of {records.length} account records
 </div>
 )}
 </div>
 );
}
