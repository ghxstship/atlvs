'use client';

import { ArrowUpDown, ArrowUp, ArrowDown, Edit, Eye, UserCheck, UserX, User } from "lucide-react";
import { useState } from 'react';
import { 
 Table, 
 TableHeader, 
 TableBody, 
 TableHead, 
 TableRow, 
 TableCell,
 Badge, 
 Button, 
 Avatar, 
 Progress,
 Checkbox
} from '@ghxstship/ui';
import type { ProfileOverview, ProfileOverviewSort } from '../types';
import { getStatusColor, getCompletionColor, formatLastLogin } from '../types';

interface ProfileOverviewTableViewProps {
 profiles: ProfileOverview[];
 loading?: boolean;
 selectedIds: string[];
 onSelectionChange: (ids: string[]) => void;
 onEdit: (profile: ProfileOverview) => void;
 onView: (profile: ProfileOverview) => void;
 onStatusChange: (profileId: string, status: ProfileOverview['status']) => void;
 onSort?: (sort: ProfileOverviewSort) => void;
 currentSort?: ProfileOverviewSort;
}

export default function ProfileOverviewTableView({
 profiles,
 loading = false,
 selectedIds,
 onSelectionChange,
 onEdit,
 onView,
 onStatusChange,
 onSort,
 currentSort
}: ProfileOverviewTableViewProps) {
 const handleSort = (field: keyof ProfileOverview) => {
 if (!onSort) return;

 const direction = 
 currentSort?.field === field && currentSort?.direction === 'asc' 
 ? 'desc' 
 : 'asc';
 
 onSort({ field, direction });
 };

 const handleSelectAll = () => {
 if (selectedIds.length === profiles.length) {
 onSelectionChange([]);
 } else {
 onSelectionChange(profiles.map(p => p.id));
 }
 };

 const handleRowSelect = (profileId: string) => {
 if (selectedIds.includes(profileId)) {
 onSelectionChange(selectedIds.filter(id => id !== profileId));
 } else {
 onSelectionChange([...selectedIds, profileId]);
 }
 };

 const getSortIcon = (field: keyof ProfileOverview) => {
 if (currentSort?.field !== field) {
 return <ArrowUpDown className="h-3 w-3" />;
 }
 return currentSort.direction === 'asc' 
 ? <ArrowUp className="h-3 w-3" />
 : <ArrowDown className="h-3 w-3" />;
 };

 if (loading) {
 return (
 <div className="border rounded-lg">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-icon-2xl">
 <div className="h-icon-xs w-icon-xs bg-secondary rounded animate-pulse"></div>
 </TableHead>
 <TableHead>
 <div className="h-icon-xs bg-secondary rounded animate-pulse"></div>
 </TableHead>
 <TableHead>
 <div className="h-icon-xs bg-secondary rounded animate-pulse"></div>
 </TableHead>
 <TableHead>
 <div className="h-icon-xs bg-secondary rounded animate-pulse"></div>
 </TableHead>
 <TableHead>
 <div className="h-icon-xs bg-secondary rounded animate-pulse"></div>
 </TableHead>
 <TableHead>
 <div className="h-icon-xs bg-secondary rounded animate-pulse"></div>
 </TableHead>
 <TableHead>
 <div className="h-icon-xs bg-secondary rounded animate-pulse"></div>
 </TableHead>
 <TableHead className="w-component-xl">
 <div className="h-icon-xs bg-secondary rounded animate-pulse"></div>
 </TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {Array.from({ length: 8 }).map((_, i) => (
 <TableRow key={i}>
 <TableCell>
 <div className="h-icon-xs w-icon-xs bg-secondary rounded animate-pulse"></div>
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-md">
 <div className="h-icon-lg w-icon-lg bg-secondary rounded-full animate-pulse"></div>
 <div className="h-icon-xs bg-secondary rounded animate-pulse w-component-lg"></div>
 </div>
 </TableCell>
 <TableCell>
 <div className="h-icon-xs bg-secondary rounded animate-pulse"></div>
 </TableCell>
 <TableCell>
 <div className="h-icon-xs bg-secondary rounded animate-pulse"></div>
 </TableCell>
 <TableCell>
 <div className="h-icon-xs bg-secondary rounded animate-pulse"></div>
 </TableCell>
 <TableCell>
 <div className="h-icon-xs bg-secondary rounded animate-pulse"></div>
 </TableCell>
 <TableCell>
 <div className="h-icon-xs bg-secondary rounded animate-pulse"></div>
 </TableCell>
 <TableCell>
 <div className="flex gap-sm">
 <div className="h-icon-lg w-icon-lg bg-secondary rounded animate-pulse"></div>
 <div className="h-icon-lg w-icon-lg bg-secondary rounded animate-pulse"></div>
 <div className="h-icon-lg w-icon-lg bg-secondary rounded animate-pulse"></div>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 );
 }

 if (profiles.length === 0) {
 return (
 <div className="border rounded-lg p-xl text-center">
 <User className="h-icon-2xl w-icon-2xl mx-auto mb-md color-muted" />
 <h3 className="text-heading-4 mb-sm">No profiles found</h3>
 <p className="color-muted">Try adjusting your search or filter criteria.</p>
 </div>
 );
 }

 return (
 <div className="stack-md">
 {/* Selection Header */}
 {selectedIds.length > 0 && (
 <div className="flex items-center justify-between p-md bg-accent/10 rounded-lg border border-accent/20">
 <span className="text-body-sm color-accent">
 {selectedIds.length} profile{selectedIds.length !== 1 ? 's' : ''} selected
 </span>
 <div className="flex items-center gap-sm">
 <Button
 variant="outline"
 size="sm"
 onClick={() => onSelectionChange([])}
 >
 Clear Selection
 </Button>
 </div>
 </div>
 )}

 {/* Table */}
 <div className="border rounded-lg overflow-hidden">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-icon-2xl">
 <Checkbox
 checked={selectedIds.length === profiles.length && profiles.length > 0}
 indeterminate={selectedIds.length > 0 && selectedIds.length < profiles.length}
 onCheckedChange={handleSelectAll}
 />
 </TableHead>
 
 <TableHead>
 <Button
 variant="ghost"
 size="sm"
 className="h-auto p-0 font-medium"
 onClick={() => handleSort('full_name')}
 >
 Profile
 {getSortIcon('full_name')}
 </Button>
 </TableHead>
 
 <TableHead>
 <Button
 variant="ghost"
 size="sm"
 className="h-auto p-0 font-medium"
 onClick={() => handleSort('job_title')}
 >
 Job Title
 {getSortIcon('job_title')}
 </Button>
 </TableHead>
 
 <TableHead>
 <Button
 variant="ghost"
 size="sm"
 className="h-auto p-0 font-medium"
 onClick={() => handleSort('department')}
 >
 Department
 {getSortIcon('department')}
 </Button>
 </TableHead>
 
 <TableHead>
 <Button
 variant="ghost"
 size="sm"
 className="h-auto p-0 font-medium"
 onClick={() => handleSort('status')}
 >
 Status
 {getSortIcon('status')}
 </Button>
 </TableHead>
 
 <TableHead>
 <Button
 variant="ghost"
 size="sm"
 className="h-auto p-0 font-medium"
 onClick={() => handleSort('profile_completion_percentage')}
 >
 Completion
 {getSortIcon('profile_completion_percentage')}
 </Button>
 </TableHead>
 
 <TableHead>
 <Button
 variant="ghost"
 size="sm"
 className="h-auto p-0 font-medium"
 onClick={() => handleSort('last_login')}
 >
 Last Login
 {getSortIcon('last_login')}
 </Button>
 </TableHead>
 
 <TableHead className="w-component-xl">Actions</TableHead>
 </TableRow>
 </TableHeader>
 
 <TableBody>
 {profiles.map((profile) => (
 <TableRow 
 key={profile.id}
 className={`
 cursor-pointer hover:bg-muted/50
 ${selectedIds.includes(profile.id) ? 'bg-accent/5' : ''}
 `}
 onClick={() => onView(profile)}
 >
 <TableCell onClick={(e) => e.stopPropagation()}>
 <Checkbox
 checked={selectedIds.includes(profile.id)}
 onCheckedChange={() => handleRowSelect(profile.id)}
 />
 </TableCell>
 
 <TableCell>
 <div className="flex items-center gap-md">
 <Avatar
 src={profile.avatar_url}
 alt={profile.full_name}
 fallback={profile.full_name.charAt(0)}
 size="sm"
 />
 <div>
 <div className="font-medium">{profile.full_name}</div>
 <div className="text-body-sm color-muted">{profile.email}</div>
 </div>
 </div>
 </TableCell>
 
 <TableCell>
 <div className="text-body-sm">
 {profile.job_title || (
 <span className="color-muted italic">No title</span>
 )}
 </div>
 </TableCell>
 
 <TableCell>
 <div className="text-body-sm">
 {profile.department || (
 <span className="color-muted italic">Unassigned</span>
 )}
 </div>
 </TableCell>
 
 <TableCell>
 <Badge variant={getStatusColor(profile.status) as unknown} size="sm">
 {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
 </Badge>
 </TableCell>
 
 <TableCell>
 <div className="flex items-center gap-md">
 <Progress 
 value={profile.profile_completion_percentage} 
 className="h-2 w-component-md"
 variant={getCompletionColor(profile.profile_completion_percentage) as unknown}
 />
 <span className="text-body-sm font-medium min-w-0">
 {profile.profile_completion_percentage}%
 </span>
 </div>
 </TableCell>
 
 <TableCell>
 <div className="text-body-sm color-muted">
 {formatLastLogin(profile.last_login)}
 </div>
 </TableCell>
 
 <TableCell onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center gap-sm">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(profile)}
 title="View Profile"
 >
 <Eye className="h-3 w-3" />
 </Button>
 
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(profile)}
 title="Edit Profile"
 >
 <Edit className="h-3 w-3" />
 </Button>
 
 <Button
 variant="ghost"
 size="sm"
 onClick={() => {
 const newStatus = profile.status === 'active' ? 'inactive' : 'active';
 onStatusChange(profile.id, newStatus);
 }}
 title={profile.status === 'active' ? 'Deactivate' : 'Activate'}
 >
 {profile.status === 'active' ? (
 <UserX className="h-3 w-3" />
 ) : (
 <UserCheck className="h-3 w-3" />
 )}
 </Button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 </div>
 );
}
