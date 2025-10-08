'use client';

import { ArrowDown, ArrowUp, ArrowUpDown, Edit, ExternalLink, ExternalUser, Eye, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import {
 Card,
 Badge,
 Button,
 Checkbox
} from '@ghxstship/ui';
import type { ProfessionalProfile, ProfessionalSort } from '../types';
import {
 formatDateShort,
 calculateTenure,
 getStatusBadgeVariant,
 getCompletionColor,
 EMPLOYMENT_TYPE_LABELS,
 PROFILE_STATUS_LABELS
} from '../types';

interface ProfessionalTableViewProps {
 profiles: ProfessionalProfile[];
 selectedIds: string[];
 sort: ProfessionalSort;
 onSelectItem: (id: string, selected: boolean) => void;
 onSelectAll: (selected: boolean) => void;
 onSort: (sort: ProfessionalSort) => void;
 onView: (profile: ProfessionalProfile) => void;
 onEdit: (profile: ProfessionalProfile) => void;
 onDelete: (profile: ProfessionalProfile) => void;
 loading?: boolean;
}

type SortField = ProfessionalSort['field'];

export default function ProfessionalTableView({
 profiles,
 selectedIds,
 sort,
 onSelectItem,
 onSelectAll,
 onSort,
 onView,
 onEdit,
 onDelete,
 loading = false
}: ProfessionalTableViewProps) {
 const allSelected = profiles.length > 0 && selectedIds.length === profiles.length;
 const someSelected = selectedIds.length > 0 && selectedIds.length < profiles.length;

 const handleSort = (field: SortField) => {
 const direction = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
 onSort({ field, direction });
 };

 const getSortIcon = (field: SortField) => {
 if (sort.field !== field) {
 return <ArrowUpDown className="h-icon-xs w-icon-xs" />;
 }
 return sort.direction === 'asc' ? 
 <ArrowUp className="h-icon-xs w-icon-xs" /> : 
 <ArrowDown className="h-icon-xs w-icon-xs" />;
 };

 if (loading) {
 return (
 <Card className="overflow-hidden">
 <div className="p-md">
 <div className="animate-pulse space-y-md">
 <div className="h-icon-xs bg-muted rounded w-full"></div>
 {[...Array(5)].map((_, i) => (
 <div key={i} className="h-icon-2xl bg-muted rounded"></div>
 ))}
 </div>
 </div>
 </Card>
 );
 }

 if (profiles.length === 0) {
 return (
 <Card className="p-xsxl text-center">
 <div className="flex flex-col items-center gap-md">
 <User className="h-icon-2xl w-icon-2xl text-muted-foreground" />
 <div>
 <h3 className="text-lg font-semibold">No Professional Profiles</h3>
 <p className="text-muted-foreground mt-2">
 No professional profiles found matching your criteria.
 </p>
 </div>
 </div>
 </Card>
 );
 }

 return (
 <Card className="overflow-hidden">
 {/* Header with bulk selection */}
 <div className="p-md border-b">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected}
 onCheckedChange={(checked) => onSelectAll(!!checked)}
 />
 <span className="text-sm text-muted-foreground">
 {selectedIds.length > 0 ? `${selectedIds.length} selected` : `${profiles.length} profiles`}
 </span>
 </div>
 {selectedIds.length > 0 && (
 <div className="flex items-center gap-xs">
 <Button variant="outline" size="sm">
 Export Selected
 </Button>
 <Button variant="outline" size="sm">
 Bulk Actions
 </Button>
 </div>
 )}
 </div>
 </div>

 {/* Table */}
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-muted/50">
 <tr>
 <th className="w-icon-2xl p-md">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected}
 onCheckedChange={(checked) => onSelectAll(!!checked)}
 />
 </th>
 <th className="text-left p-md font-medium">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('job_title')}
 className="h-auto p-0 font-medium"
 >
 Job Title
 {getSortIcon('job_title')}
 </Button>
 </th>
 <th className="text-left p-md font-medium">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('department')}
 className="h-auto p-0 font-medium"
 >
 Department
 {getSortIcon('department')}
 </Button>
 </th>
 <th className="text-left p-md font-medium">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('employment_type')}
 className="h-auto p-0 font-medium"
 >
 Type
 {getSortIcon('employment_type')}
 </Button>
 </th>
 <th className="text-left p-md font-medium">Status</th>
 <th className="text-left p-md font-medium">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('profile_completion_percentage')}
 className="h-auto p-0 font-medium"
 >
 Completion
 {getSortIcon('profile_completion_percentage')}
 </Button>
 </th>
 <th className="text-left p-md font-medium">Manager</th>
 <th className="text-left p-md font-medium">Skills</th>
 <th className="text-left p-md font-medium">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('hire_date')}
 className="h-auto p-0 font-medium"
 >
 Hire Date
 {getSortIcon('hire_date')}
 </Button>
 </th>
 <th className="text-left p-md font-medium">Links</th>
 <th className="w-component-lg p-md font-medium">Actions</th>
 </tr>
 </thead>
 <tbody>
 {profiles.map((profile, index) => {
 const isSelected = selectedIds.includes(profile.id);
 const completion = profile.profile_completion_percentage;

 return (
 <tr 
 key={profile.id}
 className={`border-b hover:bg-muted/50 ${
 isSelected ? 'bg-primary/5' : ''
 } ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
 >
 <td className="p-md">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => onSelectItem(profile.id, !!checked)}
 />
 </td>
 <td className="p-md">
 <div className="font-medium">
 {profile.job_title || 'No Job Title'}
 </div>
 {profile.employee_id && (
 <div className="text-sm text-muted-foreground">
 ID: {profile.employee_id}
 </div>
 )}
 </td>
 <td className="p-md">
 <div className="font-medium">
 {profile.department || 'No Department'}
 </div>
 </td>
 <td className="p-md">
 {profile.employment_type ? (
 <Badge variant="outline">
 {EMPLOYMENT_TYPE_LABELS[profile.employment_type]}
 </Badge>
 ) : (
 <span className="text-muted-foreground">Not set</span>
 )}
 </td>
 <td className="p-md">
 <Badge variant={getStatusBadgeVariant(profile.status)}>
 {PROFILE_STATUS_LABELS[profile.status]}
 </Badge>
 </td>
 <td className="p-md">
 <div className="flex items-center gap-xs">
 <div className="flex-1 bg-muted rounded-full h-2 w-component-md">
 <div 
 className={`h-2 rounded-full bg-${getCompletionColor(completion)}-500`}
 style={{ width: `${completion}%` }}
 ></div>
 </div>
 <span className="text-sm font-medium w-icon-xl">
 {completion}%
 </span>
 </div>
 </td>
 <td className="p-md">
 <div className="font-medium">
 {profile.manager_name || 'No Manager'}
 </div>
 </td>
 <td className="p-md">
 <div className="text-center">
 <div className="font-medium">
 {profile.skills ? profile.skills.length : 0}
 </div>
 <div className="text-xs text-muted-foreground">
 skills
 </div>
 </div>
 </td>
 <td className="p-md">
 {profile.hire_date ? (
 <div>
 <div className="text-sm">
 {formatDateShort(profile.hire_date)}
 </div>
 <div className="text-xs text-muted-foreground">
 {calculateTenure(profile.hire_date)}
 </div>
 </div>
 ) : (
 <span className="text-muted-foreground">Not set</span>
 )}
 </td>
 <td className="p-md">
 <div className="flex gap-xs">
 {profile.linkedin_url && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => window.open(profile.linkedin_url!, '_blank')}
 title="LinkedIn"
 >
 <ExternalLink className="h-3 w-3" />
 </Button>
 )}
 {profile.website_url && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => window.open(profile.website_url!, '_blank')}
 title="Website"
 >
 <ExternalLink className="h-3 w-3" />
 </Button>
 )}
 </div>
 </td>
 <td className="p-md">
 <div className="flex items-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(profile)}
 title="View"
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(profile)}
 title="Edit"
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(profile)}
 title="Delete"
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 {/* Footer */}
 <div className="p-md border-t bg-muted/20">
 <div className="flex items-center justify-between text-sm text-muted-foreground">
 <div>
 Showing {profiles.length} professional profiles
 </div>
 <div className="flex items-center gap-xs">
 <span>Rows per page: 50</span>
 <Button variant="outline" size="sm">
 Previous
 </Button>
 <Button variant="outline" size="sm">
 Next
 </Button>
 </div>
 </div>
 </div>
 </Card>
 );
}
