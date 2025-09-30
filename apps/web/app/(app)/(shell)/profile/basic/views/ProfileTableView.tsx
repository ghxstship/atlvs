'use client';

import { User, Edit, Eye, Download, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useMemo } from 'react';
import { 
 Card, 
 Avatar, 
 Badge, 
 Button,
 Skeleton,
} from '@ghxstship/ui';
import type { UserProfile, ProfileSort } from '../types';

interface ProfileTableViewProps {
 profiles: UserProfile[];
 loading: boolean;
 selectedItems: string[];
 onSelectItem: (id: string, selected: boolean) => void;
 onSelectAll: (ids: string[], selected: boolean) => void;
 onSort?: (sort: ProfileSort) => void;
 onEdit?: (profile: UserProfile) => void;
 onView?: (profile: UserProfile) => void;
 onExport?: (profile: UserProfile) => void;
 currentSort?: ProfileSort;
}

export default function ProfileTableView({
 profiles,
 loading,
 selectedItems,
 onSelectItem,
 onSelectAll,
 onSort,
 onEdit,
 onView,
 onExport,
 currentSort,
}: ProfileTableViewProps) {
 const allSelected = profiles.length > 0 && profiles.every(profile => selectedItems.includes(profile.id));
 const someSelected = profiles.some(profile => selectedItems.includes(profile.id));

 const handleSelectAll = () => {
 const profileIds = profiles.map(profile => profile.id);
 onSelectAll(profileIds, !allSelected);
 };

 const handleSort = (field: keyof UserProfile) => {
 if (!onSort) return;
 
 const direction = currentSort?.field === field && currentSort?.direction === 'asc' ? 'desc' : 'asc';
 onSort({ field, direction });
 };

 const getSortIcon = (field: keyof UserProfile) => {
 if (currentSort?.field !== field) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
 return <ArrowUpDown className={`h-3 w-3 ${currentSort.direction === 'desc' ? 'rotate-180' : ''}`} />;
 };

 const formatDate = (dateString?: string) => {
 if (!dateString) return 'Not specified';
 return new Date(dateString).toLocaleDateString();
 };

 const getCompletionColor = (percentage: number) => {
 if (percentage >= 80) return 'text-green-600';
 if (percentage >= 60) return 'text-yellow-600';
 return 'text-red-600';
 };

 if (loading) {
 return (
 <Card className="p-6">
 <div className="space-y-4">
 <Skeleton className="h-8 w-full" />
 {Array.from({ length: 5 }).map((_, i) => (
 <div key={i} className="flex items-center gap-4">
 <Skeleton className="h-4 w-4" />
 <Skeleton className="h-8 w-8 rounded-full" />
 <Skeleton className="h-4 flex-1" />
 <Skeleton className="h-4 w-20" />
 <Skeleton className="h-4 w-16" />
 </div>
 ))}
 </div>
 </Card>
 );
 }

 if (profiles.length === 0) {
 return (
 <Card className="p-12 text-center">
 <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-semibold mb-2">No Profiles Found</h3>
 <p className="text-muted-foreground">
 No profiles match the current filters.
 </p>
 </Card>
 );
 }

 return (
 <Card className="p-6">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b">
 <th className="text-left p-2">
 <input
 type="checkbox"
 checked={allSelected}
 ref={(input) => {
 if (input) input.indeterminate = someSelected && !allSelected;
 }}
 onChange={handleSelectAll}
 className="h-4 w-4 rounded border-border"
 />
 </th>
 <th className="text-left p-2">Profile</th>
 <th className="text-left p-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('job_title')}
 className="h-auto p-0 font-semibold"
 >
 Position
 {getSortIcon('job_title')}
 </Button>
 </th>
 <th className="text-left p-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('department')}
 className="h-auto p-0 font-semibold"
 >
 Department
 {getSortIcon('department')}
 </Button>
 </th>
 <th className="text-left p-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('employment_type')}
 className="h-auto p-0 font-semibold"
 >
 Type
 {getSortIcon('employment_type')}
 </Button>
 </th>
 <th className="text-left p-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('profile_completion_percentage')}
 className="h-auto p-0 font-semibold"
 >
 Completion
 {getSortIcon('profile_completion_percentage')}
 </Button>
 </th>
 <th className="text-left p-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('status')}
 className="h-auto p-0 font-semibold"
 >
 Status
 {getSortIcon('status')}
 </Button>
 </th>
 <th className="text-left p-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('updated_at')}
 className="h-auto p-0 font-semibold"
 >
 Updated
 {getSortIcon('updated_at')}
 </Button>
 </th>
 <th className="text-left p-2">Actions</th>
 </tr>
 </thead>
 <tbody>
 {profiles.map((profile) => {
 const isSelected = selectedItems.includes(profile.id);
 
 return (
 <tr 
 key={profile.id} 
 className={`border-b hover:bg-muted/50 ${
 isSelected ? 'bg-muted/30' : ''
 }`}
 >
 <td className="p-2">
 <input
 type="checkbox"
 checked={isSelected}
 onChange={(e) => onSelectItem(profile.id, e.target.checked)}
 className="h-4 w-4 rounded border-border"
 />
 </td>
 
 <td className="p-2">
 <div className="flex items-center gap-3">
 <Avatar className="h-8 w-8">
 {profile.avatar_url ? (
 <img 
 src={profile.avatar_url} 
 alt="Profile" 
 className="h-full w-full object-cover" 
 />
 ) : (
 <User className="h-4 w-4" />
 )}
 </Avatar>
 <div>
 <div className="font-medium text-sm">
 {profile.employee_id || 'No ID'}
 </div>
 <div className="text-xs text-muted-foreground">
 {profile.nationality || 'Not specified'}
 </div>
 </div>
 </div>
 </td>
 
 <td className="p-2">
 <div className="text-sm">
 {profile.job_title || 'No Title'}
 </div>
 </td>
 
 <td className="p-2">
 <div className="text-sm">
 {profile.department || 'Unassigned'}
 </div>
 </td>
 
 <td className="p-2">
 {profile.employment_type && (
 <Badge variant="outline" className="text-xs">
 {profile.employment_type}
 </Badge>
 )}
 </td>
 
 <td className="p-2">
 <div className={`text-sm font-medium ${getCompletionColor(profile.profile_completion_percentage)}`}>
 {profile.profile_completion_percentage}%
 </div>
 <div className="w-16 bg-muted rounded-full h-1 mt-1">
 <div
 className="bg-primary h-1 rounded-full transition-all"
 style={{ width: `${profile.profile_completion_percentage}%` }}
 />
 </div>
 </td>
 
 <td className="p-2">
 <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
 {profile.status}
 </Badge>
 </td>
 
 <td className="p-2">
 <div className="text-sm text-muted-foreground">
 {formatDate(profile.updated_at)}
 </div>
 </td>
 
 <td className="p-2">
 <div className="flex items-center gap-1">
 {onView && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(profile)}
 className="h-6 w-6 p-0"
 >
 <Eye className="h-3 w-3" />
 </Button>
 )}
 {onEdit && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(profile)}
 className="h-6 w-6 p-0"
 >
 <Edit className="h-3 w-3" />
 </Button>
 )}
 {onExport && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onExport(profile)}
 className="h-6 w-6 p-0"
 >
 <Download className="h-3 w-3" />
 </Button>
 )}
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </Card>
 );
}
