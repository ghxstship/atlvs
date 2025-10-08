'use client';

import { ArrowUpDown, ArrowUp, ArrowDown, Edit, Eye, User } from "lucide-react";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
 Badge,
 Button,
 Avatar,
 Checkbox
} from '@ghxstship/ui';

import type { UserProfile, FieldConfig, ProfileSort } from '../types';

interface ProfileTableViewProps {
 profiles: UserProfile[];
 loading: boolean;
 selectedIds: string[];
 onSelectionChange: (ids: string[]) => void;
 onEdit: (profile: UserProfile) => void;
 onSort: (sort: ProfileSort) => void;
 currentSort: ProfileSort;
 fieldConfig: FieldConfig[];
}

export default function ProfileTableView({
 profiles,
 loading,
 selectedIds,
 onSelectionChange,
 onEdit,
 onSort,
 currentSort,
 fieldConfig
}: ProfileTableViewProps) {
 const handleSelectProfile = (profileId: string, checked: boolean) => {
 if (checked) {
 onSelectionChange([...selectedIds, profileId]);
 } else {
 onSelectionChange(selectedIds.filter(id => id !== profileId));
 }
 };

 const handleSelectAll = (checked: boolean) => {
 if (checked) {
 onSelectionChange(profiles.map(p => p.id));
 } else {
 onSelectionChange([]);
 }
 };

 const handleSort = (field: keyof UserProfile) => {
 const direction = currentSort.field === field && currentSort.direction === 'asc' ? 'desc' : 'asc';
 onSort({ field, direction });
 };

 const getSortIcon = (field: string) => {
 if (currentSort.field !== field) {
 return <ArrowUpDown className="h-icon-xs w-icon-xs" />;
 }
 return currentSort.direction === 'asc' ? 
 <ArrowUp className="h-icon-xs w-icon-xs" /> : 
 <ArrowDown className="h-icon-xs w-icon-xs" />;
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'active':
 return 'success';
 case 'inactive':
 return 'destructive';
 case 'pending':
 return 'warning';
 case 'suspended':
 return 'destructive';
 default:
 return 'secondary';
 }
 };

 if (loading) {
 return (
 <div className="border rounded-md">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-icon-2xl">
 <div className="w-icon-xs h-icon-xs bg-muted rounded animate-pulse" />
 </TableHead>
 <TableHead>Name</TableHead>
 <TableHead>Email</TableHead>
 <TableHead>Department</TableHead>
 <TableHead>Position</TableHead>
 <TableHead>Status</TableHead>
 <TableHead>Completion</TableHead>
 <TableHead>Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {Array.from({ length: 10 }).map((_, i) => (
 <TableRow key={i}>
 <TableCell>
 <div className="w-icon-xs h-icon-xs bg-muted rounded animate-pulse" />
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-sm">
 <div className="w-icon-lg h-icon-lg bg-muted rounded-full animate-pulse" />
 <div className="w-component-xl h-icon-xs bg-muted rounded animate-pulse" />
 </div>
 </TableCell>
 <TableCell>
 <div className="w-40 h-icon-xs bg-muted rounded animate-pulse" />
 </TableCell>
 <TableCell>
 <div className="w-component-lg h-icon-xs bg-muted rounded animate-pulse" />
 </TableCell>
 <TableCell>
 <div className="w-28 h-icon-xs bg-muted rounded animate-pulse" />
 </TableCell>
 <TableCell>
 <div className="w-component-md h-icon-md bg-muted rounded animate-pulse" />
 </TableCell>
 <TableCell>
 <div className="w-component-lg h-icon-xs bg-muted rounded animate-pulse" />
 </TableCell>
 <TableCell>
 <div className="flex gap-xs">
 <div className="w-icon-lg h-icon-lg bg-muted rounded animate-pulse" />
 <div className="w-icon-lg h-icon-lg bg-muted rounded animate-pulse" />
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
 <div className="border rounded-md p-xl text-center">
 <User className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No profiles found</h3>
 <p className="text-muted-foreground mb-lg">
 Get started by creating your first profile or adjust your filters.
 </p>
 <Button>Create Profile</Button>
 </div>
 );
 }

 return (
 <div className="border rounded-md">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-icon-2xl">
 <Checkbox
 checked={selectedIds.length === profiles.length}
 onCheckedChange={handleSelectAll}
 indeterminate={selectedIds.length > 0 && selectedIds.length < profiles.length}
 />
 </TableHead>
 <TableHead>
 <Button
 variant="ghost"
 size="sm"
 className="h-auto p-0 font-semibold"
 onClick={() => handleSort('full_name')}
 >
 Name
 {getSortIcon('full_name')}
 </Button>
 </TableHead>
 <TableHead>
 <Button
 variant="ghost"
 size="sm"
 className="h-auto p-0 font-semibold"
 onClick={() => handleSort('email')}
 >
 Email
 {getSortIcon('email')}
 </Button>
 </TableHead>
 <TableHead>
 <Button
 variant="ghost"
 size="sm"
 className="h-auto p-0 font-semibold"
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
 className="h-auto p-0 font-semibold"
 onClick={() => handleSort('position')}
 >
 Position
 {getSortIcon('position')}
 </Button>
 </TableHead>
 <TableHead>
 <Button
 variant="ghost"
 size="sm"
 className="h-auto p-0 font-semibold"
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
 className="h-auto p-0 font-semibold"
 onClick={() => handleSort('completion_percentage')}
 >
 Completion
 {getSortIcon('completion_percentage')}
 </Button>
 </TableHead>
 <TableHead>
 <Button
 variant="ghost"
 size="sm"
 className="h-auto p-0 font-semibold"
 onClick={() => handleSort('last_login')}
 >
 Last Login
 {getSortIcon('last_login')}
 </Button>
 </TableHead>
 <TableHead className="w-component-lg">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {profiles.map((profile) => (
 <TableRow
 key={profile.id}
 className={`cursor-pointer hover:bg-muted/50 ${
 selectedIds.includes(profile.id) ? 'bg-muted/30' : ''
 }`}
 >
 <TableCell>
 <Checkbox
 checked={selectedIds.includes(profile.id)}
 onCheckedChange={(checked) => handleSelectProfile(profile.id, checked as boolean)}
 onClick={(e) => e.stopPropagation()}
 />
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-sm">
 <Avatar className="h-icon-lg w-icon-lg">
 {profile.avatar_url ? (
 <img src={profile.avatar_url} alt={profile.full_name} />
 ) : (
 <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary font-semibold text-xs">
 {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
 </div>
 )}
 </Avatar>
 <div>
 <p className="font-medium">{profile.full_name}</p>
 {profile.employee_id && (
 <p className="text-xs text-muted-foreground">ID: {profile.employee_id}</p>
 )}
 </div>
 </div>
 </TableCell>
 <TableCell>
 <div>
 <p className="font-medium">{profile.email}</p>
 {profile.phone && (
 <p className="text-xs text-muted-foreground">{profile.phone}</p>
 )}
 </div>
 </TableCell>
 <TableCell>
 {profile.department ? (
 <Badge variant="outline">{profile.department}</Badge>
 ) : (
 <span className="text-muted-foreground">-</span>
 )}
 </TableCell>
 <TableCell>
 {profile.position || <span className="text-muted-foreground">-</span>}
 </TableCell>
 <TableCell>
 <Badge variant={getStatusColor(profile.status) as unknown}>
 {profile.status}
 </Badge>
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-sm">
 <div className="w-component-md bg-muted rounded-full h-2">
 <div 
 className="bg-primary h-2 rounded-full transition-all duration-300" 
 style={{ width: `${profile.completion_percentage}%` }}
 />
 </div>
 <span className="text-sm font-medium w-icon-xl">
 {profile.completion_percentage}%
 </span>
 </div>
 </TableCell>
 <TableCell>
 {profile.last_login ? (
 <span className="text-sm">
 {new Date(profile.last_login).toLocaleDateString()}
 </span>
 ) : (
 <span className="text-muted-foreground">Never</span>
 )}
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(profile);
 }}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(profile);
 }}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 );
}
