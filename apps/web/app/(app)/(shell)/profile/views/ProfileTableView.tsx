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
 Checkbox,
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
 return <ArrowUpDown className="h-4 w-4" />;
 }
 return currentSort.direction === 'asc' ? 
 <ArrowUp className="h-4 w-4" /> : 
 <ArrowDown className="h-4 w-4" />;
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
 <TableHead className="w-12">
 <div className="w-4 h-4 bg-muted rounded animate-pulse" />
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
 <div className="w-4 h-4 bg-muted rounded animate-pulse" />
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-sm">
 <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
 <div className="w-32 h-4 bg-muted rounded animate-pulse" />
 </div>
 </TableCell>
 <TableCell>
 <div className="w-40 h-4 bg-muted rounded animate-pulse" />
 </TableCell>
 <TableCell>
 <div className="w-24 h-4 bg-muted rounded animate-pulse" />
 </TableCell>
 <TableCell>
 <div className="w-28 h-4 bg-muted rounded animate-pulse" />
 </TableCell>
 <TableCell>
 <div className="w-16 h-6 bg-muted rounded animate-pulse" />
 </TableCell>
 <TableCell>
 <div className="w-20 h-4 bg-muted rounded animate-pulse" />
 </TableCell>
 <TableCell>
 <div className="flex gap-xs">
 <div className="w-8 h-8 bg-muted rounded animate-pulse" />
 <div className="w-8 h-8 bg-muted rounded animate-pulse" />
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
 <User className="h-12 w-12 text-muted-foreground mx-auto mb-md" />
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
 <TableHead className="w-12">
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
 <TableHead className="w-24">Actions</TableHead>
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
 <Avatar className="h-8 w-8">
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
 <div className="w-16 bg-muted rounded-full h-2">
 <div 
 className="bg-primary h-2 rounded-full transition-all duration-300" 
 style={{ width: `${profile.completion_percentage}%` }}
 />
 </div>
 <span className="text-sm font-medium w-10">
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
 <Eye className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(profile);
 }}
 >
 <Edit className="h-4 w-4" />
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
